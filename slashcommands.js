const { SlashCommandBuilder } = require("discord.js");

module.exports = [
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about a user")
    .addUserOption((o) =>
      o
        .setName("user")
        .setDescription("Target user (defaults to you)")
        .setRequired(false),
    ),

  new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Role utilities")
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List all roles in the server"),
    ),
  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Show information about the current server"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show utility commands"),

  new SlashCommandBuilder()
    .setName("whoami")
    .setDescription("Show bot identity"),

  new SlashCommandBuilder()
    .setName("exit")
    .setDescription("Shut down the utility bot"),

  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Embed utilities")
    .addSubcommand((sub) =>
      sub
        .setName("send")
        .setDescription("Send a custom embed")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("Target channel")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("edit")
        .setDescription("Edit an existing embed sent by the bot")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("Channel containing the embed")
            .setRequired(true),
        )
        .addStringOption((o) =>
          o
            .setName("message_id")
            .setDescription("Message ID of the embed")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List all saved embeds"),
    ),

  new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Rebuild embed & notice logs from existing messages"),

  new SlashCommandBuilder()
    .setName("notice")
    .setDescription("Send, edit, or list notices")
    .addSubcommand((s) =>
      s
        .setName("send")
        .setDescription("Send a notice")
        .addChannelOption((o) =>
          o
            .setName("channel")
            .setDescription("Target channel")
            .setRequired(true),
        )
        .addStringOption((o) =>
          o.setName("title").setDescription("Notice title").setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("edit")
        .setDescription("Edit an existing notice")
        .addChannelOption((o) =>
          o.setName("channel").setDescription("Channel").setRequired(true),
        )
        .addStringOption((o) =>
          o
            .setName("message_id")
            .setDescription("Message ID")
            .setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s.setName("list").setDescription("List recent notices"),
    ),

  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages")
    .addSubcommand((s) =>
      s
        .setName("all")
        .setDescription("Delete recent messages")
        .addIntegerOption((o) =>
          o
            .setName("amount")
            .setDescription("Number of messages")
            .setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("bot")
        .setDescription("Delete bot messages")
        .addIntegerOption((o) =>
          o
            .setName("amount")
            .setDescription("Number of messages")
            .setRequired(true),
        ),
    )
    .addSubcommand((s) =>
      s
        .setName("user")
        .setDescription("Delete messages from a user")
        .addUserOption((o) =>
          o.setName("target").setDescription("Target user").setRequired(true),
        )
        .addIntegerOption((o) =>
          o
            .setName("amount")
            .setDescription("Number of messages")
            .setRequired(true),
        ),
    ),
  new SlashCommandBuilder()
    .setName("text")
    .setDescription("Send a normal text message as the bot")
    .addChannelOption((o) =>
      o.setName("channel").setDescription("Target channel").setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("mention")
    .setDescription("Mention anyone in a specific channel")
    .addChannelOption((o) =>
      o
        .setName("channel")
        .setDescription("Channel where the mention will be sent")
        .setRequired(true),
    ),
].map((c) => c.toJSON());
