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
          name: 'fxChildAddressToSet',
          message: `What would you like to set the fxChild address to?`,
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

  const { rootTunnelAddress, fxChildAddressToSet } = answers;

  const RootTunnel = await ethers.getContractFactory('RootTunnel');
  const rootTunnel = await RootTunnel.attach(rootTunnelAddress);

  const info = await rootTunnel.setFxChildTunnel(fxChildAddressToSet);
  console.log('INFO:', info);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
