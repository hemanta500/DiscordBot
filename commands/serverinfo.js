const { EmbedBuilder, ChannelType } = require("discord.js");
const { OWNER_ID } = require("../utils/constants");

module.exports = {
  commands: ["serverinfo"],

  async execute(client, interaction) {
    // ❗ Owner check BEFORE defer
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner-only command.",
        flags: 64,
      });
    }

    // ✅ Defer once
    await interaction.deferReply({ flags: 64 });

    try {
      const guild = interaction.guild;
      await guild.fetch();

      const total = guild.memberCount;
      const bots = guild.members.cache.filter((m) => m.user.bot).size;
      const humans = total - bots;

      const text = guild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildText,
      ).size;
      const voice = guild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildVoice,
      ).size;
      const categories = guild.channels.cache.filter(
        (c) => c.type === ChannelType.GuildCategory,
      ).size;

      const embed = new EmbedBuilder()
        .setTitle(`🧭 Server Info — ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .addFields(
          { name: "Server ID", value: guild.id },
          { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
          {
            name: "Created",
            value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
            inline: true,
          },
          {
            name: "Members",
            value: `👥 ${humans} | 🤖 ${bots}`,
            inline: true,
          },
          {
            name: "Boosts",
            value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount})`,
            inline: true,
          },
          {
            name: "Channels",
            value: `💬 ${text} | 🔊 ${voice} | 📁 ${categories}`,
            inline: true,
          },
          {
            name: "Roles",
            value: `${guild.roles.cache.size}`,
            inline: true,
          },
          {
            name: "Verification",
            value: `${guild.verificationLevel}`,
            inline: true,
          },
          {
            name: "AFK Channel",
            value: guild.afkChannel ? guild.afkChannel.name : "None",
            inline: true,
          },
          {
            name: "AFK Timeout",
            value: `${guild.afkTimeout / 60} min`,
            inline: true,
          },
        )
        .setColor(0x5865f2);

      // ✅ ALWAYS finish with editReply
      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error("Serverinfo error:", err);

      // ✅ Even on error, finish the interaction
      return interaction.editReply({
        content: "❌ Failed to fetch server info.",
      });
    }
  },
};
