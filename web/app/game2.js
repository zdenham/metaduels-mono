import * as PIXI from "pixi.js";
import "howler";
import SpriteUtilities from "./spriteUtilities.js";
import TextStyles from "./textStyles.js";
import Keyboard from "./keyboard.js";
import characterData from "./characters.json";
import "./connect";

class Game {
  constructor() {
    this.contractClient = null;
    this.app = new PIXI.Application(1200, 400);
    this.textObj = new TextStyles(this.app.renderer);
    this.utils = new SpriteUtilities(PIXI);

    initScene();
  }

  initScene() {}

  setContractClient(client) {
    this.contractClient = client;
    this.initContractEventListeners();
  }

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
    // re-render game state whenever something important happens
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
