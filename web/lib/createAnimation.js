function createAnimation(idOrPath, numberFrames, reverse = false) {
  let frames = [];

  for (let i = 1; i <= numberFrames; i++) {
    frames.push(PIXI.Texture.from(`${idOrPath}${i}.png`));
  }

  const anim = new PIXI.AnimatedSprite(frames);

  return anim;
}

export default createAnimation;
