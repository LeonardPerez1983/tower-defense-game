/**
 * useEnergyTimer - Auto-regenerate energy for both teams
 *
 * Adds energy every second based on energyRegenRate + worker bonuses.
 * Formula: baseRegenRate + (workerCount * energyPerWorker)
 * Only runs when game phase is "playing".
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";

export function useEnergyTimer() {
  const { state, actions } = useGameState();

  useEffect(() => {
    if (state.phase !== "playing") return;

    const interval = setInterval(() => {
      // Calculate energy regen including worker bonuses
      const playerRegen = state.energyRegenRate + (state.playerWorkerCount * state.energyPerWorker);
      const cpuRegen = state.energyRegenRate + (state.cpuWorkerCount * state.energyPerWorker);

      // Add energy to both teams
      actions.addEnergy("player", playerRegen);
      actions.addEnergy("cpu", cpuRegen);
    }, 1000); // Every 1 second

    return () => clearInterval(interval);
  }, [
    state.phase,
    state.energyRegenRate,
    state.energyPerWorker,
    state.playerWorkerCount,
    state.cpuWorkerCount,
    actions
  ]);
}
