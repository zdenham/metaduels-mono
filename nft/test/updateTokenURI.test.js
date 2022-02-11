const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const hre = require('hardhat');
const fs = require('fs');
const Hash = require('ipfs-only-hash');

chai.use(chaiAsPromised);

const { expect } = chai;

describe('updateTokenURI', function () {
  let nft, owner, user1, ogCid;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    await hre.network.provider.send('hardhat_reset');

    const AdditiveNFT = await ethers.getContractFactory('AdditiveNFT');

    nft = await AdditiveNFT.deploy();

    const originalNFTMeta = fs
      .readFileSync('test/files/original.json')
      .toString();

    ogCid = await Hash.of(originalNFTMeta);

    await nft.mintNFT(ogCid);
  });

  it('should accept a valid tokenURI update', async function () {
    await nft.setTokenURIUpdaterAddress(owner.address);

    await nft.updateTokenURI(1, 'newCID', ogCid, owner.address);
    const newTokenURI = await nft.tokenURI(1);

    expect(newTokenURI).to.equal('ipfs://newCID');
  });

  it('should reject an update if it does not come from the token URI updater address', async function () {
    await nft.setTokenURIUpdaterAddress(user1.address);

    await expect(
      nft.updateTokenURI(1, 'newCID', ogCid, owner.address)
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: Only the tokenURIUpdater contract can update tokenURIs/g
    );
  });

  it('should reject an update if the passed tokenOwner is not the owner of the token', async function () {
    await nft.setTokenURIUpdaterAddress(owner.address);

    await expect(
      nft.updateTokenURI(1, 'newCID', ogCid, user1.address)
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: Attempting to update a tokenURI without owning it/g
    );
  });

  it('should reject an update if the passed currentCID is mismatched with the CID', async function () {
    await nft.setTokenURIUpdaterAddress(owner.address);

    await expect(
      nft.updateTokenURI(1, 'newCID', 'incorrectCurrentCid', owner.address)
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: TokenURI CID Integrity is not kept/g
    );
  });
});
