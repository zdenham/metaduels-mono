import { ethers } from "ethers";
import { v4 } from "uuid";
import gameContract from "./contract";

const GAME_NETWORK_ID = "0x13881";

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
    this.duelerAddress = null;
    this.dueleeAddress = null;
  }

  async newGame(dueleeAddress) {
    if (!this.game) {
      throw new Error("No Game Contract found");
    }

    this.duelerAddress = await this.signer.getAddress();
    this.dueleeAddress = dueleeAddress;

    await this.game.letItBegin(this.duelerAddress, this.dueleeAddress);
  }

  async connectToGame(gameId) {
    this.gameId = gameId;
  }

  async getGameState() {
    const state = await this.game.gameStateForId(this.gameId);

    return state;
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

  async queryEvents(eventType) {
    const MAX_BLOCKS = 900;

    const currentBlock = await this.signer.provider.getBlockNumber();

    const fromBlock = Math.max(currentBlock - 900, 0);

    const filter = {
      address: gameContract.address,
      topics: this._topicsForEventType(eventType),
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

  _topicsForEventType(eventType) {
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
          ethers.utils.id("MoveSubmitted(uint256,address)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
        ];
      case "MoveRevealed":
        return [
          ethers.utils.id("MoveRevealed(uint256,address)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
        ];
      case "RoundCompleted":
        return [
          ethers.utils.id("RoundCompleted(uint256,uint8,uint8)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
        ];
      case "WinnerDeclared":
        return [
          ethers.utils.id("WinnerDeclared(uint256,address)"),
          ethers.utils.hexZeroPad(this.gameId, 32),
        ];
      default:
        return [];
    }
  }

  _parseDataFromEvent(eventType, event) {
    switch (eventType) {
      case "GameCreated":
        const gameId = parseInt(event.data, 16);
        return { gameId };
      case "MoveSubmitted":
        return {};
      case "MoveRevealed":
        return {};
      case "RoundCompleted":
        return {};
      case "WinnerDeclared":
        return {};
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

export default GameClient;
