const { ethers } = require('hardhat');
const { POSClient, use } = require('@maticnetwork/maticjs');
const { Web3ClientPlugin } = require('@maticnetwork/maticjs-ethers');
const inquirer = require('inquirer');

// see metamask example here: https://github.com/maticnetwork/maticjs-ethers/blob/main/examples/metamask/src/index.js
const { providers, Wallet } = ethers;

const {
  TEST_OWNER_PRIVATE_KEY,
  TEST_OWNER_PUBLIC_KEY,
  GOERLI_API,
  MUMBAI_API,
} = process.env;

// install ethers plugin
use(Web3ClientPlugin);

function getTxnHash() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'txnHash',
          message: `What is the transaction hash from polygon you would like to receive in ETH?`,
        },
        {
          type: 'input',
          name: 'rootTunnelAddress',
          message: `What is the address of the root contract to receive the message?`,
        },
      ])
      .then((answers) => {
        resolve(answers);
      })
      .catch(() => {
        resolve(null);
      });
  });
}

async function generateMaticProof(txnHash) {
  const posClient = new POSClient();

  const parentProvider = new providers.JsonRpcProvider(GOERLI_API);
  const childProvider = new providers.JsonRpcProvider(MUMBAI_API);

  await posClient.init({
    log: true,
    network: 'testnet',
    version: 'mumbai',
    child: {
      provider: new Wallet(TEST_OWNER_PRIVATE_KEY, childProvider),
      defaultConfig: {
        from: TEST_OWNER_PUBLIC_KEY,
      },
    },
    parent: {
      provider: new Wallet(TEST_OWNER_PRIVATE_KEY, parentProvider),
      defaultConfig: {
        from: TEST_OWNER_PUBLIC_KEY,
      },
    },
  });

  console.log('MADE IT HERE!');
  const proof = await posClient.exitUtil.buildPayloadForExit(
    txnHash,
    '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036'
  );

  console.log('MAYBE THE PROOOOF?', proof);

  return proof;
}

async function main() {
  const { txnHash, rootTunnelAddress } = await getTxnHash();

  const RootTunnel = await ethers.getContractFactory('RootTunnel');
  const rootTunnel = await RootTunnel.attach(rootTunnelAddress);

  const proof = await generateMaticProof(txnHash);
  const info = await rootTunnel.receiveMessage(proof);

  console.log('ROOT TUNNEL RECEIVE?:', info);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
