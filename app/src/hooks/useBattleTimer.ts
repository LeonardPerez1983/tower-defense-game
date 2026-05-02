/**
 * useBattleTimer - Enforces 3-minute battle limit and determines winner
 */

import { useFrame } from "@react-three/fiber";
import { useGameState } from "../engine/GameState";

const BATTLE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export function useBattleTimer() {
  const { state, actions } = useGameState();

  useFrame(() => {
    // Don't override game over if already set by combat
    if (state.phase !== "playing") return;
    if (state.winner !== null) return; // Already have a winner, don't override
    if (state.paused) return;
    if (!state.battleStartTime) return;

    const elapsed = performance.now() - state.battleStartTime;

    // Check if 3 minutes elapsed
    if (elapsed >= BATTLE_DURATION_MS) {
      // Determine winner based on criteria
      let winner: "player" | "cpu" | "tie" = "tie";

      // Criterion 1: Most damage to enemy central structure
      if (state.playerCentralStructureDamageTaken < state.cpuCentralStructureDamageTaken) {
        winner = "player";
      } else if (state.cpuCentralStructureDamageTaken < state.playerCentralStructureDamageTaken) {
        winner = "cpu";
      } else {
        // Criterion 2: Most total damage dealt
        if (state.playerTotalDamageDealt > state.cpuTotalDamageDealt) {
          winner = "player";
        } else if (state.cpuTotalDamageDealt > state.playerTotalDamageDealt) {
          winner = "cpu";
        } else {
          // Criterion 3: Most units created
          if (state.playerUnitsCreated > state.cpuUnitsCreated) {
            winner = "player";
          } else if (state.cpuUnitsCreated > state.playerUnitsCreated) {
            winner = "cpu";
          }
          // else: true tie, winner stays "tie"
        }
      }

      // Set winner and end game (timeout victory)
      actions.setWinner(winner, "timeout");
      actions.setPhase("gameover");

      console.log(`[Battle Timer] 3 minutes elapsed. Winner: ${winner}`);
      console.log(`  Player central damage: ${state.playerCentralStructureDamageTaken}`);
      console.log(`  CPU central damage: ${state.cpuCentralStructureDamageTaken}`);
      console.log(`  Player total damage: ${state.playerTotalDamageDealt}`);
      console.log(`  CPU total damage: ${state.cpuTotalDamageDealt}`);
      console.log(`  Player units created: ${state.playerUnitsCreated}`);
      console.log(`  CPU units created: ${state.cpuUnitsCreated}`);
    }
  });
}

/**
 * Get remaining time in the battle
 */
export function useRemainingTime(): number {
  const { state } = useGameState();

  if (state.phase !== "playing" || !state.battleStartTime) {
    return BATTLE_DURATION_MS;
  }

  const elapsed = performance.now() - state.battleStartTime;
  const remaining = Math.max(0, BATTLE_DURATION_MS - elapsed);

  return remaining;
}
