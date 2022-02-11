const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const hre = require('hardhat');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('TestBytes', function () {
  let test, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');

    const TestBytes = await ethers.getContractFactory('TestBytes');

    test = await TestBytes.deploy();
  });

  it('Want to print stuff!', async function () {
    await test.setBytes('0x12341234');

    const bytes = await test.myBytes();

    console.log('THE BYTES LOOK LIKE: ', bytes);

    await test.setBytes([1, 2, 4]);

    const otherBytes = await test.myBytes();

    console.log('OTHER BYTES LOOK LIKE: ', otherBytes);
  });
});
