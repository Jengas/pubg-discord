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
    let matchId = args[2];

    if (typeof playerName == 'undefined') return await message.reply(`You haven't specified player name. See syntax **${client.config.prefix}help**`);
    if (typeof playerRegion == 'undefined') return await message.reply(`You haven't specified platform. See syntax: **${client.config.prefix}help**`);
    if (!PUBGservers.includes(playerRegion)) return await message.reply(`Platform that you have specified doesn't exist`);


    let matchPlayer;
    let matchData;

    let playerNotFound = false;

    await pubgClient.player({
            name: playerName,
            region: playerRegion,
        })
        .then((player) => {
            matchPlayer = player
        })
        .catch((error) => {
            return message.reply(`I couldn't find a player. Are you sure it exists?`);
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
                return message.reply(`I couldn't find a match. Are you sure it exists?`);
            });
    }



    await genStats(matchPlayer, matchData, lng).then(async buffer => {
        await message.reply('', {
            file: buffer
        });
    }).catch(err=>err);

    logger.info(`${message.author.tag} (${message.author.id}) - executed command ${__filename.split(/[\\/]/).pop().split(".")[0]}`)
}