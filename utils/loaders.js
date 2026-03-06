const fs = require("fs");
const path = require("path");

module.exports = function loadEvents(client) {
  const eventsPath = path.join(__dirname, "../events");

  for (const file of fs.readdirSync(eventsPath)) {
    if (!file.endsWith(".js")) continue;
    const event = require(path.join(eventsPath, file));
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
};
