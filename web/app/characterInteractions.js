import * as PIXI from "pixi.js";
import delay from "../lib/delay";
import DuelerCharacter from "./duelerCharacter";
import DevKeyBindings from "./devKeyBindings";
import RoundEndTextManager from "./roundEndTextManager.js";

// Move Type
const M = {
  N: 0,
  A: 1,
  B: 2,
  R: 3,
};

// CRIT Type
const C = {
  C: "critical",
  N: "nonCritical",
  A: "any",
};

class CharacterInteractions {
  constructor(
    initialGameState,
    playerAddress,
    vfx,
    playerCharacterName,
    opponentCharacterName,
    playerControls,
    playerStates
  ) {
    this.isPlayerDueler = initialGameState.duelerAddress === playerAddress;
    this.vfx = vfx;

    this.player = new DuelerCharacter(playerCharacterName, true);
    this.opponent = new DuelerCharacter(opponentCharacterName, false);

    this.container = new PIXI.Container();
    this.container.zIndex = 8;

    this.container.addChild(this.opponent.container);
    this.container.addChild(this.player.container);

    this.playerControls = playerControls;
    this.playerStates = playerStates;

    const ci = this;

    this.interactions = [
      // id, playerMoveType, opponentMoveType, playerCritical, opponentCritical, handler, debug hot key!
      [0, M.A, M.A, C.A, C.A, ci.doubleAttack], // a
      [1, M.A, M.R, C.N, C.N, ci.attackReload], // b
      [2, M.R, M.A, C.N, C.N, ci.reloadAttack], // c
      [3, M.B, M.B, C.A, C.A, ci.doubleBlock], // d
      [4, M.A, M.B, C.A, C.A, ci.attackBlock], // e
      [5, M.B, M.A, C.A, C.A, ci.blockAttack], // f
      [6, M.B, M.R, C.N, C.N, ci.blockReload], // g
      [7, M.R, M.B, C.N, C.N, ci.reloadBlock], // h
      [8, M.R, M.R, C.N, C.N, ci.doubleReload], // i
      [9, M.A, M.R, C.C, C.A, ci.criticalAttackReload], // j
      [10, M.R, M.A, C.A, C.C, ci.reloadCriticalAttack], // k
      [11, M.A, M.R, C.N, C.C, ci.attackCriticalReload], // l
      [12, M.R, M.A, C.C, C.N, ci.criticalReloadAttack], // m
      [13, M.B, M.R, C.N, C.C, ci.blockCriticalReload], // n
      [14, M.R, M.B, C.C, C.N, ci.criticalReloadBlock], // o
      [15, M.R, M.R, C.N, C.C, ci.reloadCriticalReload], // p
      [16, M.R, M.R, C.C, C.N, ci.criticalReloadReload], // q
      [17, M.R, M.R, C.C, C.C, ci.doubleCriticalReload], // r
    ];

    this.roundEndTextManager = new RoundEndTextManager(
      initialGameState,
      playerAddress
    );

    this.container.addChild(this.roundEndTextManager.container);

    // FOR DEBUGGING ONLY
    new DevKeyBindings(this);

    // win - s
    // lose - t

    // this.win(this.opponent, this.player);
    // this.doubleBlock(this.player, this.opponent);

    setInterval(() => {
      // this.doubleBlock(this.player, this.opponent);
      // this.win(this.opponent, this.player);
    }, 6000);
  }

  isCritMatch(boolIsCrit, interactionCritType) {
    return (
      interactionCritType === C.A ||
      (boolIsCrit && interactionCritType === C.C) ||
      (!boolIsCrit && interactionCritType === C.N)
    );
  }

  async onRoundCompleted(duelerMove, dueleeMove, isDuelerCrit, isDueleeCrit) {
    console.log(
      "ROUND COMPLETED PLAYER INTERACTIONS INBOUND!!!!",
      duelerMove,
      dueleeMove,
      isDuelerCrit,
      isDueleeCrit
    );

    this.roundEndTextManager.showTexts(
      duelerMove,
      dueleeMove,
      isDuelerCrit,
      isDueleeCrit
    );

    await delay(250);

    const playerMove = this.isPlayerDueler ? duelerMove : dueleeMove;
    const opponentMove = this.isPlayerDueler ? dueleeMove : duelerMove;
    const isPlayerCrit = this.isPlayerDueler ? isDuelerCrit : isDueleeCrit;
    const isOpponentCrit = this.isPlayerDueler ? isDueleeCrit : isDuelerCrit;

    for (let interaction of this.interactions) {
      const [
        interactionId,
        interactionPlayerMove,
        interactionOpponentMove,
        interactionPlayerCrit,
        interactionOpponentCrit,
        interactionHandler,
        flipped,
      ] = interaction;

      const moveMatch =
        playerMove === interactionPlayerMove &&
        opponentMove === interactionOpponentMove;

      const playerCritMatch = this.isCritMatch(
        isPlayerCrit,
        interactionPlayerCrit
      );

      const opponentCritMatch = this.isCritMatch(
        isOpponentCrit,
        interactionOpponentCrit
      );

      if (moveMatch && playerCritMatch && opponentCritMatch) {
        const c1 = flipped ? this.opponent : this.player;
        const c2 = flipped ? this.player : this.opponent;

        interactionHandler.call(this, c1, c2);
      }
    }
  }

  // a
  async doubleAttack() {
    this.vfx.showActionLines();

    const a = this.player.attack();
    const b = this.opponent.attack();

    setTimeout(() => {
      this.vfx.showFusion();
    }, 150);

    await Promise.all([a, b]);

    this.vfx.hideActionLines();
  }

  // b
  async attackReload() {
    this.vfx.showActionLines();

    await Promise.all([this.player.attack(), this.opponent.reload()]);
    await this.opponent.receiveHit();

    this.vfx.hideActionLines();
  }

  // c
  async reloadAttack() {
    this.vfx.showActionLines();

    await Promise.all([this.opponent.attack(), this.player.reload()]);
    await this.player.receiveHit();

    this.vfx.hideActionLines();
  }

  // d
  async doubleBlock() {
    this.vfx.showActionLines();
    await Promise.all([this.player.block(), this.opponent.block()]);
    this.vfx.hideActionLines();
  }

  // e
  async attackBlock() {
    this.vfx.showActionLines();
    await Promise.all([this.player.attack(), this.opponent.block()]);
    this.vfx.hideActionLines();
  }

  // f
  async blockAttack() {
    this.vfx.showActionLines();
    await Promise.all([this.player.block(), this.opponent.attack()]);
    this.vfx.hideActionLines();
  }

  // g
  async blockReload() {
    this.vfx.showActionLines();
    await Promise.all([this.player.block(), this.opponent.reload()]);
    this.vfx.hideActionLines();
  }

  // h
  async reloadBlock() {
    this.vfx.showActionLines();
    await Promise.all([this.player.reload(), this.opponent.block()]);
    this.vfx.hideActionLines();
  }

  // i
  async doubleReload() {
    this.vfx.showActionLines();
    await Promise.all([this.player.reload(), this.opponent.reload()]);
    this.vfx.hideActionLines();
  }

  // j
  async criticalAttackReload() {
    this.vfx.showActionLines();
    await this.opponent.reload();
    this.playerControls.container.alpha = 0;
    this.playerStates.container.alpha = 0;

    this.container.zIndex = 11;
    this.vfx.showCritBackground();

    await this.player.criticalAttackPrep();
    await delay(150);

    await Promise.all([
      this.player.attack(),
      this.opponent.receiveCriticalHit(),
    ]);

    this.vfx.hideActionLines();
  }

  // k
  async reloadCriticalAttack() {
    this.vfx.showActionLines();
    await this.player.reload();
    this.playerControls.container.alpha = 0;
    this.playerStates.container.alpha = 0;

    this.container.zIndex = 11;
    this.vfx.showCritBackground();

    await this.opponent.criticalAttackPrep();
    await delay(150);

    await Promise.all([
      this.opponent.attack(),
      this.player.receiveCriticalHit(),
    ]);

    this.vfx.hideActionLines();
  }

  // l
  async attackCriticalReload() {
    this.player.attack();
    this.opponent.criticalReload();
  }

  // m
  async criticalReloadAttack() {}

  // n
  async blockCriticalReload() {
    this.player.block();
    this.opponent.criticalReload();
  }

  // o
  async criticalReloadBlock() {}

  // p
  async reloadCriticalReload() {
    this.player.reload();
    this.opponent.criticalReload();
  }

  // q
  async criticalReloadReload() {}

  // r
  async doubleCriticalReload() {
    this.player.criticalReload();
    this.opponent.criticalReload();
  }

  async win() {
    await this.opponent.die();
    this.playerStates.hide();
    this.playerControls.hide();
    this.vfx.zoomBackgroundWin(true);
    this.player.win();
  }

  async lose() {}
}

export default CharacterInteractions;
