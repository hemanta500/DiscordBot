const { OWNER_ID } = require("../utils/constants");
const logAction = require("../utils/logger");

module.exports = {
  commands: ["purge"],
  async execute(_, interaction) {
    if (interaction.user.id !== OWNER_ID) return;
    const sub = interaction.options.getSubcommand();
    const amount = interaction.options.getInteger("amount");
    const messages = await interaction.channel.messages.fetch({ limit: 100 });

    let target = messages;
    if (sub === "bot") target = messages.filter(m => m.author.bot);
    if (sub === "user") {
      const u = interaction.options.getUser("target");
      target = messages.filter(m => m.author.id === u.id);
    }

    const deleted = await interaction.channel.bulkDelete(
      target.first(amount),
      true
    );

    logAction(`PURGE ${sub} ${deleted.size}`);
    interaction.reply({ content: `Deleted ${deleted.size}`, flags: 64 });
  },
};
