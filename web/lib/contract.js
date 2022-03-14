const gameContract = {
  address: "0x5731e2e3d72469182D9655fD1D6412B257D03eBD",
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "dueler",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "duelee",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
      ],
      name: "GameStarted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "stateVersion",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "revealer",
          type: "address",
        },
      ],
      name: "MoveRevealed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "stateVersion",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "signer",
          type: "address",
        },
      ],
      name: "MoveSubmitted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "stateVersion",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "duelerMove",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "uint8",
          name: "dueleeMove",
          type: "uint8",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isDuelerMoveCritical",
          type: "bool",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isDueleeMoveCritical",
          type: "bool",
        },
      ],
      name: "RoundCompleted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "gameId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "stateVersion",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "address",
          name: "winner",
          type: "address",
        },
      ],
      name: "WinnerDeclared",
      type: "event",
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
      stateMutability: "pure",
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
      stateMutability: "pure",
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
            {
              internalType: "uint256",
              name: "stateVersion",
              type: "uint256",
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

export default gameContract;
