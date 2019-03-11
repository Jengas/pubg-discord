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

    if (typeof playerName == 'undefined') return await message.reply(`You haven't specified player name. See syntax **${client.config.prefix}help**`);
    if (typeof playerRegion == 'undefined') return await message.reply(`You haven't specified platform. See syntax: **${client.config.prefix}help**`);
    if (!PUBGservers.includes(playerRegion)) return await message.reply(`Platform that you have specified doesn't exist`);


    let matchId;
    let matchData;
    let matchPlayer;

    let playerNotFound = false;

    await pubgClient.player({
            name: playerName,
            region: playerRegion,
        })
        .then((player) => {
            matchId = player.data[0].relationships.matches.data[0].id;
            matchPlayer = player;
        })
        .catch((error) => {
            playerNotFound = true
            message.reply(`I couldn't find a player. Are you sure it exists?`);
        });

    if (!playerNotFound) {
        await pubgClient.match({
                region: playerRegion,
                id: matchId
            })
            .then((match) => {
                matchData = match;
            })
            .catch((error) => {
                message.reply(`I couldn't find a match. Are you sure it exists?`);
            });
    }


    genStats(matchPlayer, matchData, lng).then(async buffer => {
        await message.reply('', {
            file: buffer
        });
    }).catch(err=>err);

    await message.delete()
        .then(msg => logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`))
        .catch(console.error);
}