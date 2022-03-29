import { TextChannel } from 'discord.js';

const waitForMessageReaction = (
  channel: TextChannel,
  msgId: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    channel.client.once('messageReactionAdd', async (reaction) => {
      setTimeout(() => {
        reject('Time out');
      }, 2 * 60 * 1000);

      // When a reaction is received, check if the structure is partial
      if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
          await reaction.fetch();
        } catch (error) {
          console.error(
            'Something went wrong when fetching the message:',
            error
          );
          // Return as `reaction.message.author` may be undefined/null
          return;
        }
      }

      if (reaction.message.id !== msgId) {
        reject('wrong message was reacted to');
      }

      resolve(reaction.emoji.name || '');
    });
  });
};

export default waitForMessageReaction;
