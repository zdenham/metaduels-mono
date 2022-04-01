/**
 * Animation Item
 * type: syncronized_animation | easing | sound | filter
 * handle: SynchronizedAnimation | EasingOptions | PixiSound | filter
 * options: {
 *   startFrame?: number;
 *   startTime?: number;
 *   startAfter
 * }
 */

class SynchronizedAnimation {
  constructor(animationList) {
    this.animationList = animationList;
    this.playFrameCounter = 0;
    this.playStartTimestamp = 0;

    this.init();
  }

  init() {}

  update() {}
}

export default SynchronizedAnimation;
