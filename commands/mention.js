const { OWNER_ID } = require("../utils/constants");

module.exports = {
  commands: ["mention"],

  async execute(client, interaction) {
    // Only slash commands
    if (!interaction.isChatInputCommand()) return;

    // Owner only
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only.",
        flags: 64,
      });
    }

    const targetChannel = interaction.options.getChannel("channel");

    if (!targetChannel || !targetChannel.isTextBased()) {
      return interaction.reply({
        content: "❌ Invalid channel.",
        flags: 64,
      });
    }

    // Ask user for mention
    await interaction.reply({
      content:
        "🔔 Type the mention now (user/role/everyone).\nType `cancel` to stop.",
      flags: 64,
    });

    const filter = (m) =>
      m.author.id === interaction.user.id &&
      m.channel.id === interaction.channel.id;

    const collector = interaction.channel.createMessageCollector({
      filter,
      max: 1,
      time: 120000,
    });

    collector.on("collect", async (msg) => {
      try {
        // Cancel command
        if (msg.content.toLowerCase() === "cancel") {
          await msg.delete().catch(() => {});
          return interaction.followUp({
            content: "❌ Cancelled.",
            flags: 64,
          });
        }

        /* ========= EXTRACT MENTIONS ONLY ========= */

        let mentions = [];

        // User mentions
        msg.mentions.users.forEach((u) => {
          mentions.push(`<@${u.id}>`);
        });

        // Role mentions
        msg.mentions.roles.forEach((r) => {
          mentions.push(`<@&${r.id}>`);
        });

        // Everyone / Here
        if (msg.content.includes("@everyone")) mentions.push("@everyone");
        if (msg.content.includes("@here")) mentions.push("@here");

        if (!mentions.length) {
          await msg.delete().catch(() => {});
          return interaction.followUp({
            content: "❌ You must mention at least one user or role.",
            flags: 64,
          });
        }

        /* ========================================= */

        await targetChannel.send({
          content: mentions.join(" "),
          allowedMentions: { parse: ["users", "roles", "everyone"] },
        });

        // Delete original message
        await msg.delete().catch(() => {});

        await interaction.followUp({
          content: "✅ Mention sent successfully.",
          flags: 64,
        });
      } catch (err) {
        console.error("MENTION ERROR:", err);
        await interaction.followUp({
          content: "❌ Failed to send mention.",
          flags: 64,
        });
      }
    });

    collector.on("end", async (collected) => {
      if (!collected.size) {
        await interaction.followUp({
          content: "⌛ Timed out. Run the command again.",
          flags: 64,
        });
      }
    });
  },
};
