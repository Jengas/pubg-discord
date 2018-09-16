exports.run = async (client, message, args) => {

  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const getObjects = client.getObjects;
  const getValues = client.getValues;
  const SecondsTohhmmss = client.SecondsTohhmmss;
  const roundUp = client.roundUp;

  var nuid = dbsql.prepare("SELECT * FROM users WHERE userid=?").get(message.author.id);

  if (nuid == undefined) {
    await message.reply(`you have not linker your PUBG account to the bot. Use **${client.config.prefix}addaccount** to link an account`);
    return;
  }
  var Player = await pubgClient.getPlayer({
    name: nuid.pubgUser
  }, nuid.pubgServer);
  var getMatch = await Player.relationships.matches[0];
  try {
    var Match = await pubgClient.getMatch(getMatch.id);
  } catch (e) {
    await message.reply(`this player has not played PUBG match yet.`);
    return;
  }

  var userObject = getObjects(Match, '', nuid.pubgUser);
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

  const matchEmbed = new Discord.RichEmbed()
    .setTitle("The latest information about the match:")
    .setColor("#f7c121")
    .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
    .setThumbnail("https://i.imgur.com/4NHuKRX.png")
    .setTimestamp()
    .addField("Game mode:", `${Match.attributes.gameMode.toUpperCase()}`, true)
    .addField("Teammates:", `${teammatesName}`.replace(/,\s?/g, "\n"), true)
    .addField("Rank:", `${winPlace}`, true)
    .addField("Time survived:", `${SecondsTohhmmss(timeSurvived)}`, true)
    .addField("Kills:", `${kills}`, true)
    .addField("Assists:", `${assists} times`, true)
    .addField("Total Damage:", `${totalDamage} hp`, true)
    .addField("Revives:", `${revives}`, true)
    .addField("Used heals:", `${heals}`, true)
    .addField("Used boosts:", `${boosts}`, true)
    .addField("Traveled on car:", `${roundUp(traveledOnCar, 1)} m`, true)
    .addField("Walked:", `${roundUp(traveledOnWalk, 1)} m`, true)

  await message.channel.send(`${message.author.toString()}, latest statistics:`, matchEmbed);
  logger.info(`${message.author.tag} (${message.author.id}) - execute the command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}
