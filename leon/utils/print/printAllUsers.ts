import { Client } from 'discord.js';

const printAllUsers = (client: Client) => {
  client.users.cache.forEach((user) => {
    console.log(user.username, ':', user.id);
  });
};

export default printAllUsers;
