module.exports = async function safeReply(interaction, payload) {
  if (interaction.replied || interaction.deferred) {
    return interaction.editReply(payload);
  }
  return interaction.reply(payload);
};
