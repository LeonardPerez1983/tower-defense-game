/**
 * useShieldRegeneration - Handles shield regeneration for Protoss units/buildings
 *
 * Shields regenerate after not taking damage for X seconds.
 * Regenerates at Y shields per second until max.
 */

import { useFrame } from "@react-three/fiber";
import { useGameState } from "../engine/GameState";

export function useShieldRegeneration() {
  const { state, actions } = useGameState();

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    const currentTime = performance.now();

    // Regenerate unit shields
    state.units.forEach(unit => {
      if (unit.shields < unit.stats.max_shields) {
        const timeSinceLastDamage = unit.lastShieldDamageTime
          ? (currentTime - unit.lastShieldDamageTime) / 1000  // Convert to seconds
          : Infinity;

        // Only regen if delay has passed
        if (timeSinceLastDamage >= unit.stats.shield_regen_delay) {
          const regenAmount = unit.stats.shield_regen_rate * delta;
          const newShields = Math.min(
            unit.stats.max_shields,
            unit.shields + regenAmount
          );

          // Update shields
          if (newShields > unit.shields) {
            actions.updateUnitShields(unit.id, newShields);
          }
        }
      }
    });

    // Regenerate building shields
    state.buildings.forEach(building => {
      if (building.shields < building.stats.max_shields) {
        const timeSinceLastDamage = building.lastShieldDamageTime
          ? (currentTime - building.lastShieldDamageTime) / 1000
          : Infinity;

        if (timeSinceLastDamage >= building.stats.shield_regen_delay) {
          const regenAmount = building.stats.shield_regen_rate * delta;
          const newShields = Math.min(
            building.stats.max_shields,
            building.shields + regenAmount
          );

          if (newShields > building.shields) {
            actions.updateBuildingShields(building.id, newShields);
          }
        }
      }
    });
  });
}
