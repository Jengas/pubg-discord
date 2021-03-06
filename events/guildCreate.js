module.exports = async (client, guild) => {

  //sqlite
  const dbsql = client.dbsql;
  const logger = client.logger;


  var getServer = dbsql.prepare('SELECT * FROM servers WHERE serverid=?').get(guild.id);

  if (getServer == undefined) {
    if (guild.region == 'russia') {
      dbsql.prepare('INSERT INTO servers (serverid, language) VALUES (?, ?)').run(guild.id, 'ru');
    } else {
      dbsql.prepare('INSERT INTO servers (serverid) VALUES (?)').run(guild.id);
    }
  }

  logger.info('BOT has been added to new server'+guild.name+` [${guild.id}]`)

};