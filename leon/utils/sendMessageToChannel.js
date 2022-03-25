const sendMessageToChannel = async (client, channelId, message) => {
  try {
    const channel = client.channels.cache.get(channelId);
    await channel.send(message);
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendMessageToChannel;
