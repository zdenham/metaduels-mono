import { createSpriteAtPosition } from "../lib/pixiUtils";

class PlayerStates {
  constructor(gameState, playerAddress, textObj) {
    this.isPlayerDueler = playerAddress === gameState.duelerAddress;
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

    const playerAddress = this.textObj.customText(
      this.isPlayerDueler ? duelerTruncated : dueleeTruncated,
      60,
      20
    );

    const opponenetAddress = this.textObj.customText(
      this.isPlayerDueler ? dueleeTruncated : duelerTruncated,
      1060,
      20
    );

    this.container.addChild(playerAddress);
    this.container.addChild(opponenetAddress);
  }

  initPlayersHealth(gameState) {
    const playerHealthPositions = [
      { x: 190, y: 50 },
      { x: 240, y: 50 },
    ];

    const opponentHealthPositions = [
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

      const playerHealth = createSpriteAtPosition(
        this.isPlayerDueler ? duelerSpritePath : dueleeSpritePath,
        playerHealthPositions[i].x,
        playerHealthPositions[i].y
      );

      const opponentHealth = createSpriteAtPosition(
        this.isPlayerDueler ? dueleeSpritePath : duelerSpritePath,
        opponentHealthPositions[i].x,
        opponentHealthPositions[i].y
      );

      this.container.addChild(playerHealth);
      this.container.addChild(opponentHealth);
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

    const playerShieldSprite = createSpriteAtPosition(
      this.isPlayerDueler ? duelerShield : dueleeShield,
      300,
      50
    );

    const opponentShieldSprite = createSpriteAtPosition(
      this.isPlayerDueler ? dueleeShield : duelerShield,
      840,
      50
    );

    this.container.addChild(playerShieldSprite);
    this.container.addChild(opponentShieldSprite);
  }

  initPlayersAmmo(gameState) {
    const playerAmmoPositions = [
      { x: 190, y: 100 },
      { x: 240, y: 100 },
      { x: 300, y: 100 },
    ];

    const opponentAmmoPositions = [
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

      const playerAmmo = createSpriteAtPosition(
        this.isPlayerDueler ? duelerSpritePath : dueleeSpritePath,
        playerAmmoPositions[i].x,
        playerAmmoPositions[i].y
      );

      const opponentAmmo = createSpriteAtPosition(
        this.isPlayerDueler ? dueleeSpritePath : duelerSpritePath,
        opponentAmmoPositions[i].x,
        opponentAmmoPositions[i].y
      );

      this.container.addChild(playerAmmo);
      this.container.addChild(opponentAmmo);
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
