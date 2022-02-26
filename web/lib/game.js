import { ethers } from "ethers";
import { v4 } from "uuid";
import hash from "object-hash";
import gameContract from "./contract";

const GAME_NETWORK_ID = "0x7A69";

export const MOVES = {
  None: 0,
  Attack: 1,
  Block: 2,
  Reload: 3,
};

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Metamask has been installed");
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);

  await provider.send("wallet_switchEthereumChain", [
    { chainId: GAME_NETWORK_ID },
  ]);

  await provider.send("eth_requestAccounts", []);

  return provider.getSigner();
}

class GameClient {
  constructor(signer) {
    this.signer = signer;
    this.game = new ethers.Contract(
      gameContract.address,
      gameContract.abi,
      signer
    );
    this.gameId = null;
  }

  async newGame(dueleeAddress) {
    if (!this.game) {
      throw new Error("No Game Contract found");
    }

    const duelerAddress = await this.signer.getAddress();

    await this.game.letItBegin(duelerAddress, dueleeAddress);
  }

  async connectToGame(gameId) {
    this.gameId = gameId;
  }

  async getGameState() {
    const state = await this.game.gameStateForId(this.gameId);
    this._saveGameStateTransitionToLocalStorage(state);
    const moves = this._deriveMovesFromGameStateTransitions();

    return { state, moves };
  }

  async signAndSendMove(moveType) {
    const nonce = v4();

    const signature = await this._getMoveSignature(moveType, nonce);

    await this.game.submitMoveSignature(this.gameId, signature);
    this._saveCurrentMoveToLocalStorage(nonce, moveType, signature);
  }

  async revealMove() {
    const move = this._loadLatestMoveFromLocalStorage();
    await this.game.revealMove(this.gameId, move);
  }

  async _getMoveSignature(moveType, nonce) {
    const encoder = new ethers.utils.AbiCoder();

    const bytes = encoder.encode(
      ["uint256", "uint8", "string"],
      [this.gameId, moveType, nonce]
    );

    const hash = ethers.utils.solidityKeccak256(["bytes"], [bytes]);

    const binaryHash = ethers.utils.arrayify(hash);

    const signature = await this.signer.signMessage(binaryHash);

    return signature;
  }

  _saveGameStateTransitionToLocalStorage(currGameState) {
    const gameStatesMap =
      JSON.parse(
        window.localStorage.getItem("metaDuelsGameStateTransitions")
      ) || {};

    const gameStateTransitions = gameStatesMap[this.gameId] || [];
    const lastGameState =
      gameStateTransitions[gameStateTransitions.length - 1] || {};

    // only add state if it differs from the previous state
    if (hash(lastGameState) !== hash(currGameState)) {
      window.localStorage.setItem(
        "metaDuelsGameStateTransitions",
        JSON.stringify({
          ...gameStatesMap,
          [this.gameId]: gameStateTransitions.concat({ ...currGameState }),
        })
      );
    }
  }

  _saveCurrentMoveToLocalStorage(nonce, moveType, signature) {
    const moves =
      JSON.parse(window.localStorage.getItem("metaDuelsCurrentMoves")) || {};

    window.localStorage.setItem(
      "metaDuelsCurrentMoves",
      JSON.stringify({
        ...moves,
        [this.gameId]: { nonce, moveType, signature },
      })
    );
  }

  _loadLatestMoveFromLocalStorage() {
    const moves =
      JSON.parse(window.localStorage.getItem("metaDuelsCurrentMoves")) || {};

    return moves[this.gameId];
  }

  _moveFromStateTransition(
    playerOldState,
    playerNewState,
    opponentOldState,
    opponentNewState
  ) {
    let moveType = MOVES.None;
    let isCritical = false;
    if (playerOldState.ammo > playerNewState.ammo) {
      moveType = MOVES.Attack;
    } else if (playerOldState.shield === playerNewState.sheild + 2) {
      moveType = MOVES.Block;
    } else {
      moveType = MOVES.Reload;
    }

    if (moveType === MOVES.Attack) {
      isCritical = opponentNewState.health === opponentOldState.health - 2;
    }

    if (moveType === MOVES.Reload) {
      isCritical = playerNewState.ammo === playerOldState.ammo + 2;
    }

    return { moveType, isCritical };
  }

  _deriveMovesFromGameStateTransitions() {
    const stateTransitionsMap =
      JSON.parse(
        window.localStorage.getItem("metaDuelsGameStateTransitions")
      ) || {};

    const stateTransitions = stateTransitionsMap[this.gameId];

    const moves = [];
    for (let i = 1; i < stateTransitions.length; i++) {
      const oldS = stateTransitions[i - 1];
      const newS = stateTransitions[i];

      const duelerMove = this._moveFromStateTransition(
        oldS.duelerState,
        newS.duelerState,
        oldS.dueleeState,
        newS.dueleeState
      );

      const dueleeMove = this._moveFromStateTransition(
        oldS.dueleeState,
        newS.dueleeState,
        oldS.duelerState,
        newS.duelerState
      );

      moves.push({
        duelerMove,
        dueleeMove,
      });
    }

    return moves;
  }
}

export default GameClient;
