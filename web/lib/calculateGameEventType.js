/**
 * THE MOVES N = NONE, A = ATTACK, B = BLOCK, R = RELOAD
 */
const M = {
  N: 0,
  A: 1,
  B: 2,
  R: 3,
};

export const gameEventTypes = {
  duelerMoveSubmitted: 0,
  dueleeMoveSubmitted: 1,
  duelerMoveRevealed: 2,
  dueleeMoveRevealed: 3,
  roundCompleted: 4,
  winnerDeclared: 5,
  none: 6,
};

function calculateEventFromStateTransition(oldState, newState) {
  if (
    oldState.currDuelerMove.signature === "0x" &&
    newState.currDuelerMove.signature !== "0x"
  ) {
    return gameEventTypes.duelerMoveSubmitted;
  }

  if (
    oldState.currDueleeMove.signature === "0x" &&
    newState.currDueleeMove.signature !== "0x"
  ) {
    return gameEventTypes.dueleeMoveSubmitted;
  }

  if (
    oldState.currDuelerMove.moveType === M.N &&
    newState.currDuelerMove.moveType !== M.N
  ) {
    return gameEventTypes.duelerMoveRevealed;
  }

  if (
    oldState.currDueleeMove.moveType === M.N &&
    newState.currDueleeMove.moveType !== M.N
  ) {
    return gameEventTypes.dueleeMoveRevealed;
  }

  if (
    (oldState.currDueleeMove.signature !== "0x" &&
      newState.currDuelerMove.signature) === "0x"
  ) {
    return gameEventTypes.roundCompleted;
  }

  if (oldState.winner === "0x" && newState.winner !== "0x") {
    return gameEventTypes.winnerDeclared;
  }

  return gameEventTypes.none;
}

export default calculateEventFromStateTransition;
