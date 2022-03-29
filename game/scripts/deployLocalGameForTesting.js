require('dotenv').config();
const hre = require('hardhat');
const { ethers } = require('hardhat');

// Deploys contract and sends
// hardhat ether to tester wallets
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Using the account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString());

  const Contract = await ethers.getContractFactory('MetaDuelsGame');

  console.log('Attempting to deploy contract');

  const instance = await Contract.deploy();
  await instance.deployed();

  console.log(`Contract deployed to address ${instance.address}`);

  const hardhatPrivateKey =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

  let wallet = new ethers.Wallet(hardhatPrivateKey, hre.ethers.provider);

  let receiver1 = process.env.TESTER_1;
  let receiver2 = process.env.TESTER_2;

  let amountInEther = '1.0';

  let tx1 = {
    to: receiver1,
    value: ethers.utils.parseEther(amountInEther),
  };

  let tx2 = {
    to: receiver2,
    value: ethers.utils.parseEther(amountInEther),
  };

  // Send a transaction
  await wallet.sendTransaction(tx1);
  await wallet.sendTransaction(tx2);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
