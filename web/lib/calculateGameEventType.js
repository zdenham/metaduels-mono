import zeroHash from "./zeroHash";

/**
 * THE MOVES N = NONE, A = ATTACK, B = BLOCK, R = RELOAD
 */

function calculateEventFromStateTransition(oldState, newState) {
  if (
    oldState.currDuelerMove.moveHash === zeroHash &&
    newState.currDuelerMove.moveHash !== zeroHash
  ) {
    return gameEventTypes.duelerMoveSubmitted;
  }

  if (
    oldState.currDueleeMove.moveHash === zeroHash &&
    newState.currDueleeMove.moveHash !== zeroHash
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
    (oldState.currDueleeMove.moveHash !== zeroHash &&
      newState.currDuelerMove.moveHash) === zeroHash
  ) {
    return gameEventTypes.roundCompleted;
  }

  if (oldState.winner === zeroHash && newState.winner !== zeroHash) {
    return gameEventTypes.winnerDeclared;
  }

  return gameEventTypes.none;
}

export default calculateEventFromStateTransition;
