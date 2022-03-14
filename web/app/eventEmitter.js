import calculateNextGameState from "../lib/calculateNextGameState";

export const gameEventTypes = {
  duelerMoveSubmitted: "duelerMoveSubmitted",
  dueleeMoveSubmitted: "dueleeMoveSubmitted",
  duelerMoveRevealed: "duelerMoveRevealed",
  dueleeMoveRevealed: "dueleeMoveRevealed",
  roundCompleted: "roundCompleted",
  winnerDeclared: "winnerDeclared",
  none: "none",
};

/**
 * The goal of this class is to be a redundant event emitter for
 * the game contract. It should handle cases where events are missed
 * and be immune to race conditions between contract reads & events.
 *
 * This class should emit ALL events after the initial state up to
 * the current state, and it shouldn't emit duplicate events
 */

class EventEmitter {
  constructor(initialState, onEventCallback, contractClient) {
    this.gameState = initialState;
    this.onEventCallback = onEventCallback;
    this.contractClient = contractClient;
    this.seenEvents = {};
    this.initializeListeners();

    // TODO - add polling fallback for events
  }

  onContractEvent(contractEventType, eventData) {
    const { nextGameState, eventType } = calculateNextGameState(
      this.gameState,
      contractEventType,
      eventData
    );

    console.log(
      "CALCULATED THE NEXT GAME STATE, EVENT TYPE",
      nextGameState,
      eventType
    );

    if (eventType === eventType.none) {
      return;
    }

    this.gameState = nextGameState;
    this.onEventCallback(eventType, eventData, nextGameState);
  }

  async initializeListeners() {
    console.log("SETTING UP LISTENERS!!!!");

    const events = await this.contractClient.queryEvents("MoveSubmitted");
    console.log("EVENTS: ", events);

    // to the smart contract, but before it has been revealed to the duelee
    this.contractClient.addEventListener("MoveSubmitted", async (data) => {
      console.log("MOVE SUBMITTED!!!");
      this.onContractEvent("MoveSubmitted", data);
    });

    // onMoveRevealed is called after a move has been revealed or confirmed
    // by submitting the password to the smart contract to reveal the move
    this.contractClient.addEventListener("MoveRevealed", async (data) => {
      console.log("MOVE REVEALED!!!");
      this.onContractEvent("MoveRevealed", data);
    });

    // onRoundCompleted is called once the round is completed. Both Players
    // have submitted their moves and revealed them. The smart contract has
    // updated the player's health and ammo etc... accordingly. The information
    // returned in this event includes the player moves & critical hit details
    this.contractClient.addEventListener("RoundCompleted", async (data) => {
      console.log("ROUND COMPLETED!!!");
      this.onContractEvent("RoundCompleted", data);
    });

    // onWinnerDeclared is a smart contract event for when someone has won a duel
    this.contractClient.addEventListener("WinnerDeclared", async (data) => {
      console.log("WINNER DECLARED!!!");
      this.onContractEvent("WinnerDeclared", data);
    });
  }
}

export default EventEmitter;
