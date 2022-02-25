const { ethers } = require("ethers");

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

const getSignedMove = async (move, signer, gameId = 1) => {
  const moveType = typeof move === "object" ? move.moveType : move;
  const nonce = typeof move === "object" ? move.nonce : nonCriticalNonce;

  const encoder = new ethers.utils.AbiCoder();

  const bytes = encoder.encode(
    ["uint256", "uint8", "string"],
    [gameId, moveType, nonce]
  );

  const hash = ethers.utils.solidityKeccak256(["bytes"], [bytes]);

  const binaryHash = ethers.utils.arrayify(hash);

  const signature = await signer.signMessage(binaryHash);

  return {
    moveType,
    nonce,
    signature,
  };
};

const signAndSendMove = async (moveType, nonce, gameId) => {
  const { signature } = await getSignedMove(moveType, nonce, gameId);
  await game.submitMoveSignature(gameId, signature);
};

const revealMove = async (move, gameId) => {
  await game.revealMove(gameId, move);
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

  async getGameState() {
    console.log("GETTING GAMESTATE FOR ID: ", this.gameId);
    return await this.game.gameStateForId(this.gameId);
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
}

export default GameClient;
