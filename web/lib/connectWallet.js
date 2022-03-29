import { ethers } from "ethers";

// POLYGON MUMBAI "0x13881";
// HARDHAT "0x7A69"
const GAME_NETWORK_ID = "0x7A69";

export default async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Metamask has been installed");
  }

  const provider = new ethers.providers.Web3Provider(
    window.web3.currentProvider || window.ethereum
  );

  await provider.send("wallet_switchEthereumChain", [
    { chainId: GAME_NETWORK_ID },
  ]);

  await provider.send("eth_requestAccounts", []);

  return provider.getSigner();
}
