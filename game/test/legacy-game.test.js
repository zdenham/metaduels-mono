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

// specifies the types of nonce combinations
const criticalNonceComboTypes = {
  NON_CRITICAL: 1,
  DUELER_CRITICAL: 2,
  DUELEE_CRITICAL: 3,
  BOTH_CRITICAL: 4,
};

// These nonce values do not produce a critical hit and
// should be used to test non critical hit scenarios
const nonCriticalNonceCombo = ['nonCritical', 'nonCritical'];

// These nonce values happen to produce critical hits
// when appended in order 'critical1' + 'critical2', but will not
// produce critical hits when appended in the opposite order.
// This should be used to test scenarios when one player has
// a critical hit and the other does not
const criticalDuelerCombo = ['critical1', 'critical2'];
const criticalDueleeCombo = ['critical2', 'critical1'];

// These nonce values happen to produce critical hits
// regardless of the order. This should be used to test scenarios
// where both players have critical hits
const criticalBothCombo = ['bothPlayersCritical', 'bothPlayersCritical'];

const criticalHit = (nonce1, nonce2) => {
  const encoder = new ethers.utils.AbiCoder();
  const bytes = encoder.encode(['string', 'string'], [nonce1, nonce2]);
  const hash = ethers.utils.solidityKeccak256(['bytes'], [bytes]);
  const binaryHash = ethers.utils.arrayify(hash);
  const isCritical = binaryHash[31] < 25;

  return isCritical;
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

// TODO - accept critical hits
const getSignedMoves = async (moves, dueler, duelee, criticalHitTypesArr) => {
  const gameId = 1;

  let previousSig = '0x';

  const signedMoves = [];

  for (let i = 0; i < moves.length; i++) {
    const moveType = moves[i];
    const signer = i % 2 === 0 ? dueler : duelee;
    const nonce = `nonCritical`;

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
    `nonCritical`,
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
    const moves = [M.A, M.R, M.R, M.B, M.A, M.R];
    const { signedMoves, finalSignature } = await getSignedMoves(
      moves,
      dueler,
      duelee
    );

    // console.log('SIGNED MOVES!', signedMoves, finalSignature);

    const winner = await game.callStatic.endGame(
      1,
      signedMoves,
      finalSignature
    );

    expect(winner).to.equal(dueler.address);
  });

  it('should replenish a shield after two rounds', async function () {
    const moves = [M.A, M.B, M.R, M.R, M.R, M.R, M.A, M.B, M.R, M.A, M.R, M.A];
    const { signedMoves, finalSignature } = await getSignedMoves(
      moves,
      dueler,
      duelee
    );

    const winner = await game.callStatic.endGame(
      1,
      signedMoves,
      finalSignature
    );

    expect(winner).to.equal(duelee.address);
  });

  it('should reject an attack with no ammo', async function () {
    const moves = [M.A, M.B, M.A, M.R];
    const { signedMoves, finalSignature } = await getSignedMoves(
      moves,
      dueler,
      duelee
    );

    await expect(
      game.callStatic.endGame(1, signedMoves, finalSignature)
    ).to.be.eventually.rejectedWith(
      /MetaDuelsGame: dueler cannot attack without ammo/g
    );
  });
});
