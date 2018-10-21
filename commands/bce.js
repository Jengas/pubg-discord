exports.run = async (client, message, args) => {
    const Discord = client.Discord;
    const logger = client.logger;

    const config = client.config;
    const dbsql = client.dbsql;

    const lang = client.lang;

    if (!message.channel.permissionsFor(message.author).has("MANAGE_GUILD")) return;

    var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)

    if (serverData.language == 'ru') {
        var lng = lang.ru;
    } else {
        var lng = lang.en;
    }


    switch (args[0]) {
        case "lang":
            if (args[1] == 'en') {
                var serverdata = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id);
                if (serverdata == undefined) {
                    dbsql.prepare('INSERT INTO servers (language, serverid) VALUES (?, ?)').run(args[1], mesage.guild.id);
                    message.reply('👍');
                } else {
                    dbsql.prepare('UPDATE servers SET language = ? WHERE serverid = ?').run(args[1], message.guild.id);
                    message.reply('👍');
                }
            } else
            if (args[1] == 'ru') {
                var serverdata = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id);
                if (serverdata == undefined) {
                    dbsql.prepare('INSERT INTO servers (language, serverid) VALUES (?, ?)').run(args[1], mesage.guild.id);
                    message.reply('👍');
                } else {
                    dbsql.prepare('UPDATE servers SET language = ? WHERE serverid = ?').run(args[1], message.guild.id);
                    message.reply('👍');
                }
            } else {
                message.reply(lng.wrongarg);
            }
            break;
        case "statsChannel":
            if (message.guild.channels.has(args[1])) {
                dbsql.prepare('UPDATE servers SET stats_channel = ? WHERE serverid = ?').run(args[1], message.guild.id);
                message.reply('👍');
            } else {
                message.reply(lng.wrongarg);
            }
            break;
        default:
            var BCEhelpEmbed = new Discord.RichEmbed()
                .setTitle("PUBG BOT " + lng.commands)
                .setColor("#f7c121")
                .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
                .setTimestamp()
                .addField(`${lng.serverlanguage}:`, "__" + client.config.prefix + "bce lang BOTLANGUAGE__\n[" + lng.example + "``" + client.config.prefix + "bce lang en``]", true)
                .addField(`${lng.stats_channel}:`, "__" + client.config.prefix + "bce statsChannel CHANNELID__\n[" + lng.example + "``" + client.config.prefix + "bce statsChannel 494781230577783888``]", true)

            await message.reply(BCEhelpEmbed);
            break;

    }

    logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}