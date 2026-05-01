/**
 * useUnitCombat - Handles unit combat and attacking
 *
 * Units attack nearest enemy (units or buildings) within range.
 * Each unit has an attack cooldown to prevent instant kills.
 */

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useGameState } from "../engine/GameState";

export function useUnitCombat() {
  const { state, actions } = useGameState();

  // Track last attack time for each unit
  const lastAttackTime = useRef<Map<string, number>>(new Map());

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    const currentTime = performance.now();

    state.units.forEach(unit => {
      // Find all enemies (units and buildings)
      const enemyUnits = state.units.filter(u => u.team !== unit.team);
      const enemyBuildings = state.buildings.filter(b => b.team !== unit.team);

      // Find nearest enemy within attack range
      let nearestEnemy: { type: "unit" | "building"; id: string; distance: number } | null = null;

      // Check enemy units
      enemyUnits.forEach(enemy => {
        const dx = enemy.position[0] - unit.position[0];
        const dz = enemy.position[2] - unit.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= unit.stats.attack_range) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "unit", id: enemy.id, distance };
          }
        }
      });

      // Check enemy buildings
      enemyBuildings.forEach(building => {
        const dx = building.position[0] - unit.position[0];
        const dz = building.position[2] - unit.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= unit.stats.attack_range) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "building", id: building.id, distance };
          }
        }
      });

      // Attack if target found and cooldown elapsed
      if (nearestEnemy) {
        const lastAttack = lastAttackTime.current.get(unit.id) || 0;
        const attackCooldown = 1000; // 1 second between attacks (TODO: add to CSV as attack_speed)

        if (currentTime - lastAttack >= attackCooldown) {
          lastAttackTime.current.set(unit.id, currentTime);

          // Deal damage
          if (nearestEnemy.type === "unit") {
            actions.damageUnit(nearestEnemy.id, unit.stats.damage);
          } else {
            actions.damageBuilding(nearestEnemy.id, unit.stats.damage);
          }
        }
      }
    });

    // Clean up dead units (health <= 0)
    state.units.forEach(unit => {
      if (unit.health <= 0) {
        actions.removeUnit(unit.id);
        lastAttackTime.current.delete(unit.id);
      }
    });

    // Clean up destroyed buildings (health <= 0, except Command Centers which trigger game over)
    state.buildings.forEach(building => {
      if (building.health <= 0 && building.buildingType !== "command_center") {
        actions.removeBuilding(building.id);
      }
    });
  });
}
