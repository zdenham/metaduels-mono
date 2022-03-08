import GameClient, { connectWallet } from "../lib/gameClient";

window.contractClient = null;
window.signer = null;

document.getElementById("connectWallet").addEventListener("click", async () => {
  window.signer = await connectWallet();
  const address = await window.signer.getAddress();

  document.getElementById("connectedWallet").innerText = address;
});

document.getElementById("startGame").addEventListener("click", async () => {
  const dueleeAddress = document.getElementById("opponentAddress").value;

  window.contractClient = new GameClient(signer);

  window.contractClient.addEventListener("GameCreated", async ({ gameId }) => {
    document.getElementById(
      "gameIdDisplay"
    ).innerText = `Game Created with ID: ${gameId}`;

    joinGame(gameId);
  });

  await window.contractClient.newGame(dueleeAddress);

  document.getElementById("gameIdDisplay").innerText = `Creating Game...`;
});

document.getElementById("joinGame").addEventListener("click", async () => {
  const gameId = parseInt(document.getElementById("gameId").value);

  window.contractClient = new GameClient(window.signer);
  await joinGame(gameId);
});

async function joinGame(gameId) {
  window.contractClient.connectToGame(gameId);
  window.game.setContractClient(window.contractClient);
}
