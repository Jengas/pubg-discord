exports.run = async (client, message, args) => {

  const Discord = client.Discord;
  const pubgClient = client.pubgClient;
  const getObjects = client.getObjects;
  const getValues = client.getValues;
  const SecondsTohhmmss = client.SecondsTohhmmss;
  const roundUp = client.roundUp;

  try {
    let playerName = args[0];
    let matchID = args[1];

    if (typeof playerName == 'undefined') {
      await message.channel.send(`Sorry ${message.author.toString()}, you haven't specified player name or match id. See commands: **${client.config.prefix}help**`);
      return;
    } else
    if (typeof matchID == 'undefined') {
      await message.channel.send(`Sorry ${message.author.toString()}, you haven't specified match id or player name. See commands: **${client.config.prefix}help**`);
      return;
    }
    const Match = await pubgClient.getMatch(matchID);

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
    //console.log(Match);
    const matchEmbed = new Discord.RichEmbed()
      .setTitle("Match info:")
      .setColor("#f7c121")
      .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
      .setThumbnail("https://i.imgur.com/4NHuKRX.png")
      .setTimestamp()
      .addField("User:", `${username}`, false)
      .addBlankField(true)

      .addField("Created at:", `${Match.attributes.createdAt}`, true)
      .addField("Server:", `${Match.attributes.shardId.toUpperCase()}`, true)
      .addField("Gamemode:", `${Match.attributes.gameMode.toUpperCase()}`, true)
      .addField("Duration:", `${Match.attributes.duration}`, false)
      .addBlankField(true)
      .addBlankField(true)
      .addField("Teammates:", `${teammatesName}`.replace(/,\s?/g, "\n"), true)
      .addField("Rank:", `${winPlace}`, true)
      .addField("Time Survived:", `${SecondsTohhmmss(timeSurvived)}`, true)
      .addField("Kills:", `${kills}`, true)
      .addField("Assists:", `${assists} times`, true)
      .addField("Total Damage:", `${totalDamage} hp`, true)
      .addField("Revives:", `${revives}`, true)
      .addField("Used heals:", `${heals}`, true)
      .addField("Used boosts:", `${boosts}`, true)
      .addField("Traveled on car:", `${roundUp(traveledOnCar, 1)} m`, true)
      .addField("Walked:", `${roundUp(traveledOnWalk, 1)} m`, true)

    await message.channel.send(`${message.author.toString()}, stats about **${Match.id}**`, matchEmbed);
    console.log(`${message.author.tag} (${message.author.id}) - executed command $matchinfo`);
  } catch (err) {
    console.log(err)
    await message.channel.send(`Sorry ${message.author.toString()}, wrong arguments. See commands: **${client.config.prefix}help**`);
    console.log(`${message.author.tag} (${message.author.id}) - executed command $matchinfo wrongly`);
  }
}
