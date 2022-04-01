import chainAnimations from "../lib/chainAnimations";
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
      this.container[`playerHealth${i}`] = playerHealth;
      this.container[`opponentHealth${i}`] = opponentHealth;
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
    this.container.playerShield = playerShieldSprite;
    this.container.opponentShield = opponentShieldSprite;
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

      this.container[`playerAmmo${i}`] = playerAmmo;
      this.container[`opponentAmmo${i}`] = opponentAmmo;
    }
  }

  depleteShield(isPlayer) {
    const shield = isPlayer
      ? this.container.playerShield
      : this.container.opponentShield;

    const x = shield.x;
    const y = shield.y;

    // TODO - maybe add animation

    this.container.removeChild(shield);

    const nextShield = createSpriteAtPosition(this.shieldIconPath(0), x, y);

    if (isPlayer) {
      this.container.playerShield = nextShield;
    } else {
      this.container.opponenetAddress = nextShield;
    }

    this.container.addChild(nextShield);
  }

  addShield(isPlayer, nextShieldVal) {
    const shield = isPlayer
      ? this.container.playerShield
      : this.container.opponentShield;

    const x = shield.x;
    const y = shield.y;

    // TODO - maybe add animation

    this.container.removeChild(shield);

    const nextShield = createSpriteAtPosition(
      this.shieldIconPath(nextShieldVal),
      x,
      y
    );

    if (isPlayer) {
      this.container.playerShield = nextShield;
    } else {
      this.container.opponenetAddress = nextShield;
    }

    this.container.addChild(nextShield);
  }

  async depleteHealth(isPlayer, change, nextHealth) {
    console.log("DEPLETING HEALTH: ", isPlayer, change, nextHealth);

    const animationPromises = [];
    for (let i = 0; i < 2; i++) {
      if (i < nextHealth || i > nextHealth - change) {
        continue;
      }

      const healthToDeplete = isPlayer
        ? this.container[`playerHealth${i}`]
        : this.container[`opponentHealth${i}`];

      const animationChain = [
        {
          params: {
            alpha: 0.3,
          },
          animation: {
            reverse: true,
            duration: 250,
            ease: "easeInOutQuad",
            repeat: 3,
          },
        },
      ];

      // blinking animation!
      animationPromises.push(chainAnimations(healthToDeplete, animationChain));
    }

    // perform blinking animation
    await Promise.all(animationPromises);

    // replace them with empty icons
    for (let i = 0; i < 2; i++) {
      if (i < nextHealth || i > nextHealth - change) {
        continue;
      }

      const healthToDeplete = isPlayer
        ? this.container[`playerHealth${i}`]
        : this.container[`opponentHealth${i}`];

      const x = healthToDeplete.x;
      const y = healthToDeplete.y;

      const emptyHealth = createSpriteAtPosition(
        "buttons/healthIconEmpty",
        x,
        y
      );

      this.container.removeChild(healthToDeplete);
      this.container.addChild(emptyHealth);

      if (isPlayer) {
        this.container[`playerHealth${i}`] = emptyHealth;
      } else {
        this.container[`opponentHealth${i}`] = emptyHealth;
      }
    }
  }

  depleteAmmo(isPlayer, nextAmmoVal) {
    const ammoToDeplete = isPlayer
      ? this.container[`playerAmmo${nextAmmoVal}`]
      : this.container[`opponentAmmo${nextAmmoVal}`];

    const x = ammoToDeplete.x;
    const y = ammoToDeplete.y;

    // TODO - maybe add animation

    this.container.removeChild(ammoToDeplete);

    const nextAmmo = createSpriteAtPosition("buttons/attackIconEmpty", x, y);

    if (isPlayer) {
      this.container[`playerAmmo${nextAmmoVal}`] = nextAmmo;
    } else {
      this.container[`opponentAmmo${nextAmmoVal}`] = nextAmmo;
    }

    this.container.addChild(nextAmmo);
  }

  reloadAmmo(isPlayer, change, nextAmmo) {
    // replace them with empty icons
    for (let i = 0; i < 3; i++) {
      const ammoIcon =
        this.container[`${isPlayer ? "playerAmmo" : "opponentAmmo"}${i}`];

      if (i < nextAmmo - change || i >= nextAmmo) {
        continue;
      }

      const x = ammoIcon.x;
      const y = ammoIcon.y;

      const reloadedAmmo = createSpriteAtPosition("buttons/attackIcon", x, y);

      this.container.removeChild(ammoIcon);
      this.container.addChild(reloadedAmmo);

      if (isPlayer) {
        this.container[`playerAmmo${i}`] = reloadedAmmo;
      } else {
        this.container[`opponentAmmo${i}`] = reloadedAmmo;
      }
    }
  }

  update(nextGameState, playerStateUpdates) {
    const {
      duelerAmmoChange,
      dueleeAmmoChange,
      duelerShieldChange,
      dueleeShieldChange,
      duelerHealthChange,
      dueleeHealthChange,
    } = playerStateUpdates;

    // update ammo
    if (duelerAmmoChange > 0) {
      this.reloadAmmo(
        this.isPlayerDueler,
        duelerAmmoChange,
        nextGameState.duelerState.ammo
      );
    }

    if (duelerAmmoChange < 0) {
      this.depleteAmmo(this.isPlayerDueler, nextGameState.duelerState.ammo);
    }

    if (dueleeAmmoChange > 0) {
      this.reloadAmmo(
        !this.isPlayerDueler,
        dueleeAmmoChange,
        nextGameState.dueleeState.ammo
      );
    }

    if (dueleeAmmoChange < 0) {
      this.depleteAmmo(!this.isPlayerDueler, nextGameState.dueleeState.ammo);
    }

    // update shield
    if (duelerShieldChange > 0) {
      this.addShield(this.isPlayerDueler, nextGameState.duelerState.shield);
    }

    if (duelerShieldChange < 0) {
      this.depleteShield(this.isPlayerDueler);
    }

    if (dueleeShieldChange > 0) {
      this.addShield(!this.isPlayerDueler, nextGameState.dueleeState.shield);
    }

    if (dueleeShieldChange < 0) {
      this.depleteShield(!this.isPlayerDueler);
    }

    // update health
    if (duelerHealthChange < 0) {
      this.depleteHealth(
        this.isPlayerDueler,
        duelerHealthChange,
        nextGameState.duelerState.health
      );
    }

    if (dueleeHealthChange < 0) {
      this.depleteHealth(
        !this.isPlayerDueler,
        dueleeHealthChange,
        nextGameState.dueleeState.health
      );
    }
  }

  hide() {
    this.container.alpha = 0;
  }
}

export default PlayerStates;
