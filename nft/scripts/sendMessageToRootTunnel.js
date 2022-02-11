require('dotenv').config();
const hre = require('hardhat');
const { ethers } = require('hardhat');

const inquirer = require('inquirer');

function getContractAddressInfo() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'childTunnelAddress',
          message: `What is the address of the ChildTunnel contract?`,
        },
        {
          type: 'input',
          name: 'message',
          message: `What message would you like to send to root?`,
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

async function main() {
  const network = hre.network.name;
  console.log('Running on network: ', network);
  const answers = await getContractAddressInfo();
  if (answers === null) {
    throw new Error('Failed to get contract address info');
  }

  const { childTunnelAddress, message } = answers;

  const ChildTunnel = await ethers.getContractFactory('ChildTunnel');
  const childTunnel = await ChildTunnel.attach(childTunnelAddress);

  const info = await childTunnel.sendMessageToRoot(message);
  console.log('TXN INFO:', info);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
