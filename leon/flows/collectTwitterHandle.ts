import { Client, User, TextChannel } from 'discord.js';
import delay from '../utils/delay';
import waitForMessage from '../utils/waitForMessage';
import twitterClient from '../utils/twitter/client';

// const metaDuelsUserId = '1490060609408286721';

const collectTwitterHandle = async (
  // @ts-ignore
  leon: Client, // @ts-ignore
  larry: Client, // @ts-ignore
  channel: TextChannel,
  user: User
): Promise<string> => {
  let handle = null;

  // const { data: metaDuelsFollowers } = await twitterClient.v2.followers(
  //   metaDuelsUserId
  // );

  await channel.sendTyping();
  await delay(1000);
  await channel.send('Send us your Twitter handle');

  while (!handle) {
    try {
      handle = await waitForMessage(channel.client, user.id);
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

      console.log('USER TWITTER: ', userTwitter);

      if (userTwitter.description) {
        await channel.sendTyping();
        await delay(2000);
        await channel.send(`"${userTwitter.description}"... thats cute`);
      }
    } catch (e) {
      await delay(750);
      await channel.sendTyping();
      await delay(1000);
      await channel.send(
        "Nope, that don't work--send your REAL twitter handle (case sensitive)"
      );
    }
  }

  return handle;
};

export default collectTwitterHandle;
