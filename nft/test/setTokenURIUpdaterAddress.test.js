const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const hre = require('hardhat');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('SetTokenURIUpdater', function () {
  let nft, owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');

    const AdditiveNFT = await ethers.getContractFactory('AdditiveNFT');

    nft = await AdditiveNFT.deploy();
  });

  it('should be able to update the tokenUpdater address from the owner', async function () {
    const updater = await nft.tokenURIUpdaterAddress();
    expect(updater).to.equal('0x0000000000000000000000000000000000000000');

    await nft.setTokenURIUpdaterAddress(user1.address);

    const newUpdater = await nft.tokenURIUpdaterAddress();
    expect(newUpdater).to.equal(user1.address);
  });

  it('should fail to update if the caller is not the contract owner', async function () {
    const user1NFTConn = await nft.connect(user1);

    await expect(
      user1NFTConn.setTokenURIUpdaterAddress(owner.address)
    ).to.be.eventually.rejectedWith(/Ownable: caller is not the owner/g);
  });

  it('should fail to update if the updater has been locked forever', async function () {
    await nft.lockTokenURIUpdaterForever();

    await expect(
      nft.setTokenURIUpdaterAddress(user1.address)
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: Token URI Updater Address is Locked Forever/g
    );
  });
});
