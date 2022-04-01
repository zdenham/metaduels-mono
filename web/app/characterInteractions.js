import * as PIXI from "pixi.js";
import DuelerCharacter from "./duelerCharacter";

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
  constructor(initialGameState, playerAddress, vfx) {
    this.isPlayerDueler = initialGameState.duelerAddress === playerAddress;
    this.vfx = vfx;

    this.playerCharacter = new DuelerCharacter("razor", true);
    this.opponentCharacter = new DuelerCharacter("right_click", false);

    this.container = new PIXI.Container();

    this.container.addChild(this.playerCharacter.container);
    this.container.addChild(this.opponentCharacter.container);

    const ci = this;

    this.interactions = [
      // id, playerMoveType, opponentMoveType, playerCritical, opponentCritical, handler
      [0, M.A, M.A, C.A, C.A, ci.doubleAttack, false],
      [1, M.A, M.R, C.N, C.N, ci.attackReload, false],
      [2, M.R, M.A, C.N, C.N, ci.attackReload, true],
      [3, M.B, M.B, C.A, C.A, ci.doubleBlock, false],
      [4, M.A, M.B, C.A, C.A, ci.attackBlock, false],
      [5, M.B, M.A, C.A, C.A, ci.attackBlock, true],
      [6, M.R, M.B, C.N, C.N, ci.blockReload, false],
      [7, M.B, M.R, C.N, C.N, ci.blockReload, true],
      [8, M.R, M.R, C.N, C.N, ci.doubleReload, false],
      [9, M.A, M.R, C.C, C.A, ci.criticalAttackReload, false],
      [10, M.R, M.A, C.A, C.C, ci.criticalAttackReload, true],
      [11, M.A, M.R, C.N, C.C, ci.attackCriticalReload, false],
      [12, M.R, M.A, C.C, C.N, ci.attackCriticalReload, true],
      [13, M.B, M.R, C.N, C.C, ci.blockCriticalReload, false],
      [14, M.R, M.B, C.C, C.N, ci.blockCriticalReload, true],
      [15, M.R, M.R, C.N, C.C, ci.reloadCriticalReload, false],
      [16, M.R, M.R, C.C, C.N, ci.reloadCriticalReload, true],
      [17, M.R, M.R, C.C, C.C, ci.doubleCriticalReload, false],
    ];

    // this.playerCharacter.die();
    // this.opponentCharacter.die();

    // this.attackReload(this.playerCharacter, this.opponentCharacter);

    // setInterval(() => {
    //   // this.playerCharacter.die();
    //   // this.opponentCharacter.die();
    //   this.attackReload(this.playerCharacter, this.opponentCharacter);
    // }, 6000);
  }

  isCritMatch(boolIsCrit, interactionCritType) {
    return (
      interactionCritType === C.A ||
      (boolIsCrit && interactionCritType === C.C) ||
      (!boolIsCrit && interactionCritType === C.N)
    );
  }

  onRoundCompleted(duelerMove, dueleeMove, isDuelerCrit, isDueleeCrit) {
    console.log(
      "ROUND COMPLETED PLAYER INTERACTIONS INBOUND!!!!",
      duelerMove,
      dueleeMove,
      isDuelerCrit,
      isDueleeCrit
    );

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
        console.log("FOUND OUR INTERACTION MATCH: ", interactionId);
        const c1 = flipped ? this.opponentCharacter : this.playerCharacter;
        const c2 = flipped ? this.playerCharacter : this.opponentCharacter;

        interactionHandler.call(this, c1, c2);
      }
    }
  }

  // interactions (12 different scenarios at round end)
  doubleAttack(c1, c2) {
    c1.attack();
    c2.attack();
  }

  async attackReload(c1, c2) {
    this.vfx.showActionLines();

    await Promise.all([c1.attack(), c2.reload()]);
    await c2.receiveHit();

    this.vfx.hideActionLines();
  }

  doubleBlock(c1, c2) {
    c1.block();
    c2.block();
  }

  attackBlock(c1, c2) {
    c1.attack();
    c2.block();
  }

  blockReload(c1, c2) {
    c1.block();
    c2.reload();
  }

  doubleReload(c1, c2) {
    c1.reload();
    c2.reload();
  }

  criticalAttackReload(c1, c2) {
    c1.criticalAttack();
    c2.reload();
  }

  attackCriticalReload(c1, c2) {
    c1.attack();
    c2.criticalReload();
  }

  blockCriticalReload(c1, c2) {
    c1.block();
    c2.criticalReload();
  }

  reloadCriticalReload(c1, c2) {
    c1.reload();
    c2.criticalReload();
  }

  doubleCriticalReload(c1, c2) {
    c1.criticalReload();
    c2.criticalReload();
  }
}

export default CharacterInteractions;
