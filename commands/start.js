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
        let platformEmbed = new Discord.RichEmbed()
            .setDescription(PUBGserversString)
            .setColor('#f7c121')

        message.reply(`Hi! I am **PUBG BOT**! Now I'll attach PUBG account to your **Discord** account.\nFollow these instructions to link PUBG account!\n\nWhere do you play? Select from the list`, platformEmbed)
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
                    await message.reply(`Please, choose platform only from the list!`, platformEmbed);
                }
                if (PUBGservers.includes(message.content)) {
                    selectedServer = message.content;
                    isServerSelected = true;
                    await message.reply(`Now enter your PUBG nickname.`);
                }
            } else if (!isUserAdded) {
                selectedUser = message.content;
                pubgClient.player({
                        name: message.content,
                        region: selectedServer
                    })
                    .then((player) => {
                        message.reply(`Congratulations! You have successfully attached PUBG account to your **Discord** account!\n\nWant to be notified after your match? \n**1**: Yes\n**2**: No\nP.S. Enter numbers`)
                        dbsql.prepare("INSERT INTO users (userid, pubgUser, pubgServer) VALUES (?,?,?)").run(message.author.id, selectedUser, selectedServer)
                        isUserAdded = true;
                        logger.info(`${message.author.tag} has linked PUBG account (${selectedUser}) to Discord`);
                    })
                    .catch((error) => {
                        message.reply(`No such player was found. Are you sure there is such a player? If so, try again.`)
                        collector.stop();
                    });
            } else if (isUserAdded && isServerSelected && !isNotifyUserSelected) {
                switch (message.content) {
                    case '1':
                        await message.reply(`Great! You want to receive notifications in DM?\n**1**: Yes\n**2**: No\nP.S. Enter numbers`);
                        isNotifyUserSelected = true;
                        break;
                    case '2':
                        await message.reply(`Sadly. Then you can get statistics manually!`);
                        isNotifyUserSelected = true;
                        break;
                }
            } else if (isUserAdded && isServerSelected && isNotifyUserSelected) {
                switch (message.content) {
                    case '+1':
                        dbsql.prepare("UPDATE users SET notify = ?, notifyLocation = ? WHERE userid=?").run("1", 'dm', message.author.id)
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
                }
            }
        });
        await message.delete()
            .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
            .catch(console.error);
    } else {
        let PUBGserversString = '';
        for (let i = 0; i < PUBGservers.length; i++) {
            PUBGserversString += `${PUBGservers[i]}\n`;
        }
        let platformEmbed = new Discord.RichEmbed()
            .setDescription(PUBGserversString)
            .setColor('#f7c121')

        message.reply(`Hi! I can see that you already have account linked to **Discord** account.\nFollow these instructions to change data!\n\nWhere do you play? Select from the list`, platformEmbed)
        let collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {
            time: 60 * 1000
        });

        let isServerSelected = false;
        let isUserAdded = false;
        let selectedServer;
        let selectedUser;
        collector.on('collect', async (message) => {
            if (!isServerSelected) {
                if (!PUBGservers.includes(message.content)) {
                    await message.reply(`Please, choose platform only from the list!`, platformEmbed);
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
                        message.reply(`Congratulations! You have successfully reattached PUBG account to your **Discord** account!`)
                        dbsql.prepare("UPDATE users SET pubgUser = ?, pubgServer = ? WHERE userid = ?").run(selectedUser, selectedServer, message.author.id)
                        isUserAdded = true;
                        logger.info(`${message.author.tag} has reattached PUBG account (${selectedUser}) to Discord`);
                    })
                    .catch((error) => {
                        message.reply(`I couldn't find a player. Are you sure it exists? If so, try again.`)
                        collector.stop();
                    });
            } 
        });
        await message.delete()
            .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
            .catch(console.error);
    }
}