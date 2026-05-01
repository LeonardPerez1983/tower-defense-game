/**
 * useUnitMovement - Moves units toward enemy base using waypoint system
 *
 * Units follow waypoints: spawn → bridge entry → bridge exit → enemy base
 * This ensures clean pathfinding through bridges.
 */

import { useFrame } from "@react-three/fiber";
import { useGameState } from "../engine/GameState";

// Arena layout constants
const RIVER_Z_MIN = -1;
const RIVER_Z_MAX = 1;
const LEFT_BRIDGE_X = -2.5;
const RIGHT_BRIDGE_X = 2.5;
const BRIDGE_APPROACH_OFFSET = 0.5;

/**
 * Generate waypoints for a unit to reach the enemy base via bridge
 */
function generateWaypoints(
  startPos: [number, number, number],
  endPos: [number, number, number],
  team: "player" | "cpu"
): [number, number, number][] {
  const waypoints: [number, number, number][] = [];

  // Determine which bridge to use (closest to current X position)
  const distToLeft = Math.abs(startPos[0] - LEFT_BRIDGE_X);
  const distToRight = Math.abs(startPos[0] - RIGHT_BRIDGE_X);
  const bridgeX = distToLeft < distToRight ? LEFT_BRIDGE_X : RIGHT_BRIDGE_X;

  // Check if unit needs to cross river
  const startZ = startPos[2];
  const endZ = endPos[2];
  const needsCrossing = (startZ > RIVER_Z_MAX && endZ < RIVER_Z_MIN) ||
                       (startZ < RIVER_Z_MIN && endZ > RIVER_Z_MAX);

  if (needsCrossing) {
    // Waypoint 1: Approach bridge (just before entering)
    const approachZ = team === "player"
      ? RIVER_Z_MAX + BRIDGE_APPROACH_OFFSET
      : RIVER_Z_MIN - BRIDGE_APPROACH_OFFSET;
    waypoints.push([bridgeX, 0, approachZ]);

    // Waypoint 2: Exit bridge (just after leaving)
    const exitZ = team === "player"
      ? RIVER_Z_MIN - BRIDGE_APPROACH_OFFSET
      : RIVER_Z_MAX + BRIDGE_APPROACH_OFFSET;
    waypoints.push([bridgeX, 0, exitZ]);
  }

  // Final waypoint: Enemy base
  waypoints.push(endPos);

  return waypoints;
}

export function useUnitMovement() {
  const { state, actions } = useGameState();

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    // Find enemy bases
    const playerBase = state.buildings.find(b => b.team === "player" && b.buildingType === "command_center");
    const cpuBase = state.buildings.find(b => b.team === "cpu" && b.buildingType === "command_center");

    if (!playerBase || !cpuBase) return;

    // Update each unit's position
    state.units.forEach(unit => {
      // Initialize waypoints if not set
      if (!unit.waypoints || unit.currentWaypointIndex === undefined) {
        const target = unit.team === "player" ? cpuBase : playerBase;
        const waypoints = generateWaypoints(unit.position, target.position, unit.team);

        // Update unit with waypoints (we'll need a new action)
        actions.setUnitWaypoints(unit.id, waypoints, 0);
        return;
      }

      // Check if unit is in combat (enemy in attack range) - if so, stop moving
      const enemyUnits = state.units.filter(u => u.team !== unit.team);
      const enemyBuildings = state.buildings.filter(b => b.team !== unit.team);

      let hasEnemyInRange = false;

      // Check for nearby enemy units
      for (const enemy of enemyUnits) {
        const dx = enemy.position[0] - unit.position[0];
        const dz = enemy.position[2] - unit.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);
        if (distance <= unit.stats.attack_range) {
          hasEnemyInRange = true;
          break;
        }
      }

      // Check for nearby enemy buildings
      if (!hasEnemyInRange) {
        for (const building of enemyBuildings) {
          const dx = building.position[0] - unit.position[0];
          const dz = building.position[2] - unit.position[2];
          const distance = Math.sqrt(dx * dx + dz * dz);
          if (distance <= unit.stats.attack_range) {
            hasEnemyInRange = true;
            break;
          }
        }
      }

      // If in combat, don't move
      if (hasEnemyInRange) return;

      // Get current target waypoint
      const currentWaypoint = unit.waypoints[unit.currentWaypointIndex];
      if (!currentWaypoint) return; // No more waypoints

      // Calculate direction to current waypoint
      const dx = currentWaypoint[0] - unit.position[0];
      const dz = currentWaypoint[2] - unit.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Check if we've reached this waypoint
      if (distance < 0.3) {
        // Move to next waypoint
        const nextIndex = unit.currentWaypointIndex + 1;
        if (nextIndex < unit.waypoints.length) {
          actions.setUnitWaypoints(unit.id, unit.waypoints, nextIndex);
        }
        return;
      }

      // Move toward current waypoint
      const moveSpeed = unit.stats.speed * delta;
      const moveX = (dx / distance) * moveSpeed;
      const moveZ = (dz / distance) * moveSpeed;

      const newPosition: [number, number, number] = [
        unit.position[0] + moveX,
        unit.position[1],
        unit.position[2] + moveZ,
      ];

      actions.updateUnitPosition(unit.id, newPosition);
    });
  });
}
