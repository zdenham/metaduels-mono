import * as PIXI from "pixi.js";
import { createSpriteAtPosition } from "../lib/pixiUtils";

/**
 * THE MOVES N = NONE, A = ATTACK, B = BLOCK, R = RELOAD
 */
const M = {
  N: 0,
  A: 1,
  B: 2,
  R: 3,
};

const duelerButtonPositions = [
  // attack
  { x: 100, y: 340 },
  // block
  { x: 160, y: 340 },
  // reload
  { x: 220, y: 340 },
  // confirm
  { x: 400, y: 340 },
];

const dueleeButtonPositions = [
  //attack
  { x: 1100, y: 340 },
  // block
  { x: 1040, y: 340 },
  // reload
  { x: 980, y: 340 },
  // confirm
  { x: 800, y: 340 },
];

class PlayerControls {
  constructor(gameState, userAddress, onConfirmCb, onRevealCb) {
    this.gameState = gameState;
    this.userAddress = userAddress;
    this.currentMove = M.N;

    this.buttonHandlers = {
      attack: this.onClickAttack,
      block: this.onClickBlock,
      reload: this.onClickReload,
      confirm: this.onConfirm,
    };

    this.buttonsMeta = [
      // attack
      {
        assetPath: "buttons/attackIcon",
        assetPathHover: "buttons/attackIconHover",
        onClick: () => {
          this.onClickMove(M.A);
        },
      },
      // block
      {
        assetPath: "buttons/shieldIcon",
        assetPathHover: "buttons/shieldIconHover",
        onClick: () => {
          this.onClickMove(M.B);
        },
      },
      // reload
      {
        assetPath: "buttons/reloadIcon",
        assetPathHover: "buttons/reloadIconHover",
        onClick: () => {
          this.onClickMove(M.R);
        },
      },
      // confirm
      {
        assetPath: "buttons/confirmIcon",
        assetPathHover: "buttons/confirmIconHover",
        onClick: this.onConfirmMove,
      },
      // reveal - TODO
    ];

    this.buttonPositions =
      userAddress === gameState.duelerAddress
        ? duelerButtonPositions
        : userAddress === gameState.dueleeAddress
        ? dueleeButtonPositions
        : [];

    this.container = new PIXI.Container();
    this.container.position.x = 0;
    this.container.position.y = 0;
    this.container.width = 1200;
    this.container.height = 400;

    this.renderButtons();
  }

  renderButtons() {
    for (let i = 0; i < this.buttonPositions.length; i++) {
      const buttonMeta = this.buttonsMeta[i];
      const position = this.buttonPositions[i];

      const buttonSprite = createSpriteAtPosition(
        buttonMeta.assetPath,
        position.x,
        position.y
      );

      this.container.addChild(buttonSprite);
    }
  }

  updateGameState(nextGameState) {
    this.gameState = nextGameState;
  }

  async onConfirmMove() {}

  async onRevealMove() {}

  onClickMove(moveType) {
    this.currentMove = moveType;
    this.displayConfirm();
  }
}

export default PlayerControls;
