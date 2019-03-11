exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const PUBGservers = client.PUBGservers;
  const genStats = client.genStats;
  const getServerLanguage = client.getServerLanguage;

  let lng = await getServerLanguage(message).then(l => l);

  let serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)
  let dbUser = dbsql.prepare("SELECT * FROM users WHERE userid=?").get(message.author.id);
  if (!dbUser) return await message.reply(`Your PUBG account is not linked to your Discord account. Please proceed **${client.config.prefix}start**`);

  message.reply(`Please select an option that you want to proceed.\n\n**1** - I want to recieve stats in to the **DM**\n**2** - I want to recieve stats in the **SERVER**\n**3** - I don't want to recieve stats anymore\nP.S. Enter numbers`)
  let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
    time: 60 * 1000
  });


  collector.on('collect', async (message) => {

    switch (message.content) {
      case '1':
        dbsql.prepare('UPDATE users SET notify = ?, notifyLocation = ? WHERE userid = ?').run('1', args[0], message.author.id);
        await message.reply(`Now bot **will** notify your statistics after each match in **DM**`);
        collector.stop();
        break;
      case '2':
        if (serverData.stats_toggle == '0') {
          await message.reply(`I was forbidden to send your statistics to this server, so instead I will send statistics to your **DM**`);
          dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'dm', message.author.id)
        } else {
          dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'server', message.author.id)
          await message.reply(`Now I will send your statistics after each match in this **SERVER**!`);
        }
        collector.stop();
        break;
      case '3':
        dbsql.prepare("UPDATE users SET notify = ? WHERE userid = ?").run("0", message.author.id)
        await message.reply(`Now bot **will not** notify your statistics after each match`);
        collector.stop();
        break;

      default:
        break;
    }
  });
  await message.delete()
    .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
    .catch(console.error);
}