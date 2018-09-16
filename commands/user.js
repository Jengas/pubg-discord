exports.run = async (client, message, args) => {

  const Discord = client.Discord;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const PUBGservers = client.PUBGservers;
  const getObjects = client.getObjects;
  const getValues = client.getValues;
  const SecondsTohhmmss = client.SecondsTohhmmss;
  const roundUp = client.roundUp;

  let playerName = args[0];
  let playerRegion = args[1];

  if (typeof playerName == 'undefined') {
    await message.reply(`you haven't specified player name. See commands: **${client.config.prefix}help**`);
    return;
  } else
  if (typeof playerRegion == 'undefined') {
    await message.reply(`you haven't specified player region. See commands: **${client.config.prefix}help**`);
    return;
  } else
  if (!PUBGservers.includes(playerRegion)) {
    await message.reply(`server you specified doesn't exists.`);
    return;
  }

  try {
    var Player = await pubgClient.getPlayer({
      name: playerName
    }, playerRegion);
    var getMatch = await Player.relationships.matches[0]
    try {
      var Match = await pubgClient.getMatch(getMatch.id);
    } catch (e) {
      await message.reply(`this player has not played PUBG match yet.`);
      return;
    }
    var Matches = await Player.relationships.matches

    var userObject = getObjects(Match, '', playerName);
    var username = getValues(userObject, 'name');
    var winPlace = getValues(userObject, 'winPlace');
    var kills = getValues(userObject, 'kills');
    var totalDamage = getValues(userObject, 'kills');
    var timeSurvived = getValues(userObject, 'timeSurvived');
    var boosts = getValues(userObject, 'boosts');
    var heals = getValues(userObject, 'heals');
    var assists = getValues(userObject, 'assists');
    var revives = getValues(userObject, 'revives');
    var traveledOnCar = getValues(userObject, 'rideDistance');
    var traveledOnWalk = getValues(userObject, 'walkDistance');
    var traveledOnWalk = getValues(userObject, 'walkDistance');

    var teammatesObject = getObjects(Match, 'winPlace', winPlace);
    var teammatesName = getValues(teammatesObject, 'name');
    console.log(teammatesName);
    //console.log(Matches.length);
    const playerEmbed = new Discord.RichEmbed()
      .setTitle("Game statistics about player:")
      .setAuthor(playerName, "https://i.imgur.com/O8Q7Eqq.png")
      .setColor("#f7c121")
      .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
      .setThumbnail("https://i.imgur.com/4NHuKRX.png")
      .setTimestamp()
      .addField("Total matches played:", `${Matches.length}`, true)
      .addField("Last played match:", `**${Match.attributes.duration}** seconds in **${Match.attributes.gameMode}** gamemode.`, false)
      .addBlankField(true)
      .addBlankField(true)
      .addField("Gamemode:", `${Match.attributes.gameMode.toUpperCase()}`, true)
      .addField("Teammates:", `${teammatesName}`.replace(/,\s?/g, "\n"), true)
      .addField("Rank:", `${winPlace}`, true)
      .addField("Time Survived:", `${SecondsTohhmmss(timeSurvived)}`, true)
      .addField("Kills:", `${kills}`, true)
      .addField("Assists:", `${assists} times`, true)
      .addField("Total Damage:", `${totalDamage} hp`, true)
      .addField("Revives:", `${revives}`, true)
      .addField("Used heals:", `${heals}`, true)
      .addField("Used boosts:", `${boosts}`, true)
      .addField("Assists:", `${assists} times`, true)
      .addField("Traveled on car:", `${roundUp(traveledOnCar, 1)} m`, true)
      .addField("Walked:", `${roundUp(traveledOnWalk, 1)} m`, true)

    await message.channel.send(`${message.author.toString()}, stats about **${Player.attributes.name}**`, playerEmbed);
    logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
  } catch (err) {
    await message.reply(`wrong arguments. See commands: **${client.config.prefix}help**`);
    logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
  }
}
