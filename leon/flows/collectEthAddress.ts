import { Client, User, TextChannel } from 'discord.js';
import { ethers } from 'ethers';
import delay from '../utils/delay';
import provider from '../utils/ethereum/provider';
import resolveEthAddress from '../utils/ethereum/resolveEthAddress';
import waitForMessage from '../utils/waitForMessage';

const collectEthAddress = async (
  // @ts-ignore
  leon: Client, // @ts-ignore
  larry: Client, // @ts-ignore
  channel: TextChannel,
  user: User
): Promise<string> => {
  let address = null;

  await channel.sendTyping();
  await delay(1000);
  await channel.send('Send us your eth address');

  while (!address) {
    try {
      const maybeAddress = await waitForMessage(channel.client, user.id);
      address = await resolveEthAddress(maybeAddress);
      if (!address) {
        throw new Error('Not an address');
      }
    } catch (e) {
      await delay(750);
      await channel.sendTyping();
      await delay(1000);
      await channel.send("Nope, that don't work--send your Eth Address");
    }
  }

  const wei = await provider.getBalance(address);
  const amountEther = ethers.utils.formatEther(wei);

  await channel.sendTyping();
  await delay(2000);

  await channel.send(
    `HAHA! This bitch has ${amountEther} Ether, they broke as Fuck!`
  );

  return address;
};

export default collectEthAddress;
