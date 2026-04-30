/**
 * useCPUAI - Simple CPU opponent logic
 *
 * Phase 2: Plays random card every 3 seconds if energy allows
 * Phase 3+: Will add smarter decision making
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";

export function useCPUAI() {
  const { state, actions } = useGameState();

  useEffect(() => {
    if (state.phase !== "playing") return;

    const interval = setInterval(() => {
      // Pick random card from CPU hand
      if (state.cpuHand.length === 0) return;

      const randomCard = state.cpuHand[Math.floor(Math.random() * state.cpuHand.length)];

      // Check if CPU has enough energy
      if (state.cpuEnergy >= randomCard.cost) {
        // Spawn at CPU's side (Z = -8, random X position)
        const randomX = (Math.random() - 0.5) * 4; // -2 to +2
        actions.playCard("cpu", randomCard.id, [randomX, 0, -8]);
      }
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [state.phase, state.cpuHand, state.cpuEnergy, actions]);
}
