import * as PIXI from "pixi.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";
import GameContractClient from "../lib/gameClient.js";
import { setBGScale } from "../lib/pixiUtils.js";

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

    PIXI.loader.add(["assets/images/backgrounds/mddojobg.jpg"]).load(() => {
      console.log("COMPLETED LOADING THE GAME ASSETS!");
    });

    // document.querySelector(".app").appendChild(this.app.renderer.view);
  }

  // create a game on the blockchain!
  async startGame(signer, dueleeAddress) {
    this.contractClient = new GameContractClient(signer);
    const gameId = await this.contractClient.newGame(dueleeAddress);

    this.initGameScene();

    return gameId;
  }

  // resume an existing game on the blockchain
  async joinGame(signer, gameId) {
    this.contractClient = new GameContractClient(signer);
    this.contractClient.connectToGame(gameId);

    this.initGameScene();

    return gameId;
  }

  // Scene / game SetUp!!
  initGameScene() {
    document.querySelector(".app").appendChild(this.app.renderer.view);

    this.initBackground();
    this.initControls();
    this.gameLoop();
  }

  initBackground() {
    this.backgroundSprite = new PIXI.Sprite.from(
      PIXI.loader.resources["assets/images/backgrounds/mddojobg.jpg"].texture
    );

    this.background = setBGScale(this.backgroundSprite);
    this.scene.addChild(this.backgroundSprite);
  }

  initControls() {}

  gameLoop() {}

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

  initContractEventListeners() {
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
}

export default Game;
