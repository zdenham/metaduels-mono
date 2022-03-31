const chai = require('chai');
const hre = require('hardhat');

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

// These nonce values do not produce a critical hit and
// should be used to test non critical hit scenarios
const nonCriticalNonce = 'nonCritical';

// These nonce values happen to produce critical hits
// when appended in order 'critical1' + 'critical2', but will not
// produce critical hits when appended in the opposite order.
// This should be used to test scenarios when one player has
// a critical hit and the other does not
const giveCriticalHitNonce = 'critical1';
const getCriticalHitNonce = 'critical2';

// These nonce values happen to produce critical hits
// regardless of the order. This should be used to test scenarios
// where both players have critical hits
const mutualCriticalHitNonce = 'bothPlayersCritical';

const criticalHit = (nonce1, nonce2) => {
  const encoder = new ethers.utils.AbiCoder();
  const bytes = encoder.encode(['string', 'string'], [nonce1, nonce2]);
  const hash = ethers.utils.solidityKeccak256(['bytes'], [bytes]);
  const binaryHash = ethers.utils.arrayify(hash);
  const isCritical = binaryHash[31] < 25;

  return isCritical;
};

const getHashedMove = async (move) => {
  const gameId = 1;

  const moveType = typeof move === 'object' ? move.moveType : move;
  const nonce = typeof move === 'object' ? move.nonce : nonCriticalNonce;

  const encoder = new ethers.utils.AbiCoder();

  const bytes = encoder.encode(
    ['uint256', 'uint8', 'string'],
    [gameId, moveType, nonce]
  );

  const moveHash = ethers.utils.solidityKeccak256(['bytes'], [bytes]);

  return {
    moveType,
    nonce,
    moveHash,
  };
};

const runMoves = async (moves, dueler, duelee, game, shouldInit = true) => {
  if (shouldInit) {
    await game.letItBegin(dueler.address, duelee.address);
  }

  const numRounds = moves.length / 2;

  const duelerGame = await game.connect(dueler);
  const dueleeGame = await game.connect(duelee);

  for (let i = 0; i < numRounds; i++) {
    const duelerMove = await getHashedMove(moves[i * 2], dueler);
    const dueleeMove = await getHashedMove(moves[i * 2 + 1], duelee);

    await duelerGame.submitMoveHash(1, duelerMove.moveHash);
    await dueleeGame.submitMoveHash(1, dueleeMove.moveHash);

    await duelerGame.revealMove(1, duelerMove);
    await dueleeGame.revealMove(1, dueleeMove);
  }

  const state = await game.gameStateForId(1);

  return state;
};

describe('TestMetaDuelGame', function () {
  let game, dueler, duelee;

  beforeEach(async function () {
    [dueler, duelee] = await ethers.getSigners();

    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');

    const MetaDuelGame = await ethers.getContractFactory('MetaDuelsGame');

    game = await MetaDuelGame.deploy();

    await game.letItBegin(dueler.address, duelee.address);
  });

  it('should declare appropriate winner for a valid game', async function () {
    const moves = [M.A, M.R, M.R, M.B, M.A, M.R];
    const state = await runMoves(moves, dueler, duelee, game);
    expect(state.winner).to.equal(dueler.address);
  });

  it('should emit an event when a move is submitted', async function () {
    const duelerMove = await getHashedMove(M.A, dueler);

    await expect(game.submitMoveHash(1, duelerMove.moveHash))
      .to.emit(game, 'MoveSubmitted')
      .withArgs(1, 2, dueler.address);
  });

  it('should emit the winner as an event on the final move', async function () {
    const initialMoves = [M.A, M.R, M.R, M.B];
    await runMoves(initialMoves, dueler, duelee, game);

    const lastMoves = [M.A, M.R];

    const duelerMove = await getHashedMove(lastMoves[0], dueler);
    const dueleeMove = await getHashedMove(lastMoves[1], duelee);

    const duelerGame = await game.connect(dueler);
    const dueleeGame = await game.connect(duelee);

    await duelerGame.submitMoveHash(1, duelerMove.moveHash);
    await dueleeGame.submitMoveHash(1, dueleeMove.moveHash);

    await duelerGame.revealMove(1, duelerMove);

    await expect(dueleeGame.revealMove(1, dueleeMove))
      .to.emit(dueleeGame, 'WinnerDeclared')
      .withArgs(1, 17, dueler.address);
  });

  it('should emit an event with appropriate critical hits on round end', async function () {
    const duelerMove = await getHashedMove(
      { moveType: M.A, nonce: giveCriticalHitNonce },
      dueler
    );
    const dueleeMove = await getHashedMove(
      { moveType: M.R, nonce: getCriticalHitNonce },
      duelee
    );

    const duelerGame = await game.connect(dueler);
    const dueleeGame = await game.connect(duelee);

    await duelerGame.submitMoveHash(1, duelerMove.moveHash);
    await dueleeGame.submitMoveHash(1, dueleeMove.moveHash);

    await duelerGame.revealMove(1, duelerMove);

    await expect(dueleeGame.revealMove(1, dueleeMove))
      .to.emit(dueleeGame, 'RoundCompleted')
      .withArgs(1, 6, M.A, M.R, true, false);
  });

  it('should replenish a shield after two rounds', async function () {
    const moves = [M.A, M.B, M.R, M.R, M.R, M.R, M.A, M.B, M.R, M.A, M.R, M.A];

    const state = await runMoves(moves, dueler, duelee, game);
    expect(state.winner).to.equal(duelee.address);
  });

  it('should cause two damage with a critical attack', async function () {
    const moves = [
      { moveType: M.A, nonce: giveCriticalHitNonce },
      { moveType: M.R, nonce: getCriticalHitNonce },
    ];

    const state = await runMoves(moves, dueler, duelee, game);
    expect(state.winner).to.equal(dueler.address);
  });
});
