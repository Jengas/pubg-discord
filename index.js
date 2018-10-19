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

const talkedRecently = new Set();
client.talkedRecently = talkedRecently;

// SQL Library
var Database = require('better-sqlite3');
var dbsql = new Database('./data/data.db');
client.Database = Database;
client.dbsql = dbsql;

// Graphics
const Jimp = require('jimp');
client.Jimp = Jimp;

// PUBG CLIENT
const pubg = require('pubg.js');
const pubgClient = new pubg.Client(config.pubg.pubgtoken);
client.pubgClient = pubgClient;


// LIST OF PUBG SERVERS
const PUBGservers = config.pubg.PUBGservers;
client.PUBGservers = PUBGservers;

// Logger
const log4js = require('log4js');
log4js.configure({
  appenders: {
    all: {
      type: 'file',
      filename: './data/logs/all.log'
    }
  },
  categories: {
    default: {
      appenders: ['all'],
      level: 'debug'
    }
  }
});
const logger = log4js.getLogger('pubg');
client.log4js = log4js;
client.logger = logger;


const lang = {};

fs.readdir("./data/lang/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let fileName = file.split(".")[0];
    lang[fileName] = require(`./data/lang/${fileName}.json`);
  });
});
client.lang = lang;

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    if (eventName == 'ready') {
      client.once(eventName, event.bind(null, client));
    } else {
      client.on(eventName, event.bind(null, client));
    }
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
  });
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

const secondsTohhmmss = function (totalSeconds) {
  var minutes = Math.floor((totalSeconds) / 60);
  var seconds = totalSeconds - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds * 100) / 100

  var result = (minutes < 10 ? "0" + minutes : minutes);
  result += "min " + (seconds < 10 ? "0" + seconds : seconds);
  result += "sec "
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
client.secondsTohhmmss = secondsTohhmmss;
client.roundUp = roundUp;


// Login to Discord API
client.login(config.token);