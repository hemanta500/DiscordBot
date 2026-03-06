const fs = require("fs");
const path = require("path");
const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { OWNER_ID } = require("../utils/constants");
const logAction = require("../utils/logger");

const logFile = path.join(__dirname, "../logs/activity.log");
const noticeFile = path.join(__dirname, "../logs/notices.json");

/* =====================
   STORAGE HELPERS
===================== */
function readNotices() {
  if (!fs.existsSync(noticeFile)) return {};
  return JSON.parse(fs.readFileSync(noticeFile, "utf8"));
}

function writeNotices(data) {
  fs.writeFileSync(noticeFile, JSON.stringify(data, null, 2));
}

function getKey(guildId, channelId) {
  return `${guildId}:${channelId}`;
}

module.exports = {
  commands: ["notice"],

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only.",
        flags: 64,
      });
    }

    /* =====================
       MODAL SUBMIT
    ===================== */
    if (interaction.isModalSubmit()) {
      const [, action, channelId] = interaction.customId.split(":");
      const channel = await client.channels.fetch(channelId);
      const content = interaction.fields.getTextInputValue("content");

      const notices = readNotices();
      const key = getKey(interaction.guildId, channelId);

      // 📢 SEND
      if (action === "send") {
        const embed = new EmbedBuilder()
          .setTitle("📢 Server Notice")
          .setDescription(content)
          .setColor(0xf1c40f)
          .setTimestamp();

        const msg = await channel.send({ embeds: [embed] });

        // ✅ SAVE ACTUAL NOTICE CONTENT + MESSAGE
        notices[key] = {
          messageId: msg.id,
          content,
          updatedAt: Date.now(),
        };
        writeNotices(notices);

        logAction(`NOTICE_SEND by ${interaction.user.tag} → ${msg.id}`);

        return interaction.reply({
          content: "✅ Notice sent and saved.",
          flags: 64,
        });
      }

      // ✏️ EDIT
      if (action === "edit") {
        const record = notices[key];
        if (!record) {
          return interaction.reply({
            content: "❌ No saved notice found for this channel.",
            flags: 64,
          });
        }

        const msg = await channel.messages.fetch(record.messageId);

        if (msg.author.id !== client.user.id) {
          return interaction.reply({
            content: "❌ Stored notice is not mine.",
            flags: 64,
          });
        }

        const updated = EmbedBuilder.from(msg.embeds[0])
          .setDescription(content)
          .setTimestamp();

        await msg.edit({ embeds: [updated] });

        // ✅ UPDATE STORED CONTENT
        record.content = content;
        record.updatedAt = Date.now();
        writeNotices(notices);

        logAction(`NOTICE_EDIT by ${interaction.user.tag} → ${msg.id}`);

        return interaction.reply({
          content: "✅ Notice updated successfully.",
          flags: 64,
        });
      }
    }

    /* =====================
       SLASH COMMAND
    ===================== */
    if (!interaction.isChatInputCommand()) return;

    const sub = interaction.options.getSubcommand();

    // 📢 SEND
    if (sub === "send") {
      const channel = interaction.options.getChannel("channel");

      const modal = new ModalBuilder()
        .setCustomId(`notice:send:${channel.id}`)
        .setTitle("Create Notice");

      const input = new TextInputBuilder()
        .setCustomId("content")
        .setLabel("Notice content")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(4000);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    // ✏️ EDIT (NO MESSAGE ID REQUIRED)
    if (sub === "edit") {
      const channel = interaction.options.getChannel("channel");
      const notices = readNotices();
      const key = getKey(interaction.guildId, channel.id);
      const record = notices[key];

      if (!record) {
        return interaction.reply({
          content: "❌ No notice exists for this channel.",
          flags: 64,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId(`notice:edit:${channel.id}`)
        .setTitle("Edit Notice");

      const input = new TextInputBuilder()
        .setCustomId("content")
        .setLabel("Updated content")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setValue(record.content) // ✅ PREFILLED FROM STORAGE
        .setMaxLength(4000);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      return interaction.showModal(modal);
    }

    // 📃 LIST
    // 📃 LIST
    if (sub === "list") {
      const notices = readNotices();
      const entries = Object.entries(notices);

      if (!entries.length) {
        return interaction.reply({
          content: "⚠️ No saved notices found.",
          flags: 64,
        });
      }

      const lines = entries.map(([key, n]) => {
        const [, channelId] = key.split(":");

        const preview =
          n.content.length > 40 ? n.content.slice(0, 40) + "…" : n.content;

        const updated = Math.floor(n.updatedAt / 1000);

        return (
          `• <#${channelId}> — **"${preview}"**\n` +
          `  ID: \`${n.messageId}\`\n` +
          `  Updated: <t:${updated}:R>`
        );
      });

      // 🧱 Chunk safely (Discord limit)
      const chunks = [];
      let current = "";

      for (const line of lines) {
        if ((current + "\n\n" + line).length > 1800) {
          chunks.push(current);
          current = line;
        } else {
          current += (current ? "\n\n" : "") + line;
        }
      }
      if (current) chunks.push(current);

      await interaction.reply({
        content: `📢 **Saved Notices (${entries.length})**\n\n${chunks[0]}`,
        flags: 64,
      });

      for (let i = 1; i < chunks.length; i++) {
        await interaction.followUp({
          content: chunks[i],
          flags: 64,
        });
      }
    }
  },
};
