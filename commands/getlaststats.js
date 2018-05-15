exports.run = async (client, message, args) => {

  const Discord = client.Discord;
  const pubgClient = client.pubgClient;
  const low = client.low;
  const FileSync = client.FileSync;
  const adapter = client.adapter;
  const db = client.db;
  const getObjects = client.getObjects;
  const getValues = client.getValues;
  const SecondsTohhmmss = client.SecondsTohhmmss;
  const roundUp = client.roundUp;

  var nuid = db.get('users')
    .find({
      uid: message.member.id
    })
    .value()
    if (typeof nuid == 'undefined') {
      console.log(`${message.author.tag} (${message.author.id}) - tried to use getlaststat command, but he did not added account to DB`);
    await message.channel.send(`${message.author.toString()}, you haven't added PUBG user to the bot. Use **${client.config.prefix}addaccount __pubgname__ __pubgserver__**`);
    return;
  }
  console.log(nuid);
  console.log(nuid.pubgUser);
  var Player = await pubgClient.getPlayer({
    name: nuid.pubgUser
  }, nuid.pubgServer);
  var getMatch = await Player.relationships.matches[0];
  try {
    var Match = await pubgClient.getMatch(getMatch.id);
  } catch (e) {
    await message.channel.send(`${message.author.toString()}, this player hasn't played PUBG yet.`);
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
  console.log(teammatesName);

  const matchEmbed = new Discord.RichEmbed()
    .setTitle("Latest info about match:")
    .setColor("#f7c121")
    .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
    .setThumbnail("https://i.imgur.com/4NHuKRX.png")
    .setTimestamp()
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

  await message.channel.send(`${message.author.toString()}, latest stats:`, matchEmbed);
  console.log(`${message.author.tag} (${message.author.id}) - executed command $getlaststats`);
}
