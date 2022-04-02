import chainAnimations from "../lib/chainAnimations";
import shakeSprite from "../lib/shakeSprite";
import animateFilterProperty from "../lib/animateFilterProperty";
import * as filters from "pixi-filters";
import * as PIXI from "pixi.js";

class DuelerCharacter {
  constructor(characterName, isPlayer) {
    this.characterName = characterName;
    this.container = null;
    this.initCharacter(isPlayer);
    this.isPlayer = isPlayer;
  }

  initCharacter(isPlayer) {
    const textureArray = [];
    for (let i = 0; i < 4; i++) {
      textureArray.push(
        PIXI.Texture.from(
          `assets/images/characters/${this.characterName}/${i}.png`
        )
      );
    }

    // set up the container
    this.container = new PIXI.Container();
    this.container.filters = [new filters.AdjustmentFilter()];

    this.container.x = isPlayer ? 1500 : -300;
    this.container.y = isPlayer ? 350 : 200;
    this.container.scale.x = isPlayer ? 0.6 : -0.3;
    this.container.scale.y = isPlayer ? 0.6 : 0.3;

    // set up the character idle animation
    const idle = new PIXI.AnimatedSprite(textureArray);

    idle.anchor.set(0.5, 0.5);
    idle.animationSpeed = 0.08;
    idle.play();
    this.container.addChild(idle);

    // set up the "death wipe mask" which covers the character when they die
    const deathWipeMask = new PIXI.Graphics();
    deathWipeMask.width = idle.width;
    deathWipeMask.height = idle.height;

    deathWipeMask.drawRect(
      -idle.width / 2,
      -idle.height / 2,
      idle.width,
      idle.height
    );

    idle.mask = deathWipeMask;

    this.container.deathWipeMask = deathWipeMask;

    this.container.addChild(deathWipeMask);

    // idle.mask = deathWipeMask;
    // this.container.mask = deathWipeMask;

    this.container.isPlayer = isPlayer;
    this.container.idle = idle;

    this.introAnimation(isPlayer);
  }

  async introAnimation(isPlayer) {
    const animationChain = [
      {
        params: {
          x: isPlayer ? 400 : 800,
        },
        animation: {
          duration: 1800,
          ease: "easeOutQuart",
        },
      },
    ];

    await chainAnimations(this.container, animationChain);
  }

  // Base Moves
  async attack() {
    this.container.idle.stop();

    const dx = this.isPlayer ? 80 : -40;
    const dy = this.isPlayer ? -24 : 12;

    const animationChain = [
      // move forward
      {
        params: {
          x: this.container.x + dx,
          y: this.container.y + dy,
        },
        animation: {
          duration: 250,
          ease: "easeInOutBack",
        },
      },
      // return back
      {
        params: {
          x: this.container.x,
          y: this.container.y,
        },
        animation: {
          duration: 300,
          ease: "easeOutSine",
        },
      },
    ];

    await chainAnimations(this.container, animationChain);

    this.container.idle.play();
  }

  async block() {
    this.container.idle.stop();

    const dy = this.isPlayer ? -50 : -25;

    const animationChain = [
      // move up and scale to 1.1
      {
        params: {
          y: this.container.y + dy,
          scaleX: 1.1 * this.container.scale.x,
          scaleY: 1.1 * this.container.scale.y,
        },
        animation: {
          duration: 350,
          ease: "easeInOutBack",
        },
      },
      // return back and scale to 1
      {
        params: {
          y: this.container.y,
          scaleX: 1 * this.container.scale.x,
          scaleY: 1 * this.container.scale.y,
        },
        animation: {
          duration: 300,
          ease: "easeOutBounce",
        },
      },
    ];

    await chainAnimations(this.container, animationChain);

    this.container.idle.play();
  }

  async receiveHit() {
    this.container.idle.stop();

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
      {
        params: {
          alpha: 1,
        },
        animation: {
          duration: 250,
          ease: "easeInOutQuad",
        },
      },
    ];

    shakeSprite(this.container);
    await chainAnimations(this.container, animationChain);

    this.container.idle.play();
  }

  async reload() {
    // TODO
  }

  async criticalReload() {
    // TODO
  }

  async criticalAttack() {
    // TODO
  }

  async die() {
    const adjustmentFilter = this.container.filters[0];
    animateFilterProperty(adjustmentFilter, "saturation", 0.4, 50);
    animateFilterProperty(adjustmentFilter, "red", 1.2, 50);

    const animationChain = [
      {
        params: {
          alpha: 0.3,
        },
        animation: {
          reverse: true,
          duration: 250,
          ease: "easeInOutQuad",
          repeat: 5,
        },
      },
      {
        params: {
          alpha: 0.8,
        },
        animation: {
          duration: 250,
          ease: "easeInOutQuad",
        },
      },
    ];

    await chainAnimations(this.container, animationChain);
    this.container.idle.stop();
    await chainAnimations(this.container.deathWipeMask, [
      {
        params: {
          y: this.container.deathWipeMask.y + this.container.idle.height,
        },
        animation: {
          duration: 750,
          ease: "easeInOutQuad",
          wait: 300,
        },
      },
    ]);
  }

  async win() {
    // TODO
    const scaleFactor = this.isPlayer ? 1.5 : 2.5;

    const animationChain = [
      {
        params: {
          scaleX: scaleFactor * this.container.scale.x,
          scaleY: scaleFactor * this.container.scale.y,
        },
        animation: {
          duration: 700,
          ease: "easeOutQuart",
        },
      },
    ];

    await chainAnimations(this.container, animationChain);
  }
}

export default DuelerCharacter;
