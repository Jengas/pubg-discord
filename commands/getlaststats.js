exports.run = async (client, message, args) => {

    const Discord = client.Discord;
    const dbsql = client.dbsql;
    const logger = client.logger;
    const pubgClient = client.pubgClient;
    const PUBGservers = client.PUBGservers;
    const genStats = client.genStats;
    const getServerLanguage = client.getServerLanguage;

    let lng = await getServerLanguage(message).then(l => l);

    let dbUser = dbsql.prepare("SELECT * FROM users WHERE userid=?").get(message.author.id);
    if (!dbUser) return await message.reply(`Your PUBG account is not linked to your Discord account. Please proceed **${client.config.prefix}start**`);

    let matchId;
    let matchData;
    let matchPlayer;

    await pubgClient.player({
            name: dbUser.pubgUser,
            region: dbUser.pubgServer,
        })
        .then((player) => {
            matchId = player.data[0].relationships.matches.data[0].id;
            matchPlayer = player;
        })
        .catch((error) => {
            message.reply(`I couldn't find a player. Are you sure it exists?`);
        });

    await pubgClient.match({
            region: dbUser.pubgServer,
            id: matchId
        })
        .then((match) => {
            matchData = match;
        })
        .catch((error) => {
            message.reply(`I couldn't find a match. Are you sure it exists?`);
        });


    genStats(matchPlayer, matchData, lng).then(async buffer => {
        await message.reply('', {
            file: buffer
        });
    }).catch(err=>err);


    await message.delete()
        .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
        .catch(console.error);
}