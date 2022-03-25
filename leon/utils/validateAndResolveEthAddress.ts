import { ethers } from 'ethers';

const addressRegEx = /^0x[a-fA-F0-9]{40}$/;
const ensRegEx =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/;

const validateAndResolveEthAddress = async (
  addressOrEns: string
): Promise<string | null> => {
  if (ensRegEx.test(addressOrEns)) {
    const provider = new ethers.providers.JsonRpcProvider(
      'https://eth-mainnet.alchemyapi.io/v2/CwVBW1_D3Q-PIzkEXecoFvYT5eIF6tlB'
    );

    return await provider.resolveName(addressOrEns);
  }

  if (addressRegEx.test(addressOrEns)) {
    return addressOrEns;
  }

  return null;
};

export default validateAndResolveEthAddress;
