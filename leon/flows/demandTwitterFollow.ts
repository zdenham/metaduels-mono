import { TextChannel } from 'discord.js';
import waitForMessageReaction from '../utils/waitForMessageReaction';
import delay from '../utils/delay';

import twitterClient from '../utils/twitter/client';
import sendWithTyping from '../utils/sendWithTyping';

const metaDuelsUserId = '1490060609408286721';

const checkDoesFollow = async (handle: string) => {
  const { data: metaDuelsFollowers } = await twitterClient.v2.followers(
    metaDuelsUserId
  );

  for (let follower of metaDuelsFollowers) {
    if (follower.username === handle) {
      return true;
    }
  }

  return false;
};

const demandTwitterFollow = async (
  leonChannel: TextChannel,
  larryChannel: TextChannel,
  handle: string
) => {
  let doesFollow = await checkDoesFollow(handle);
  if (doesFollow) {
    await sendWithTyping(
      leonChannel,
      'Damn straight you follow @metaduels on twitter... if you even THINK about unfollowing @metaduels, I will boot you from this discord no questions asked'
    );
    return;
  }

  await sendWithTyping(
    leonChannel,
    'HOLD UP! This MF is not following @metaduels on twitter - what the FUCK!'
  );

  const msg = await sendWithTyping(
    larryChannel,
    `Hold up Hold up.... lets give em a chance
Once you have followed @metaduels on Twitter, react with the 🐦 emoji to this 
message and I'll see if I can convince Leon re-consider letting you into the server
`
  );

  msg.react('🐦');

  await delay(1000);

  while (!doesFollow) {
    const reaction = await waitForMessageReaction(leonChannel, msg.id);
    if (reaction !== '🐦') {
      await sendWithTyping(
        leonChannel,
        'Wrong reaction, react with 🐦 once you have followed metaduels'
      );
      continue;
    }

    doesFollow = await checkDoesFollow(handle);

    if (!doesFollow) {
      await sendWithTyping(
        leonChannel,
        `NOPE! @${handle} doesn't follow us on twitter`
      );
    }
  }

  await sendWithTyping(
    larryChannel,
    'Thanks for the follow, welcome to the tribe'
  );
};

export default demandTwitterFollow;
