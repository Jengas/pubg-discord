const Discord = require("discord.js");
const pubg = require('pubg.js');
const client = new Discord.Client();
const config = require("./settings/config.json");
// PUBG KEY
const pubgClient = new pubg.Client(config.pubgtoken);

// Set the prefix
let prefix = config.prefix;

client.on('ready', () => {

  // set status
  client.user.setStatus("online", `${config.game}`) // Change from settings/config.json
  console.log('Your Bot is Online')
});

client.on("message", async (message) => {
  // Exit and stop if the prefix is not there or if user is a bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (message.content.startsWith(prefix + "user")) {
    var pubgargs = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = pubgargs.shift();
    let playerName = pubgargs[0];
    let playerRegion = pubgargs[1];
    //console.log(`Hello ${message.author.username}, your PUBG Nick is ${playerName} and region is ${playerRegion}`);
    try {
      const Player = await pubgClient.getPlayer({
        name: playerName
      }, playerRegion);
      //console.log(Player);
      const Match = await Player[0].relationships.matches[0].fetch()
      const Matches = await Player[0].relationships.matches
      //console.log(Matches.length);
      const playerEmbed = new Discord.RichEmbed()
        .setTitle("Game statistics about player:")
        .setAuthor(playerName, "https://i.imgur.com/O8Q7Eqq.png")
        .setColor("#f7c121")
        .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
        .setThumbnail("https://i.imgur.com/4NHuKRX.png")
        .setTimestamp()
        .addBlankField(true)
        .addField("Last played match:", `**${Match.attributes.duration}** seconds in **${Match.attributes.gameMode}** gamemode.`, false)
        .addField("Total matches played:", `${Matches.length}`, true)
      //console.log("embed passed");
      await message.channel.send(`${message.author.toString()}, stats about **${Player[0].attributes.name}**`, playerEmbed);
    } catch (err) {
      console.log(err)
      await message.channel.send(`Sorry ${message.author.toString()}, not enough arguments. See commands: **$help**`);
    }
  } else
  if (message.content.startsWith(prefix + "matchlist")) {
    var pubgargs = message.content.slice(prefix.length).trim().split(/ +/g);
    try {
      const command = pubgargs.shift();
      let playerName = pubgargs[0];
      let playerRegion = pubgargs[1];
      const Player = await pubgClient.getPlayer({
        name: playerName
      }, playerRegion);
      //console.log(Player);
      const Match = await Player[0].relationships.matches
      //console.log(Match);

      const matchlistEmbed = new Discord.RichEmbed()
        .setTitle("List of matches:")
        .setAuthor(playerName, "https://i.imgur.com/O8Q7Eqq.png")
        .setColor("#f7c121")
        .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
        .setThumbnail("https://i.imgur.com/4NHuKRX.png")
        .setTimestamp()
        .addBlankField(true)
      for(var i = 0, l = Match.length; i < l; i++) {
          var msg = Match[i];
          matchlistEmbed.addField(i, `${msg.id}`, false)
      }

      //console.log("embed passed");
      //console.log(matchlistEmbed);

      await message.channel.send(`${message.author.toString()}, match lists of **${Player[0].attributes.name}**`, matchlistEmbed);
    } catch (err) {
      console.log(err)
      await message.channel.send(`Sorry ${message.author.toString()}, not enough arguments. See commands: **$help**`);
    }
  } else
  if (message.content.startsWith(prefix + "help")) {

    const helpEmbed = new Discord.RichEmbed()
      .setTitle("PUBG BOT help")
      .setColor("#f7c121")
      .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
      .setTimestamp()
      .addField("Servers:", "pc-na - [North America]\npc-eu - [Europe]\npc-as - [Asia]\npc-oc - [Oceania]\npc-sa - [South and Central America]\npc-sea - [South East Asia]\npc-kakao - [Kakaogames]\n---\nxbox-na - [North America]\nxbox-eu - [Europe]\nxbox-as - [Asia]\nxbox-oc - [Oceania]", false)
      .addField("User info:", "__$user NickName Server__\n[EXAMPLE: ``$user Jengas pc-eu``]", true)
      .addField("Match list:", "__$matchlist NickName Server__\n[EXAMPLE: ``$machlist Jengas pc-eu``]", true)
      .addField("Match info:", "__$matchinfo MatchID Server__\n[EXAMPLE: ``$match bde780c3-8887-4c11-aa50-0165d02aa7b0 pc-eu``]", true)

    await message.channel.send(`${message.author.toString()}, your help is delivered!`, helpEmbed);
  } else
  if (message.content.startsWith(prefix + "matchinfo")) {
    var pubgargs = message.content.slice(prefix.length).trim().split(/ +/g);
    try {
      const command = pubgargs.shift();
      let matchID = pubgargs[0];
      let playerRegion = pubgargs[1];
      const Match = await pubgClient.getMatch(matchID, playerRegion);
      //console.log(Match);
      const matchEmbed = new Discord.RichEmbed()
        .setTitle("Match info:")
        .setColor("#f7c121")
        .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
        .setThumbnail("https://i.imgur.com/4NHuKRX.png")
        .setTimestamp()
        .addBlankField(true)
        .addField("Created at:", `${Match.attributes.createdAt}`, true)
        .addField("Server:", `${Match.attributes.shardId}`, true)
        .addField("Gamemode:", `${Match.attributes.gameMode}`, true)
        .addField("Duration:", `${Match.attributes.duration}`, true)

      await message.channel.send(`${message.author.toString()}, stats about **${Match.id}**`, matchEmbed);
    } catch (err) {
      console.log(err)
      await message.channel.send(`Sorry ${message.author.toString()}, not enough arguments. See commands: **$help**`);
    }
  }
});

//Login to your bot edit the config file on settings folder
client.login(config.discordtoken); // Find your token > https://discordapp.com/developers/applications/me
