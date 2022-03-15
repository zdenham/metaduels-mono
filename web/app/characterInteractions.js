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
  constructor() {
    this.duelerCharacter = this.initCharacter(true);
    this.dueleeCharacter = this.initCharacter(false);

    this.container = new PIXI.Container();

    this.container.addChild(this.duelerCharacter);
    this.container.addChild(this.dueleeCharacter);

    this.interactions = [
      // id, duelerMoveType, dueleeMoveType, duelerCritical, dueleeCritical, handler, flipped
      [0, M.A, M.A, C.A, C.A, this.doubleAttack, false],
      [1, M.A, M.R, C.N, C.N, this.attackReload, false],
      [2, M.R, M.A, C.N, C.N, this.attackReload, true],
      [3, M.B, M.B, C.A, C.A, this.doubleBlock, false],
      [4, M.A, M.B, C.A, C.A, this.attackBlock, false],
      [5, M.B, M.A, C.A, C.A, this.attackBlock, true],
      [6, M.R, M.B, C.N, C.N, this.blockReload, false],
      [7, M.B, M.R, C.N, C.N, this.blockReload, true],
      [8, M.R, M.R, C.N, C.N, this.doubleReload, false],
      [9, M.A, M.R, C.C, C.A, this.criticalAttackReload, false],
      [10, M.R, M.A, C.A, C.C, this.criticalAttackReload, true],
      [11, M.A, M.R, C.N, C.C, this.attackCriticalReload, false],
      [12, M.R, M.A, C.C, C.N, this.attackCriticalReload, true],
      [13, M.B, M.R, C.N, C.C, this.blockCriticalReload, false],
      [14, M.R, M.B, C.C, C.N, this.blockCriticalReload, true],
      [15, M.R, M.R, C.N, C.C, this.reloadCriticalReload, false],
      [16, M.R, M.R, C.C, C.N, this.reloadCriticalReload, true],
      [17, M.R, M.R, C.C, C.C, this.doubleCriticalReload, false],
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
    for (let interaction of this.interactions) {
      const [
        interactionId,
        interactionDuelerMove,
        interactionDueleeMove,
        interactionDuelerCrit,
        interactionDueleeCrit,
        interactionHandler,
        flipped,
      ] = interaction;

      const moveMatch =
        duelerMove === interactionDuelerMove &&
        dueleeMove === interactionDueleeMove;

      const duelerCritMatch = this.isCritMatch(
        isDuelerCrit,
        interactionDuelerCrit
      );

      const dueleeCritMatch = this.isCritMatch(
        isDueleeCrit,
        interactionDueleeCrit
      );

      if (moveMatch && duelerCritMatch && dueleeCritMatch) {
        const c1 = flipped ? this.dueleeCharacter : this.duelerCharacter;
        const c2 = flipped ? this.duelerCharacter : this.dueleeCharacter;

        interactionHandler(c1, c2);
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

  initCharacter(isDueler) {
    // TODO - add our own characters
    // for now just use scorpion data
    const data = characterData.characters[0];

    const character = new PIXI.Container();
    const actions = {};

    character.x = isDueler ? 400 : 800;
    character.y = 155;
    character.scale.x = isDueler ? data.scale : -data.scale;
    character.scale.y = data.scale;

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
      }

      if (!animation.visible) {
        sprite.visible = false;
      }

      actions[animation.name] = sprite;

      character.addChild(sprite);
    });

    character.actions = actions;
    character.active = data.active;
    character.isDueler = isDueler;

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
    character.actions["punch"].gotoAndPlay(0);
  }

  block(character) {
    character.actions["punch"].gotoAndPlay(0);
  }

  reload(character) {
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

  // Side Effects
}

export default CharacterInteractions;
