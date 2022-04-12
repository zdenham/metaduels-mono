const gameContract = {
  address: "0x1cAF0f174De7D4D302a1A43BebaE1af26ED1D95d",
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
                  internalType: "bytes32",
                  name: "moveHash",
                  type: "bytes32",
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
                  internalType: "bytes32",
                  name: "moveHash",
                  type: "bytes32",
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
              internalType: "bytes32",
              name: "moveHash",
              type: "bytes32",
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
          internalType: "bytes32",
          name: "moveHash",
          type: "bytes32",
        },
      ],
      name: "submitMoveHash",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

export default gameContract;
