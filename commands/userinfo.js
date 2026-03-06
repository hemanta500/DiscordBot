const { EmbedBuilder } = require("discord.js");
const { OWNER_ID } = require("../utils/constants");

module.exports = {
  commands: ["userinfo"],

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner-only command.",
        flags: 64,
      });
    }

    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const roles =
      member.roles.cache
        .filter((r) => r.id !== interaction.guild.id)
        .map((r) => r.name)
        .join(", ") || "None";

    const embed = new EmbedBuilder()
      .setTitle(`👤 User Info — ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User ID", value: user.id, inline: false },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        {
          name: "Server Owner",
          value: user.id === interaction.guild.ownerId ? "Yes" : "No",
          inline: true,
        },

        {
          name: "Account Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
          inline: false,
        },
        {
          name: "Joined Server",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
          inline: false,
        },

        {
          name: "Highest Role",
          value: member.roles.highest.name,
          inline: true,
        },
        { name: "Roles", value: roles, inline: false },

        {
          name: "Boosting",
          value: member.premiumSince ? "Yes" : "No",
          inline: true,
        },
      )
      .setColor(0x00bcd4);

    if (user.bannerURL()) {
      embed.setImage(user.bannerURL({ size: 1024 }));
    }

    return interaction.reply({ embeds: [embed], flags: 64 });
  },
};
