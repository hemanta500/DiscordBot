const handlers = [
  require("../commands/help"),
  require("../commands/notice"),
  require("../commands/purge"),
  require("../commands/embed"),
  require("../commands/whoami"),
  require("../commands/exit"),
  require("../commands/serverinfo"),
  require("../commands/userinfo"),
  require("../commands/roles"),
  require("../commands/refresh"),
  require("../commands/text"),
  require("../commands/mention"),
];

module.exports = {
  name: "interactionCreate",

  async execute(client, interaction) {
    /* =====================
       MODAL ROUTING
    ===================== */
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("notice:")) {
        return require("../commands/notice").execute(client, interaction);
      }

      if (interaction.customId.startsWith("embed:")) {
        return require("../commands/embed").execute(client, interaction);
      }

      // ✅ ADD THIS (THIS FIXES /text)
      if (interaction.customId.startsWith("text:")) {
        return require("../commands/text").execute(client, interaction);
      }

      return; // ignore unknown modals safely
    }

    /* =====================
       SLASH COMMAND ROUTING
    ===================== */
    if (!interaction.isChatInputCommand()) return;

    for (const h of handlers) {
      if (h.commands.includes(interaction.commandName)) {
        return h.execute(client, interaction);
      }
    }
  },
};
