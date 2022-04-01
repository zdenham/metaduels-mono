import { ease } from "pixi-ease";

const runAnimation = (container, params, animation) => {
  return new Promise((resolve) => {
    const anim = ease.add(container, params, animation);

    anim.once("complete", resolve);
  });
};

const chainAnimations = async (sprite, animationsArr) => {
  for (const opts of animationsArr) {
    await runAnimation(sprite, opts.params, opts.animation);
  }
};

export default chainAnimations;
