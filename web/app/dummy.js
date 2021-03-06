import GameClient, { MOVES, moveToString } from "../lib/gameClient";
import connectWallet from "../lib/connectWallet";

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

  gameClient.addEventListener("GameCreated", async ({ gameId }) => {
    document.getElementById(
      "gameIdDisplay"
    ).innerText = `Game Created with ID: ${gameId}`;

    joinGame(gameId);
  });

  document.getElementById("gameIdDisplay").innerText = `Creating Game...`;

  await gameClient.newGame(dueleeAddress);
});

document.getElementById("joinGame").addEventListener("click", async () => {
  const gameId = parseInt(document.getElementById("gameId").value);

  gameClient = new GameClient(signer);
  await joinGame(gameId);
});

async function joinGame(gameId) {
  gameClient.connectToGame(gameId);

  const role = await renderGameState();

  setUpGameEventListeners(role);
}

function setUpGameEventListeners(role) {
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

  // re-render game state whenever something important happens
  gameClient.addEventListener("MoveSubmitted", async () => {
    console.log("MOVE SUBMITTED YO!");
    await renderGameState();
  });

  gameClient.addEventListener("MoveRevealed", async () => {
    console.log("MOVE REVEALED YO!");
    await renderGameState();
  });

  gameClient.addEventListener("RoundCompleted", async () => {
    console.log("ROUND COMPLETED YO!");
    await renderGameState();
  });

  gameClient.addEventListener("WinnerDeclared", async () => {
    console.log("WINNER DECLARED YO!");
    await renderGameState();
  });
}

function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function getMoveStateText(move) {
  if (move.moveHash === "0x") {
    return `SUBMITTED MOVE: ??? , REVEALED MOVE: ???`;
  } else if (move.moveType === MOVES.None) {
    return `SUBMITTED MOVE: ??? , REVEALED MOVE: ???`;
  }

  return `SUBMITTED MOVE: ??? , REVEALED MOVE: ???`;
}

async function renderGameState() {
  const myAddress = await signer.getAddress();
  const state = await gameClient.getGameState(gameId);

  const role = myAddress === state.duelerAddress ? `dueler` : `duelee`;

  // unhide the game
  document.getElementById("gameContainer").style.display = "flex";

  // render the header of the current player
  document.getElementById(
    `${role}Header`
  ).innerText = `${role.toUpperCase()} ????`;

  // render the moves buttons
  document.getElementById(`${role}Moves`).style.display = "block";

  // render the moves state
  const duelerMoveStateText = getMoveStateText(state.currDuelerMove);
  const dueleeMoveStateText = getMoveStateText(state.currDueleeMove);
  document.getElementById("duelerMoveState").innerText = duelerMoveStateText;
  document.getElementById("dueleeMoveState").innerText = dueleeMoveStateText;

  // render the health
  document.getElementById("duelerHealth").innerText =
    "Health: " + new Array(state.duelerState.health).fill("????").join(" ");

  document.getElementById("dueleeHealth").innerText =
    "Health: " + new Array(state.dueleeState.health).fill("????").join(" ");

  // render the ammo
  document.getElementById("duelerAmmo").innerText =
    "Ammo: " + new Array(state.duelerState.ammo).fill("????").join(" ");
  document.getElementById("dueleeAmmo").innerText =
    "Ammo: " + new Array(state.dueleeState.ammo).fill("????").join(" ");

  // render the shield
  document.getElementById("duelerShield").innerText =
    "Shield: " +
    new Array(Math.floor(state.duelerState.shield / 2)).fill("????").join(" ");
  document.getElementById("dueleeShield").innerText =
    "Shield: " +
    new Array(Math.floor(state.dueleeState.shield / 2)).fill("????").join(" ");

  // render winner / loser
  document.getElementById("winner").innerText =
    state.winner !== "0x0000000000000000000000000000000000000000"
      ? state.winner === state.duelerAddress
        ? "???? WINNER - DUELER! ????"
        : "???? WINNER - DUELEE! ????"
      : "";

  const moves = await gameClient.queryEvents("RoundCompleted");

  const moveContainer = document.getElementById("moveContainer");
  removeAllChildNodes(moveContainer);

  // render moves - TODO
  for (let i = 0; i < moves.length; i++) {
    const {
      duelerMove,
      dueleeMove,
      isDuelerMoveCritical,
      isDueleeMoveCritical,
    } = moves[i];
    const moveDiv = document.createElement("div");

    moveDiv.innerText = `ROUND ${i + 1}: DUELER MOVE: ${moveToString(
      duelerMove
    )} ${isDuelerMoveCritical ? "CRITICAL!" : ""} | DUELEE MOVE: ${moveToString(
      dueleeMove
    )} ${isDueleeMoveCritical ? "CRITICAL!" : ""}`;

    moveContainer.insertBefore(moveDiv, moveContainer.firstChild);
  }

  return role;
}
