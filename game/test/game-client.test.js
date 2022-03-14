const chai = require('chai');
const hre = require('hardhat');
const { default: GameContractClient } = require('../../web/lib/gameClient');

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

const runMoves = async (moves, dueler, duelee, game, shouldInit = true) => {};

describe('TestMetaDuelGameClient', function () {
  let duelerClient, dueleeClient, dueler, duelee;

  beforeEach(async function () {
    [dueler, duelee] = await ethers.getSigners();

    // reset the network to prevent tests from affecting each other
    await hre.network.provider.send('hardhat_reset');
    game = await MetaDuelGame.deploy();

    duelerClient = new GameContractClient(dueler);
    dueleeClient = new GameContractClient(duelee);
  });
});
