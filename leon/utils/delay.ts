const delay = (timeMs = 100) =>
  new Promise((resolve) => setTimeout(resolve, timeMs));

export default delay;
