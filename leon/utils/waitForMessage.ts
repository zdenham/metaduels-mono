import { Client } from 'discord.js';

const waitForMessage = (client: Client, userId: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    let timeout = setTimeout(() => {
      reject();
    }, 2 * 60 * 1000);

    client.once('messageCreate', (message) => {
      if (message.author.id !== userId) {
        throw new Error('Incorrect user');
      }

      clearTimeout(timeout);
      resolve(message.content);
    });
  });
};

export default waitForMessage;
