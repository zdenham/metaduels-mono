import * as PIXI from "pixi.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";
import GameContractClient from "../lib/gameClient.js";
import {
  setBGScale,
  createSpriteAtPosition,
  texture,
} from "../lib/pixiUtils.js";
import PlayerStates from "./playerStates.js";
import PlayerControls from "./playerControls.js";

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
    this.playersStates = null;
    this.playerControls = null;
    this.characters = null;

    PIXI.loader
      .add([
        "assets/images/backgrounds/mddojobg.png",
        "assets/images/buttons/healthIcon.png",
        "assets/images/buttons/healthIconEmpty.png",
        "assets/images/buttons/shieldIcon.png",
        "assets/images/buttons/shieldIconHalf.png",
        "assets/images/buttons/shieldIconEmpty.png",
        "assets/images/buttons/attackIcon.png",
        "assets/images/buttons/attackIconEmpty.png",
        "assets/images/buttons/attackIconHover.png",
        "assets/images/buttons/attackIconSelected.png",
        "assets/images/buttons/reloadIcon.png",
        "assets/images/buttons/reloadIconHover.png",
        "assets/images/buttons/reloadIconSelect.png",
        "assets/images/buttons/confirmIcon.png",
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
    const gameState = await this.getGameState();
    const userAddress = await this.contractClient.signerAddress();

    this.initBackground();
    this.initContractListeners();
    this.initGameLoop();

    this.playersStates = new PlayerStates(gameState, this.textObj);
    this.playerControls = new PlayerControls(
      gameState,
      userAddress,
      () => {},
      () => {}
    );

    this.scene.addChild(this.playersStates.container);
    this.scene.addChild(this.playerControls.container);
  }

  initBackground() {
    this.backgroundSprite = new PIXI.Sprite.from(
      texture("backgrounds/mddojobg")
    );

    this.background = setBGScale(this.backgroundSprite);
    this.scene.addChild(this.backgroundSprite);
  }

  // TODO
  async initPlayerControls() {}

  initContractListeners() {
    this.contractClient.addEventListener("MoveSubmitted", async (data) => {
      const gameState = await this.getGameState();
      this.onMoveSubmitted(data, gameState);
    });

    this.contractClient.addEventListener("MoveRevealed", async (data) => {
      const gameState = await this.getGameState();
      this.onMoveRevealed(data, gameState);
    });

    this.contractClient.addEventListener("RoundCompleted", async (data) => {
      const gameState = await this.getGameState();
      this.onRoundCompleted(data, gameState);
    });

    this.contractClient.addEventListener("WinnerDeclared", async (data) => {
      const gameState = await this.getGameState();
      this.onWinnerDeclared(data, gameState);
    });
  }

  initGameLoop() {}

  // TODO - implement
  // onMoveSubmitted is called after a player has submitted a move
  // to the smart contract, but before it has been revealed to the duelee
  onMoveSubmitted(eventData, gameState) {}

  // TODO - implement
  // onMoveRevealed is called after a move has been revealed or confirmed
  // by submitting the password to the smart contract to reveal the move
  onMoveRevealed(eventData, gameState) {}

  // TODO - implement
  // onRoundCompleted is called once the round is completed. Both Players
  // have submitted their moves and revealed them. The smart contract has
  // updated the player's health and ammo etc... accordingly. The information
  // returned in this event includes the player moves & critical hit details
  onRoundCompleted(eventData, gameState) {}

  // TODO - implement
  // onWinnerDeclared is a smart contract event for when someone has won a duel
  onWinnerDeclared(eventData, gameState) {}

  // getGameState fetches the current game state from the smart contract
  async getGameState() {
    return await this.contractClient.getGameState();
  }
}

export default Game;
