import * as PIXI from "pixi.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import GameContractClient from "../lib/gameClient.js";
import { setBGScale, texture } from "../lib/pixiUtils.js";
import PlayerStates from "./playerStates.js";
import PlayerControls from "./playerControls.js";
import EventEmitter, { gameEventTypes } from "./eventEmitter.js";
import CharacterInteractions from "./characterInteractions.js";

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
    this.characterInteractions = null;

    this.eventEmmitter = null;

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

        "assets/images/characters/scorpion.jpg",
        "assets/images/characters/scorpion.json",
      ])
      .load();
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

    const initialGameState = await this.contractClient.getGameState();

    this.initBackground();

    const onEventCallback = (eventType, eventData, nextGameState) =>
      this.handleGameEvent(eventType, eventData, nextGameState);

    // initialize the eventEmitter!
    this.eventEmmitter = new EventEmitter(
      initialGameState,
      onEventCallback,
      this.contractClient
    );

    // initialize player states
    this.playerStates = new PlayerStates(initialGameState, this.textObj);

    // initialize player controls
    // TODO - player controls can be passed the contract client rather than cbs
    const onMoveConfirm = (move) => this.contractClient.signAndSendMove(move);
    const onMoveReveal = (move) => this.contractClient.revealMove(move);
    const userAddress = await this.contractClient.signerAddress();
    this.playerControls = new PlayerControls(
      initialGameState,
      userAddress,
      onMoveConfirm,
      onMoveReveal
    );

    // initialize character interactions
    this.characterInteractions = new CharacterInteractions();

    // add views to the scene
    this.scene.addChild(this.playerStates.container);
    this.scene.addChild(this.playerControls.container);
    this.scene.addChild(this.characterInteractions.container);

    this.initGameLoop();
  }

  initBackground() {
    this.backgroundSprite = new PIXI.Sprite.from(
      texture("backgrounds/mddojobg")
    );

    this.background = setBGScale(this.backgroundSprite);
    this.scene.addChild(this.backgroundSprite);
  }

  handleGameEvent(eventType, eventData, nextGameState) {
    switch (eventType) {
      case gameEventTypes.dueleeMoveRevealed:
      case gameEventTypes.duelerMoveRevealed:
        break;
      case gameEventTypes.duelerMoveSubmitted:
      case gameEventTypes.dueleeMoveSubmitted:
        this.playerControls.onMoveSubmitted(nextGameState);
        break;
      case gameEventTypes.roundCompleted:
        const {
          duelerMove,
          dueleeMove,
          isDuelerMoveCritical,
          isDueleeMoveCritical,
        } = eventData;

        this.playerStates.update(nextGameState);
        this.playerControls.onRoundCompleted(nextGameState);
        this.characterInteractions.onRoundCompleted(
          duelerMove,
          dueleeMove,
          isDuelerMoveCritical,
          isDueleeMoveCritical
        );
        break;
      default:
    }
  }

  initGameLoop() {}
}

export default Game;
