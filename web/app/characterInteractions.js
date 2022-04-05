import * as PIXI from "pixi.js";
import delay from "../lib/delay";
import DuelerCharacter from "./duelerCharacter";
import DevKeyBindings from "./devKeyBindings";
import RoundEndTextManager from "./roundEndTextManager.js";
import zeroHash from "../lib/zeroHash";
import playSound from "../lib/playSound";

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
    this.playerAddress = playerAddress;

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

  async onRoundCompleted(
    duelerMove,
    dueleeMove,
    isDuelerCrit,
    isDueleeCrit,
    nextGameState
  ) {
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

        this.vfx.showActionLines();
        await interactionHandler.call(this, c1, c2);
        this.vfx.hideActionLines();
      }
    }

    if (nextGameState.winner && nextGameState.winner !== zeroHash) {
      if (this.playerAddress === winner) {
        await this.win();
      } else {
        await this.lose();
      }
    }
  }

  // a
  async doubleAttack() {
    const a = this.player.attack();
    const b = this.opponent.attack();

    setTimeout(() => {
      this.vfx.showFusion();
    }, 150);

    await Promise.all([a, b]);
  }

  // b
  async attackReload() {
    playSound("punch", 200);
    await Promise.all([this.player.attack(), this.opponent.reload()]);
    await this.opponent.receiveHit();
  }

  // c
  async reloadAttack() {
    playSound("punch", 200);
    await Promise.all([this.opponent.attack(), this.player.reload()]);
    await this.player.receiveHit();
  }

  // d
  async doubleBlock() {
    await Promise.all([this.player.block(), this.opponent.block()]);
  }

  // e
  async attackBlock() {
    await Promise.all([this.player.attack(), this.opponent.block()]);
  }

  // f
  async blockAttack() {
    await Promise.all([this.player.block(), this.opponent.attack()]);
  }

  // g
  async blockReload() {
    await Promise.all([this.player.block(), this.opponent.reload()]);
  }

  // h
  async reloadBlock() {
    await Promise.all([this.player.reload(), this.opponent.block()]);
  }

  // i
  async doubleReload() {
    await Promise.all([this.player.reload(), this.opponent.reload()]);
  }

  // j
  async criticalAttackReload() {
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
  }

  // k
  async reloadCriticalAttack() {
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
  }

  // l
  async attackCriticalReload() {
    await Promise.all([this.player.attack(), this.opponent.reload()]);
    await this.opponent.receiveHit();
    await this.opponent.reload();
  }

  // m
  async criticalReloadAttack() {
    await Promise.all([this.opponent.attack(), this.player.reload()]);
    await this.player.receiveHit();
    await this.player.reload();
  }

  // n
  async blockCriticalReload() {
    await Promise.all([this.player.block(), this.opponent.reload()]);
    await this.opponent.reload();
  }

  // o
  async criticalReloadBlock() {
    await Promise.all([this.player.reload(), this.opponent.block()]);
    await this.player.reload();
  }

  // p
  async reloadCriticalReload() {
    await Promise.all([this.player.reload(), this.opponent.reload()]);
    await this.opponent.reload();
  }

  // q
  async criticalReloadReload() {
    await Promise.all([this.player.reload(), this.opponent.reload()]);
    await this.player.reload();
  }

  // r
  async doubleCriticalReload() {
    await Promise.all([this.player.reload(), this.opponent.reload()]);
    await Promise.all([this.player.reload(), this.opponent.reload()]);
  }

  async win() {
    await this.opponent.die();
    this.playerStates.hide();
    this.playerControls.hide();
    this.vfx.zoomBackgroundWin(true);
    this.player.win();
  }

  async lose() {
    await this.player.die();
    this.playerStates.hide();
    this.playerControls.hide();
    this.vfx.zoomBackgroundWin(false);
    this.opponent.win();
  }
}

export default CharacterInteractions;
