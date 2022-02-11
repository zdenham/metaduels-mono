const hre = require('hardhat');
const { ethers } = require('hardhat');

var inquirer = require('inquirer');

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
          name: 'fxRootAddressToSet',
          message: `What would you like to set the fxRoot address to?`,
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

  const { childTunnelAddress, fxRootAddressToSet } = answers;

  const ChildTunnel = await ethers.getContractFactory('ChildTunnel');
  const childTunnel = await ChildTunnel.attach(childTunnelAddress);

  const info = await childTunnel.setFxRootTunnel(fxRootAddressToSet);
  console.log('INFO:', info);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
