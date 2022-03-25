const respondToKeyWord = (client, keyword, response) => {
  client.on('messageCreate', async (msg) => {
    if (msg.content.toLowerCase().indexOf(keyword) === -1) {
      return;
    }

    if (msg.author.id === client.user.id) {
      return;
    }

    try {
      await client.api.channels[msg.channel.id].messages.post({
        data: {
          content: response,
          message_reference: {
            message_id: msg.id,
            channel_id: msg.channel.id,
            guild_id: msg.guild.id,
          },
        },
      });
    } catch (e) {
      console.log('THERE WAS AN ERROR!', e);
    }
  });
};

module.exports = respondToKeyWord;
