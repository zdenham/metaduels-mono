import * as PIXI from "pixi.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";
import GameContractClient from "../lib/gameClient.js";
import { setBGScale, texture } from "../lib/pixiUtils.js";
import PlayerStates from "./playerStates.js";
import PlayerControls, { M } from "./playerControls.js";
import calculateEventFromStateTransition, {
  gameEventTypes,
} from "../lib/calculateGameEventType.js";

class Game {
  constructor() {
    this.contractClient = null;
    this.app = new PIXI.Application(1200, 400);
    this.textObj = new TextStyles(this.app.renderer);
    this.utils = new SpriteUtilities(PIXI);

    // Initialize the scene
    this.scene = new PIXI.Container();

    // this.scene.alpha = 0;
    this.app.stage.addChild(this.scene);

    // Containers - null until a game is created or joined
    this.playerStates = null;
    this.playerControls = null;
    this.characters = null;

    this.gameSTate = null;

    PIXI.loader
      .add([
        "assets/images/backgrounds/mddojobg.png",

        "assets/images/buttons/healthIcon.png",
        "assets/images/buttons/healthIconEmpty.png",

        "assets/images/buttons/shieldIcon.png",
        "assets/images/buttons/shieldIconHalf.png",
        "assets/images/buttons/shieldIconEmpty.png",
        "assets/images/buttons/shieldIconHover.png",
        "assets/images/buttons/shieldIconSelect.png",

        "assets/images/buttons/attackIcon.png",
        "assets/images/buttons/attackIconEmpty.png",
        "assets/images/buttons/attackIconHover.png",
        "assets/images/buttons/attackIconSelect.png",

        "assets/images/buttons/reloadIcon.png",
        "assets/images/buttons/reloadIconHover.png",
        "assets/images/buttons/reloadIconSelect.png",

        "assets/images/buttons/confirmIcon.png",
        "assets/images/buttons/confirmIconHover.png",

        "assets/images/buttons/revealIcon.png",
        "assets/images/buttons/revealIconHover.png",

        "assets/images/placeholder/duelerWagerImage.png",
        "assets/images/placeholder/dueleeWagerImage.png",
      ])
      .load(() => {
        console.log("COMPLETED LOADING THE GAME ASSETS!");
      });
  }

  // create a game on the blockchain!
  async startGame(signer, dueleeAddress) {
    this.contractClient = new GameContractClient(signer);
    const gameId = await this.contractClient.newGame(dueleeAddress);

    await this.initGameScene();

    return gameId;
  }

  // resume an existing game on the blockchain
  async joinGame(signer, gameId) {
    this.contractClient = new GameContractClient(signer);
    this.contractClient.connectToGame(gameId);

    await this.initGameScene();

    return gameId;
  }

  // Scene / game SetUp!!
  async initGameScene() {
    document.querySelector(".app").appendChild(this.app.renderer.view);
    this.gameState = await this.getGameState();
    const userAddress = await this.contractClient.signerAddress();

    this.initBackground();
    // this.initContractListeners();
    this.initGameStatePolling();
    this.initGameLoop();

    this.playerStates = new PlayerStates(this.gameState, this.textObj);

    const onMoveConfirm = (move) => this.contractClient.signAndSendMove(move);
    const onMoveReveal = (move) => this.contractClient.revealMove(move);

    this.playerControls = new PlayerControls(
      this.gameState,
      userAddress,
      onMoveConfirm,
      onMoveReveal
    );

    this.scene.addChild(this.playerStates.container);
    this.scene.addChild(this.playerControls.container);
  }

  initBackground() {
    this.backgroundSprite = new PIXI.Sprite.from(
      texture("backgrounds/mddojobg")
    );

    this.background = setBGScale(this.backgroundSprite);
    this.scene.addChild(this.backgroundSprite);
  }

  /**
   * Keeping this commented in favor of polling game state for now
   * We may want to add contract event listeners back in the future
   * if polling proves to be unscalable
   **/

  // initContractListeners() {
  //   // onMoveSubmitted is called after a player has submitted a move
  //   // to the smart contract, but before it has been revealed to the duelee
  //   this.contractClient.addEventListener("MoveSubmitted", async (data) => {
  //     this.onContractEvent("MoveSubmitted", data);
  //   });

  //   // onMoveRevealed is called after a move has been revealed or confirmed
  //   // by submitting the password to the smart contract to reveal the move
  //   this.contractClient.addEventListener("MoveRevealed", async (data) => {
  //     this.onContractEvent("MoveRevealed", data);
  //   });

  //   // onRoundCompleted is called once the round is completed. Both Players
  //   // have submitted their moves and revealed them. The smart contract has
  //   // updated the player's health and ammo etc... accordingly. The information
  //   // returned in this event includes the player moves & critical hit details
  //   this.contractClient.addEventListener("RoundCompleted", async (data) => {
  //     this.onContractEvent("RoundCompleted", data);
  //   });

  //   // onWinnerDeclared is a smart contract event for when someone has won a duel
  //   this.contractClient.addEventListener("WinnerDeclared", async (data) => {
  //     this.onContractEvent("WinnerDeclared", data);
  //   });
  // }

  // async onContractEvent(contractEventType, data) {
  //   await fetchNextGameStateForEvents();
  // }

  initGameStatePolling() {
    this.gameStatePollInterval = setInterval(async () => {
      await this.fetchNextGameStateForEvents();
    }, 3000);
  }

  async fetchNextGameStateForEvents(contractEventType, data) {
    const nextGameState = await this.getGameState();

    /**
     * Use getGameState as a source of truth to avoid
     * race conditions with contract events (may not be necessary)
     */
    const eventType = calculateEventFromStateTransition(
      this.gameState,
      nextGameState
    );

    this.gameState = nextGameState;

    // we are passing both the event issued from the contract
    // as well as the event calculated from the state transition
    // we will have to see if they are inline / how reliable
    // the contract based events are
    this.handleGameEvent(eventType, contractEventType, data);
  }

  handleGameEvent(eventType, contractEventType, data) {
    console.log(
      "EVENTS OCCURED: ",
      eventType,
      this.gameState.currDuelerMove.signature,
      this.gameState.currDueleeMove.signature
    );
    switch (eventType) {
      case gameEventTypes.dueleeMoveRevealed:
      case gameEventTypes.duelerMoveRevealed:
        break;
      case gameEventTypes.duelerMoveSubmitted:
      case gameEventTypes.dueleeMoveSubmitted:
        this.playerControls.onMoveSubmitted(this.gameState);
        break;
      case gameEventTypes.roundCompleted:
        this.playerStates.update(this.gameState);
        this.playerControls.onRoundEnd(this.gameState);
        break;
      default:
    }
  }

  initGameLoop() {}

  // getGameState fetches the current game state from the smart contract
  async getGameState() {
    return await this.contractClient.getGameState();
  }
}

export default Game;
