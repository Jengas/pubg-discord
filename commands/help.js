exports.run = async (client, message, args) => {
  const Discord = client.Discord;
  const logger = client.logger;

  const helpEmbed = new Discord.RichEmbed()
    .setTitle("PUBG BOT commands")
    .setColor("#f7c121")
    .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
    .setTimestamp()
    .addField("Servers:", "pc-na - [North America]\npc-eu - [Europe]\npc-ru - [Russia]\npc-as - [Asia]\npc-oc - [Oceania]\npc-sa - [South and Central America]\npc-sea - [South East Asia]\npc-kakao - [Kakaogames]\n---\nxbox-na - [North America]\nxbox-eu - [Europe]\nxbox-as - [Asia]\nxbox-oc - [Oceania]", false)
    .addField("Add PUBG account:", "__"+client.config.prefix+"addaccount__\n[EXAMPLE: ``"+client.config.prefix+"addaccount``]", true)
    .addField("Get last stats:", "__"+client.config.prefix+"getlaststats__\n[EXAMPLE: ``"+client.config.prefix+"getlaststats``]", true)
    .addField("User info:", "__"+client.config.prefix+"user NickName Server__\n[EXAMPLE: ``"+client.config.prefix+"user Jengas pc-eu``]", true)
    .addField("Match list:", "__"+client.config.prefix+"matchlist NickName Server__\n[EXAMPLE: ``"+client.config.prefix+"matchlist Jengas pc-eu``]", true)
    .addField("Match info:", "__"+client.config.prefix+"matchinfo NickName MatchID Server__\n[EXAMPLE: ``"+client.config.prefix+"matchinfo Jengas 1de1332c-985a-4825-b320-32e40e24b6ef``]", true)
    .addField("Get stats evry match:", "__"+client.config.prefix+"notify__\n[EXAMPLE: ``"+client.config.prefix+"notify``]", true)

  await message.channel.send(`${message.author.toString()}, your help is delivered!`, helpEmbed);
  logger.info(`${message.author.tag} (${message.author.id}) - execute the command ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}
