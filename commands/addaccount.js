exports.run = async (client, message, args) => {

  const low = client.low;
  const FileSync = client.FileSync;
  const adapter = client.adapter;
  const db = client.db;
  const PUBGservers = client.PUBGservers;

  let pubgUser = args[0];
  let pubgServer = args[1];

  if (!PUBGservers.includes(pubgServer)) {
    await message.channel.send(`${message.author.toString()}, server you specified doesn't exists.`);
    return;
  }

  if (typeof pubgUser == 'undefined') {
    await message.channel.send(`${message.author.toString()}, you haven't added PUBG user account.`);
    return;
  } else
  if (typeof pubgServer == 'undefined') {
    await message.channel.send(`${message.author.toString()}, you haven't added PUBG server.`);
    return;
  } else
  if (typeof pubgUser == 'undefined' || typeof pubgServer == 'undefined') {
    await message.channel.send(`${message.author.toString()}, you haven't added PUBG user account and server.`);
    return;
  }

  db.defaults({
      users: []
    })
    .write()

  try {
    var nuid = db.get('users')
      .find({
        uid: message.member.id
      })
      .value()

    if (nuid.uid == message.member.id) {
      db.get('users')
        .find({
          uid: message.member.id
        })
        .assign({
          pubgUser: pubgUser,
          pubgServer: pubgServer,
          notify: "false",
        })
        .write()
      console.log(`${message.author.tag} (${message.author.id}) - updated his PUBG data for Database`);
      await message.channel.send(`${message.author.toString()}, you have successfully added new PUBG username **${pubgUser}** and server **${pubgServer}**`);
    }
    console.log(nuid);
  } catch (e) {
    console.log("No user! Creating...")
    db.get('users')
      .push({
        uid: message.member.id,
        pubgUser: pubgUser,
        pubgServer: pubgServer,
        notify: "false",
        lastmatch: "null"
      })
      .write()
    console.log(`${message.author.tag} (${message.author.id}) - executed command $addaccount`);
    await message.channel.send(`${message.author.toString()}, you have successfully added new PUBG username **${pubgUser}**`);
  }
}
