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
  const Jimp = client.Jimp;

  const lang = client.lang;


  let wait = ms => new Promise(resolve => setTimeout(resolve, ms));


  client.user.setStatus("idle");
  client.user.setActivity(`${config.game}`);
  console.log('Bot is now running!');
  logger.info('Bot is now running!');

  dbsql.prepare('CREATE TABLE IF NOT EXISTS users ( `userid` TEXT, `pubgUser` TEXT, `pubgServer` TEXT, `notify` TEXT DEFAULT 0, `notifyLocation` TEXT DEFAULT "DM", `notifySID` TEXT, `lastmatch` TEXT )').run();
  dbsql.prepare('CREATE TABLE IF NOT EXISTS servers ( serverid TEXT, language TEXT DEFAULT "en", stats_channel TEXT DEFAULT "false" )').run();

  // async function checkUsers() {
  //   var notify = dbsql.prepare('SELECT * FROM users WHERE notify=?').all("1");

  //   for (var i = 0, l = notify.length; i < l; i++) {
  //     var n_uid = notify[i].userid;
  //     var n_pubgUser = notify[i].pubgUser;
  //     var n_pubgServer = notify[i].pubgServer;
  //     var Player = await pubgClient.getPlayer({
  //       name: n_pubgUser
  //     }, n_pubgServer);
  //     var getMatch = await Player.relationships.matches[0]
  //     try {
  //       var Match = await pubgClient.getMatch(getMatch.id);
  //       var lastmatch = Match.id;
  //       var checkmatch = dbsql.prepare('SELECT * FROM users WHERE userid=?').get(n_uid);
  //       var oldmatch = checkmatch.lastmatch;
  //       if (lastmatch != oldmatch) {
  //         var userObject = getObjects(Match, '', n_pubgUser);
  //         var username = getValues(userObject, 'name');
  //         var winPlace = getValues(userObject, 'winPlace');
  //         var rankPoints = getValues(userObject, 'rankPoints');
  //         var kills = getValues(userObject, 'kills');
  //         var totalDamage = getValues(userObject, 'damageDealt');
  //         var timeSurvived = getValues(userObject, 'timeSurvived');
  //         var boosts = getValues(userObject, 'boosts');
  //         var heals = getValues(userObject, 'heals');
  //         var assists = getValues(userObject, 'assists');
  //         var revives = getValues(userObject, 'revives');
  //         var vehicleDestroys = getValues(userObject, 'vehicleDestroys');
  //         var traveledOnCar = getValues(userObject, 'rideDistance');
  //         var traveledOnWalk = getValues(userObject, 'walkDistance');
  //         var swimDistance = getValues(userObject, 'swimDistance');

  //         var teammatesObject = getObjects(Match, 'winPlace', winPlace);
  //         var teammatesName = getValues(teammatesObject, 'name');
  //         const playerEmbed = new Discord.RichEmbed()
  //           .setTitle("Latest statistics:")
  //           .setAuthor(n_pubgUser, "https://i.imgur.com/O8Q7Eqq.png")
  //           .setColor("#f7c121")
  //           .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
  //           .setThumbnail("https://i.imgur.com/4NHuKRX.png")
  //           .setTimestamp()
  //           .addField("Last match:", `**${Match.attributes.duration}** seconds in **${Match.attributes.gameMode}** gamemode.`, false)
  //           .addBlankField(true)
  //           .addBlankField(true)
  //           .addField("Gamemode:", `${Match.attributes.gameMode.toUpperCase()}`, true)
  //           .addField("Teammates:", `${teammatesName}`.replace(/,\s?/g, "\n"), true)
  //           .addField("Rank:", `${winPlace}`, true)
  //           .addField("Rank Points:", `${rankPoints}`, true)
  //           .addField("Time Survived:", `${secondsTohhmmss(Math.ceil(timeSurvived))}`, true)
  //           .addField("Kills:", `${kills}`, true)
  //           .addField("Assists:", `${assists} times`, true)
  //           .addField("Total Damage:", `${totalDamage} hp`, true)
  //           .addField("Revives:", `${revives}`, true)
  //           .addField("Used heals:", `${heals}`, true)
  //           .addField("Used Boosts:", `${boosts}`, true)
  //           .addField("Traveled on car:", `${roundUp(traveledOnCar, 1)} m`, true)
  //           .addField("Walked:", `${roundUp(traveledOnWalk, 1)} m`, true)
  //         await client.users.get(n_uid).send(`Your latest stats on the match:`, playerEmbed);
  //       } else {}
  //       dbsql.prepare('UPDATE users SET lastmatch = ? WHERE userid = ?').run(lastmatch, n_uid)
  //     } catch (e) {
  //       dbsql.prepare("UPDATE users SET notify = ? WHERE userid=?").run("0", message.author.id)
  //       continue;
  //     }
  //     await wait(2 * 1000);
  //   }
  // }


  // setInterval(async function () {
  //   checkUsers();
  // }, client.config.pubg.notify_interval * 1000);

  async function asyncServerStats(serverdata, userdata) {
    if (serverdata.language == 'ru') {
      var lng = lang.ru;
    } else {
      var lng = lang.en;
    }

    for (let i = 0; i < userdata.length; i++) {
      
      var userData = userdata[i];
      
      if (userData.notifySID == serverdata.serverid && serverdata.stats_toggle != '0') {

        var Player = await pubgClient.getPlayer({
          name: userData.pubgUser
        }, userData.pubgServer);
        var getMatch = await Player.relationships.matches[0];
        try {
          var Match = await pubgClient.getMatch(getMatch.id);
        } catch (e) {
          dbsql.prepare("UPDATE users SET notify = ? WHERE userid = ?").run("0", userData.userid)
          await client.users.get(userData.userid).send(lng.notify_error);
          continue;
        }

        var lastmatch = Match.id;
        var checkmatch = dbsql.prepare('SELECT * FROM users WHERE userid=?').get(userData.userid);
        var oldmatch = checkmatch.lastmatch;
        

        if (lastmatch != oldmatch) {
          var userObject = getObjects(Match, '', userData.pubgUser);

          var winPlace = getValues(userObject, 'winPlace');
          var kills = getValues(userObject, 'kills');
          var totalDamage = getValues(userObject, 'damageDealt');
          var timeSurvived = getValues(userObject, 'timeSurvived');
          var boosts = getValues(userObject, 'boosts');
          var heals = getValues(userObject, 'heals');
          var assists = getValues(userObject, 'assists');
          var revives = getValues(userObject, 'revives');
          var traveledOnCar = getValues(userObject, 'rideDistance');
          var traveledOnWalk = getValues(userObject, 'walkDistance');
          var swimDistance = getValues(userObject, 'swimDistance');

          var teammatesObject = getObjects(Match, 'winPlace', winPlace);
          var teammatesName = getValues(teammatesObject, 'name').slice(0, 4);

          async function genStats() {
            var oswald_white_24 = await Jimp.loadFont(`./data/fonts/oswald/oswald_white_24.fnt`);
            var oswald_orange_32 = await Jimp.loadFont(`./data/fonts/oswald/oswald_orange_32.fnt`);
            var oswald_orange_48 = await Jimp.loadFont(`./data/fonts/oswald/oswald_orange_48.fnt`);
            var oswald_black_15 = await Jimp.loadFont(`./data/fonts/oswald/oswald_black_15.fnt`);
            var oswald_black_36 = await Jimp.loadFont(`./data/fonts/oswald/oswald_black_36.fnt`);


            if (teammatesName.length == 1) {
              var tm_font = oswald_black_15
              var tm_x = 300
              var tm_y = 140
              var tm_maxwidth = 200
              var tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
              var tm_text = teammatesName.join(' ');
            } else
            if (teammatesName.length == 2) {
              var tm_font = oswald_black_15
              var tm_x = 390
              var tm_y = 110
              var tm_maxwidth = 25
              var tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
              var tm_text = teammatesName.join(' ');
            } else
            if (teammatesName.length >= 3) {
              var tm_font = oswald_black_15
              var tm_x = 390
              var tm_y = 88
              var tm_maxwidth = 25
              var tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
              var tm_text = teammatesName.join(' ');
            }


            const image = await Jimp.read('./data/images/bg.png');

            var img = image.print(
                // Username
                oswald_orange_32,
                30,
                6, {
                  text: `${Player.attributes.name}`,
                  alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                  alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }
              ).print(
                // Server info
                oswald_white_24,
                358,
                -4, {
                  text: `${Match.attributes.shardId.toUpperCase()} ${Match.attributes.gameMode.toUpperCase()}`,
                  alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
                },
                400
              ).print(
                // Date
                oswald_white_24,
                358,
                22, {
                  text: `${Match.attributes.createdAt.toGMTString().split(' ').slice(0, 6).join(' ')}`,
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
              await client.channels.get(serverdata.stats_channel).send(client.users.get(userData.userid).toString(), {
                file: buffer
              });
            });

          }
          genStats();
          dbsql.prepare('UPDATE users SET lastmatch = ? WHERE userid = ?').run(lastmatch, userData.userid)
        }
      }
    }
  }
  async function asyncUserStats(userdata) {

    for (let i = 0; i < userdata.length; i++) {
      var userData = userdata[i];
      if (userData.language == 'ru') {
        var lng = lang.ru;
      } else {
        var lng = lang.en;
      }


      var Player = await pubgClient.getPlayer({
        name: userData.pubgUser
      }, userData.pubgServer);
      var getMatch = await Player.relationships.matches[0];
      try {
        var Match = await pubgClient.getMatch(getMatch.id);
      } catch (e) {
        dbsql.prepare("UPDATE users SET notify = ? WHERE userid = ?").run("0", userData.userid)
        await client.users.get(userData.userid).send(lng.notify_error);
        continue;
      }

      var lastmatch = Match.id;
      var checkmatch = dbsql.prepare('SELECT * FROM users WHERE userid=?').get(userData.userid);
      var oldmatch = checkmatch.lastmatch;

      if (lastmatch != oldmatch) {
        var userObject = getObjects(Match, '', userData.pubgUser);

        var winPlace = getValues(userObject, 'winPlace');
        var kills = getValues(userObject, 'kills');
        var totalDamage = getValues(userObject, 'damageDealt');
        var timeSurvived = getValues(userObject, 'timeSurvived');
        var boosts = getValues(userObject, 'boosts');
        var heals = getValues(userObject, 'heals');
        var assists = getValues(userObject, 'assists');
        var revives = getValues(userObject, 'revives');
        var traveledOnCar = getValues(userObject, 'rideDistance');
        var traveledOnWalk = getValues(userObject, 'walkDistance');
        var swimDistance = getValues(userObject, 'swimDistance');

        var teammatesObject = getObjects(Match, 'winPlace', winPlace);
        var teammatesName = getValues(teammatesObject, 'name').slice(0, 4);

        async function genStats() {
          var oswald_white_24 = await Jimp.loadFont(`./data/fonts/oswald/oswald_white_24.fnt`);
          var oswald_orange_32 = await Jimp.loadFont(`./data/fonts/oswald/oswald_orange_32.fnt`);
          var oswald_orange_48 = await Jimp.loadFont(`./data/fonts/oswald/oswald_orange_48.fnt`);
          var oswald_black_15 = await Jimp.loadFont(`./data/fonts/oswald/oswald_black_15.fnt`);
          var oswald_black_36 = await Jimp.loadFont(`./data/fonts/oswald/oswald_black_36.fnt`);


          if (teammatesName.length == 1) {
            var tm_font = oswald_black_15
            var tm_x = 300
            var tm_y = 140
            var tm_maxwidth = 200
            var tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
            var tm_text = teammatesName.join(' ');
          } else
          if (teammatesName.length == 2) {
            var tm_font = oswald_black_15
            var tm_x = 390
            var tm_y = 110
            var tm_maxwidth = 25
            var tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
            var tm_text = teammatesName.join(' ');
          } else
          if (teammatesName.length >= 3) {
            var tm_font = oswald_black_15
            var tm_x = 390
            var tm_y = 88
            var tm_maxwidth = 25
            var tm_aligment = Jimp.HORIZONTAL_ALIGN_CENTER
            var tm_text = teammatesName.join(' ');
          }


          const image = await Jimp.read('./data/images/bg.png');

          var img = image.print(
              // Username
              oswald_orange_32,
              30,
              6, {
                text: `${Player.attributes.name}`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
              }
            ).print(
              // Server info
              oswald_white_24,
              358,
              -4, {
                text: `${Match.attributes.shardId.toUpperCase()} ${Match.attributes.gameMode.toUpperCase()}`,
                alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT
              },
              400
            ).print(
              // Date
              oswald_white_24,
              358,
              22, {
                text: `${Match.attributes.createdAt.toGMTString().split(' ').slice(0, 6).join(' ')}`,
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
            await client.users.get(userData.userid).send(client.users.get(userData.userid).toString(), {
              file: buffer
            });
          });

        }
        genStats();
        dbsql.prepare('UPDATE users SET lastmatch = ? WHERE userid = ?').run(lastmatch, userData.userid)
      }
    }
  }

  async function checkServerUsers() {
    var serversData = dbsql.prepare('SELECT * FROM servers WHERE stats_toggle=?').all("1");
    var usersData = dbsql.prepare('SELECT * FROM users WHERE notify=? AND notifyLocation = ?').all("1", "server");
    
    const sLength = serversData.length;
    for (let i = 0; i < sLength; i++) {
      var ServerDataLoop = serversData[i];
      await asyncServerStats(ServerDataLoop, usersData);
    }
  }
  
  async function checkUsers(params) {
    var usersData = dbsql.prepare('SELECT * FROM users WHERE notify=? AND notifyLocation = ?').all("1", "dm");
    await asyncUserStats(usersData);
  }

  setInterval(async function () {
    checkServerUsers();
    checkUsers();
  }, 10 * 1000);


};