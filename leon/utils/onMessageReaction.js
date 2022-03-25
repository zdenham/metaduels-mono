const onMessageReaction = (client, msgId, reactionType, callBack) => {
  client.on('interactionCreate', (interaction) => {
    console.log('INTERACTION CREATED!!!', interaction);
  });
};

module.exports = onMessageReaction;
