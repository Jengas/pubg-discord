exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const dbsql = client.dbsql;
  const lang = client.lang;

  var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)

  if (serverData.language == 'ru') {
    var lng = lang.ru;
  } else {
    var lng = lang.en;
  }

  try {
    let playerName = args[0];
    let playerRegion = args[1];
    if (typeof playerName == 'undefined') {
      await message.reply(`${lng.namenotspecified}: **${client.config.prefix}help**`);
      return;
    } else
    if (typeof playerRegion == 'undefined') {
      await message.reply(`${lng.servernotspecified}: **${client.config.prefix}help**`);
      return;
    }
    const Player = await pubgClient.getPlayer({
      name: playerName
    }, playerRegion);
    const Match = await Player.relationships.matches

    const matchlistEmbed = new Discord.RichEmbed()
      .setTitle(lng.listofmatches_1)
      .setAuthor(playerName, "https://i.imgur.com/O8Q7Eqq.png")
      .setColor("#f7c121")
      .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
      .setThumbnail("https://i.imgur.com/4NHuKRX.png")
      .setTimestamp()
      .addBlankField(true)
    for (var i = 0; i < 20; i++) {
      var msg = Match[i];
      if (msg == null) {
        continue;
      }
      matchlistEmbed.addField(i + 1, "```fix\n" + msg.id + "\n```", false)
    }

    await message.reply(`${lng.listofmatches} **${Player.attributes.name}**`, matchlistEmbed);
  } catch (err) {
    await message.reply(`${lng.wrongargs}: **${client.config.prefix}help**`);
  }
  logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}