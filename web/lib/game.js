import { ethers } from "ethers";
import { v4 } from "uuid";
import hash from "object-hash";

const criticalHit = (nonce1, nonce2) => {
  const encoder = new ethers.utils.AbiCoder();
  const bytes = encoder.encode(["string", "string"], [nonce1, nonce2]);
  const hash = ethers.utils.solidityKeccak256(["bytes"], [bytes]);
  const binaryHash = ethers.utils.arrayify(hash);
  const isCritical = binaryHash[31] < 25;

  return isCritical;
};

const GAME_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const GAME_NETWORK_ID = "0x7A69";

const gameContract = {
  address: GAME_CONTRACT_ADDRESS,
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          internalType: "uint8",
          name: "moveType",
          type: "uint8",
        },
        {
          internalType: "string",
          name: "nonce",
          type: "string",
        },
      ],
      name: "_createSignatureInputHash",
      outputs: [
        {
          internalType: "bytes32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes32",
          name: "data",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
        {
          internalType: "address",
          name: "maybeSigner",
          type: "address",
        },
      ],
      name: "_validateSignature",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
      ],
      name: "gameStateForId",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "winner",
              type: "address",
            },
            {
              internalType: "address",
              name: "duelerAddress",
              type: "address",
            },
            {
              internalType: "address",
              name: "dueleeAddress",
              type: "address",
            },
            {
              components: [
                {
                  internalType: "int8",
                  name: "ammo",
                  type: "int8",
                },
                {
                  internalType: "int8",
                  name: "health",
                  type: "int8",
                },
                {
                  internalType: "int8",
                  name: "shield",
                  type: "int8",
                },
              ],
              internalType: "struct MetaDuelsGame.PlayerState",
              name: "duelerState",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "int8",
                  name: "ammo",
                  type: "int8",
                },
                {
                  internalType: "int8",
                  name: "health",
                  type: "int8",
                },
                {
                  internalType: "int8",
                  name: "shield",
                  type: "int8",
                },
              ],
              internalType: "struct MetaDuelsGame.PlayerState",
              name: "dueleeState",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "uint8",
                  name: "moveType",
                  type: "uint8",
                },
                {
                  internalType: "bytes",
                  name: "signature",
                  type: "bytes",
                },
                {
                  internalType: "string",
                  name: "nonce",
                  type: "string",
                },
              ],
              internalType: "struct MetaDuelsGame.Move",
              name: "currDuelerMove",
              type: "tuple",
            },
            {
              components: [
                {
                  internalType: "uint8",
                  name: "moveType",
                  type: "uint8",
                },
                {
                  internalType: "bytes",
                  name: "signature",
                  type: "bytes",
                },
                {
                  internalType: "string",
                  name: "nonce",
                  type: "string",
                },
              ],
              internalType: "struct MetaDuelsGame.Move",
              name: "currDueleeMove",
              type: "tuple",
            },
          ],
          internalType: "struct MetaDuelsGame.Game",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "dueler",
          type: "address",
        },
        {
          internalType: "address",
          name: "duelee",
          type: "address",
        },
      ],
      name: "letItBegin",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "uint8",
              name: "moveType",
              type: "uint8",
            },
            {
              internalType: "bytes",
              name: "signature",
              type: "bytes",
            },
            {
              internalType: "string",
              name: "nonce",
              type: "string",
            },
          ],
          internalType: "struct MetaDuelsGame.Move",
          name: "revealedMove",
          type: "tuple",
        },
      ],
      name: "revealMove",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "signature",
          type: "bytes",
        },
      ],
      name: "submitMoveSignature",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

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
    await game.revealMove(this.gameId, move);
  }

  async _getMoveSignature(moveType, nonce) {
    const encoder = new ethers.utils.AbiCoder();

    const bytes = encoder.encode(
      ["uint256", "uint8", "string"],
      [gameId, moveType, nonce]
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
    const lastGameState = gameStateTransitions[gameStateTransitions.length - 1];

    // only add state if it differs from the previous state
    if (hash(lastGameState) !== hash(currGameState)) {
      window.localStorage.setItem(
        "metaDuelsGameStateTransitions",
        JSON.stringify({
          ...gameStatesMap,
          [this.gameId]: gameStateTransitions.concat(currGameState),
        })
      );
    }
  }

  _saveCurrentMoveToLocalStorage(nonce, moveType, signature) {
    const moves =
      JSON.parse(window.localStorage.getItem("metaDuelsCurrentMoves")) || {};

    window.localStorage.setItem(
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
      moveType = Moves.Attack;
    } else if (playerOldState.shield === playerNewState.sheild + 2) {
      moveType = Moves.Block;
    } else {
      moveType = Moves.Reload;
    }

    if (moveType === MOVES.Attack) {
      isCritical = opponentNewState.health === opponentOldState.health - 2;
    }

    if (moveType === Moves.Reload) {
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
