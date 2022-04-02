import * as PIXI from "pixi.js";

class RoundEndTextManager {
  constructor(isPlayerDueler) {
    this.isPlayerDueler = isPlayerDueler;
    this.container = new PIXI.Container();

    this.container.width = 1200;
    this.container.height = 400;

    this.init();
  }

  setUpText(isPlayer, name, texture) {
    const sprite = new PIXI.Sprite(texture);
    sprite.isPlayer = isPlayer;

    this.container[name] = sprite;

    sprite.x = isPlayer ? 50 : 1150;
    sprite.anchor.set(isPlayer ? 0 : 1, 0.5);
    sprite.y = 200;

    this.container.addChild(sprite);
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
      : isDudlerMoveCritical;

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
  }
}

export default RoundEndTextManager;
