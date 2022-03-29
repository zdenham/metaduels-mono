// @ts-ignore
import { TextChannel, Channel, Client } from 'discord.js';
import demandTwitterFollow from './demandTwitterFollow';
import collectTwitterHandle from './collectTwitterHandle';
import collectEthAddress from './collectEthAddress';
// import deleteChannel from '../utils/deleteChannel';
import createPrivateChannel from '../utils/createPrivateChannel';
import introduceCharacters from './introduceCharacters';
import delay from '../utils/delay';

const onboard = async (leon: Client, larry: Client, userId: string) => {
  const user = await leon.users.fetch(userId);

  if (!user) {
    throw new Error('The user does not exist');
  }

  // create welcome channel
  const channelName = 'welcome-' + user.username;

  const welcomeChannelCategoryId = '953404479758295061';

  await delay(5000);

  const leonWelcomeChannel = (await createPrivateChannel(
    leon,
    channelName,
    welcomeChannelCategoryId,
    userId,
    leon.user?.id || '',
    larry.user?.id || ''
  )) as Channel as TextChannel;

  const larryWelcomeChannel = (await larry.channels.fetch(
    leonWelcomeChannel.id
  )) as Channel as TextChannel;

  // Introduce the characters

  await introduceCharacters(leonWelcomeChannel, larryWelcomeChannel);

  const ethAddress = await collectEthAddress(
    leonWelcomeChannel,
    larryWelcomeChannel,
    user
  );

  const twitterHandle = await collectTwitterHandle(
    leonWelcomeChannel,
    larryWelcomeChannel,
    user
  );

  await demandTwitterFollow(
    leonWelcomeChannel,
    larryWelcomeChannel,
    twitterHandle
  );

  console.log('USER INFO ', user.username, ethAddress, twitterHandle);
};

export default onboard;
