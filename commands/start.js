exports.run = async (client, message, args) => {

    const Discord = client.Discord;
    const dbsql = client.dbsql;
    const logger = client.logger;
    const pubgClient = client.pubgClient;
    const PUBGservers = client.PUBGservers;
    const getServerLanguage = client.getServerLanguage;

    let lng = await getServerLanguage(message).then(l => l);
    let serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)

    let dbUser = dbsql.prepare('SELECT userid, pubgUser FROM users WHERE userid=?').get(message.author.id)

    if (!dbUser) {
        let PUBGserversString = '';
        for (let i = 0; i < PUBGservers.length; i++) {
            PUBGserversString += `${PUBGservers[i]}\n`;
        }
        let serversEmbed = new Discord.RichEmbed()
            .addField(PUBGserversString)

        message.reply(`Hi! I am **PUBG BOT**! Now I you'll attach PUBG account to your ** Discord**.\nFollow these instructions and everything will be great!\n\nWhere you play? Select from the list`, serversEmbed)
        let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
            time: 60 * 1000
        });

        let isServerSelected = false;
        let isUserAdded = false;
        let isNotifyUserSelected = false;
        let selectedServer;
        let selectedUser;
        collector.on('collect', async (message) => {
            if (!isServerSelected) {
                if (!PUBGservers.includes(message.content)) {
                    await message.reply(`${lng.specifyserver}:`, serversEmbed);
                }
                if (PUBGservers.includes(message.content)) {
                    selectedServer = message.content;
                    isServerSelected = true;
                    await message.reply(`Now enter your PUBG nickname`);
                }
            } else if (!isUserAdded) {
                selectedUser = message.content;
                pubgClient.player({
                        name: message.content,
                        region: selectedServer
                    })
                    .then((player) => {
                        message.reply(`Congratulations! You have successfully attached PUBG account to your **Discord**!\n\nWant to be notified after your match? \n**+**: Yes\n**-**: No`)
                        dbsql.prepare('UPDATE users SET pubgUser = ?, pubgServer = ? WHERE userid=?').run(selectedUser, selectedServer, message.author.id)
                        isUserAdded = true;
                        logger.info(`${message.author.tag} ${lng.changeaccdb} ${selectedUser}`);
                    })
                    .catch((error) => {
                        message.reply(`No such player was found. Are you sure there is such a player? If so, try again.`)
                        collector.stop();
                    });
            } else if (isUserAdded && isServerSelected && !isNotifyUserSelected) {
                switch (message.content) {
                    case '+':
                        await message.reply(`Great! You want to receive notifications in DM?\n**+**: Yes\n**-**: No`);
                        isNotifyUserSelected = true;
                        break;
                    case '-':
                        await message.reply(`Sadly. Then you can get statistics manually!`);
                        isNotifyUserSelected = true;
                        break;
                }
            } else if (isUserAdded && isServerSelected && isNotifyUserSelected) {
                switch (message.content) {
                    case '+':
                        dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'dm', message.author.id)
                        await message.reply(lng.notify_dm_true);
                        collector.stop();
                        break;
                    case '-':
                        if (serverData.stats_toggle == '0') {
                            await message.reply(lng.notify_server_forbid);
                            await message.reply(lng.notify_dm_true);
                            dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'dm', message.author.id)
                        } else {
                            dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'server', message.author.id)
                            await message.reply(lng.notify_server_true);
                        }
                        collector.stop();
                        break;
                }
            }
        });
        await message.delete()
            .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
            .catch(console.error);
    }
}