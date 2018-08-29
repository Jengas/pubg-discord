exports.run = async (client, message, args) => {

  const Discord = client.Discord;
  const dbsql = client.dbsql;
  const logger = client.logger;
  const pubgClient = client.pubgClient;
  const PUBGservers = client.PUBGservers;

  let pubgUser = args[0];
  let pubgServer = args[1];


  var GetUserCheck = dbsql.prepare('SELECT userid, pubgUser FROM users WHERE userid=?').get(message.author.id)

  message.reply("to add your PUBG account to the Discord, enter your PUBG name");
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
    serversEmbed.addField('Servers', server_list, false)
    if (!PUBGservers.includes(message.content)) {
      message.channel.send(`${message.author.toString()}, specify the server you are playing on. Servers:`, serversEmbed);
    }
    if (PUBGservers.includes(message.content)) {
      list_array.push(message.content)
      try {
        const Player = await pubgClient.getPlayer({
            name: list_array[0]
          })
          .then(player => player)
          .catch(error => console.log(error))
        var user_try = Player.attributes.name;

        if (GetUserCheck == undefined) {
          dbsql.prepare('INSERT INTO users (userid, pubgUser, pubgServer) VALUES (?, ?, ?)').run(message.author.id, list_array[0], list_array[list_array.length-1])
          logger.info(`${message.author.tag} added the account with the nickname PUBG ${list_array[0]} to database`);
        } else {
          dbsql.prepare('UPDATE users SET pubgUser = ?, pubgServer = ? WHERE userid=?').run(list_array[0], list_array[list_array.length-1], message.author.id)
          logger.info(`${message.author.tag} changed your PUBG account with nick ${list_array[0]} to database`);
        }

        message.reply("great! You have successfully linked your PUBG account to Discord")
        collector.stop()
      } catch (e) {
        message.reply("you may have entered the wrong nickname in PUBG. Try again!");
        collector.stop()
      }
    }
  })
  await message.delete()
    .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - execute the command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
    .catch(console.error);
}
