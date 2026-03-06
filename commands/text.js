const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { OWNER_ID } = require("../utils/constants");

module.exports = {
  commands: ["text"],

  async execute(client, interaction) {
    // 🔐 Owner only
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: "❌ Owner only.",
        flags: 64,
      });
    }

    /* =====================
       SLASH COMMAND
    ===================== */
    if (interaction.isChatInputCommand()) {
      const channel = interaction.options.getChannel("channel");

      const modal = new ModalBuilder()
        .setCustomId(`text:send:${channel.id}`)
        .setTitle("Send Text Message");

      const input = new TextInputBuilder()
        .setCustomId("content")
        .setLabel("Message to send")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(2000);

      modal.addComponents(new ActionRowBuilder().addComponents(input));

      return interaction.showModal(modal);
    }

    /* =====================
       MODAL SUBMIT
    ===================== */
    if (interaction.isModalSubmit()) {
      // ✅ STRICT GUARD
      if (!interaction.customId.startsWith("text:")) return;

      // ⏳ IMMEDIATELY ACKNOWLEDGE
      await interaction.deferReply({ flags: 64 });

      const [, action, channelId] = interaction.customId.split(":");

      if (action !== "send" || !channelId) {
        return interaction.editReply({
          content: "❌ Invalid modal submission.",
        });
      }

      try {
        const channel = await client.channels.fetch(channelId);

        if (!channel || !channel.isTextBased()) {
          return interaction.editReply({
            content: "❌ Invalid or non-text channel.",
          });
        }

        const content = interaction.fields.getTextInputValue("content");

        await channel.send({ content });

        return interaction.editReply({
          content: "✅ Message sent successfully.",
        });
      } catch (err) {
        console.error("TEXT COMMAND ERROR:", err);
        return interaction.editReply({
          content: "❌ Failed to send message.",
        });
      }
    }
  },
};
