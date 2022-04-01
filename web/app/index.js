import PixiGame from "./game";
import connectWallet from "../lib/connectWallet";

window.signer = null;
window.game = new PixiGame();

// CONNECT WALLET
document.getElementById("connectWallet").addEventListener("click", async () => {
  window.signer = await connectWallet();
  const address = await window.signer.getAddress();

  document.getElementById("connectedWallet").innerText = address;
});

// START GAME
document.getElementById("startGame").addEventListener("click", async () => {
  const dueleeAddress = document.getElementById("opponentAddress").value;
  document.getElementById("gameIdDisplay").innerText = `Creating Game...`;
  const gameId = await window.game.startGame(window.signer, dueleeAddress);

  document.getElementById(
    "gameIdDisplay"
  ).innerText = `Game Created with ID: ${gameId}`;
});

// JOIN GAME
document.getElementById("joinGame").addEventListener("click", async () => {
  const gameId = parseInt(document.getElementById("gameId").value);
  window.game.joinGame(window.signer, gameId);
});

// FOR DEBUGGING ONLY!!!!
const setUp = async () => {
  const razorWallets = ["0x5e7610698ba465973C11A607eAf43b7f1733D947"];

  window.signer = await connectWallet();

  const address = await window.signer.getAddress();

  document.getElementById("connectedWallet").innerText = address;

  const selectedCharacter = razorWallets.includes(address)
    ? "razor"
    : "right_click";

  const opponentCharacter =
    selectedCharacter === "razor" ? "right_click" : "razor";

  window.game.joinGame(window.signer, 1, selectedCharacter, opponentCharacter);
};

setUp();
