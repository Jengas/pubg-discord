module.exports = async (client, message) => {
  const Discord = client.Discord;

  const config = client.config;
  const dbsql = client.dbsql;

  const logger = client.logger;

  const getObjects = client.getObjects;
  const getValues = client.getValues;
  const secondsTohhmmss = client.secondsTohhmmss;
  const roundUp = client.roundUp;
  const pubgClient = client.pubgClient;
  const PUBGservers = client.PUBGservers;
  
  const lang = client.lang;


  let wait = ms => new Promise(resolve => setTimeout(resolve, ms));


  client.user.setStatus("idle");
  client.user.setActivity(`${config.game}`);
  console.log('Bot is now running!');
  logger.info('Bot is now running!');

  dbsql.prepare('CREATE TABLE IF NOT EXISTS users ( userid TEXT, pubgUser TEXT, pubgServer TEXT, NewPubgServer TEXT, notify TEXT DEFAULT "false", lastmatch TEXT )').run();
  dbsql.prepare('CREATE TABLE IF NOT EXISTS servers ( serverid TEXT, language TEXT DEFAULT "en", stats_channel TEXT DEFAULT "false" )').run();

  async function checkUsers() {
    var notify = dbsql.prepare('SELECT * FROM users WHERE notify=?').all("1");

    for (var i = 0, l = notify.length; i < l; i++) {
      var n_uid = notify[i].userid;
      var n_pubgUser = notify[i].pubgUser;
      var n_pubgServer = notify[i].pubgServer;
      var Player = await pubgClient.getPlayer({
        name: n_pubgUser
      }, n_pubgServer);
      var getMatch = await Player.relationships.matches[0]
      try {
        var Match = await pubgClient.getMatch(getMatch.id);
        var lastmatch = Match.id;
        var checkmatch = dbsql.prepare('SELECT * FROM users WHERE userid=?').get(n_uid);
        var oldmatch = checkmatch.lastmatch;
        if (lastmatch != oldmatch) {
          var userObject = getObjects(Match, '', n_pubgUser);
          var username = getValues(userObject, 'name');
          var winPlace = getValues(userObject, 'winPlace');
          var rankPoints = getValues(userObject, 'rankPoints');
          var kills = getValues(userObject, 'kills');
          var totalDamage = getValues(userObject, 'damageDealt');
          var timeSurvived = getValues(userObject, 'timeSurvived');
          var boosts = getValues(userObject, 'boosts');
          var heals = getValues(userObject, 'heals');
          var assists = getValues(userObject, 'assists');
          var revives = getValues(userObject, 'revives');
          var vehicleDestroys = getValues(userObject, 'vehicleDestroys');
          var traveledOnCar = getValues(userObject, 'rideDistance');
          var traveledOnWalk = getValues(userObject, 'walkDistance');
          var swimDistance = getValues(userObject, 'swimDistance');

          var teammatesObject = getObjects(Match, 'winPlace', winPlace);
          var teammatesName = getValues(teammatesObject, 'name');
          const playerEmbed = new Discord.RichEmbed()
            .setTitle("Latest statistics:")
            .setAuthor(n_pubgUser, "https://i.imgur.com/O8Q7Eqq.png")
            .setColor("#f7c121")
            .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
            .setThumbnail("https://i.imgur.com/4NHuKRX.png")
            .setTimestamp()
            .addField("Last match:", `**${Match.attributes.duration}** seconds in **${Match.attributes.gameMode}** gamemode.`, false)
            .addBlankField(true)
            .addBlankField(true)
            .addField("Gamemode:", `${Match.attributes.gameMode.toUpperCase()}`, true)
            .addField("Teammates:", `${teammatesName}`.replace(/,\s?/g, "\n"), true)
            .addField("Rank:", `${winPlace}`, true)
            .addField("Rank Points:", `${rankPoints}`, true)
            .addField("Time Survived:", `${secondsTohhmmss(Math.ceil(timeSurvived))}`, true)
            .addField("Kills:", `${kills}`, true)
            .addField("Assists:", `${assists} times`, true)
            .addField("Total Damage:", `${totalDamage} hp`, true)
            .addField("Revives:", `${revives}`, true)
            .addField("Used heals:", `${heals}`, true)
            .addField("Used Boosts:", `${boosts}`, true)
            .addField("Traveled on car:", `${roundUp(traveledOnCar, 1)} m`, true)
            .addField("Walked:", `${roundUp(traveledOnWalk, 1)} m`, true)
          await client.users.get(n_uid).send(`Your latest stats on the match:`, playerEmbed);
        } else {}
        dbsql.prepare('UPDATE users SET lastmatch = ? WHERE userid = ?').run(lastmatch, n_uid)
      } catch (e) {
        dbsql.prepare("UPDATE users SET notify = ? WHERE userid=?").run("0", message.author.id)
        continue;
      }
      await wait(2 * 1000);
    }
  }


  setInterval(async function () {
    checkUsers();
  }, client.config.pubg.notify_interval * 1000);

};