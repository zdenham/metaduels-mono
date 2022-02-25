/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@typechain/hardhat');
require('hardhat-gas-reporter');

const {
  TEST_OWNER_PRIVATE_KEY,
  GOERLI_API,
  MUMBAI_API,
  LOCAL_OWNER_PRIVATE_KEY,
} = process.env;
module.exports = {
  solidity: '0.8.0',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    local: {
      url: 'http://127.0.0.1:8545',
      accounts: [LOCAL_OWNER_PRIVATE_KEY],
    },
    goerli: {
      url: GOERLI_API,
      accounts: [TEST_OWNER_PRIVATE_KEY],
    },
    mumbai: {
      url: MUMBAI_API,
      accounts: [TEST_OWNER_PRIVATE_KEY],
    },
  },
};
