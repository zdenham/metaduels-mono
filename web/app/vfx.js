import chainAnimations from "../lib/chainAnimations";
import createAnimation from "../lib/createAnimation";

class VFX {
  constructor(parent, background) {
    this.parentContainer = parent;
    this.background = background;

    this.container = new PIXI.Container();
    this.container.width = 1200;
    this.container.height = 400;

    this.actionLines = null;

    this.init();
  }

  init() {
    this.actionLines = createAnimation("Action Lines 10", 11);

    this.actionLines.width = 1200;
    this.actionLines.height = 400;
    this.actionLines.scale.x = 1.05;
    this.actionLines.x = -20;
    this.actionLines.alpha = 0;

    this.container.addChild(this.actionLines);
  }

  showActionLines() {
    this.actionLines.play();
    this.actionLines.alpha = 1;
  }

  hideActionLines() {
    this.actionLines.alpha = 0;
    this.actionLines.stop();
  }

  async bulgeBackground() {
    const ogScaleX = this.background.scale.x;
    const ogScaleY = this.background.scale.y;

    const animationChain = [
      // move up and scale to 1.1
      {
        params: {
          scaleX: ogScaleX * 1.1,
          scaleY: ogScaleY * 1.1,
        },
        animation: {
          duration: 100,
          ease: "easeOutExpo",
        },
      },
      // return back and scale to 1
      {
        params: {
          scaleX: ogScaleX,
          scaleY: ogScaleY,
        },
        animation: {
          duration: 300,
          ease: "linear",
        },
      },
    ];

    await chainAnimations(this.background, animationChain);
  }

  async zoomBackgroundWin(playerWon) {
    const scaleFactor = 1.5;

    const animationChain = [
      {
        params: {
          scaleX: scaleFactor * this.background.scale.x,
          scaleY: scaleFactor * this.background.scale.y,
        },
        animation: {
          duration: 700,
          ease: "easeOutQuart",
        },
      },
    ];

    await chainAnimations(this.background, animationChain);
  }
}

export default VFX;
