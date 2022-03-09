import * as PIXI from "pixi.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";
import GameContractClient from "../lib/gameClient.js";
import { setBGScale, texture } from "../lib/pixiUtils.js";

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
    this.playersStateContainer = null;
    this.duelerControlsContainer = null;
    this.dueleeControlsContainer = null;
    this.charactersContainer = null;

    PIXI.loader
      .add([
        "assets/images/backgrounds/mddojobg.png",
        "assets/images/buttons/healthIcon.png",
        "assets/images/buttons/healthIconEmpty.png",
        "assets/images/buttons/shieldIcon.png",
        "assets/images/buttons/shieldIconHalf.png",
        "assets/images/buttons/shieldIconEmpty.png",
        "assets/images/buttons/attackIcon.png",
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

    this.initBackground();

    await this.initPlayerStates();
    await this.initPlayerControls();

    this.initContractListeners();

    this.initGameLoop();
  }

  initBackground() {
    this.backgroundSprite = new PIXI.Sprite.from(
      texture("backgrounds/mddojobg")
    );

    this.background = setBGScale(this.backgroundSprite);
    this.scene.addChild(this.backgroundSprite);
  }

  createSpriteAtPosition(spritePath, x, y) {
    const sprite = new PIXI.Sprite.from(texture(spritePath));
    sprite.position.x = x;
    sprite.position.y = y;

    return sprite;
  }

  // TODO
  async initPlayerStates() {
    const gameState = await this.contractClient.getGameState();
    this.playerStateContainer = new PIXI.Container();
    this.playerStateContainer.position.x = 0;
    this.playerStateContainer.position.y = 0;
    this.playerStateContainer.width = 1200;
    this.playerStateContainer.height = 400;

    this.renderPlayersAddresses(gameState);
    this.renderPlayersHealth(gameState);
    this.renderPlayersShield(gameState);
    this.renderPlayersAmmo(gameState);

    this.scene.addChild(this.playerStateContainer);
  }

  renderPlayersAddresses(gameState) {
    const duelerTruncated = `${gameState.duelerAddress.substring(
      0,
      4
    )}...${gameState.duelerAddress.substring(38, 42)}`;

    const dueleeTruncated = `${gameState.dueleeAddress.substring(
      0,
      4
    )}...${gameState.dueleeAddress.substring(38, 42)}`;

    const duelerAddressText = this.textObj.customText(duelerTruncated, 60, 20);

    const dueleeAddressText = this.textObj.customText(
      dueleeTruncated,
      1060,
      20
    );

    this.playerStateContainer.addChild(duelerAddressText);
    this.playerStateContainer.addChild(dueleeAddressText);
  }

  renderPlayersHealth(gameState) {
    this.renderPlayersShield(gameState);
    const duelerHealthPositions = [
      { x: 190, y: 50 },
      { x: 240, y: 50 },
    ];

    const dueleeHealthPositions = [
      { x: 960, y: 50 },
      { x: 900, y: 50 },
    ];

    for (let i = 0; i < 2; i++) {
      const duelerSpritePath =
        i < gameState.duelerState.health
          ? "buttons/healthIcon"
          : "buttons/healthIconEmpty";
      const dueleeSpritePath =
        i < gameState.dueleeState.health
          ? "buttons/healthIcon"
          : "buttons/healthIconEmpty";

      const duelerHealth = this.createSpriteAtPosition(
        duelerSpritePath,
        duelerHealthPositions[i].x,
        duelerHealthPositions[i].y
      );

      const dueleeHealth = this.createSpriteAtPosition(
        dueleeSpritePath,
        dueleeHealthPositions[i].x,
        dueleeHealthPositions[i].y
      );

      this.playerStateContainer.addChild(duelerHealth);
      this.playerStateContainer.addChild(dueleeHealth);
    }
  }

  renderPlayersAmmo(gameState) {}

  shieldIconPath(numShield) {
    switch (numShield) {
      case 2:
        return "buttons/shieldIcon";
      case 1:
        return "buttons/shieldIconHalf";
      default:
        return "buttons/shieldIconEmpty";
    }
  }

  renderPlayersShield(gameState) {
    const duelerShield = this.shieldIconPath(gameState.duelerState.shield);
    const dueleeShield = this.shieldIconPath(gameState.dueleeState.shield);

    const duelerSprite = this.createSpriteAtPosition(duelerShield, 300, 50);
    const dueleeSprite = this.createSpriteAtPosition(dueleeShield, 840, 50);

    this.playerStateContainer.addChild(duelerSprite);
    this.playerStateContainer.addChild(dueleeSprite);
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
