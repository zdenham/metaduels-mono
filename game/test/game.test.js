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

const signMove = async (gameId, moveType, nonce, previousSig, signer) => {
  const encoder = new ethers.utils.AbiCoder();

  const bytes = encoder.encode(
    ['uint256', 'uint8', 'string', 'bytes'],
    [gameId, moveType, nonce, previousSig]
  );

  const hash = ethers.utils.solidityKeccak256(['bytes'], [bytes]);

  const binaryHash = ethers.utils.arrayify(hash);

  const signature = await signer.signMessage(binaryHash);

  return signature;
};

const getSignedMoves = async (moves, dueler, duelee) => {
  const gameId = 1;

  let previousSig = '0x';

  const signedMoves = [];

  for (let i = 0; i < moves.length; i++) {
    const moveType = moves[i];
    const signer = i % 2 === 0 ? dueler : duelee;
    const nonce = `nonce${i}`;

    const signature = await signMove(
      gameId,
      moveType,
      nonce,
      previousSig,
      signer
    );

    previousSig = signature;

    signedMoves.push({
      moveType,
      nonce,
      signature,
    });
  }

  const finalSignature = await signMove(
    gameId,
    moves[moves.length - 1],
    `nonce${moves.length - 1}`,
    previousSig,
    dueler
  );

  return {
    signedMoves,
    finalSignature,
  };
};

describe('TestMetaDuelGame', function () {
  let game, dueler, duelee;

  beforeEach(async function () {
    [dueler, duelee] = await ethers.getSigners();

    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');

    const MetaDuelGame = await ethers.getContractFactory('MetaDuelGame');

    game = await MetaDuelGame.deploy();

    await game.letItBegin(dueler.address, duelee.address);
  });

  it('should sign a valid game', async function () {
    // const encoder = new ethers.utils.AbiCoder();
    // const bytes = encoder.encode(['uint', 'string'], [1234, 'Hello World']);

    const moves = [M.A, M.R, M.R, M.B, M.A, M.R];
    const { signedMoves, finalSignature } = await getSignedMoves(
      moves,
      dueler,
      duelee
    );

    // console.log('SIGNED MOVES!', signedMoves, finalSignature);

    const result = await game.endGame(1, signedMoves, finalSignature);

    console.log('RESULT: ', result);
  });
});
