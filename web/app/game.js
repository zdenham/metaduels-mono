import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import "howler";
import TextStyles from "./textStyles.js";
import GameContractClient from "../lib/gameClient.js";
import { animation, setBGScale, texture } from "../lib/pixiUtils.js";
import PlayerStates from "./playerStates.js";
import PlayerControls, { M } from "./playerControls.js";
import EventEmitter, { gameEventTypes } from "./eventEmitter.js";
import CharacterInteractions from "./characterInteractions.js";
import VFX from "./vfx.js";
import ZIndexManager from "./zIndexManager.js";

class Game {
  constructor() {
    this.contractClient = null;
    this.app = new PIXI.Application({ width: 1200, height: 400 });
    this.textObj = new TextStyles(this.app.renderer);

    // Initialize the scene
    this.scene = new PIXI.Container();

    // this.scene.alpha = 0;
    this.app.stage.addChild(this.scene);

    // Containers - null until a game is created or joined
    this.playerStates = null;
    this.playerAddress = null;
    this.playerControls = null;
    this.characterInteractions = null;

    this.playerCharacterName = null;
    this.opponentCharacterName = null;

    this.eventEmmitter = null;

    this.zIndexManager = new ZIndexManager(this.app, this.scene);
  }

  loadAssets() {
    return new Promise((resolve) => {
      PIXI.Loader.shared
        .add([
          "assets/images/backgrounds/0.png",
          "assets/images/backgrounds/1.png",
          "assets/images/backgrounds/2.png",
          "assets/images/backgrounds/3.png",

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

          // razor
          "assets/images/characters/razor/0.png",
          "assets/images/characters/razor/1.png",
          "assets/images/characters/razor/2.png",
          "assets/images/characters/razor/3.png",

          // right_click
          "assets/images/characters/right_click/0.png",
          "assets/images/characters/right_click/1.png",
          "assets/images/characters/right_click/2.png",
          "assets/images/characters/right_click/3.png",

          // VFX
          "assets/vfx/actionlines.json",
          "assets/vfx/laserBackground.mp4",
          "assets/vfx/recharge.json",
          "assets/vfx/fusion.json",

          // Round End Text
          "assets/images/text/attackText.png",
          "assets/images/text/blockText.png",
          "assets/images/text/criticalHitText.png",
          "assets/images/text/criticalReloadText.png",
          "assets/images/text/reloadText.png",
        ])
        .load(() => {
          resolve();
        });
    });
  }

  // create a game on the blockchain!
  async startGame(
    signer,
    dueleeAddress,
    playerCharacterName,
    opponentCharacterName
  ) {
    this.playerCharacterName = playerCharacterName;
    this.opponentCharacterName = opponentCharacterName;
    this.contractClient = new GameContractClient(signer);
    this.playerAddress = await this.contractClient.signerAddress();
    const gameId = await this.contractClient.newGame(dueleeAddress);

    await this.initGameScene();

    return gameId;
  }

  // resume an existing game on the blockchain
  async joinGame(signer, gameId, playerCharacterName, opponentCharacterName) {
    this.playerCharacterName = playerCharacterName;
    this.opponentCharacterName = opponentCharacterName;

    this.contractClient = new GameContractClient(signer);
    this.playerAddress = await this.contractClient.signerAddress();
    this.contractClient.connectToGame(gameId);

    await this.initGameScene();
    return gameId;
  }

  // Scene / game SetUp!!
  async initGameScene() {
    await this.loadAssets();

    await document.querySelector(".app").appendChild(this.app.renderer.view);

    const initialGameState = await this.contractClient.getGameState();

    this.initBackground();

    const onEventCallback = (
      eventType,
      eventData,
      nextGameState,
      playerStateUpdates
    ) =>
      this.handleGameEvent(
        eventType,
        eventData,
        nextGameState,
        playerStateUpdates
      );

    // initialize the eventEmitter!
    this.eventEmmitter = new EventEmitter(
      initialGameState,
      onEventCallback,
      this.contractClient
    );

    // initialize player states
    this.playerStates = new PlayerStates(
      initialGameState,
      this.playerAddress,
      this.textObj
    );

    // initialize player controls
    // TODO - player controls can be passed the contract client rather than cbs
    const onMoveConfirm = (move) => this.contractClient.signAndSendMove(move);
    const onMoveReveal = (move) => this.contractClient.revealMove(move);
    this.playerControls = new PlayerControls(
      initialGameState,
      this.playerAddress,
      onMoveConfirm,
      onMoveReveal
    );

    this.vfx = new VFX(this.scene, this.background);

    // initialize character interactions
    this.characterInteractions = new CharacterInteractions(
      initialGameState,
      this.playerAddress,
      this.vfx,
      this.playerCharacterName,
      this.opponentCharacterName,
      this.playerControls,
      this.playerStates
    );

    // add views to the scene
    this.scene.addChild(this.characterInteractions.container);
    this.scene.addChild(this.vfx.container);

    this.scene.addChild(this.playerStates.container);
    this.scene.addChild(this.playerControls.container);
  }

  initBackground() {
    const textureArray = [];
    for (let i = 0; i < 4; i++) {
      textureArray.push(
        PIXI.Texture.from(`assets/images/backgrounds/${i}.png`)
      );
    }

    this.background = new PIXI.AnimatedSprite(textureArray);

    this.background.x = 600;
    this.background.y = 200;
    this.background.anchor.set(0.5, 0.5);
    this.background.zIndex = 0;

    this.background.animationSpeed = 0.1;
    this.background.play();

    setBGScale(this.background, 1200, 400);

    this.scene.addChild(this.background);
  }

  handleGameEvent(eventType, eventData, nextGameState, playerStateUpdates) {
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

        this.playerStates.update(nextGameState, playerStateUpdates);
        this.playerControls.onRoundCompleted(nextGameState);
        this.characterInteractions.onRoundCompleted(
          duelerMove,
          dueleeMove,
          isDuelerMoveCritical,
          isDueleeMoveCritical,
          nextGameState
        );
        break;
      default:
    }
  }
}

export default Game;
