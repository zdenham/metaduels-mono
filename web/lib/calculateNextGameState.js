const M = {
  N: 0,
  A: 1,
  B: 2,
  R: 3,
};

const gameEventTypes = {
  duelerMoveSubmitted: "duelerMoveSubmitted",
  dueleeMoveSubmitted: "dueleeMoveSubmitted",
  duelerMoveRevealed: "duelerMoveRevealed",
  dueleeMoveRevealed: "dueleeMoveRevealed",
  roundCompleted: "roundCompleted",
  winnerDeclared: "winnerDeclared",
  none: "none",
};

function calculateHealthChange(
  duelerMove,
  dueleeMove,
  isDuelerMoveCritical,
  isDueleeMoveCritical
) {
  if (duelerMove === M.A && dueleeMove === M.R) {
    return {
      duelerHealthChange: 0,
      dueleeHealthChange: isDuelerMoveCritical ? -2 : -1,
    };
  }

  if (dueleeMove === M.A && duelerMove === M.R) {
    return {
      duelerHealthChange: isDueleeMoveCritical ? -2 : -1,
      dueleeHealthChange: 0,
    };
  }

  return {
    duelerHealthChange: 0,
    dueleeHealthChange: 0,
  };
}

function calculateAmmoChange(
  duelerMove,
  dueleeMove,
  isDuelerMoveCritical,
  isDueleeMoveCritical
) {
  const duelerReload = duelerMove === M.R ? (isDuelerMoveCritical ? 2 : 1) : 0;

  const dueleeReload = dueleeMove === M.R ? (isDueleeMoveCritical ? 2 : 1) : 0;

  const duelerAmmoUsage = duelerMove === M.A ? 1 : 0;
  const dueleeAmmoUsage = dueleeMove === M.A ? 1 : 0;

  return {
    duelerAmmoChange: duelerReload - duelerAmmoUsage,
    dueleeAmmoChange: dueleeReload - dueleeAmmoUsage,
  };
}

function calculateShieldChange(duelerMove, dueleeMove) {
  const duelerShieldChange = duelerMove === M.B ? -2 : 1;
  const dueleeShieldChange = dueleeMove === M.B ? -2 : 1;

  return { duelerShieldChange, dueleeShieldChange };
}

function calculateNextGameState(currGameState, contractEventType, eventData) {
  // event already handled - skip handling
  if (eventData.stateVersion <= currGameState.stateVersion) {
    return { nextGameState: currGameState, eventType: gameEventTypes.none };
  }

  switch (contractEventType) {
    case "MoveSubmitted":
      const { signer } = eventData;
      const isDuelerSender = signer === currGameState.duelerAddress;
      return {
        nextGameState: {
          ...currGameState,
          currDuelerMove: isDuelerSender
            ? { ...currGameState.currDuelerMove, signature: "0xFF" }
            : currGameState.currDuelerMove,
          currDueleeMove: isDuelerSender
            ? currGameState.currDueleeMove
            : { ...currGameState.currDueleeMove, signature: "0xFF" },
        },
        eventType: isDuelerSender
          ? gameEventTypes.duelerMoveSubmitted
          : gameEventTypes.dueleeMoveSubmitted,
      };
    case "MoveRevealed":
      const { revealer } = eventData;
      const isDuelerRevealer = revealer === currGameState.duelerAddress;
      return {
        nextGameState: {
          ...currGameState,
          currDuelerMove: isDuelerRevealer
            ? { ...currGameState.currDuelerMove, moveType: M.A }
            : currGameState.currDuelerMove,
          currDueleeMove: isDuelerRevealer
            ? currGameState.currDueleeMove
            : { ...currGameState.currDueleeMove, moveType: M.A },
        },
        eventType: isDuelerRevealer
          ? gameEventTypes.duelerMoveRevealed
          : gameEventTypes.dueleeMoveRevealed,
      };
    case "RoundCompleted":
      const {
        duelerMove,
        dueleeMove,
        isDuelerMoveCritical,
        isDueleeMoveCritical,
      } = eventData;

      const { duelerHealthChange, dueleeHealthChange } = calculateHealthChange(
        duelerMove,
        dueleeMove,
        isDuelerMoveCritical,
        isDueleeMoveCritical
      );

      const { duelerAmmoChange, dueleeAmmoChange } = calculateAmmoChange(
        duelerMove,
        dueleeMove,
        isDuelerMoveCritical,
        isDueleeMoveCritical
      );

      const { duelerShieldChange, dueleeShieldChange } = calculateShieldChange(
        duelerMove,
        dueleeMove
      );

      return {
        nextGameState: {
          ...currGameState,
          currDuelerMove: {
            signature: "0x",
            moveType: M.N,
          },
          currDueleeMove: {
            signature: "0x",
            moveType: M.N,
          },
          duelerState: {
            ammo: currGameState.duelerState.ammo + duelerAmmoChange,
            health: currGameState.duelerState.health + duelerHealthChange,
            shield: currGameState.duelerState.shield + duelerShieldChange,
          },
          dueleeState: {
            ammo: currGameState.dueleeState.ammo + dueleeAmmoChange,
            health: currGameState.dueleeState.health + dueleeHealthChange,
            shield: currGameState.dueleeState.shield + dueleeShieldChange,
          },
        },
        eventType: gameEventTypes.roundCompleted,
      };
    case "WinnerDeclared":
      const { winner } = eventData;
      return {
        nextGameState: {
          ...currGameState,
          winner,
        },
        eventType: gameEventTypes.winnerDeclared,
      };
  }
}

export default calculateNextGameState;
