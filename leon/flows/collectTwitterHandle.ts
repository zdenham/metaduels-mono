import { User, TextChannel } from 'discord.js';
import delay from '../utils/delay';
import waitForMessage from '../utils/waitForMessage';
import twitterClient from '../utils/twitter/client';
import sendWithTyping from '../utils/sendWithTyping';

// const metaDuelsUserId = '1490060609408286721';

const collectTwitterHandle = async (
  leonChannel: TextChannel,
  larryChannel: TextChannel,
  user: User
): Promise<string> => {
  let handle = null;

  await sendWithTyping(
    larryChannel,
    'Frank - would you be so kind as to let them know the last step to get in?'
  );

  await sendWithTyping(
    leonChannel,
    'No one gets into the arena without sending us their twitter handle'
  );

  await sendWithTyping(
    larryChannel,
    `If you don't mind, just send your twitter handle into this channel and you can be on your merry way`
  );

  while (!handle) {
    try {
      handle = await waitForMessage(leonChannel.client, user.id);
      if (!/^@?(\w){1,15}$/.test(handle)) {
        throw new Error('Not a Handle');
      }

      handle = handle.replace('@', '');

      const { data: userTwitter } = await twitterClient.v2.userByUsername(
        handle,
        {
          'user.fields': ['description'],
        }
      );

      if (userTwitter.description) {
        await sendWithTyping(
          leonChannel,
          `"${userTwitter.description}"... thats cute`,
          2000
        );
      }
    } catch (e) {
      await delay(750);
      await sendWithTyping(
        leonChannel,
        "Nope, that don't work--send your REAL twitter handle (case sensitive)"
      );
    }
  }

  return handle;
};

export default collectTwitterHandle;
