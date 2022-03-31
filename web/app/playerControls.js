import * as PIXI from "pixi.js";
import { createSpriteAtPosition, texture } from "../lib/pixiUtils";
import zeroHash from "../lib/zeroHash";

/**
 * THE MOVES N = NONE, A = ATTACK, B = BLOCK, R = RELOAD
 */
export const M = {
  N: 0,
  A: 1,
  B: 2,
  R: 3,
};

const playerButtonPositions = {
  attack: { x: 100, y: 340 },
  block: { x: 160, y: 340 },
  reload: { x: 220, y: 340 },
  confirm: { x: 400, y: 340 },
  reveal: { x: 400, y: 340 },
};

const moveStates = {
  none: "none",
  submitted: "submitted",
  revealed: "revealed",
};

function moveState(move) {
  if (move.moveHash === zeroHash) {
    return moveStates.none;
  } else if (move.moveType === M.N) {
    return moveStates.submitted;
  }

  return moveStates.revealed;
}

function getButtonsToShow(playerMoveState, opponentMoveState) {
  switch (playerMoveState) {
    case moveStates.none:
      return ["attack", "block", "reload"];
    case moveStates.submitted:
      return opponentMoveState === moveStates.none ? [] : ["reveal"];
    default:
      return [];
  }
}

class PlayerControls {
  constructor(
    initialGameState,
    playerAddress,
    onConfirmCallback,
    onRevealCallback
  ) {
    this.isPlayerDueler = playerAddress === initialGameState.duelerAddress;
    this.selectedMove = M.N;

    this.onConfirmCallback = onConfirmCallback;
    this.onRevealCallback = onRevealCallback;

    this.buttons = {
      // attack
      attack: {
        assetPath: "buttons/attackIcon",
        moveType: M.A,
      },
      // block
      block: {
        assetPath: "buttons/shieldIcon",
        moveType: M.B,
      },
      // reload
      reload: {
        assetPath: "buttons/reloadIcon",
        moveType: M.R,
      },
      // confirm
      confirm: {
        assetPath: "buttons/confirmIcon",
      },
      // reveal
      reveal: {
        assetPath: "buttons/revealIcon",
      },
    };

    this.container = new PIXI.Container();
    this.container.position.x = 0;
    this.container.position.y = 0;
    this.container.width = 1200;
    this.container.height = 400;

    this.initButtons(initialGameState);
  }

  initButtons(gameState) {
    for (let key of Object.keys(playerButtonPositions)) {
      const button = this.buttons[key];
      const position = playerButtonPositions[key];

      const buttonSprite = createSpriteAtPosition(
        button.assetPath,
        position.x,
        position.y
      );

      // iniitalize with 0 alpha until "enabled"
      buttonSprite.alpha = 0;

      this.buttons[key].sprite = buttonSprite;

      buttonSprite.on("pointerover", () => {
        if (button.moveType === this.selectedMove) {
          return;
        }

        this.buttons[key].sprite.texture = texture(
          this.buttons[key].assetPath + "Hover"
        );
      });

      buttonSprite.on("pointerout", () => {
        if (button.moveType === this.selectedMove) {
          return;
        }

        this.buttons[key].sprite.texture = texture(this.buttons[key].assetPath);
      });

      buttonSprite.on("pointerdown", () => {
        this.onClickButton(key);
      });

      this.container.addChild(buttonSprite);
    }

    // choose which buttons to initialy show based on game state
    const duelerMoveState = moveState(gameState.currDuelerMove);
    const dueleeMoveState = moveState(gameState.currDueleeMove);

    const buttonsToShow = getButtonsToShow(
      this.isPlayerDueler ? duelerMoveState : dueleeMoveState,
      this.isPlayerDueler ? dueleeMoveState : duelerMoveState
    );

    this.showButtons(...buttonsToShow);
  }

  showButtons(...buttonKeys) {
    console.log("SHOWING BUTTONS: ", buttonKeys);
    for (let key of buttonKeys) {
      const button = this.buttons[key];

      button.sprite.alpha = 1;
      button.sprite.interactive = true;
      button.sprite.buttonMode = true;
    }
  }

  hideButtons(...buttonKeys) {
    for (let key of buttonKeys) {
      const button = this.buttons[key];

      button.sprite.alpha = 0;
      button.sprite.interactive = false;
      button.sprite.buttonMode = false;
    }
  }

  resetMoveButtons() {
    const moveButtonKeys = ["attack", "reload", "block"];

    for (let key of moveButtonKeys) {
      this.buttons[key].sprite.texture = texture(this.buttons[key].assetPath);
    }
  }

  async onConfirmMove() {
    // TODO - maybe set a loading state
    await this.onConfirmCallback(this.selectedMove);

    this.hideButtons("attack", "block", "reload", "confirm");
    this.resetMoveButtons();
  }

  async onRevealMove() {
    await this.onRevealCallback();
    this.hideButtons("reveal");
  }

  onClickMove(buttonKey) {
    const button = this.buttons[buttonKey];

    this.selectedMove = button.moveType;
    this.resetMoveButtons();

    button.sprite.texture = texture(button.assetPath + "Select");

    this.showButtons("confirm");
  }

  onMoveSubmitted(nextGameState) {
    const dueleeMoveState = moveState(nextGameState.currDueleeMove);
    const duelerMoveState = moveState(nextGameState.currDuelerMove);

    if (
      dueleeMoveState === moveStates.submitted &&
      duelerMoveState === moveStates.submitted
    ) {
      // show the reveal button
      this.showButtons("reveal");
    }
  }

  onRoundCompleted(nextGameState) {
    // TODO - actually render animations / transitions
    // For now we are just removing all children and rendering with a fresh state
    for (let i = this.container.children.length - 1; i >= 0; i--) {
      this.container.removeChild(this.container.children[i]);
    }

    this.initButtons(nextGameState);
  }

  onClickButton(buttonKey) {
    switch (buttonKey) {
      case "confirm":
        this.onConfirmMove();
        break;
      case "reveal":
        this.onRevealMove();
        break;
      default:
        this.onClickMove(buttonKey);
    }
  }
}

export default PlayerControls;
