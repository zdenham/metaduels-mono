import GameClient, { connectWallet, MOVES } from "../lib/game";

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

  const role = await renderGameState();

  setUpMoveEventListeners(role);
});

function setUpMoveEventListeners(role) {
  document
    .getElementById(`${role}Attack`)
    .addEventListener("click", async () => {
      await gameClient.signAndSendMove(MOVES.Attack);
    });

  document
    .getElementById(`${role}Block`)
    .addEventListener("click", async () => {
      await gameClient.signAndSendMove(MOVES.Block);
    });

  document
    .getElementById(`${role}Reload`)
    .addEventListener("click", async () => {
      await gameClient.signAndSendMove(MOVES.Reload);
    });

  document
    .getElementById(`${role}Confirm`)
    .addEventListener("click", async () => {
      await gameClient.revealMove();
    });
}

async function renderGameState() {
  const myAddress = await signer.getAddress();
  const { state, moves } = await gameClient.getGameState(gameId);

  const role = myAddress === state.duelerAddress ? `dueler` : `duelee`;

  // unhide the game
  document.getElementById("gameContainer").style.display = "flex";

  // render the header of the current player
  document.getElementById(
    `${role}Header`
  ).innerText = `${role.toUpperCase()} 👋`;

  // render the moves buttons
  document.getElementById(`${role}Moves`).style.display = "block";

  // render the health
  document.getElementById("duelerHealth").innerText =
    "Health: " + new Array(state.duelerState.health).fill("💗").join(" ");

  document.getElementById("dueleeHealth").innerText =
    "Health: " + new Array(state.dueleeState.health).fill("💗").join(" ");

  // render the ammo
  document.getElementById("duelerAmmo").innerText =
    "Ammo: " + new Array(state.duelerState.ammo).fill("🗡").join(" ");
  document.getElementById("dueleeAmmo").innerText =
    "Ammo: " + new Array(state.dueleeState.ammo).fill("🗡").join(" ");

  // render the shield
  document.getElementById("duelerShield").innerText =
    "Shield: " +
    new Array(Math.floor(state.duelerState.shield / 2)).fill("🛡").join(" ");
  document.getElementById("dueleeShield").innerText =
    "Shield: " +
    new Array(Math.floor(state.dueleeState.shield / 2)).fill("🛡").join(" ");

  // render winner / loser
  document.getElementById("winner").innerText =
    state.winner !== "0x0000000000000000000000000000000000000000"
      ? state.winner === state.duelerAddress
        ? "WINNER - DUELER!"
        : "WINNER - DUELEE!"
      : "";

  // render moves - TODO

  return role;
}
