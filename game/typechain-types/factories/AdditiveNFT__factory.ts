/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AdditiveNFT, AdditiveNFTInterface } from "../AdditiveNFT";

const _abi = [
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
        internalType: "string",
        name: "ipfsCid",
        type: "string",
      },
    ],
    name: "mintNFT",
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
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040518060400160405280600b81526020017f41646469746976654e46540000000000000000000000000000000000000000008152506040518060400160405280600681526020017f5a4f444941430000000000000000000000000000000000000000000000000000815250816000908051906020019062000096929190620000b8565b508060019080519060200190620000af929190620000b8565b505050620001cd565b828054620000c69062000168565b90600052602060002090601f016020900481019282620000ea576000855562000136565b82601f106200010557805160ff191683800117855562000136565b8280016001018555821562000136579182015b828111156200013557825182559160200191906001019062000118565b5b50905062000145919062000149565b5090565b5b80821115620001645760008160009055506001016200014a565b5090565b600060028204905060018216806200018157607f821691505b602082108114156200019857620001976200019e565b5b50919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b612aa580620001dd6000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c806370a082311161008c578063b88d4fde11610066578063b88d4fde1461025b578063c87b56dd14610277578063e985e9c5146102a7578063fb37e883146102d7576100ea565b806370a08231146101f157806395d89b4114610221578063a22cb4651461023f576100ea565b8063095ea7b3116100c8578063095ea7b31461016d57806323b872dd1461018957806342842e0e146101a55780636352211e146101c1576100ea565b806301ffc9a7146100ef57806306fdde031461011f578063081812fc1461013d575b600080fd5b61010960048036038101906101049190611bf8565b610307565b60405161011691906123fd565b60405180910390f35b6101276103e9565b6040516101349190612418565b60405180910390f35b61015760048036038101906101529190611c8b565b61047b565b6040516101649190612396565b60405180910390f35b61018760048036038101906101829190611bbc565b610500565b005b6101a3600480360381019061019e9190611ab6565b610618565b005b6101bf60048036038101906101ba9190611ab6565b610678565b005b6101db60048036038101906101d69190611c8b565b610698565b6040516101e89190612396565b60405180910390f35b61020b60048036038101906102069190611a51565b61074a565b604051610218919061263a565b60405180910390f35b610229610802565b6040516102369190612418565b60405180910390f35b61025960048036038101906102549190611b80565b610894565b005b61027560048036038101906102709190611b05565b6108aa565b005b610291600480360381019061028c9190611c8b565b61090c565b60405161029e9190612418565b60405180910390f35b6102c160048036038101906102bc9190611a7a565b610a5e565b6040516102ce91906123fd565b60405180910390f35b6102f160048036038101906102ec9190611c4a565b610af2565b6040516102fe919061263a565b60405180910390f35b60007f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614806103d257507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b806103e257506103e182610b35565b5b9050919050565b6060600080546103f89061289a565b80601f01602080910402602001604051908101604052809291908181526020018280546104249061289a565b80156104715780601f1061044657610100808354040283529160200191610471565b820191906000526020600020905b81548152906001019060200180831161045457829003601f168201915b5050505050905090565b600061048682610b9f565b6104c5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104bc9061259a565b60405180910390fd5b6004600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b600061050b82610698565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16141561057c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610573906125fa565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff1661059b610c0b565b73ffffffffffffffffffffffffffffffffffffffff1614806105ca57506105c9816105c4610c0b565b610a5e565b5b610609576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610600906124da565b60405180910390fd5b6106138383610c13565b505050565b610629610623610c0b565b82610ccc565b610668576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161065f9061261a565b60405180910390fd5b610673838383610daa565b505050565b610693838383604051806020016040528060008152506108aa565b505050565b6000806002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610741576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107389061251a565b60405180910390fd5b80915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1614156107bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107b2906124fa565b60405180910390fd5b600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6060600180546108119061289a565b80601f016020809104026020016040519081016040528092919081815260200182805461083d9061289a565b801561088a5780601f1061085f5761010080835404028352916020019161088a565b820191906000526020600020905b81548152906001019060200180831161086d57829003601f168201915b5050505050905090565b6108a661089f610c0b565b8383611006565b5050565b6108bb6108b5610c0b565b83610ccc565b6108fa576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108f19061261a565b60405180910390fd5b61090684848484611173565b50505050565b606061091782610b9f565b610956576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161094d9061257a565b60405180910390fd5b60006006600084815260200190815260200160002080546109769061289a565b80601f01602080910402602001604051908101604052809291908181526020018280546109a29061289a565b80156109ef5780601f106109c4576101008083540402835291602001916109ef565b820191906000526020600020905b8154815290600101906020018083116109d257829003601f168201915b505050505090506000610a006111cf565b9050600081511415610a16578192505050610a59565b600082511115610a4b578082604051602001610a33929190612372565b60405160208183030381529060405292505050610a59565b610a548461120c565b925050505b919050565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b600080610afd610c0b565b9050610b0960086112b3565b6000610b1560086112c9565b9050610b2182826112d7565b610b2b81856114a5565b8092505050919050565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b60008073ffffffffffffffffffffffffffffffffffffffff166002600084815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1614159050919050565b600033905090565b816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16610c8683610698565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000610cd782610b9f565b610d16576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d0d906124ba565b60405180910390fd5b6000610d2183610698565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff161480610d9057508373ffffffffffffffffffffffffffffffffffffffff16610d788461047b565b73ffffffffffffffffffffffffffffffffffffffff16145b80610da15750610da08185610a5e565b5b91505092915050565b8273ffffffffffffffffffffffffffffffffffffffff16610dca82610698565b73ffffffffffffffffffffffffffffffffffffffff1614610e20576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e17906125ba565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610e90576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e879061247a565b60405180910390fd5b610e9b838383611519565b610ea6600082610c13565b6001600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610ef691906127b0565b925050819055506001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254610f4d9190612729565b92505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a4505050565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611075576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161106c9061249a565b60405180910390fd5b80600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c318360405161116691906123fd565b60405180910390a3505050565b61117e848484610daa565b61118a8484848461151e565b6111c9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111c09061243a565b60405180910390fd5b50505050565b60606040518060400160405280600781526020017f697066733a2f2f00000000000000000000000000000000000000000000000000815250905090565b606061121782610b9f565b611256576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161124d906125da565b60405180910390fd5b60006112606111cf565b9050600081511161128057604051806020016040528060008152506112ab565b8061128a846116b5565b60405160200161129b929190612372565b6040516020818303038152906040525b915050919050565b6001816000016000828254019250508190555050565b600081600001549050919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611347576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161133e9061255a565b60405180910390fd5b61135081610b9f565b15611390576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113879061245a565b60405180910390fd5b61139c60008383611519565b6001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282546113ec9190612729565b92505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a45050565b6114ae82610b9f565b6114ed576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114e49061253a565b60405180910390fd5b80600660008481526020019081526020016000209080519060200190611514929190611875565b505050565b505050565b600061153f8473ffffffffffffffffffffffffffffffffffffffff16611862565b156116a8578373ffffffffffffffffffffffffffffffffffffffff1663150b7a02611568610c0b565b8786866040518563ffffffff1660e01b815260040161158a94939291906123b1565b602060405180830381600087803b1580156115a457600080fd5b505af19250505080156115d557506040513d601f19601f820116820180604052508101906115d29190611c21565b60015b611658573d8060008114611605576040519150601f19603f3d011682016040523d82523d6000602084013e61160a565b606091505b50600081511415611650576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116479061243a565b60405180910390fd5b805181602001fd5b63150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149150506116ad565b600190505b949350505050565b606060008214156116fd576040518060400160405280600181526020017f3000000000000000000000000000000000000000000000000000000000000000815250905061185d565b600082905060005b6000821461172f578080611718906128cc565b915050600a82611728919061277f565b9150611705565b60008167ffffffffffffffff811115611771577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280601f01601f1916602001820160405280156117a35781602001600182028036833780820191505090505b5090505b60008514611856576001826117bc91906127b0565b9150600a856117cb9190612915565b60306117d79190612729565b60f81b818381518110611813577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600a8561184f919061277f565b94506117a7565b8093505050505b919050565b600080823b905060008111915050919050565b8280546118819061289a565b90600052602060002090601f0160209004810192826118a357600085556118ea565b82601f106118bc57805160ff19168380011785556118ea565b828001600101855582156118ea579182015b828111156118e95782518255916020019190600101906118ce565b5b5090506118f791906118fb565b5090565b5b808211156119145760008160009055506001016118fc565b5090565b600061192b61192684612686565b612655565b90508281526020810184848401111561194357600080fd5b61194e848285612858565b509392505050565b6000611969611964846126b6565b612655565b90508281526020810184848401111561198157600080fd5b61198c848285612858565b509392505050565b6000813590506119a381612a13565b92915050565b6000813590506119b881612a2a565b92915050565b6000813590506119cd81612a41565b92915050565b6000815190506119e281612a41565b92915050565b600082601f8301126119f957600080fd5b8135611a09848260208601611918565b91505092915050565b600082601f830112611a2357600080fd5b8135611a33848260208601611956565b91505092915050565b600081359050611a4b81612a58565b92915050565b600060208284031215611a6357600080fd5b6000611a7184828501611994565b91505092915050565b60008060408385031215611a8d57600080fd5b6000611a9b85828601611994565b9250506020611aac85828601611994565b9150509250929050565b600080600060608486031215611acb57600080fd5b6000611ad986828701611994565b9350506020611aea86828701611994565b9250506040611afb86828701611a3c565b9150509250925092565b60008060008060808587031215611b1b57600080fd5b6000611b2987828801611994565b9450506020611b3a87828801611994565b9350506040611b4b87828801611a3c565b925050606085013567ffffffffffffffff811115611b6857600080fd5b611b74878288016119e8565b91505092959194509250565b60008060408385031215611b9357600080fd5b6000611ba185828601611994565b9250506020611bb2858286016119a9565b9150509250929050565b60008060408385031215611bcf57600080fd5b6000611bdd85828601611994565b9250506020611bee85828601611a3c565b9150509250929050565b600060208284031215611c0a57600080fd5b6000611c18848285016119be565b91505092915050565b600060208284031215611c3357600080fd5b6000611c41848285016119d3565b91505092915050565b600060208284031215611c5c57600080fd5b600082013567ffffffffffffffff811115611c7657600080fd5b611c8284828501611a12565b91505092915050565b600060208284031215611c9d57600080fd5b6000611cab84828501611a3c565b91505092915050565b611cbd816127e4565b82525050565b611ccc816127f6565b82525050565b6000611cdd826126e6565b611ce781856126fc565b9350611cf7818560208601612867565b611d0081612a02565b840191505092915050565b6000611d16826126f1565b611d20818561270d565b9350611d30818560208601612867565b611d3981612a02565b840191505092915050565b6000611d4f826126f1565b611d59818561271e565b9350611d69818560208601612867565b80840191505092915050565b6000611d8260328361270d565b91507f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560008301527f63656976657220696d706c656d656e74657200000000000000000000000000006020830152604082019050919050565b6000611de8601c8361270d565b91507f4552433732313a20746f6b656e20616c7265616479206d696e746564000000006000830152602082019050919050565b6000611e2860248361270d565b91507f4552433732313a207472616e7366657220746f20746865207a65726f2061646460008301527f72657373000000000000000000000000000000000000000000000000000000006020830152604082019050919050565b6000611e8e60198361270d565b91507f4552433732313a20617070726f766520746f2063616c6c6572000000000000006000830152602082019050919050565b6000611ece602c8361270d565b91507f4552433732313a206f70657261746f7220717565727920666f72206e6f6e657860008301527f697374656e7420746f6b656e00000000000000000000000000000000000000006020830152604082019050919050565b6000611f3460388361270d565b91507f4552433732313a20617070726f76652063616c6c6572206973206e6f74206f7760008301527f6e6572206e6f7220617070726f76656420666f7220616c6c00000000000000006020830152604082019050919050565b6000611f9a602a8361270d565b91507f4552433732313a2062616c616e636520717565727920666f7220746865207a6560008301527f726f2061646472657373000000000000000000000000000000000000000000006020830152604082019050919050565b600061200060298361270d565b91507f4552433732313a206f776e657220717565727920666f72206e6f6e657869737460008301527f656e7420746f6b656e00000000000000000000000000000000000000000000006020830152604082019050919050565b6000612066602e8361270d565b91507f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60008301527f6578697374656e7420746f6b656e0000000000000000000000000000000000006020830152604082019050919050565b60006120cc60208361270d565b91507f4552433732313a206d696e7420746f20746865207a65726f20616464726573736000830152602082019050919050565b600061210c60318361270d565b91507f45524337323155524953746f726167653a2055524920717565727920666f722060008301527f6e6f6e6578697374656e7420746f6b656e0000000000000000000000000000006020830152604082019050919050565b6000612172602c8361270d565b91507f4552433732313a20617070726f76656420717565727920666f72206e6f6e657860008301527f697374656e7420746f6b656e00000000000000000000000000000000000000006020830152604082019050919050565b60006121d860298361270d565b91507f4552433732313a207472616e73666572206f6620746f6b656e2074686174206960008301527f73206e6f74206f776e00000000000000000000000000000000000000000000006020830152604082019050919050565b600061223e602f8361270d565b91507f4552433732314d657461646174613a2055524920717565727920666f72206e6f60008301527f6e6578697374656e7420746f6b656e00000000000000000000000000000000006020830152604082019050919050565b60006122a460218361270d565b91507f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560008301527f72000000000000000000000000000000000000000000000000000000000000006020830152604082019050919050565b600061230a60318361270d565b91507f4552433732313a207472616e736665722063616c6c6572206973206e6f74206f60008301527f776e6572206e6f7220617070726f7665640000000000000000000000000000006020830152604082019050919050565b61236c8161284e565b82525050565b600061237e8285611d44565b915061238a8284611d44565b91508190509392505050565b60006020820190506123ab6000830184611cb4565b92915050565b60006080820190506123c66000830187611cb4565b6123d36020830186611cb4565b6123e06040830185612363565b81810360608301526123f28184611cd2565b905095945050505050565b60006020820190506124126000830184611cc3565b92915050565b600060208201905081810360008301526124328184611d0b565b905092915050565b6000602082019050818103600083015261245381611d75565b9050919050565b6000602082019050818103600083015261247381611ddb565b9050919050565b6000602082019050818103600083015261249381611e1b565b9050919050565b600060208201905081810360008301526124b381611e81565b9050919050565b600060208201905081810360008301526124d381611ec1565b9050919050565b600060208201905081810360008301526124f381611f27565b9050919050565b6000602082019050818103600083015261251381611f8d565b9050919050565b6000602082019050818103600083015261253381611ff3565b9050919050565b6000602082019050818103600083015261255381612059565b9050919050565b60006020820190508181036000830152612573816120bf565b9050919050565b60006020820190508181036000830152612593816120ff565b9050919050565b600060208201905081810360008301526125b381612165565b9050919050565b600060208201905081810360008301526125d3816121cb565b9050919050565b600060208201905081810360008301526125f381612231565b9050919050565b6000602082019050818103600083015261261381612297565b9050919050565b60006020820190508181036000830152612633816122fd565b9050919050565b600060208201905061264f6000830184612363565b92915050565b6000604051905081810181811067ffffffffffffffff8211171561267c5761267b6129d3565b5b8060405250919050565b600067ffffffffffffffff8211156126a1576126a06129d3565b5b601f19601f8301169050602081019050919050565b600067ffffffffffffffff8211156126d1576126d06129d3565b5b601f19601f8301169050602081019050919050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b60006127348261284e565b915061273f8361284e565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0382111561277457612773612946565b5b828201905092915050565b600061278a8261284e565b91506127958361284e565b9250826127a5576127a4612975565b5b828204905092915050565b60006127bb8261284e565b91506127c68361284e565b9250828210156127d9576127d8612946565b5b828203905092915050565b60006127ef8261282e565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b8381101561288557808201518184015260208101905061286a565b83811115612894576000848401525b50505050565b600060028204905060018216806128b257607f821691505b602082108114156128c6576128c56129a4565b5b50919050565b60006128d78261284e565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82141561290a57612909612946565b5b600182019050919050565b60006129208261284e565b915061292b8361284e565b92508261293b5761293a612975565b5b828206905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b612a1c816127e4565b8114612a2757600080fd5b50565b612a33816127f6565b8114612a3e57600080fd5b50565b612a4a81612802565b8114612a5557600080fd5b50565b612a618161284e565b8114612a6c57600080fd5b5056fea2646970667358221220bb07e194d1a22c3625e851d837d138c1640f12a7bd497674c2ff559c96ca317564736f6c63430008000033";

type AdditiveNFTConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AdditiveNFTConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AdditiveNFT__factory extends ContractFactory {
  constructor(...args: AdditiveNFTConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
    this.contractName = "AdditiveNFT";
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<AdditiveNFT> {
    return super.deploy(overrides || {}) as Promise<AdditiveNFT>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): AdditiveNFT {
    return super.attach(address) as AdditiveNFT;
  }
  connect(signer: Signer): AdditiveNFT__factory {
    return super.connect(signer) as AdditiveNFT__factory;
  }
  static readonly contractName: "AdditiveNFT";
  public readonly contractName: "AdditiveNFT";
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AdditiveNFTInterface {
    return new utils.Interface(_abi) as AdditiveNFTInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AdditiveNFT {
    return new Contract(address, _abi, signerOrProvider) as AdditiveNFT;
  }
}
