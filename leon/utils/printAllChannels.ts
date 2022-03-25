import { Client, TextChannel } from 'discord.js';

const printAllChannels = (client: Client) => {
  client.channels.cache.forEach((channel) => {
    console.log(channel.id, (channel as TextChannel).name);
  });
};

export default printAllChannels;
