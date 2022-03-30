// import { GuildMember } from 'discord.js';
// import printAllChannels from './utils/print/printAllChannels';
// import onboard from './flows/onboard';
require('dotenv').config();
import { Client, Intents } from 'discord.js';
import delay from './utils/delay';
import initCommands from './initCommands';

const leon = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

const larry = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

leon.on('ready', async () => {
  await delay(5000);
  await initCommands(leon, larry);
  // leon.on('guildMemberAdd', (member: GuildMember) => {
  //   console.log('NEW MEMBER!', member);
  //   // TODO - onboard them!
  // });
  // await onboard(leon, larry, '496840772587618306');
  // onMessageReaction(leon);
  // sendDMToUser(leon, '825831245187252265', 'Im in your DMs, bitch');
  // respondToKeyWord(leon, 'johnson', 'Horse Cock Williams');
  // sendMessageToChannel(leon, '956663083319849061');
  // respondToKeyWord(leon, 'test', 'Fuck your test');
});

console.log('WE ARE STARTING!');
larry.login(process.env.LARRY_BOT_TOKEN);
leon.login(process.env.LEON_BOT_TOKEN);

// createDBRow('hello', '0xtest', 100, 'https://twitter.com/zac_denham');
