exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const logger = client.logger;
  const pubgClient = client.pubgClient;

  try {
    let playerName = args[0];
    let playerRegion = args[1];
    if (typeof playerName == 'undefined') {
      await message.reply(`you haven't specified player name. See commands: **${client.config.prefix}help**`);
      return;
    } else
    if (typeof playerRegion == 'undefined') {
      await message.reply(`you haven't specified server region. See commands: **${client.config.prefix}help**`);
      return;
    }
    const Player = await pubgClient.getPlayer({
      name: playerName
    }, playerRegion);
    const Match = await Player.relationships.matches

    const matchlistEmbed = new Discord.RichEmbed()
      .setTitle("List of matches:")
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

    await message.channel.send(`${message.author.toString()}, the list of matches of the player **${Player.attributes.name}**`, matchlistEmbed);
    logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
  } catch (err) {
    logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
    await message.reply(`wrong arguments. See commands: **${client.config.prefix}help**`);
  }
}
