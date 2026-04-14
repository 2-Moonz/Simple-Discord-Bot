const Discord = require("discord.js");

// Function to register slash commands
async function registerSlashCommands(client, Token, guildId = null) {
  const endpoint = guildId
    ? `https://discord.com/api/v10/applications/${client.user.id}/guilds/${guildId}/commands`
    : `https://discord.com/api/v10/applications/${client.user.id}/commands`;

  const commands = [
    {
      name: "ping",
      description: "Responds with Pong!",
      options: []
    },
    {
      name: "avatar",
      description: "Show Member Avatar!",
      options: [
        {
          name: "member",
          description: "Member to get avatar from (optional)",
          type: 6, // USER type
          required: false
        }
      ]
    },
    {
      name: "howgay",
      description: "Show How Gay Member Is!",
      options: [
        {
          name: "member",
          description: "Member to rate (optional)",
          type: 6,
          required: false
        }
      ]
    },
    {
      name: "rate",
      description: "Bot Rate Your Given Thing!",
      options: [
        {
          name: "text",
          description: "What to rate",
          type: 3, // STRING type
          required: true
        }
      ]
    },
    {
      name: "userinfo",
      description: "Show User Information!",
      options: [
        {
          name: "member",
          description: "Member to get info from (optional)",
          type: 6,
          required: false
        }
      ]
    }
  ];

  try {
    const headers = {
      Authorization: `Bot ${Token}`,
      "Content-Type": "application/json"
    };

    for (const command of commands) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(command)
      });

      if (response.ok) {
        console.log(`✅ Slash command '/${command.name}' registered`);
      } else {
        console.log(`❌ Failed to register '/${command.name}'`);
      }
    }
  } catch (error) {
    console.error("Error registering slash commands:", error);
  }
}

module.exports = { registerSlashCommands };
