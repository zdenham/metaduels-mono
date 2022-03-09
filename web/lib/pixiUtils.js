import * as PIXI from "pixi.js";

export const setBGScale = function (sprite, width = 1200, height = 400) {
  const winAspectRatio = width / height;
  const bgAspectRatio = sprite.texture.width / sprite.texture.height;
  let ratio;

  if (winAspectRatio > bgAspectRatio) {
    ratio = width / sprite.texture.width;
  } else {
    ratio = height / sprite.texture.height;
  }

  sprite.scale.x = ratio;
  sprite.scale.y = ratio;

  sprite.x = (width - sprite.width) / 2;
  sprite.y = (height - sprite.height) / 2;
};

export const texture = function (path) {
  return PIXI.loader.resources[`assets/images/${path}.png`].texture;
};
