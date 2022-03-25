import { Client } from 'discord.js';

const GUILD_TEXT = 0;

const createPrivateChannel = async (
  client: Client,
  channelName: string,
  parentId: string | null,
  ...userIds: string[]
) => {
  const guild = client.guilds.cache.first();

  if (!guild) {
    throw new Error('No Guilds Exist');
  }
  const everyoneRole = guild.roles.everyone;

  const channel = await guild.channels.create(channelName, {
    parent: parentId || undefined,
    type: GUILD_TEXT,
    permissionOverwrites: [
      { id: everyoneRole, deny: ['VIEW_CHANNEL', 'SEND_MESSAGES'] },
    ],
  });

  for (let userId of userIds) {
    await channel.permissionOverwrites.create(userId, {
      VIEW_CHANNEL: true,
      SEND_MESSAGES: true,
    });
  }

  return channel;
};

export default createPrivateChannel;
