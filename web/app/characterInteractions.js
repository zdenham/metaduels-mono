import * as PIXI from "pixi.js";
import characterData from "./characters.json";

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
  constructor(initialGameState, playerAddress) {
    this.isPlayerDueler = initialGameState.duelerAddress === playerAddress;
    this.playerCharacter = this.initCharacter(true);
    this.opponentCharacter = this.initCharacter(false);

    this.container = new PIXI.Container();

    this.container.addChild(this.playerCharacter);
    this.container.addChild(this.opponentCharacter);

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

  createAnimation(id, numberFrames, reverse = false) {
    let frames = [];

    if (!reverse) {
      for (let i = 1; i <= numberFrames; i++) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    } else {
      for (let i = numberFrames; i > 0; i--) {
        frames.push(PIXI.Texture.fromFrame(`${id}${i}.png`));
      }
    }

    const anim = new PIXI.extras.AnimatedSprite(frames);

    return anim;
  }

  initCharacter(isPlayer) {
    // TODO - add our own characters
    // for now just use scorpion data
    const data = characterData.characters[0];

    const character = new PIXI.Container();
    const actions = {};

    character.x = isPlayer ? 400 : 800;
    character.y = 155;
    character.scale.x = isPlayer ? 2 * data.scale : -data.scale * 0.75;
    character.scale.y = isPlayer ? 2 * data.scale : data.scale * 0.75;

    data.animations.forEach((animation) => {
      const sprite = this.createAnimation(
        `${data.name}-${animation.name}`,
        animation.frames
      );
      sprite.name = animation.name;
      sprite.animationSpeed = animation.animationSpeed;
      sprite.anchor.set(0.5, 0);

      if (animation.loop === true) {
        sprite.play();
      } else {
        sprite.loop = false;
        sprite.onComplete = () => {
          sprite.visible = false;
          actions["stance"].visible = true;
        };
      }

      if (!animation.visible) {
        sprite.visible = false;
      }

      actions[animation.name] = sprite;

      character.addChild(sprite);
    });

    character.actions = actions;
    character.active = data.active;
    character.isPlayer = isPlayer;

    return character;
  }

  // interactions (12 different scenarios at round end)
  doubleAttack(c1, c2) {
    this.attack(c1);
    this.attack(c2);
  }

  attackReload(c1, c2) {
    this.attack(c1);
    this.reload(c2);
  }

  doubleBlock(c1, c2) {
    this.block(c1);
    this.block(c2);
  }

  attackBlock(c1, c2) {
    this.attack(c1);
    this.block(c2);
  }

  blockReload(c1, c2) {
    this.block(c1);
    this.reload(c2);
  }

  doubleReload(c1, c2) {
    this.reload(c1);
    this.reload(c2);
  }

  criticalAttackReload(c1, c2) {
    this.criticalAttack(c1);
    this.reload(c2);
  }

  attackCriticalReload(c1, c2) {
    this.attack(c1);
    this.criticalReload(c2);
  }

  blockCriticalReload(c1, c2) {
    this.block(c1);
    this.criticalReload(c2);
  }

  reloadCriticalReload(c1, c2) {
    this.reload(c1);
    this.criticalReload(c2);
  }

  doubleCriticalReload(c1, c2) {
    this.criticalReload(c1);
    this.criticalReload(c2);
  }

  // Base Moves
  attack(character) {
    character.actions["stance"].visible = false;
    character.actions["punch"].visible = true;
    character.actions["punch"].gotoAndPlay(0);
  }

  block(character) {
    character.actions["punch"].gotoAndPlay(0);
  }

  reload(character) {
    character.actions["stance"].visible = false;
    character.actions["punch"].visible = true;
    character.actions["punch"].gotoAndPlay(0);
  }

  criticalReload(character) {
    character.actions["punch"].gotoAndPlay(0);
  }

  criticalAttack(character) {
    character.actions["punch"].gotoAndPlay(0);
  }

  die(character) {
    character.actions["punch"].gotoAndPlay(0);
  }

  win(character) {
    character.actions["punch"].gotoAndPlay(0);
  }

  // Side Effects - TODO
}

export default CharacterInteractions;
