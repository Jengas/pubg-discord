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

// SQL Library
const Database = require('better-sqlite3');
const dbsql = new Database('./data/data.db');
client.Database = Database;
client.dbsql = dbsql;

// Graphics
const Jimp = require('jimp');
client.Jimp = Jimp;

// PUBG CLIENT
const pubgRoyale = require('pubg-royale');
const pubgClient = new pubgRoyale.Client({
    // Put your api key here
    key: config.pubg.pubgtoken,

    // Default region used for api calls. Defaults to "steam" if omitted.
    // The region can be set for individual api calls.
    defaultRegion: pubgRoyale.REGIONS.PC.STEAM,

    // Specifies ttl in ms for cached objects. Any value ommited defaults to 60 seconds.
    // Set every value to zero to disable caching
    cache: {
        player: 120 * 1000,
        playerStats: 120 * 1000,
        match: 120 * 1000,
        status: 120 * 1000,
        seasons: 120 * 1000,
    },
});
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


let lang = {};

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


const getObjects = (obj, key, val) => {
    let objects = [];
    for (let i in obj) {
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

const getValues = (obj, key) => {
    let objects = [];
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getValues(obj[i], key));
        } else if (i == key) {
            objects.push(obj[i]);
        }
    }
    return objects;
}

const secondsTohhmmss = (totalSeconds) => {
    let minutes = Math.floor((totalSeconds) / 60);
    let seconds = totalSeconds - (minutes * 60);

    // round seconds
    seconds = Math.round(seconds * 100) / 100

    let result = (minutes < 10 ? "0" + minutes : minutes);
    result += "min " + (seconds < 10 ? "0" + seconds : seconds);
    result += "sec "
    return result;
}

const roundUp = (num, precision) => {
    if (num != 0 || "NaN") {
        precision = Math.pow(1, precision)
        return Math.ceil(num * precision) / precision
    } else {
        return num;
    }
}

const getServerLanguage = (incomeMessage) => {
    return new Promise((resolve, reject) => {
        let serverData;
        let lng;

        serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(incomeMessage.guild.id)
        if (!serverData) {
            if (incomeMessage.guild.region == 'russia') {
                dbsql.prepare('INSERT INTO servers (serverid, language) VALUES (?, ?)').run(incomeMessage.guild.id, 'ru');
                lng = lang['ru'];
            } else {
                dbsql.prepare('INSERT INTO servers (serverid) VALUES (?)').run(incomeMessage.guild.id);
                lng = lang.en;
            }
            serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(incomeMessage.guild.id)
        }
        if (serverData.language) {
            lng = lang[serverData.language];
        } else {
            lng = lang.en;
        }

        resolve(lng);
    });
}

const genStats = async (player, match, lng) => {
    return new Promise(async (resolve, reject) => {

        let userObject = getObjects(match, '', player.data[0].attributes.name);

        let winPlace = getValues(userObject, 'winPlace');
        let kills = getValues(userObject, 'kills');
        let totalDamage = getValues(userObject, 'damageDealt');
        let timeSurvived = getValues(userObject, 'timeSurvived');
        let boosts = getValues(userObject, 'boosts');
        let heals = getValues(userObject, 'heals');
        let assists = getValues(userObject, 'assists');
        let revives = getValues(userObject, 'revives');
        let traveledOnCar = getValues(userObject, 'rideDistance');
        let traveledOnWalk = getValues(userObject, 'walkDistance');
        let swimDistance = getValues(userObject, 'swimDistance');

        let teammatesObject = getObjects(match, 'winPlace', winPlace);
        let teammatesName = getValues(teammatesObject, 'name').slice(0, 4);

        let oswald_white_24 = await Jimp.loadFont(`./data/fonts/oswald/oswald_white_24.fnt`);
        let oswald_orange_32 = await Jimp.loadFont(`./data/fonts/oswald/oswald_orange_32.fnt`);
        let oswald_orange_48 = await Jimp.loadFont(`./data/fonts/oswald/oswald_orange_48.fnt`);
        let oswald_black_15 = await Jimp.loadFont(`./data/fonts/oswald/oswald_black_15.fnt`);
        let oswald_black_36 = await Jimp.loadFont(`./data/fonts/oswald/oswald_black_36.fnt`);

        let tm_font = oswald_black_15
        let tm_x = 300
        let tm_y = 140
        let tm_maxwidth = 200
        let tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
        let tm_text

        if (teammatesName.length == 1) {
            tm_font = oswald_black_15
            tm_x = 300
            tm_y = 140
            tm_maxwidth = 200
            tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
            tm_text = teammatesName.join(' ');
        } else
        if (teammatesName.length == 2) {
            tm_font = oswald_black_15
            tm_x = 390
            tm_y = 110
            tm_maxwidth = 25
            tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
            tm_text = teammatesName.join(' ');
        } else
        if (teammatesName.length >= 3) {
            tm_font = oswald_black_15
            tm_x = 390
            tm_y = 88
            tm_maxwidth = 25
            tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
            tm_text = teammatesName.join(' ');
        }


        const image = await Jimp.read('./data/images/bg.png');

        let img = image.print(
                // Username
                oswald_orange_32,
                30,
                6, {
                    text: `${player.data[0].attributes.name}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }
            ).print(
                // Server info
                oswald_white_24,
                358,
                -4, {
                    text: `${match.data.attributes.shardId.toUpperCase()} ${match.data.attributes.gameMode.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
                },
                400
            ).print(
                // Date
                oswald_white_24,
                358,
                22, {
                    text: `${new Date(match.data.attributes.createdAt).toUTCString().split(' ').slice(0, 6).join(' ')}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
                },
                400
            ).print(
                // Rank title
                oswald_white_24,
                43,
                75, {
                    text: `${lng.rank}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Rank data
                oswald_orange_48,
                40,
                120, {
                    text: `#${winPlace}/100`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Rank title
                oswald_white_24,
                304,
                75, {
                    text: `${lng.teammates}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Rank data
                tm_font,
                tm_x,
                tm_y, {
                    text: `${tm_text}`,
                    alignmentX: tm_aligment
                },
                tm_maxwidth
            )
            .print(
                // Survived title
                oswald_white_24,
                570,
                75, {
                    text: `${lng.timesurvived}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Survived data
                oswald_orange_48,
                560,
                100, {
                    text: `${Math.floor(timeSurvived / 60)}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Survived metrics
                oswald_black_36,
                560,
                150, {
                    text: `${lng.min}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Kills title
                oswald_white_24,
                43,
                207, {
                    text: `${lng.kills}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Kills data
                oswald_orange_48,
                40,
                230, {
                    text: `${kills}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Kills metrics
                oswald_black_36,
                40,
                280, {
                    text: `${lng.kills.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Total Damage title
                oswald_white_24,
                304,
                207, {
                    text: `${lng.totaldamage}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Total Damage data
                oswald_orange_48,
                304,
                230, {
                    text: `${Math.ceil(totalDamage)}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Total Damage metrics
                oswald_black_36,
                305,
                280, {
                    text: `${lng.hp.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Revives title
                oswald_white_24,
                570,
                207, {
                    text: `${lng.revives}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Revives data
                oswald_orange_48,
                560,
                230, {
                    text: `${revives}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Revives metrics
                oswald_black_36,
                560,
                280, {
                    text: `${lng.times.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Assists title
                oswald_white_24,
                43,
                335, {
                    text: `${lng.assists}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Assists data
                oswald_orange_48,
                40,
                360, {
                    text: `${assists}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Used heals metrics
                oswald_black_36,
                40,
                410, {
                    text: `${lng.times.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Used heals title
                oswald_white_24,
                304,
                335, {
                    text: `${lng.usedheals}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Used heals data
                oswald_orange_48,
                304,
                360, {
                    text: `${heals}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Used heals metrics
                oswald_black_36,
                304,
                410, {
                    text: `${lng.times.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Used boosts title
                oswald_white_24,
                570,
                335, {
                    text: `${lng.usedboosts}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Used boosts data
                oswald_orange_48,
                560,
                360, {
                    text: `${boosts}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Used boosts metrics
                oswald_black_36,
                560,
                410, {
                    text: `${lng.times.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // On car title
                oswald_white_24,
                43,
                465, {
                    text: `${lng.traveledoncar}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // On car data
                oswald_orange_48,
                43,
                490, {
                    text: `${roundUp(traveledOnCar, 1)}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // On car metrics
                oswald_black_36,
                43,
                540, {
                    text: `${lng.meters_singular.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // On foot title
                oswald_white_24,
                304,
                465, {
                    text: `${lng.walked}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // On foot data
                oswald_orange_48,
                304,
                490, {
                    text: `${roundUp(traveledOnWalk, 1)}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // On foot metrics
                oswald_black_36,
                304,
                540, {
                    text: `${lng.meters_singular.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Sum title
                oswald_white_24,
                570,
                465, {
                    text: `${lng.swum}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT
                },
                183
            )
            .print(
                // Swum data
                oswald_orange_48,
                560,
                490, {
                    text: `${Math.ceil(swimDistance)}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
            .print(
                // Swum metrics
                oswald_black_36,
                560,
                540, {
                    text: `${lng.meters_singular.toUpperCase()}`,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
                },
                200
            )
        img.getBuffer(Jimp.AUTO, async (err, buffer) => {
            resolve(buffer);
        });


    });

}


client.getObjects = getObjects;
client.getValues = getValues;
client.secondsTohhmmss = secondsTohhmmss;
client.roundUp = roundUp;
client.getServerLanguage = getServerLanguage;
client.genStats = genStats;


// Login to Discord API
client.login(config.token);