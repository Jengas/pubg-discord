exports.run = async (client, message, args) => {
  const Discord = client.Discord;

  const helpEmbed = new Discord.RichEmbed()
    .setTitle("PUBG BOT help")
    .setColor("#f7c121")
    .setFooter("PUBG BOT", "https://i.imgur.com/O8Q7Eqq.png")
    .setTimestamp()
    .addField("Servers:", "pc-na - [North America]\npc-eu - [Europe]\npc-ru - [Russia]\npc-as - [Asia]\npc-oc - [Oceania]\npc-sa - [South and Central America]\npc-sea - [South East Asia]\npc-kakao - [Kakaogames]\n---\nxbox-na - [North America]\nxbox-eu - [Europe]\nxbox-as - [Asia]\nxbox-oc - [Oceania]", false)
    .addField("Add PUBG account:", "__$addaccount NickName Server__\n[EXAMPLE: ``$addaccount Jengas pc-eu``]", true)
    .addField("Get last stats:", "__$getlaststats__\n[EXAMPLE: ``$getlaststats``]", true)
    .addField("User info:", "__$user NickName Server__\n[EXAMPLE: ``$user Jengas pc-eu``]", true)
    .addField("Match list:", "__$matchlist NickName Server__\n[EXAMPLE: ``$matchlist Jengas pc-eu``]", true)
    .addField("Match info:", "__$matchinfo NickName MatchID Server__\n[EXAMPLE: ``$matchinfo Jengas 1de1332c-985a-4825-b320-32e40e24b6ef``]", true)

  await message.channel.send(`${message.author.toString()}, your help is delivered!`, helpEmbed);
  console.log(`${message.author.tag} (${message.author.id}) - executed command $help`);
}
