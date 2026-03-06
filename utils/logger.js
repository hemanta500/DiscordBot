const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
const logFile = path.join(logDir, "activity.log");

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

module.exports = function logAction(text) {
  const time = new Date().toISOString().replace("T", " ").split(".")[0];
  fs.appendFileSync(logFile, `[${time}] ${text}\n`);
};
