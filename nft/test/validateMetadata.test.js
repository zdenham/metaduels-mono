const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const Hash = require('ipfs-only-hash');
const hre = require('hardhat');

chai.use(chaiAsPromised);

const { expect } = chai;

function calculateOldMeta(newMeta, additionStartIndex, additionEndIndex) {
  const start = newMeta.substring(0, additionStartIndex);
  const end = newMeta.substring(additionEndIndex, newMeta.length);

  return start + end;
}

describe('ValidateMetadata', function () {
  const additionStartIndex = 52;
  const additionEndIndex = 146;
  let metaValidator, ogCid, owner, user1;
  const originalNFTMeta = fs
    .readFileSync('test/files/original.json')
    .toString();

  beforeEach(async function () {
    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');

    const MetadataValidator = await ethers.getContractFactory(
      'MetadataValidator'
    );

    metaValidator = await MetadataValidator.deploy();

    ogCid = await Hash.of(originalNFTMeta);

    [owner, user1] = await ethers.getSigners();
  });

  it('should attempt to update the metadata for a valid addition', async function () {
    const validMeta = fs
      .readFileSync('test/files/validAddition.json')
      .toString();

    const addedJSON = validMeta.substring(
      additionStartIndex + 1,
      additionEndIndex
    );
    const flatSig = await owner.signMessage(addedJSON);

    await expect(
      metaValidator.validateMetadata(
        1,
        owner.address,
        validMeta,
        additionStartIndex,
        additionEndIndex,
        flatSig
      )
    ).to.be.eventually.fulfilled;
  });

  it('should reject an update if the addition signature provided does not match the signer', async function () {
    const validMeta = fs
      .readFileSync('test/files/validAddition.json')
      .toString();

    const addedJSON = validMeta.substring(
      additionStartIndex + 1,
      additionEndIndex
    );
    const invalidSig = await user1.signMessage(addedJSON);

    await expect(
      metaValidator.validateMetadata(
        1,
        owner.address,
        validMeta,
        additionStartIndex,
        additionEndIndex,
        invalidSig
      )
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: signature for added content does not match provided owner/g
    );
  });

  it('should reject an update if it does not include the updater address', async function () {
    const omitUpdaterAddressJSON = fs
      .readFileSync('test/files/invalidUpdaterAddressOmmission.json')
      .toString();

    const addedJSON = omitUpdaterAddressJSON.substring(
      additionStartIndex + 1,
      additionEndIndex
    );
    const sig = await owner.signMessage(addedJSON);

    await expect(
      metaValidator.validateMetadata(
        1,
        owner.address,
        omitUpdaterAddressJSON,
        additionStartIndex,
        additionEndIndex,
        sig
      )
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: updater address in the added content must equal the message sender/g
    );
  });

  it('should reject an update if it includes the wrong updater address', async function () {
    const omitUpdaterAddressJSON = fs
      .readFileSync('test/files/invalidUpdaterAddressIncorrect.json')
      .toString();

    const addedJSON = omitUpdaterAddressJSON.substring(
      additionStartIndex + 1,
      additionEndIndex
    );
    const sig = await owner.signMessage(addedJSON);

    await expect(
      metaValidator.validateMetadata(
        1,
        owner.address,
        omitUpdaterAddressJSON,
        additionStartIndex,
        additionEndIndex,
        sig
      )
    ).to.be.eventually.rejectedWith(
      /AdditiveNFT: updater address in the added content must equal the message sender/g
    );
  });

  // it('should update the token URI if appropriate content is provided', async function () {
  //   const validMeta = fs
  //     .readFileSync('test/files/validAddition.json')
  //     .toString();
  //   const newCid = await Hash.of(validMeta);

  //   // validate that the passed start / end index properly describe the addition in js
  //   expect(
  //     calculateOldMeta(validMeta, additionStartIndex, additionEndIndex)
  //   ).to.equal(originalNFTMeta);

  //   await nft.updateTokenURIAppendOnly(
  //     1,
  //     newCid,
  //     validMeta,
  //     additionStartIndex,
  //     additionEndIndex
  //   );

  //   const newTokenUri = await nft.tokenURI(1);

  //   expect(newTokenUri).to.equal(`ipfs://${newCid}`);
  // });

  // it('Should reject an update if the previous CID does not match the content without the addition', async function () {
  //   const invalidMeta = fs
  //     .readFileSync('test/files/invalidModificationOfOriginal.json')
  //     .toString();

  //   const newCid = await Hash.of(invalidMeta);

  //   await expect(
  //     nft.updateTokenURIAppendOnly(
  //       1,
  //       newCid,
  //       invalidMeta,
  //       additionStartIndex,
  //       additionEndIndex
  //     )
  //   ).to.be.eventually.rejectedWith(
  //     /AdditiveNFT: integrity of previous metadata not preserved with addition/g
  //   );
  // });

  // it('should reject an update if the new content does not match the new CID', async function () {
  //   const invalidCid = 'QmUQy4tfg9e6FBBVczmfN5NCoLbYZ5AnfgxUvDBLAHBLAH';
  //   const validMeta = fs
  //     .readFileSync('test/files/validAddition.json')
  //     .toString();

  //   await expect(
  //     nft.updateTokenURIAppendOnly(
  //       1,
  //       invalidCid,
  //       validMeta,
  //       additionStartIndex,
  //       additionEndIndex
  //     )
  //   ).to.eventually.be.rejectedWith(
  //     /AdditiveNFT: append metadata content does not match the passed CID/g
  //   );
  // });

  // it('should reject an update if the transaction sender does not own the NFT', async function () {
  //   const validMeta = fs
  //     .readFileSync('test/files/validAddition.json')
  //     .toString();
  //   const newCid = await Hash.of(validMeta);

  //   const [_, addr1] = await hre.ethers.getSigners();

  //   const addr1NFT = await nft.connect(addr1);

  //   await expect(
  //     addr1NFT.updateTokenURIAppendOnly(
  //       1,
  //       newCid,
  //       validMeta,
  //       additionStartIndex,
  //       additionEndIndex
  //     )
  //   ).to.eventually.be.rejectedWith(
  //     /AdditiveNFT: append metadata which sender does not own/g
  //   );
  // });

  // it('should reject an update if the addition includes invalid JSON', async function () {
  //   const invalidJSONAddition = fs
  //     .readFileSync('test/files/invalidJSONAddition.json')
  //     .toString();

  //   const newCid = await Hash.of(invalidJSONAddition);

  //   await expect(
  //     nft.updateTokenURIAppendOnly(
  //       1,
  //       newCid,
  //       invalidJSONAddition,
  //       additionStartIndex,
  //       additionEndIndex
  //     )
  //   ).to.be.eventually.rejectedWith(
  //     /AdditiveNFT: append metadata contains invalid JSON/g
  //   );
  // });
});
