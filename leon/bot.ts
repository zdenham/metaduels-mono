import { GuildMember } from 'discord.js';
require('dotenv').config();
import { Client, Intents } from 'discord.js';
import delay from './utils/delay';
import initCommands from './initCommands';
import printAllUsers from './utils/print/printAllUsers';

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
  await printAllUsers(leon);
  await delay(5000);
  await initCommands(leon, larry);
  leon.on('guildMemberAdd', (member: GuildMember) => {
    console.log('NEW MEMBER!', member.id);
    // TODO - onboard them!
  });
});

console.log('WE ARE STARTING!');
larry.login(process.env.LARRY_BOT_TOKEN);
leon.login(process.env.LEON_BOT_TOKEN);

// createDBRow('hello', '0xtest', 100, 'https://twitter.com/zac_denham');
