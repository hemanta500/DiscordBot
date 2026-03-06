const { OWNER_ID } = require("../utils/constants");

module.exports = {
  commands: ["roles"],

  async execute(client, interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only.",
        flags: 64,
      });
    }

    if (!interaction.isChatInputCommand()) return;

    const sub = interaction.options.getSubcommand();
    if (sub !== "list") return;

    const roles = interaction.guild.roles.cache
      .filter((r) => r.name !== "@everyone")
      .sort((a, b) => b.position - a.position);

    if (!roles.size) {
      return interaction.reply({
        content: "⚠️ No roles found.",
        flags: 64,
      });
    }

    // ✅ Names only, clean bullets
    const lines = roles.map((r) => `• **${r.name}**`);

    // Discord message limit safety
    const chunks = [];
    let current = "";

    for (const line of lines) {
      if ((current + "\n" + line).length > 1900) {
        chunks.push(current);
        current = line;
      } else {
        current += (current ? "\n" : "") + line;
      }
    }
    if (current) chunks.push(current);

    await interaction.reply({
      content: `🧱 **Server Roles (${roles.size})**\n\n${chunks[0]}`,
      flags: 64,
    });

    // Follow-ups if needed
    for (let i = 1; i < chunks.length; i++) {
      await interaction.followUp({
        content: chunks[i],
        flags: 64,
      });
    }
  },
};
