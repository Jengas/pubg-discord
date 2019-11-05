exports.run = async (client, message, args) => {

  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const PUBGservers = client.PUBGservers;
  const lang = client.lang;

  var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)
  if (serverData == undefined) {
    if (message.guild.region == 'russia') {
      dbsql.prepare('INSERT INTO servers (serverid, language) VALUES (?, ?)').run(message.guild.id, 'ru');
    } else {
      dbsql.prepare('INSERT INTO servers (serverid) VALUES (?)').run(message.guild.id);
    }
    var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)
  }
  if (serverData.language) {
    var lng = lang[serverData.language];
  } else {
    var lng = lang.en;
  }


  var GetUserCheck = dbsql.prepare('SELECT userid, pubgUser FROM users WHERE userid=?').get(message.author.id)

  message.reply(lng.addacc_info);
  const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
    time: 60 * 1000
  });
  var list_array = [];
  collector.on('collect', async (message) => {
    list_array.push(message.content)
    var serversEmbed = new Discord.RichEmbed()
      .setColor("#f7c121")
    for (var i = 0; i < PUBGservers.length; i++) {
      var server_list = server_list + "\n" + PUBGservers[i];
    }
    var server_list = server_list.replace("undefined", "");
    serversEmbed.addField(lng.servers, server_list, false)
    if (!PUBGservers.includes(message.content)) {
      message.reply(`${lng.specifyserver}:`, serversEmbed);
    }
    if (PUBGservers.includes(message.content)) {
      list_array.push(message.content)
      try {
        const Player = await pubgClient.getPlayer({
            name: list_array[0]
          }, list_array[1])
          .then(player => player)
          .catch(error => console.log(error))
        var user_try = Player.attributes.name;

        if (GetUserCheck == undefined) {
          dbsql.prepare('INSERT INTO users (userid, pubgUser, pubgServer) VALUES (?, ?, ?)').run(message.author.id, list_array[0], list_array[list_array.length - 1])
          logger.info(`${message.author.tag} ${lng.addedacctodb} ${list_array[0]}`);
        } else {
          dbsql.prepare('UPDATE users SET pubgUser = ?, pubgServer = ? WHERE userid=?').run(list_array[0], list_array[list_array.length - 1], message.author.id)
          logger.info(`${message.author.tag} ${lng.changeaccdb} ${list_array[0]}`);
        }

        message.reply(lng.successaccchange)
        collector.stop()
      } catch (e) {
        message.reply(lng.wrongaccname);
        collector.stop()
      }
    }
  })
  await message.delete()
    .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
    .catch(console.error);
}