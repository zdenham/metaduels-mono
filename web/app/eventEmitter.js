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
 * Events can be received in any order, but will only be emitted
 * in ascending order by stateVersion
 *
 * This class should emit ALL events after the initial state up to
 * the current state, and it shouldn't emit duplicate events
 */

const delay = (timeMs) => new Promise((resolve) => setTimeout(resolve, timeMs));

class EventEmitter {
  constructor(initialState, onEventCallback, contractClient) {
    this.gameState = initialState;
    this.onEventCallback = onEventCallback;
    this.contractClient = contractClient;
    this.initializeListeners();

    // TODO - add polling fallback for events
    this.initializePolling();
  }

  onContractEvent(contractEventType, eventData) {
    const { nextGameState, eventType, playerStateUpdates } =
      calculateNextGameState(this.gameState, contractEventType, eventData);

    if (eventType === eventType.none) {
      return;
    }

    this.gameState = { ...nextGameState };
    this.onEventCallback(
      eventType,
      eventData,
      nextGameState,
      playerStateUpdates
    );
  }

  async queryAllEvents() {
    const submitted = await this.contractClient.queryEvents("MoveSubmitted");
    const revealed = await this.contractClient.queryEvents("MoveRevealed");
    const completed = await this.contractClient.queryEvents("RoundCompleted");

    const sortedEvents = await [...submitted, ...revealed, ...completed].sort(
      (a, b) => {
        return a.stateVersion.lte(b.stateVersion) ? -1 : 1;
      }
    );

    return sortedEvents;
  }

  async initializePolling() {
    setInterval(async () => {
      const events = this.queryAllEvents();

      for (let i = 0; i < events.length; i++) {
        if (events[i].stateVersion <= this.gameState.stateVersion) {
          continue;
        }

        this.onContractEvent(events[i].eventType, events[i]);
        await delay(1000);
      }
    }, 10000);
  }

  async initializeListeners() {
    // to the smart contract, but before it has been revealed to the duelee
    this.contractClient.addEventListener("MoveSubmitted", async (data) => {
      this.onContractEvent("MoveSubmitted", data);
    });

    // onMoveRevealed is called after a move has been revealed or confirmed
    // by submitting the password to the smart contract to reveal the move
    this.contractClient.addEventListener("MoveRevealed", async (data) => {
      this.onContractEvent("MoveRevealed", data);
    });

    // onRoundCompleted is called once the round is completed. Both Players
    // have submitted their moves and revealed them. The smart contract has
    // updated the player's health and ammo etc... accordingly. The information
    // returned in this event includes the player moves & critical hit details
    this.contractClient.addEventListener("RoundCompleted", async (data) => {
      this.onContractEvent("RoundCompleted", data);
    });

    // onWinnerDeclared is a smart contract event for when someone has won a duel
    this.contractClient.addEventListener("WinnerDeclared", async (data) => {
      this.onContractEvent("WinnerDeclared", data);
    });
  }
}

export default EventEmitter;
