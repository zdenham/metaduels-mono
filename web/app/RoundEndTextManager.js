import * as PIXI from "pixi.js";
import animateRectangle from "../lib/animateRectangle";
import delay from "../lib/delay";

class RoundEndTextManager {
  constructor(gameState, playerAddress) {
    this.isPlayerDueler = gameState.duelerAddress === playerAddress;
    this.container = new PIXI.Container();

    this.container.width = 1200;
    this.container.height = 400;

    this.init();
  }

  setUpText(isPlayer, name, texture) {
    const sprite = new PIXI.Sprite(texture);
    sprite.isPlayer = isPlayer;

    this.container[name] = sprite;

    sprite.x = isPlayer ? -65 : 1265;
    sprite.anchor.set(isPlayer ? 0 : 1, 0.5);
    sprite.y = 200;

    sprite.scale.x = 0.25;
    sprite.scale.y = 0.25;

    this.container.addChild(sprite);

    const spriteMask = new PIXI.Graphics();

    const dims = {
      x: isPlayer ? sprite.x - sprite.width : sprite.x,
      y: sprite.y - sprite.height / 2,
      width: sprite.width,
      height: sprite.height,
    };

    spriteMask.drawRect(dims.x, dims.y, dims.width, dims.height);

    this.container.addChild(spriteMask);
    sprite.mask = spriteMask;
    sprite.dims = dims;
  }

  init() {
    const attackTexture = PIXI.Texture.from(
      "assets/images/text/attackText.png"
    );
    const blockTexture = PIXI.Texture.from("assets/images/text/blockText.png");
    const reloadTexture = PIXI.Texture.from(
      "assets/images/text/reloadText.png"
    );
    const criticalHitTexture = PIXI.Texture.from(
      "assets/images/text/criticalHitText.png"
    );
    const criticalReloadTexture = PIXI.Texture.from(
      "assets/images/text/criticalReloadText.png"
    );

    this.setUpText(true, "playerAttack", attackTexture);
    this.setUpText(false, "opponentAttack", attackTexture);
    this.setUpText(true, "playerBlock", blockTexture);
    this.setUpText(false, "opponentBlock", blockTexture);
    this.setUpText(true, "playerReload", reloadTexture);
    this.setUpText(false, "opponentReload", reloadTexture);
    this.setUpText(true, "playerCriticalAttack", criticalHitTexture);
    this.setUpText(false, "opponentCritical", criticalHitTexture);
    this.setUpText(true, "playerCriticalReload", criticalReloadTexture);
    this.setUpText(false, "opponentCriticalReload", criticalReloadTexture);
  }

  getSpriteToShow(isPlayer, move, isCritical) {
    const p = isPlayer ? "player" : "opponent";
    const c = isCritical ? "Critical" : "";
    switch (move) {
      case 1: // attack
        return this.container[`${p}${c}Attack`];
      case 2: // block
        return this.container[`${p}Block`];
      case 3:
        return this.container[`${p}${c}Reload`];
    }
  }

  async showTexts(
    duelerMove,
    dueleeMove,
    isDuelerMoveCritical,
    isDueleeMoveCritical
  ) {
    const playerMove = this.isPlayerDueler ? duelerMove : dueleeMove;
    const opponentMove = this.isPlayerDueler ? dueleeMove : duelerMove;

    const isPlayerMoveCritical = this.isPlayerDueler
      ? isDuelerMoveCritical
      : isDueleeMoveCritical;
    const isOpponentMoveCritical = this.isPlayerDueler
      ? isDueleeMoveCritical
      : isDuelerMoveCritical;

    const playerSprite = this.getSpriteToShow(
      true,
      playerMove,
      isPlayerMoveCritical
    );

    const opponentSprite = this.getSpriteToShow(
      false,
      opponentMove,
      isOpponentMoveCritical
    );

    const playerIn = animateRectangle(
      playerSprite.mask,
      // from
      playerSprite.dims.x,
      playerSprite.dims.y,
      playerSprite.dims.width,
      playerSprite.dims.height,
      // to
      playerSprite.dims.x + playerSprite.width,
      playerSprite.dims.y,
      playerSprite.dims.width,
      playerSprite.dims.height,
      20,
      0
    );

    const opponentIn = animateRectangle(
      opponentSprite.mask,
      // from
      opponentSprite.dims.x,
      opponentSprite.dims.y,
      opponentSprite.dims.width,
      opponentSprite.dims.height,
      // to
      opponentSprite.dims.x - opponentSprite.width,
      opponentSprite.dims.y,
      opponentSprite.dims.width,
      opponentSprite.dims.height,
      20,
      0
    );

    await Promise.all([playerIn, opponentIn]);

    await delay(2500);

    const playerOut = animateRectangle(
      playerSprite.mask,
      // from
      playerSprite.dims.x + playerSprite.width,
      playerSprite.dims.y,
      playerSprite.dims.width,
      playerSprite.dims.height,
      // to
      playerSprite.dims.x,
      playerSprite.dims.y,
      playerSprite.dims.width,
      playerSprite.dims.height,
      20,
      0
    );

    const opponentOut = animateRectangle(
      opponentSprite.mask,
      // from
      opponentSprite.dims.x - opponentSprite.width,
      opponentSprite.dims.y,
      opponentSprite.dims.width,
      opponentSprite.dims.height,
      // to
      opponentSprite.dims.x,
      opponentSprite.dims.y,
      opponentSprite.dims.width,
      opponentSprite.dims.height,
      20,
      0
    );

    await Promise.all([playerOut, opponentOut]);
  }
}

export default RoundEndTextManager;
