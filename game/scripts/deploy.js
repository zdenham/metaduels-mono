const hre = require('hardhat');
const { ethers } = require('hardhat');

var inquirer = require('inquirer');

const contractArgs = {
  mumbai: {
    ChildTunnel: ['0xCf73231F28B7331BBe3124B907840A94851f9f11'],
  },
  goerli: {
    RootTunnel: ['0x2890bA17EfE978480615e330ecB65333b880928e'],
  },
  hardhat: {
    MetaDuelsGame: [],
  },
  local: {
    MetaDuelsGame: [],
  },
};

function confirmDeploy(contractName, network, args) {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'confirm',
          message: `Are you sure you want to deploy ${contractName} to ${network} with the following args: ${args.join(
            ', '
          )} (y/n)`,
        },
      ])
      .then((answer) => {
        resolve(answer.confirm.toLowerCase() === 'y');
      })
      .catch(() => {
        resolve(false);
      });
  });
}

function getContractName(network) {
  return new Promise((resolve) => {
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'contract',
          message: `What contract would you like to deploy to ${network}? (case sensitive)`,
        },
      ])
      .then((answer) => {
        resolve(answer.contract);
      })
      .catch(() => {
        resolve('');
      });
  });
}

async function main() {
  const network = hre.network.name;

  const contract = await getContractName(network);

  if (!contractArgs[network] || !contractArgs[network][contract]) {
    throw new Error(
      'No contract arguments found for this network and contract'
    );
  }

  const args = contractArgs[network][contract];
  const [deployer] = await ethers.getSigners();

  console.log('Using the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory(contract);
  const confirmed = await confirmDeploy(contract, network, args);

  if (!confirmed) {
    console.log('Exiting without deploy');
    return;
  }

  console.log('Attempting to deploy contract');

  const instance = await Contract.deploy(...args);
  await instance.deployed();

  console.log(`Contract ${contract} deployed to address ${instance.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
