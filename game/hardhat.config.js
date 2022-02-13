/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@typechain/hardhat');
require('hardhat-gas-reporter');

const { TEST_OWNER_PRIVATE_KEY, GOERLI_API, MUMBAI_API } = process.env;
module.exports = {
  solidity: '0.8.0',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
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
