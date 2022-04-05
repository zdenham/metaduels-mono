import { sound } from "@pixi/sound";
import delay from "./delay";

sound.add("punch", "assets/sounds/punchSound.mp3");

const _waitTilComplete = (path) => {
  return new Promise((resolve) => {
    sound.play(path, resolve);
  });
};

const playSound = async (path, delayMs = 0) => {
  await delay(delayMs);
  _waitTilComplete(path);
};

export default playSound;
