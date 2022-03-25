import { Client } from 'discord.js';
// import deleteChannel from '../utils/deleteChannel';
// import createPrivateChannel from '../utils/createPrivateChannel';
// import createChannel from '../utils/createChannel';
// import printAllChannels from '../utils/printAllChannels';
// import sendDMToUser from '../utils/sendDMToUser';

// @ts-ignore
const leonIntroText =
  "The name is Leon...\nI'm the bouncer for the MetaDuels Arena \n\nand you... well you are my little baby back bitch\n\nYou will do what I say, when I say it or so help me\nI will turn your tight lil' asshole into my favorite sock puppet";

// @ts-ignore
const onboard = async (leon: Client, larry: Client, userId: string) => {
  const user = await leon.users.fetch(userId);

  if (!user) {
    throw new Error('The user does not exist');
  }

  // const channelName = 'welcome-' + user.username;
  // const welcomeChannelCategoryId = '953404479758295061';
  // const welcomeChannel = await createPrivateChannel(
  //   leon,
  //   channelName,
  //   welcomeChannelCategoryId,
  //   userId,
  //   leon.user?.id || '',
  //   larry.user?.id || ''
  // );

  // console.log('THE WELCOME CHANNEL: ', welcomeChannel);

  // await createChannel(leon, userId, welcomeChannelCategoryId);
};

export default onboard;
