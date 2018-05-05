exports.run = async (client, message, args) => {
  const low = client.low;
  const FileSync = client.FileSync;
  const adapter = client.adapter;
  const db = client.db;
  const PUBGservers = client.PUBGservers;

  try {
    var nuid = db.get('users')
      .find({
        uid: message.member.id
      })
      .value()
  } catch (e) {
    console.log(e);
    await message.channel.send(`${message.author.toString()}, you haven't added PUBG user to the bot. Use **${client.config.prefix}addaccount __pubgname__ __pubgserver__**`);
    return;
  }

  if (nuid.notify == "false") {
    db.get('users')
      .find({
        uid: message.member.id
      })
      .assign({
        notify: "true"
      })
      .write()
    console.log("NOW YES");
    await message.channel.send(`${message.author.toString()}, now bot **will** notify your stats after matches!`);
  } else
  if (nuid.notify == "true") {
    db.get('users')
      .find({
        uid: message.member.id
      })
      .assign({
        notify: "false"
      })
      .write()
    console.log("NOT NO");
    await message.channel.send(`${message.author.toString()}, now bot **will not** notify your stats after matches!`);
  }

}
