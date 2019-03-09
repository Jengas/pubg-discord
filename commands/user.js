exports.run = async (client, message, args) => {

    const Discord = client.Discord;
    const dbsql = client.dbsql;
    const logger = client.logger;
    const pubgClient = client.pubgClient;
    const PUBGservers = client.PUBGservers;
    const genStats = client.genStats;
    const getServerLanguage = client.getServerLanguage;

    let lng = await getServerLanguage(message).then(l => l);

    let playerName = args[0];
    let playerRegion = args[1];

    if (typeof playerName == 'undefined') {
        await message.reply(`${lng.namenotspecified}: **${client.config.prefix}help**`);
        return;
    } else
    if (typeof playerRegion == 'undefined') {
        await message.reply(`${lng.servernotspecified}: **${client.config.prefix}help**`);
        return;
    } else
    if (!PUBGservers.includes(playerRegion)) {
        await message.reply(lng.server_notexists);
        return;
    }


    let matchId;
    let matchData;
    let matchPlayer;


    await pubgClient.player({
            name: playerName,
            region: playerRegion,
        })
        .then((player) => {

            matchId = player.data[0].relationships.matches.data[0].id;

            matchPlayer = player;
        })
        .catch((error) => {
            console.log('playererr', error);

            message.reply(`I couldn't find such a player. Are you sure you typed it right?`);
        });

    await pubgClient.match({
            region: playerRegion,
            id: matchId
        })
        .then((match) => {
            matchData = match;
        })
        .catch((error) => {
            console.log('matcherr', error);

            message.reply(`I couldn't find such match. Are you sure you typed it right?`);
        });


    genStats(matchPlayer, matchData, lng).then(async buffer => {
        await message.reply('', {
            file: buffer
        });
    });

    logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}