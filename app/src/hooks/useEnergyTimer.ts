/**
 * useEnergyTimer - Auto-regenerate energy for both teams
 *
 * Adds energy every second based on energyRegenRate from config.
 * Only runs when game phase is "playing".
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";

export function useEnergyTimer() {
  const { state, actions } = useGameState();

  useEffect(() => {
    if (state.phase !== "playing") return;

    const interval = setInterval(() => {
      // Add energy to both teams
      actions.addEnergy("player", state.energyRegenRate);
      actions.addEnergy("cpu", state.energyRegenRate);
    }, 1000); // Every 1 second

    return () => clearInterval(interval);
  }, [state.phase, state.energyRegenRate, actions]);
}
