exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
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
  if (serverData.language == 'ru') {
    var lng = lang.ru;
  } else {
    var lng = lang.en;
  }


  var userData = dbsql.prepare("SELECT * FROM users WHERE userid=?").get(message.author.id);
  if (userData == undefined) {
    await message.reply(`${lng.accnotlinked} **${client.config.prefix}addaccount** ${lng.tolinkaccount}`);
    return;
  }

  switch (args[0]) {
    case "dm":
      dbsql.prepare('UPDATE users SET notify = ?, notifyLocation = ? WHERE userid = ?').run('1', args[0], message.author.id);
      await message.reply(lng.notify_dm_true);
      break;
    case "server":
      if (serverData.stats_toggle == '0') {
        await message.reply(lng.notify_server_forbid);
        dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'dm', message.author.id)
      } else {
        dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'server', message.author.id)
        await message.reply(lng.notify_server_true);
      }
      break;
    case "toggle":
      if (userData.notify == '0') {
        if (userData.notifyLocation == 'server' && serverData.stats_toggle == '0') {
          await message.reply(lng.notify_toggle_server_error);
          dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid = ?").run("1", 'dm', message.author.id)
        } else {
          dbsql.prepare("UPDATE users SET notify = ? WHERE userid = ?").run("1", message.author.id)
          await message.reply(lng.notify_toggle_on);
        }
      } else
      if (userData.notify == '1') {
        dbsql.prepare("UPDATE users SET notify = ? WHERE userid = ?").run("0", message.author.id)
        await message.reply(lng.notify_toggle_off);
      }
      break;
    default:
      var BCEhelpEmbed = new Discord.RichEmbed()
        .setTitle("PUBG BOT " + lng.commands)
        .setColor("#f7c121")
        .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
        .setTimestamp()
        .addField(`${lng.notify_toggle}:`, "__" + client.config.prefix + "notify toggle__\n[" + lng.example + "``" + client.config.prefix + "toggle``]", false)
        .addBlankField()
        .addField(`${lng.list}:`, "``dm``\n``server``", false)
        .addField(`${lng.notify}:`, "__" + client.config.prefix + "notify LOCATION BOOLEAN__\n[" + lng.example + "``" + client.config.prefix + "notify dm true``]", false)

      await message.reply(BCEhelpEmbed);
      break;
  }
  logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}