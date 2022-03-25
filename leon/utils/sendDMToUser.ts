import { Client } from 'discord.js';

const sendDMToUser = async (client: Client, userId: string, msg: string) => {
  try {
    const user = client.users.cache.get(userId);

    if (!user) {
      throw new Error('The user does not exist');
    }

    await user.send(msg);
  } catch (e) {
    console.log('RAN INTO ERROR: ', e);
  }
};

export default sendDMToUser;
