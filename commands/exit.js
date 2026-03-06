const { OWNER_ID } = require("../utils/constants");
const logAction = require("../utils/logger");

module.exports = {
  commands: ["exit"],
  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) return;
    await interaction.reply({ content: "Shutting down...", flags: 64 });
    logAction("EXIT");
    await client.destroy();
    process.exit(0);
  },
};
