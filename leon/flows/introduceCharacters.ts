import { TextChannel } from 'discord.js';
import sendWithTyping from '../utils/sendWithTyping';
import waitForMessageReaction from '../utils/waitForMessageReaction';

const msg1 = `The name is Frank...

I'm the bouncer for the MetaDuels Arena
and you... well you are my little baby back bitch

You will do what I say, when I say it or so help me
I will turn your tight lil' asshole into my favorite sock puppet.

Now, to get us started, react ✅ to this message
`;

const msg2 = `eeeeeeehhhhhhhhh-xcuse my colleague here, he's a bit eeehhhhhh... irate at the moment. 

My name is bell boy by the way--much obliged

ehhhhhhh.... its probably best to do what he says and react ✅ to the above
`;

const msg3 = `Thats exactly right - get used to doing what I say`;

const msg4 = `Alright alright meathead, would you at least tell them the requirements to get into the arena?`;

const introduceCharacters = async (
  leonChannel: TextChannel,
  larryChannel: TextChannel
) => {
  const initialMsg = await sendWithTyping(leonChannel, msg1);
  await initialMsg.react('✅');
  await sendWithTyping(larryChannel, msg2);
  let reaction = await waitForMessageReaction(leonChannel, initialMsg.id);

  while (reaction !== '✅') {
    await sendWithTyping(leonChannel, 'I SAID react ✅ to the above message!');
    reaction = await waitForMessageReaction(leonChannel, initialMsg.id);
  }

  await sendWithTyping(leonChannel, msg3);
  await sendWithTyping(larryChannel, msg4, 2000);
};

export default introduceCharacters;
