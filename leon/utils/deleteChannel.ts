import { Client } from 'discord.js';

const deleteChannel = async (client: Client, channelId: string) => {
  const channel = await client.channels.cache.get(channelId);

  if (!channel) {
    throw new Error('Channel does not exist!!');
  }

  await channel.delete('The user has been onboarded!');
};

export default deleteChannel;
