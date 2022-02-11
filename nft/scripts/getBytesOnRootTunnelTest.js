const hre = require('hardhat');
const { ethers } = require('hardhat');

var inquirer = require('inquirer');

function getContractAddressInfo() {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'rootTunnelAddress',
          message: `What is the address of the rootTunnel contract?`,
        },
        {
          type: 'input',
          name: 'reset',
          message: 'Would you like to reset the latest data (y/n)',
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
  console.log('Running on network: ', hre.network.name);
  const answers = await getContractAddressInfo();
  if (answers === null) {
    throw new Error('Failed to get contract address info');
  }

  const { rootTunnelAddress } = answers;

  const RootTunnel = await ethers.getContractFactory('RootTunnel');
  const rootTunnel = await RootTunnel.attach(rootTunnelAddress);

  if (answers.reset === 'y') {
    const setTxn = await rootTunnel.setLatestData('0x1234');

    console.log('SET TXN: ', setTxn);
  }

  const latestData = await rootTunnel.latestData();
  console.log('LATEST DATA: ', latestData);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
