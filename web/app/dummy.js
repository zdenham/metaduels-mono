import GameClient, { connectWallet } from "../lib/game";

var signer = null;
var gameClient = null;

document.getElementById("connectWallet").addEventListener("click", async () => {
  signer = await connectWallet();
  const address = await signer.getAddress();

  document.getElementById("connectedWallet").innerText = address;
});

document.getElementById("startGame").addEventListener("click", async () => {
  const dueleeAddress = document.getElementById("opponentAddress").value;

  gameClient = new GameClient(signer);

  await gameClient.newGame(dueleeAddress);
});

document.getElementById("joinGame").addEventListener("click", async () => {
  const gameId = parseInt(document.getElementById("gameId").value);

  gameClient = new GameClient(signer);
  gameClient.connectToGame(gameId);

  const state = await gameClient.getGameState(gameId);

  console.log("THE GAME STATE!!!!", state);
});
