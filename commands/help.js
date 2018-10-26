exports.run = async (client, message, args) => {
  const Discord = client.Discord;
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
  if (serverData.language == 'ru') {
    var lng = lang.ru;
  } else {
    var lng = lang.en;
  }

  const helpEmbed = new Discord.RichEmbed()
    .setTitle("PUBG BOT " + lng.commands)
    .setColor("#f7c121")
    .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
    .setTimestamp()
    .addField(`${lng.servers}:`, "pc-na - [North America]\npc-eu - [Europe]\npc-ru - [Russia]\npc-as - [Asia]\npc-oc - [Oceania]\npc-sa - [South and Central America]\npc-sea - [South East Asia]\npc-krjp - [Korea & Japan]\npc-jp - [Japan]\npc-kakao - [Kakaogames]\n---\nxbox-na - [North America]\nxbox-eu - [Europe]\nxbox-as - [Asia]\nxbox-oc - [Oceania]", false)
    .addField(`${lng.addpubgacc}:`, "__" + client.config.prefix + "addaccount__\n[" + lng.example + "``" + client.config.prefix + "addaccount``]", true)
    .addField(`${lng.getlaststats}:`, "__" + client.config.prefix + "getlaststats__\n[" + lng.example + ": ``" + client.config.prefix + "getlaststats``]", true)
    .addField(`${lng.userinfo}:`, "__" + client.config.prefix + "user NickName Server__\n[" + lng.example + ": ``" + client.config.prefix + "user Jengas pc-eu``]", true)
    .addField(`${lng.matchlist}:`, "__" + client.config.prefix + "matchlist NickName Server__\n[" + lng.example + ": ``" + client.config.prefix + "matchlist Jengas pc-eu``]", true)
    .addField(`${lng.matchinfo}:`, "__" + client.config.prefix + "matchinfo NickName MatchID__\n[" + lng.example + ": ``" + client.config.prefix + "matchinfo Jengas 1de1332c-985a-4825-b320-32e40e24b6ef``]", true)
    .addField(`${lng.getstatseverymatch}:`, "__" + client.config.prefix + "notify__\n[" + lng.example + ": ``" + client.config.prefix + "notify``]", true)
    .addField(`${lng.bce}:`, "__" + client.config.prefix + "bce__\n[" + lng.example + ": ``" + client.config.prefix + "bce``]", true)
    .addField(`${lng.uce}:`, "__" + client.config.prefix + "uce__\n[" + lng.example + ": ``" + client.config.prefix + "uce``]", true)

  await message.reply(helpEmbed);
  logger.info(`${message.author.tag} (${message.author.id}) - ${lng.execcmd} ${__filename.split(/[\\/]/).pop().split(".")[0]}`);
}