const fs = require("fs");
const path = require("path");
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { OWNER_ID } = require("../utils/constants");

const EMBED_STORE = path.join(__dirname, "../logs/embeds.json");
const EMBED_LOG = path.join(__dirname, "../logs/embed.log");

/* =====================
   STORAGE HELPERS
===================== */
function readEmbeds() {
  if (!fs.existsSync(EMBED_STORE)) return {};
  return JSON.parse(fs.readFileSync(EMBED_STORE, "utf8"));
}

function writeEmbeds(data) {
  fs.writeFileSync(EMBED_STORE, JSON.stringify(data, null, 2));
}

function logEmbed(action, user, messageId) {
  const line = `[${new Date().toISOString()}] ${action} by ${user} → ${messageId}\n`;
  fs.appendFileSync(EMBED_LOG, line);
}

/* =====================
   TEXT MESSAGE HELPER
===================== */
async function sendText(client, channelId, content) {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) {
    throw new Error("Invalid channel");
  }
  return channel.send({ content });
}

module.exports = {
  commands: ["embed"],

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only.",
        flags: 64,
      });
    }

    /* =====================
       SLASH COMMAND
    ===================== */
    if (interaction.isChatInputCommand()) {
      const sub = interaction.options.getSubcommand();

      // 📤 SEND
      if (sub === "send") {
        const channel = interaction.options.getChannel("channel");

        const modal = new ModalBuilder()
          .setCustomId(`embed:send:${channel.id}`)
          .setTitle("Embed Builder");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("title")
              .setLabel("Title")
              .setStyle(TextInputStyle.Short)
              .setRequired(true),
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("desc")
              .setLabel("Description")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true),
          ),
        );

        return interaction.showModal(modal);
      }

      // ✏️ EDIT
      if (sub === "edit") {
        const channel = interaction.options.getChannel("channel");
        const messageId = interaction.options.getString("message_id");

        const embeds = readEmbeds();
        const record = embeds[messageId];

        if (!record) {
          return interaction.reply({
            content: "❌ This embed is not tracked.",
            flags: 64,
          });
        }

        const modal = new ModalBuilder()
          .setCustomId(`embed:edit:${channel.id}:${messageId}`)
          .setTitle("Edit Embed");

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("title")
              .setLabel("Title")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
              .setValue(record.title),
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("desc")
              .setLabel("Description")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
              .setValue(record.description),
          ),
        );

        return interaction.showModal(modal);
      }

      // 📃 LIST
      if (sub === "list") {
        const embeds = readEmbeds();
        const entries = Object.entries(embeds);

        if (!entries.length) {
          return interaction.reply({
            content: "⚠️ No saved embeds found.",
            flags: 64,
          });
        }

        const lines = entries.map(([id, e]) => {
          const title =
            e.title.length > 40 ? e.title.slice(0, 40) + "…" : e.title;

          return `• <#${e.channelId}> — **${title}**\n  ID: \`${id}\``;
        });

        // Chunk safely
        const chunks = [];
        let current = "";

        for (const line of lines) {
          if ((current + "\n" + line).length > 1800) {
            chunks.push(current);
            current = line;
          } else {
            current += (current ? "\n" : "") + line;
          }
        }
        if (current) chunks.push(current);

        await interaction.reply({
          content: `🧱 **Saved Embeds (${entries.length})**\n\n${chunks[0]}`,
          flags: 64,
        });

        for (let i = 1; i < chunks.length; i++) {
          await interaction.followUp({
            content: chunks[i],
            flags: 64,
          });
        }
      }
    }

    /* =====================
       MODAL SUBMIT
    ===================== */
    if (interaction.isModalSubmit()) {
      const [, action, channelId, messageId] = interaction.customId.split(":");

      const channel = await client.channels.fetch(channelId);
      const title = interaction.fields.getTextInputValue("title");
      const desc = interaction.fields.getTextInputValue("desc");

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(desc)
        .setTimestamp();

      const embeds = readEmbeds();

      // 📤 SEND
      if (action === "send") {
        const msg = await channel.send({ embeds: [embed] });

        embeds[msg.id] = {
          channelId,
          title,
          description: desc,
          updatedAt: Date.now(),
        };

        writeEmbeds(embeds);
        logEmbed("EMBED_SEND", interaction.user.tag, msg.id);

        return interaction.reply({
          content: "✅ Embed sent and saved.",
          flags: 64,
        });
      }

      // ✏️ EDIT
      if (action === "edit") {
        const msg = await channel.messages.fetch(messageId);
        await msg.edit({ embeds: [embed] });

        embeds[messageId].title = title;
        embeds[messageId].description = desc;
        embeds[messageId].updatedAt = Date.now();

        writeEmbeds(embeds);
        logEmbed("EMBED_EDIT", interaction.user.tag, messageId);

        return interaction.reply({
          content: "✅ Embed updated and saved.",
          flags: 64,
        });
      }
    }
  },

  // export helper for other commands
  sendText,
};
