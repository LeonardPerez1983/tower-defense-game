/**
 * useCreepRegeneration - Zerg units regenerate health on creep
 *
 * Zerg units standing on creep slowly regenerate +2 HP/sec.
 */

import { useFrame } from "@react-three/fiber";
import { useGameState } from "../engine/GameState";
import { hasCreepAt } from "./useCreepSystem";

const CREEP_REGEN_RATE = 2; // HP per second

export function useCreepRegeneration() {
  const { state, actions } = useGameState();

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    state.units.forEach(unit => {
      // Only Zerg units regenerate on creep
      if (unit.stats.faction !== "zerg") return;

      // Check if unit is on creep
      if (!hasCreepAt(state.creepTiles, unit.position)) return;

      // Check if unit is damaged
      if (unit.health >= unit.stats.health) return;

      // Regenerate health
      const regenAmount = CREEP_REGEN_RATE * delta;
      const newHealth = Math.min(unit.health + regenAmount, unit.stats.health);

      // Update unit health via damage action (negative damage = heal)
      const healAmount = newHealth - unit.health;
      if (healAmount > 0) {
        actions.damageUnit(unit.id, -healAmount);
      }
    });
  });
}
