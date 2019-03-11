exports.run = async (client, message, args) => {
    const Discord = client.Discord;
    const logger = client.logger;
    const getServerLanguage = client.getServerLanguage;

    let lng = await getServerLanguage(message).then(l => l);

    try {
        await client.users.get(message.author.id).send(`${lng.bot_invite_message} https://discordapp.com/api/oauth2/authorize?client_id=442019408446095370&permissions=68608&scope=bot`);
    } catch (error) {
        logger.error(error);
    }

}