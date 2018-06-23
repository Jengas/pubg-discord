exports.run = async (client, message, args) => {
  const Discord = client.Discord;

  const channelVoice = [
    "459698545348313088", // 1
    "459769065905324033", // 2
    "459769167302885386" // 2
  ];
  const allowCMDS = [
    "459654490795278337", // поиск команд
    "459707264706805760", // beta
    "441545018499530753" // beta
  ];
  if (!allowCMDS.includes(message.channel.id)) {
    return;
  }

  if (channelVoice.includes(message.member.voiceChannelID)) {
    await message.channel.send(`${message.author.toString()}, вы уже в голосовом канале **${message.member.voiceChannel.name}**!`);
    return;
  } else
  if (message.member.voiceChannelID != '459403662024769557') {
    await message.channel.send(`${message.author.toString()}, вы не в голосовом канале! Зайдите в Лобби!`);
    console.log(message.member.voiceChannelID);
    return;
  }

  for (var i = 0, l = channelVoice.length; i < l; i++) {
    var n_channelVoice = channelVoice[i];
    console.log(n_channelVoice);
    var channels = message.guild.channels.get(n_channelVoice)
    console.log(channels.full);
    if (channels.full == false) {
      console.log("joinable");
      console.log(channels.id);
      console.log("sending to channel");
      message.member.setVoiceChannel(channels.id)
      break;
    }
  }

}
