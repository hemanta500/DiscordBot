const { Events, REST, Routes } = require("discord.js");
const commands = require("../slashcommands");

module.exports = {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    const app = await client.application.fetch();

    try {
      console.log("🧹 Clearing GLOBAL slash commands...");
      await rest.put(Routes.applicationCommands(app.id), { body: [] });

      console.log("📦 Registering GLOBAL slash commands...");
      await rest.put(Routes.applicationCommands(app.id), { body: commands });

      console.log("✅ Global commands synced");
    } catch (err) {
      console.error(err);
    }
  },
};
