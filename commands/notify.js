exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const PUBGservers = client.PUBGservers;


  var nuid = dbsql.prepare("SELECT * FROM users WHERE userid=?").get(message.author.id);
  if (nuid == undefined) {
    await message.reply(`you haven't added PUBG user to the bot. Use **${client.config.prefix}addaccount** to link an account`);
    return;
  }

  if (nuid.notify == "0") {
    dbsql.prepare("UPDATE users SET notify = ? WHERE userid=?").run("1", message.author.id)
    await message.reply(`now bot **will** notify your stats after every match!`);
  } else
  if (nuid.notify == "1") {
    dbsql.prepare("UPDATE users SET notify = ? WHERE userid=?").run("0", message.author.id)
    await message.reply(`now bot **will not** notify your stats after every match!`);
  }
  logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}
