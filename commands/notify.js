exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const lang = client.lang;

  var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)
  if (serverData == undefined) {
    dbsql.prepare('INSERT INTO servers (language, serverid) VALUES (?, ?)').run('en', message.guild.id);
  }
  if (serverData.language == 'ru') {
    var lng = lang.ru;
  } else {
    var lng = lang.en;
  }


  var nuid = dbsql.prepare("SELECT * FROM users WHERE userid=?").get(message.author.id);
  if (nuid == undefined) {
    await message.reply(`${lng.accnotlinked} **${client.config.prefix}addaccount** ${lng.tolinkaccount}`);
    return;
  }

  if (nuid.notify == "0") {
    dbsql.prepare("UPDATE users SET notify = ? WHERE userid=?").run("1", message.author.id)
    await message.reply(lng.notify_true);
  } else
  if (nuid.notify == "1") {
    dbsql.prepare("UPDATE users SET notify = ? WHERE userid=?").run("0", message.author.id)
    await message.reply(lng.notify_false);
  }
  logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}