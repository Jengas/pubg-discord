exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const pubgClient = client.pubgClient;

  try {
    let playerName = args[0];
    let playerRegion = args[1];
    if (typeof playerName == 'undefined') {
      await message.channel.send(`Sorry ${message.author.toString()}, you haven't specified player name. See commands: **${client.config.prefix}help**`);
      return;
    } else
    if (typeof playerRegion == 'undefined') {
      await message.channel.send(`Sorry ${message.author.toString()}, you haven't specified server region. See commands: **${client.config.prefix}help**`);
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
      console.log(msg);
  	  if (msg == null) {
  		  continue;
  	  }
      matchlistEmbed.addField(i + 1, "```fix\n" + msg.id + "\n```", false)
    }

    await message.channel.send(`${message.author.toString()}, match lists of **${Player.attributes.name}**`, matchlistEmbed);
    console.log(`${message.author.tag} (${message.author.id}) - executed command $matchlist`);
  } catch (err) {
    console.log(err)
    console.log(`${message.author.tag} (${message.author.id}) - executed command $matchlist wrongly!`);
    await message.channel.send(`Sorry ${message.author.toString()}, wrong arguments. See commands: **${client.config.prefix}help**`);
  }
}
