const { EmbedBuilder } = require("discord.js");
const { OWNER_ID } = require("../utils/constants");

module.exports = {
  commands: ["whoami"],
  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) return;
    const embed = new EmbedBuilder()
      .setTitle("Bot Identity")
      .addFields(
        { name: "Tag", value: client.user.tag },
        { name: "ID", value: client.user.id }
      );
    interaction.reply({ embeds: [embed], flags: 64 });
  },
};
