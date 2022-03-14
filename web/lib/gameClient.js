import { ethers } from "ethers";
import { v4 } from "uuid";
import gameContract from "./contract";

export const MOVES = {
  None: 0,
  Attack: 1,
  Block: 2,
  Reload: 3,
};

export function moveToString(move) {
  switch (move) {
    case MOVES.Attack:
      return "Attack";
    case MOVES.Block:
      return "Block";
    case MOVES.Reload:
      return "Reload";
    default:
      return "None";
  }
}

class GameContractClient {
  constructor(signer, address = gameContract.address) {
    this.signer = signer;
    this.game = new ethers.Contract(address, gameContract.abi, signer);

    this.iface = new ethers.utils.Interface(gameContract.abi);
    this.gameId = null;
    this.duelerAddress = null;
    this.dueleeAddress = null;
  }

  waitForGameId() {
    return new Promise((resolve) => {
      this.addEventListener("GameCreated", async ({ gameId }) => {
        // TODO - remove event listener or only listen for one event
        resolve(gameId);
      });
    });
  }

  async newGame(dueleeAddress) {
    if (!this.game) {
      throw new Error("No Game Contract found");
    }

    this.duelerAddress = await this.signer.getAddress();
    this.dueleeAddress = dueleeAddress;

    await this.game.letItBegin(this.duelerAddress, this.dueleeAddress);

    this.gameId = await this.waitForGameId();

    return this.gameId;
  }

  async connectToGame(gameId) {
    this.gameId = gameId;
    const state = await this.getGameState();
    this.duelerAddress = state.duelerAddress;
    this.dueleeAddress = state.dueleeAddress;
  }

  async getGameState() {
    const state = await this.game.gameStateForId(this.gameId);

    return state;
  }

  async signerAddress() {
    return await this.signer.getAddress();
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

  // eventType: GameCreated | MoveSubmitted | MoveRevealed | RoundCompleted | WinnerDeclared
  async addEventListener(eventType, handler) {
    const startBlockNum = await this.signer.provider.getBlockNumber();

    const filter = {
      address: gameContract.address,
      topics: this._topicsForEventType(eventType),
    };

    this.signer.provider.on(filter, (event) => {
      if (startBlockNum < event.blockNumber) {
        handler(this._parseDataFromEvent(eventType, event));
      }
    });
  }

  async queryEvents(eventType, ...stateVersions) {
    const MAX_BLOCKS = 900;

    const currentBlock = await this.signer.provider.getBlockNumber();

    const fromBlock = Math.max(currentBlock - MAX_BLOCKS, 0);

    const filter = {
      address: gameContract.address,
      topics: this._topicsForEventType(eventType, ...stateVersions),
    };

    const events = await this.game.queryFilter(filter, fromBlock);

    const decodedEvents = events.map((event) => {
      const decodedArr = event.decode(event.data, event.topics);

      return { ...decodedArr };
    });

    return decodedEvents;
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

  _topicsForEventType(eventType, ...stateVersions) {
    const stateVersionsTopic = stateVersions.length ? stateVersions : null;

    switch (eventType) {
      case "GameCreated":
        return [
          ethers.utils.id("GameStarted(address,address,uint256)"),
          [
            ethers.utils.hexZeroPad(this.duelerAddress, 32),
            ethers.utils.hexZeroPad(this.dueleeAddress, 32),
          ],
          [
            ethers.utils.hexZeroPad(this.duelerAddress, 32),
            ethers.utils.hexZeroPad(this.dueleeAddress, 32),
          ],
        ];
      case "MoveSubmitted":
        return [
          ethers.utils.id("MoveSubmitted(uint256,uint256,address)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
          stateVersionsTopic,
        ];
      case "MoveRevealed":
        return [
          ethers.utils.id("MoveRevealed(uint256,uint256,address)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
          stateVersionsTopic,
        ];
      case "RoundCompleted":
        return [
          ethers.utils.id(
            "RoundCompleted(uint256,uint256,uint8,uint8,bool,bool)"
          ),
          ethers.utils.hexZeroPad(this.gameId, 32),
          stateVersionsTopic,
        ];
      case "WinnerDeclared":
        return [
          ethers.utils.id("WinnerDeclared(uint256,uint256,address)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
          stateVersionsTopic,
        ];
      default:
        return [];
    }
  }

  _parseDataFromEvent(eventType, event) {
    const args = this.iface.parseLog(event).args;

    console.log("THE ARGS: ", args);

    switch (eventType) {
      case "GameCreated":
        return { dueler: args[0], duelee: args[1], gameId: args[2] };
      case "MoveSubmitted":
        return {
          gameId: args[0],
          stateVersion: args[1],
          signer: args[2],
        };
      case "MoveRevealed":
        return {
          gameId: args[0],
          stateVersion: args[1],
          revealer: args[2],
        };
      case "RoundCompleted":
        return {
          gameId: args[0],
          stateVersion: args[1],
          duelerMove: args[2],
          dueleeMove: args[3],
          isDuelerMoveCritical: args[4],
          isDueleeMoveCritical: args[5],
        };
      case "WinnerDeclared":
        return {
          gameId: args[0],
          stateVersion: args[1],
          winner: args[2],
        };
      default:
        return {};
    }
  }

  _loadLatestMoveFromLocalStorage() {
    const moves =
      JSON.parse(window.localStorage.getItem("metaDuelsCurrentMoves")) || {};

    return moves[this.gameId];
  }
}

export default GameContractClient;
