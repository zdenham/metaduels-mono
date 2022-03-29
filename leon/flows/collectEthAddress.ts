import { User, TextChannel } from 'discord.js';
import { ethers } from 'ethers';
import sendWithTyping from '../utils/sendWithTyping';
import delay from '../utils/delay';
import provider from '../utils/ethereum/provider';
import resolveEthAddress from '../utils/ethereum/resolveEthAddress';
import waitForMessage from '../utils/waitForMessage';

const msg1 = `You don't get into the club unless you show us your ID`;
const msg2 = `In case you are new around here, your ID is your ETH / ENS address,
it looks like 0x... send your ETH address in this channel so we can ID you.`;

const collectEthAddress = async (
  leonChannel: TextChannel,
  larryChannel: TextChannel,
  user: User
): Promise<string> => {
  let address = null;

  await sendWithTyping(leonChannel, msg1);
  await sendWithTyping(larryChannel, msg2);

  while (!address) {
    try {
      const maybeAddress = await waitForMessage(leonChannel.client, user.id);
      address = await resolveEthAddress(maybeAddress);
      if (!address) {
        throw new Error('Not an address');
      }
    } catch (e) {
      await delay(750);
      await sendWithTyping(
        leonChannel,
        "Nope, that don't work--send your Eth Address"
      );
    }
  }

  const wei = await provider.getBalance(address);
  const amountEther = ethers.utils.formatEther(wei);

  await sendWithTyping(
    leonChannel,
    `HAHA! This bitch has ${amountEther} Ether in their wallet, they broke as FUCK!`,
    2000
  );

  await sendWithTyping(
    larryChannel,
    `Sorry about that, we see a lot of high rollers come through here so Leon is ehhhhhhh.... not easily impressed`
  );

  return address;
};

export default collectEthAddress;
