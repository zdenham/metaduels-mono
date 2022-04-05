// Move Type
const M = {
  N: 0,
  A: 1,
  B: 2,
  R: 3,
};

class DevKeyBindings {
  constructor(characterInteractions) {
    this.characterInteractions = characterInteractions;

    // playerMove, opponentMove
    // playerCritical, opponentCritical
    const interactions = [
      [M.A, M.A, false, false, "a"],
      [M.A, M.R, false, false, "b"],
      [M.R, M.A, false, false, "c"],
      [M.B, M.B, false, false, "d"],
      [M.A, M.B, false, false, "e"],
      [M.B, M.A, false, false, "f"],
      [M.B, M.R, false, false, "g"],
      [M.R, M.B, false, false, "h"],
      [M.R, M.R, false, false, "i"],
      [M.A, M.R, true, false, "j"],
      [M.R, M.A, false, true, "k"],
      [M.A, M.R, false, true, "l"],
      [M.R, M.A, true, false, "m"],
      [M.B, M.R, false, true, "n"],
      [M.R, M.B, true, false, "o"],
      [M.R, M.R, false, true, "p"],
      [M.R, M.R, true, false, "q"],
      [M.R, M.R, true, true, "r"],
    ];

    window.addEventListener("keydown", (e) => {
      for (let interaction of interactions) {
        const key = interaction[4];
        if (key === e.key) {
          this.characterInteractions.onRoundCompleted(
            interaction[0],
            interaction[1],
            interaction[2],
            interaction[3]
          );
        }
      }
    });
  }
}

export default DevKeyBindings;
