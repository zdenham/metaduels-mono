const animateFilterProperty = (filter, property, endVal, numFrames) => {
  return new Promise((resolve) => {
    let startVal = filter[property];
    let count = 0;

    function update() {
      const currentVal = startVal + (count / numFrames) * (endVal - startVal);
      if (count < numFrames) {
        filter[property] = currentVal;
        count++;
        requestAnimationFrame(update);
        return;
      }

      resolve();
    }

    requestAnimationFrame(update);
  });
};

export default animateFilterProperty;
