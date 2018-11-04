exports.run = async (client, message, args) => {
    const logger = client.logger;
    const lang = client.lang;
    const dbsql = client.dbsql;

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

    try {
        await client.users.get(message.author.id).send(`${lng.bot_invite_message} https://discordapp.com/api/oauth2/authorize?client_id=442019408446095370&permissions=68608&scope=bot`);
    } catch (error) {
        logger.error(error);
    }

}