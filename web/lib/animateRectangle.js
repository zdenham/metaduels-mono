const animateRectangle = (
  graphics,
  startX,
  startY,
  startWidth,
  startHeight,
  endX,
  endY,
  endWidth,
  endHeight,
  numFrames = 45,
  delayFrames = 10
) => {
  return new Promise((resolve) => {
    let count = 0;
    let delayCount = 0;

    function update() {
      if (delayCount < delayFrames) {
        delayCount++;
        requestAnimationFrame(update);
        return;
      }

      const currentX = startX + (count / numFrames) * (endX - startX);
      const currentY = startY + (count / numFrames) * (endY - startY);
      const currentWidth =
        startWidth + (count / numFrames) * (endWidth - startWidth);
      const currentHeight =
        startHeight + (count / numFrames) * (endHeight - startHeight);

      if (count <= numFrames + delayFrames) {
        graphics.clear();
        graphics.drawRect(currentX, currentY, currentWidth, currentHeight);
        count++;
        requestAnimationFrame(update);
        return;
      }

      resolve();
    }

    requestAnimationFrame(update);
  });
};

export default animateRectangle;
