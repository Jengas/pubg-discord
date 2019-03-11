exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const PUBGservers = client.PUBGservers;
  const genStats = client.genStats;
  const getServerLanguage = client.getServerLanguage;

  let lng = await getServerLanguage(message).then(l => l);

  let playerName = args[0];
  let playerRegion = args[1];

  if (typeof playerName == 'undefined') return await message.reply(`You haven't specified player name. See syntax **${client.config.prefix}help**`);
  if (typeof playerRegion == 'undefined') return await message.reply(`You haven't specified platform. See syntax: **${client.config.prefix}help**`);
  if (!PUBGservers.includes(playerRegion)) return await message.reply(`Platform that you have specified doesn't exist`);

  let matches;
  let player;

  await pubgClient.player({
      name: playerName,
      region: playerRegion,
    })
    .then((pl) => {
      matches = pl.data[0].relationships.matches.data;
      player = pl;
    })
    .catch((error) => {
      message.reply(`I couldn't find a player. Are you sure it exists?`);
    });

  const matchlistEmbed = new Discord.RichEmbed()
    .setTitle(`List of mathes`)
    .setAuthor(playerName, "https://i.imgur.com/O8Q7Eqq.png")
    .setColor("#f7c121")
    .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
    .setThumbnail("https://i.imgur.com/4NHuKRX.png")
    .setTimestamp()
  for (let i = 0; i < 20; i++) {
    var msg = matches[i];
    if (!msg) continue;
    matchlistEmbed.addField(i + 1, "```fix\n" + msg.id + "\n```", false)
  }

  await message.reply(`Here is the match list of **${player.data[0].attributes.name}**`, matchlistEmbed);

  await message.delete()
    .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
    .catch(console.error);
}