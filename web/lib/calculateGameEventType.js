/**
 * THE MOVES N = NONE, A = ATTACK, B = BLOCK, R = RELOAD
 */

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
