import { Message, TextChannel } from 'discord.js';
import delay from './delay';

const sendWithTyping = async (
  channel: TextChannel,
  msg: string,
  delayMs = 3000
): Promise<Message> => {
  await delay(2500);
  await channel.sendTyping();
  await delay(delayMs);
  return await channel.send(msg);
};

export default sendWithTyping;
