require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const loadEvents = require("./utils/loaders");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

loadEvents(client);
client.login(process.env.TOKEN);
