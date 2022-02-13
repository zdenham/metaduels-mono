const chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const hre = require('hardhat');

chai.use(chaiAsPromised);

const { expect } = chai;
const { ethers } = hre;

/**
 * THE MOVES A = ATTACK, B = BLOCK, R = RELOAD
 */
const M = {
  A: 1,
  B: 2,
  R: 3,
};

const signMoves = async (moves, dueler, duelee) => {
  const gameId = 1;
  const encoder = new ethers.utils.AbiCoder();

  let previousSig = '';

  return await Promise.all(
    moves.map(async (moveType, i) => {
      const signer = i % 2 === 0 ? dueler : duelee;
      const nonce = `nonce${i}`;

      console.log('BEFORE: ');
      const bytes = encoder.encode(
        ['uint256', 'uint8', 'string', 'bytes'],
        [gameId, moves[i], `nonce${i}`]
      );

      console.log('AFTER: ');

      const hash = ethers.utils.solidityKeccak256(['bytes'], [bytes]);

      const dataToSign = encoder.encode(hash);

      const signature = await signer.signMessage(dataToSign);

      previousSig = signature;

      return {
        moveType,
        nonce,
        signature,
      };
    })
  );
};

describe('TestMetaDuelGame', function () {
  let game, dueler, duelee;

  beforeEach(async function () {
    [dueler, duelee] = await ethers.getSigners();

    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');

    const MetaDuelGame = await ethers.getContractFactory('MetaDuelGame');

    game = await MetaDuelGame.deploy();
  });

  it('should sign a valid game', async function () {
    // const encoder = new ethers.utils.AbiCoder();
    // const bytes = encoder.encode(['uint', 'string'], [1234, 'Hello World']);

    const bytes32 = ethers.utils.solidityKeccak256(['string'], ['BLAH']);

    await game.letItBegin(dueler.address, duelee.address, bytes32);

    const moves = [M.A, M.R, M.R, M.B, M.A, M.R];

    const signedMoves = await signMoves(moves, dueler, duelee);

    console.log('THE SIGNED MOVES: ', signedMoves);
  });
});
