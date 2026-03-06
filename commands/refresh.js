const fs = require("fs");
const path = require("path");
const { OWNER_ID } = require("../utils/constants");

const NOTICE_STORE = path.join(__dirname, "../logs/notices.json");
const EMBED_STORE = path.join(__dirname, "../logs/embeds.json");
const ACTIVITY_LOG = path.join(__dirname, "../logs/activity.log");
const EMBED_LOG = path.join(__dirname, "../logs/embed.log");

function readJSON(file) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function log(file, line) {
  fs.appendFileSync(file, line + "\n");
}

module.exports = {
  commands: ["refresh"],

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only.",
        flags: 64,
      });
    }

    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply({ flags: 64 });

    const guild = interaction.guild;
    const notices = readJSON(NOTICE_STORE);
    const embeds = readJSON(EMBED_STORE);

    let noticeCount = 0;
    let embedCount = 0;

    for (const channel of guild.channels.cache.values()) {
      if (!channel.isTextBased()) continue;

      try {
        const messages = await channel.messages.fetch({ limit: 100 });

        for (const msg of messages.values()) {
          if (msg.author.id !== client.user.id) continue;
          if (!msg.embeds.length) continue;

          const embed = msg.embeds[0];

          // 📢 NOTICE
          if (embed.title === "📢 Server Notice") {
            const key = `${guild.id}:${channel.id}`;
            notices[key] = {
              messageId: msg.id,
              content: embed.description || "",
              updatedAt: msg.editedTimestamp || msg.createdTimestamp,
            };

            log(
              ACTIVITY_LOG,
              `[REFRESH_NOTICE] ${interaction.user.tag} → ${msg.id}`,
            );
            noticeCount++;
          }

          // 🧱 EMBED
          else {
            embeds[msg.id] = {
              channelId: channel.id,
              title: embed.title || "",
              description: embed.description || "",
              updatedAt: msg.editedTimestamp || msg.createdTimestamp,
            };

            log(
              EMBED_LOG,
              `[REFRESH_EMBED] ${interaction.user.tag} → ${msg.id}`,
            );
            embedCount++;
          }
        }
      } catch {
        // silently skip channels bot can't read
      }
    }

    writeJSON(NOTICE_STORE, notices);
    writeJSON(EMBED_STORE, embeds);

    return interaction.editReply({
      content:
        "🔄 **Log refresh completed**\n\n" +
        `📢 Notices rebuilt: **${noticeCount}**\n` +
        `🧱 Embeds rebuilt: **${embedCount}**`,
    });
  },
};
