exports.run = async (client, message, args) => {
    const Discord = client.Discord;
    const logger = client.logger;

    const config = client.config;
    const dbsql = client.dbsql;

    const lang = client.lang;

    if (!message.channel.permissionsFor(message.author).has("MANAGE_GUILD")) return;

    var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)
    if (serverData == undefined) {
        if (message.guild.region == 'russia') {
            dbsql.prepare('INSERT INTO servers (serverid, language) VALUES (?, ?)').run(message.guild.id, 'ru');
        } else {
            dbsql.prepare('INSERT INTO servers (serverid) VALUES (?)').run(message.guild.id);
        }
        var serverData = dbsql.prepare('SELECT * FROM servers WHERE serverid = ?').get(message.guild.id)
    }
    if (serverData.language) {
        var lng = lang[serverData.language];
    } else {
        var lng = lang.en;
    }


    switch (args[0]) {
        case "lang":
            if (args[1] == 'en') {
                dbsql.prepare('UPDATE users SET language = ? WHERE userid = ?').run(args[1], message.author.id);
                message.reply('👍');
            } else
            if (args[1] == 'ru') {
                dbsql.prepare('UPDATE users SET language = ? WHERE userid = ?').run(args[1], message.author.id);
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
                .addField(`${lng.serverlanguage}:`, "__" + client.config.prefix + "uce lang BOTLANGUAGE__\n[" + lng.example + "``" + client.config.prefix + "uce lang ru``]", true)

            await message.reply(BCEhelpEmbed);
            break;

    }

    logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}