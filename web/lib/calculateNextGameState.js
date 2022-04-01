import zeroHash from "./zeroHash";

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
  // we only handle events that create the next state version
  const nextStateVersion = currGameState.stateVersion.add(1);
  if (!nextStateVersion.eq(eventData.stateVersion)) {
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
            ? { ...currGameState.currDuelerMove, moveHash: "0xFF" }
            : currGameState.currDuelerMove,
          currDueleeMove: isDuelerSender
            ? currGameState.currDueleeMove
            : { ...currGameState.currDueleeMove, moveHash: "0xFF" },
          stateVersion: nextStateVersion,
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
          stateVersion: nextStateVersion,
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

      const nextGameState = {
        ...currGameState,
        currDuelerMove: {
          moveHash: zeroHash,
          moveType: M.N,
        },
        currDueleeMove: {
          moveHash: zeroHash,
          moveType: M.N,
        },
        duelerState: {
          ammo: Math.min(currGameState.duelerState.ammo + duelerAmmoChange, 3),
          health: Math.max(
            currGameState.duelerState.health + duelerHealthChange,
            0
          ),
          shield: Math.min(
            currGameState.duelerState.shield + duelerShieldChange,
            2
          ),
        },
        dueleeState: {
          ammo: Math.min(currGameState.dueleeState.ammo + dueleeAmmoChange, 3),
          health: Math.max(
            0,
            currGameState.dueleeState.health + dueleeHealthChange
          ),
          shield: Math.min(
            currGameState.dueleeState.shield + dueleeShieldChange,
            2
          ),
        },
        stateVersion: nextStateVersion,
      };

      const playerStateUpdates = {
        duelerAmmoChange:
          currGameState.duelerState.ammo - nextGameState.duelerState.ammo,
        dueleeAmmoChange:
          currGameState.dueleeState.ammo - nextGameState.dueleeState.ammo,
        duelerShieldChange:
          currGameState.duelerState.shield - nextGameState.duelerState.shield,
        dueleeShieldChange:
          currGameState.dueleeState.shield - nextGameState.dueleeState.shield,
        duelerHealthChange:
          currGameState.duelerState.health - nextGameState.duelerState.health,
        dueleeHealthChange:
          currGameState.dueleeState.health - nextGameState.dueleeState.health,
      };

      return {
        nextGameState,
        eventType: gameEventTypes.roundCompleted,
        playerStateUpdates,
      };
    case "WinnerDeclared":
      const { winner } = eventData;
      return {
        nextGameState: {
          ...currGameState,
          stateVersion: nextStateVersion,
          winner,
        },
        eventType: gameEventTypes.winnerDeclared,
      };
  }
}

export default calculateNextGameState;
