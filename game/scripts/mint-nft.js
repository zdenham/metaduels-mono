require('dotenv').config();
const API_URL = process.env.API_URL;
const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const web3 = createAlchemyWeb3(API_URL);
const contract = require('../artifacts/contracts/ZodiacKidsTest.sol/ZodiacKidsTest.json');

console.log(JSON.stringify(contract.abi));

const contractAddress = '0xe5143bd31868ca49ea93f45e2b531d8a14d01743';

const nftContract = new web3.eth.Contract(contract.abi, contractAddress);

async function mintNFT(tokenURI) {
  const nonce = await web3.eth.getTransactionCount(
    process.env.PUBLIC_KEY,
    'latest'
  ); //get latest nonce

  //the transaction
  const tx = {
    from: process.env.PUBLIC_KEY,
    to: contractAddress,
    nonce: nonce,
    gas: 500000,
    data: nftContract.methods
      .mintNFT(process.env.PUBLIC_KEY, tokenURI)
      .encodeABI(),
  };

  const signPromise = web3.eth.accounts.signTransaction(
    tx,
    process.env.OWNER_PRIVATE_KEY
  );

  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              'The hash of your transaction is: ',
              hash,
              "\nCheck Alchemy's Mempool to view the status of your transaction!"
            );
          } else {
            console.log(
              'Something went wrong when submitting your transaction:',
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log(' Promise failed:', err);
    });
}

mintNFT(
  'https://gateway.pinata.cloud/ipfs/QmWcdrnVQnyVo53hvXNCq5aEng61FM87VLv8BDwhnQxRwi'
);
