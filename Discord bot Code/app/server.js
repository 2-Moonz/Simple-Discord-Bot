const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES"] });
const { Prefix, Token, Color } = require("./config.js");
const { registerSlashCommands } = require("./slash-commands.js");
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
// Using mock database instead of quick.db due to build issues
client.db = require("./quick-db-mock.js");

client.on("ready", async () => {
  console.log(`ready!`);
  // Register slash commands
  registerSlashCommands(client, Token).catch(console.error);
  
  client.user
    .setActivity(`Servers : ${await client.guilds.cache.size} | Users : ${await client.users.cache.size}`, { type: "PLAYING" })
    .catch(error => console.log(error));
});

client.on("message", async message => {
  if (message.channel.type === "dm") return;
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  if (message.content.match(new RegExp(`^<@!?${client.user.id}>`))) {
    return message.channel.send(`Bot Prefix : ${Prefix}`);
  }
});

let modules = ["fun", "info", "moderation"];

modules.forEach(function(module) {
  fs.readdir(`./commands/${module}`, function(err, files) {
    if (err)
      return new Error(
        "Missing Folder Of Commands! Example : Commands/<Folder>/<Command>.js"
      );
    files.forEach(function(file) {
      if (!file.endsWith(".js")) return;
      let command = require(`./commands/${module}/${file}`);
      console.log(`${command.name} Command Has Been Loaded - ✅`);
      if (command.name) client.commands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach(alias =>
          client.aliases.set(alias, command.name)
        );
      }
      if (command.aliases.length === 0) command.aliases = null;
    });
  });
});

client.on("message", async message => {
  if (message.channel.type === "dm") return;
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  if (!message.content.startsWith(Prefix)) return;

  const args = message.content
    .slice(Prefix.length)
    .trim()
    .split(" ");
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  let command =
    client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));

  if (!command) return;

  if (command) {
    if (!message.guild.me.hasPermission("ADMINISTRATOR"))
      return message.channel.send(
        "I Don't Have Enough Permission To Use This Or Any Of My Commands | Require : Administrator"
      );
    command.run(client, message, args);
  }
  console.log(
    `User : ${message.author.tag} (${message.author.id}) Server : ${message.guild.name} (${message.guild.id}) Command : ${command.name}`
  );
});

// Handle slash command interactions
client.on("interaction", async interaction => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName.toLowerCase();
  const command = client.commands.get(commandName);

  if (!command) {
    return interaction.reply({ content: "Command not found!", ephemeral: true });
  }

  try {
    // Create a fake message object for compatibility with existing commands
    const fakeMessage = {
      member: interaction.member,
      guild: interaction.guild,
      author: interaction.user,
      channel: interaction.channel,
      mentions: {
        members: new Discord.Collection()
      },
      delete: async () => {},
      reply: (content) => interaction.reply({ content }),
      channel: {
        send: (content) => interaction.reply(content instanceof Discord.MessageEmbed ? { embeds: [content] } : { content })
      }
    };

    // Handle member option if provided
    if (interaction.options.getUser("member")) {
      const member = interaction.options.getMember("member");
      fakeMessage.mentions.members.set(member.id, member);
    }

    // Get text option if provided
    const textOption = interaction.options.getString("text");
    const args = textOption ? textOption.split(" ") : [];

    // Run the command
    command.run(client, fakeMessage, args);

    console.log(
      `Slash Command Used - User : ${interaction.user.tag} (${interaction.user.id}) Server : ${interaction.guild.name} (${interaction.guild.id}) Command : ${commandName}`
    );
  } catch (error) {
    console.error(error);
    interaction.reply({ content: "There was an error executing that command!", ephemeral: true });
  }
});

client.login(Token);