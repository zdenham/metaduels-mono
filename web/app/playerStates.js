import { createSpriteAtPosition } from "../lib/pixiUtils";

class PlayerStates {
  constructor(gameState, textObj) {
    this.textObj = textObj;
    this.container = new PIXI.Container();
    this.container.position.x = 0;
    this.container.position.y = 0;
    this.container.width = 1200;
    this.container.height = 400;

    this.initPlayerNFTs(gameState);
    this.initPlayersAddresses(gameState);
    this.initPlayersHealth(gameState);
    this.initPlayersShield(gameState);
    this.initPlayersAmmo(gameState);
  }

  initPlayerNFTs(gameState) {
    const duelerWagerImage = createSpriteAtPosition(
      "placeholder/duelerWagerImage",
      60,
      50
    );
    const dueleeWagerImage = createSpriteAtPosition(
      "placeholder/dueleeWagerImage",
      1020,
      50
    );

    this.container.addChild(duelerWagerImage);
    this.container.addChild(dueleeWagerImage);
  }

  initPlayersAddresses(gameState) {
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

    this.container.addChild(duelerAddressText);
    this.container.addChild(dueleeAddressText);
  }

  initPlayersHealth(gameState) {
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

      const duelerHealth = createSpriteAtPosition(
        duelerSpritePath,
        duelerHealthPositions[i].x,
        duelerHealthPositions[i].y
      );

      const dueleeHealth = createSpriteAtPosition(
        dueleeSpritePath,
        dueleeHealthPositions[i].x,
        dueleeHealthPositions[i].y
      );

      this.container.addChild(duelerHealth);
      this.container.addChild(dueleeHealth);
    }
  }

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

  initPlayersShield(gameState) {
    const duelerShield = this.shieldIconPath(gameState.duelerState.shield);
    const dueleeShield = this.shieldIconPath(gameState.dueleeState.shield);

    const duelerSprite = createSpriteAtPosition(duelerShield, 300, 50);
    const dueleeSprite = createSpriteAtPosition(dueleeShield, 840, 50);

    this.container.addChild(duelerSprite);
    this.container.addChild(dueleeSprite);
  }

  initPlayersAmmo(gameState) {
    const duelerAmmoPositions = [
      { x: 190, y: 100 },
      { x: 240, y: 100 },
      { x: 300, y: 100 },
    ];

    const dueleeAmmoPositions = [
      { x: 960, y: 100 },
      { x: 900, y: 100 },
      { x: 840, y: 100 },
    ];

    for (let i = 0; i < 3; i++) {
      const duelerSpritePath =
        i < gameState.duelerState.ammo
          ? "buttons/attackIcon"
          : "buttons/attackIconEmpty";
      const dueleeSpritePath =
        i < gameState.dueleeState.ammo
          ? "buttons/attackIcon"
          : "buttons/attackIconEmpty";

      const duelerAmmo = createSpriteAtPosition(
        duelerSpritePath,
        duelerAmmoPositions[i].x,
        duelerAmmoPositions[i].y
      );

      const dueleeAmmo = createSpriteAtPosition(
        dueleeSpritePath,
        dueleeAmmoPositions[i].x,
        dueleeAmmoPositions[i].y
      );

      this.container.addChild(duelerAmmo);
      this.container.addChild(dueleeAmmo);
    }
  }

  update(nextGameState) {
    // TODO - actually render animations / transitions
    // For now we are just removing all children and rendering with a fresh state
    for (let i = this.container.children.length - 1; i >= 0; i--) {
      this.container.removeChild(this.container.children[i]);
    }

    this.initPlayerNFTs(nextGameState);
    this.initPlayersAddresses(nextGameState);
    this.initPlayersHealth(nextGameState);
    this.initPlayersShield(nextGameState);
    this.initPlayersAmmo(nextGameState);
  }
}

export default PlayerStates;
