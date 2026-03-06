const { EmbedBuilder } = require("discord.js");
const { OWNER_ID } = require("../utils/constants");
const slashCommands = require("../slashcommands");

module.exports = {
  commands: ["help"],

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner-only command.",
        flags: 64,
      });
    }

    // slashCommands is already .toJSON() output
    const list = slashCommands.map((cmd) => {
      return `• **/${cmd.name}** — ${cmd.description}`;
    });

    const embed = new EmbedBuilder()
      .setTitle("🧠 NIYOCORE Utility Commands")
      .setDescription(list.join("\n"))
      .setColor(0x5865f2)
      .setFooter({
        text: "Dynamically generated from registered slash commands",
      });

    return interaction.reply({
      embeds: [embed],
      flags: 64,
    });
  },
};
