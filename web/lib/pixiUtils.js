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

  sprite.x = (width - sprite.width) / 2 + width / 2;
  sprite.y = (height - sprite.height) / 2 + height / 2;
};

export const texture = function (path, extension = "png") {
  const asset =
    PIXI.Loader.shared.resources[`assets/images/${path}.${extension}`];
  if (!asset) {
    return null;
  }

  return asset.texture;
};

export const animation = function (path, extension = "png") {
  const asset =
    PIXI.Loader.shared.resources[`assets/images/${path}.${extension}`];
  if (!asset) {
    return null;
  }

  console.log("ASSET: ", asset);
  return asset.image.animation;
};

export const createSpriteAtPosition = (spritePath, x, y) => {
  const sprite = new PIXI.Sprite.from(texture(spritePath));
  sprite.position.x = x;
  sprite.position.y = y;

  return sprite;
};
