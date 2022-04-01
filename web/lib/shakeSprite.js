function shakeSprite(
  sprite,
  numberOfShakes = 50,
  magnitude = 16,
  angular = false
) {
  return new Promise((resolve) => {
    //A counter to count the number of shakes
    let counter = 1;

    //Capture the sprite's position and angle so you can
    //restore them after the shaking has finished
    let startX = sprite.x;
    let startY = sprite.y;
    let startAngle = sprite.rotation;

    //Divide the magnitude into 10 units so that you can
    //reduce the amount of shake by 10 percent each frame
    let magnitudeUnit = magnitude / numberOfShakes;

    //The `randomInt` helper function
    let randomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const animationFrameCallback = () => {
      if (angular) {
        angularShake();
      } else {
        upAndDownShake();
      }
    };

    requestAnimationFrame(animationFrameCallback);

    //The `upAndDownShake` function
    function upAndDownShake() {
      //Shake the sprite while the `counter` is less than
      //the `numberOfShakes`
      if (counter < numberOfShakes) {
        //Reset the sprite's position at the start of each shake
        sprite.x = startX;
        sprite.y = startY;

        //Reduce the magnitude
        magnitude -= magnitudeUnit;

        //Randomly change the sprite's position
        sprite.x += randomInt(-magnitude, magnitude);
        sprite.y += randomInt(-magnitude, magnitude);

        //Add 1 to the counter
        counter += 1;
        requestAnimationFrame(animationFrameCallback);
      }

      //When the shaking is finished, restore the sprite to its original
      //position and remove it from the `shakingSprites` array
      if (counter >= numberOfShakes) {
        sprite.x = startX;
        sprite.y = startY;
        resolve();
      }
    }

    //The `angularShake` function
    //First set the initial tilt angle to the right (+1)
    let tiltAngle = 1;

    function angularShake() {
      if (counter < numberOfShakes) {
        //Reset the sprite's rotation
        sprite.rotation = startAngle;

        //Reduce the magnitude
        magnitude -= magnitudeUnit;

        //Rotate the sprite left or right, depending on the direction,
        //by an amount in radians that matches the magnitude
        sprite.rotation = magnitude * tiltAngle;
        counter += 1;

        //Reverse the tilt angle so that the sprite is tilted
        //in the opposite direction for the next shake
        tiltAngle *= -1;
        requestAnimationFrame(animationFrameCallback);
      }

      //When the shaking is finished, reset the sprite's angle and
      //remove it from the `shakingSprites` array
      if (counter >= numberOfShakes) {
        sprite.rotation = startAngle;
        resolve();
      }
    }
  });
}

export default shakeSprite;
