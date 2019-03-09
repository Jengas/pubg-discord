module.exports = async (client, guild) => {

  const dbsql = client.dbsql;
  const logger = client.logger;
  const getServerLanguage = client.getServerLanguage;

  await getServerLanguage(message).then(l => l);

  logger.info(`BOT has been added to the new server ${guild.name} [${guild.id}]`)

};