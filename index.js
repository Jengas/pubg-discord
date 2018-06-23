// DISCORD AND COMMAND HANDLER
const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");

// Config and client
const client = new Discord.Client();
const config = require("./settings/config.json");
// We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
client.config = config;
client.Discord = Discord;


// JSON DATABASE Module
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('data/db.json')
const db = low(adapter)
client.low = low;
client.FileSync = FileSync;
client.adapter = adapter;
client.db = db;

// PUBG CLIENT
const pubg = require('pubg.js');
const pubgClient = new pubg.Client(config.pubgtoken);
client.pubgClient = pubgClient;

// LIST OF PUBG SERVERS
const PUBGservers = [
  "pc-na",
  "pc-eu",
  "pc-ru",
  "pc-krjp",
  "pc-as",
  "pc-oc",
  "pc-sa",
  "pc-sea",
  "pc-kakao",

  "xbox-na",
  "xbox-eu",
  "xbox-as",
  "xbox-oc"
];
client.PUBGservers = PUBGservers;


fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    //console.log(`Попытка загрузить команду ${commandName}`);
    client.commands.set(commandName, props);
  });
});

// JUST IN CASE OF ANY ERROR OF DISCORD.JS
client.on("error", (o_O) => {});

// On bot ready function
client.on('ready', () => {

  // Set status
  client.user.setStatus("idle") // Set status
  client.user.setActivity(`${config.game}`) // Set game. Change from settings/config.json
  console.log('BOT is now online!')
});

// Sort functions for commands


const getObjects = function getObjects(obj, key, val) {
  var objects = [];
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
      objects = objects.concat(getObjects(obj[i], key, val));
    } else
      //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
      if (i == key && obj[i] == val || i == key && val == '') { //
        objects.push(obj);
      } else if (obj[i] == val && key == '') {
      //only add if the object is not already in the array
      if (objects.lastIndexOf(obj) == -1) {
        objects.push(obj);
      }
    }
  }
  return objects;
}

const getValues = function getValues(obj, key) {
  var objects = [];
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] == 'object') {
      objects = objects.concat(getValues(obj[i], key));
    } else if (i == key) {
      objects.push(obj[i]);
    }
  }
  return objects;
}
const SecondsTohhmmss = function(totalSeconds) {
  var minutes = Math.floor((totalSeconds) / 60);
  var seconds = totalSeconds - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds * 100) / 100

  var result = (minutes < 10 ? "0" + minutes : minutes);
  result += "m " + (seconds < 10 ? "0" + seconds : seconds);
  result += "s "
  return result;
}

const roundUp = function roundUp(num, precision) {
  if (num != 0 || "NaN") {
    precision = Math.pow(1, precision)
    return Math.ceil(num * precision) / precision
  } else {
    return num;
  }
}
client.getObjects = getObjects;
client.getValues = getValues;
client.SecondsTohhmmss = SecondsTohhmmss;
client.roundUp = roundUp;


setInterval(async function() {
  var notify = db.get('users')
    .filter({
      notify: "true"
    })
    .value()
  // console.log("1");
  // console.log(notify);

  uid_array = notify.filter(a => a.notify).map(a => a.uid);
  pubgUser_array = notify.filter(a => a.notify).map(a => a.pubgUser);
  pubgServer_array = notify.filter(a => a.notify).map(a => a.pubgServer);
  //console.log(uid_array);
  for (var i = 0, l = notify.length; i < l; i++) {
    var n_uid = uid_array[i];
    var n_pubgUser = pubgUser_array[i];
    var n_pubgServer = pubgServer_array[i];
    // console.log(n_uid);
    // console.log(n_pubgUser);
    // console.log(n_pubgServer);
    var Player = await pubgClient.getPlayer({
      name: n_pubgUser
    }, n_pubgServer);
    var getMatch = await Player.relationships.matches[0]
    try {
      var Match = await pubgClient.getMatch(getMatch.id);
    } catch (e) {
      continue;
    }
    var lastmatch = Match.id;
    var checkmatch = db.get('users')
      .find({
        uid: n_uid
      })
      .write()
    var oldmatch = checkmatch.lastmatch;
    if (lastmatch != oldmatch) {
      // console.log("HE NEEEEEEEEEEEEEED GET THIS MATCH");
      var userObject = getObjects(Match, '', n_pubgUser);
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
      // console.log(teammatesName);
      //console.log(Matches.length);
      const playerEmbed = new Discord.RichEmbed()
        .setTitle("Game statistics about player:")
        .setAuthor(n_pubgUser, "https://i.imgur.com/O8Q7Eqq.png")
        .setColor("#f7c121")
        .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
        .setThumbnail("https://i.imgur.com/4NHuKRX.png")
        .setTimestamp()
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
      try {
        await client.users.get(n_uid).send(`Your lastest stats about match:`, playerEmbed);
      } catch (e) {
        continue;
      }
    } else {
      // console.log("HE DONT NEEEEEEEEEEED GET NOOOOOO");
    }
    db.get('users')
      .find({
        uid: n_uid
      })
      .assign({
        lastmatch: lastmatch
      })
      .write()
    // console.log("Assigned last match");
  }

}, 200 * 1000);


// Login to Discord API
client.login(config.token);
