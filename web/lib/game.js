const criticalHitCount = (nonce1, nonce2) => {
  const encoder = new ethers.utils.AbiCoder();
  const bytes = encoder.encode(["string", "string"], [nonce1, nonce2]);
  const hash = ethers.utils.solidityKeccak256(["bytes"], [bytes]);
  const binaryHash = ethers.utils.arrayify(hash);
  const isCritical = binaryHash[31] < 25;

  return isCritical ? 2 : 1;
};

const getGameState = (moves, duelerAddress, dueleeAddress) => {
  const duelerState = {
    ammo: 1,
    health: 2,
    shield: 1,
  };

  const dueleeState = {
    ammo: 1,
    health: 2,
    shield: 1,
  };

  let previousSig = "0x";
  let round = 0;

  for (let i = 0; i < moves.length; i++) {
    const { signature, nonce, moveType } = move;
    const currSigner = i % 2 == 0 ? duelerAddress : dueleeAddress;
  }
};
