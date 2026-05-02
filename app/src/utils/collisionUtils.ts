/**
 * collisionUtils - Collision detection and avoidance helpers
 */

import { Unit, PlacedBuilding } from "../engine/GameState";
import { UNIT_VISUALS, BUILDING_VISUALS } from "../game/visuals/starcraftVisualConfig";

/**
 * Get collision radius for a unit
 */
export function getUnitRadius(unit: Unit): number {
  // Map unit type to visual config ID
  const visualId = mapUnitTypeToVisualId(unit.unitType);
  const visual = UNIT_VISUALS[visualId];
  return visual?.collisionRadius || 0.3; // Use collisionRadius instead of visual radius
}

/**
 * Get collision radius for a building
 */
export function getBuildingRadius(building: PlacedBuilding): number {
  // Map building type to visual config ID
  const visualId = mapBuildingTypeToVisualId(building.buildingType);
  const visual = BUILDING_VISUALS[visualId];
  return visual?.collisionRadius || 1.0; // Use collisionRadius instead of visual radius
}

/**
 * Map unit type from CSV to visual config ID
 */
function mapUnitTypeToVisualId(unitType: string): string {
  const mapping: Record<string, string> = {
    "marine_unit": "terran_marine",
    "firebat_unit": "terran_firebat",
    "worker_unit": "terran_marine", // Use marine model for SCV
    "probe_unit": "protoss_zealot", // Use zealot model for Probe
    "zealot_unit": "protoss_zealot",
    "dragoon_unit": "protoss_dragoon",
    "drone_unit": "zerg_zergling", // Use zergling model for Drone
    "zergling_unit": "zerg_zergling",
    "hydralisk_unit": "zerg_hydralisk",
  };
  return mapping[unitType] || "terran_marine";
}

/**
 * Map building type from CSV to visual config ID
 */
function mapBuildingTypeToVisualId(buildingType: string): string {
  const mapping: Record<string, string> = {
    "command_center": "terran_command_center",
    "barracks": "terran_barracks",
    "bunker": "terran_bunker",
    "protoss_nexus": "protoss_nexus",
    "protoss_gateway": "protoss_gateway",
    "protoss_photon_cannon": "protoss_photon_cannon",
    "zerg_hatchery": "zerg_hatchery",
    "zerg_spawning_pool": "zerg_spawning_pool",
    "zerg_creep_colony": "zerg_creep_colony",
    "zerg_sunken_colony": "zerg_sunken_colony",
  };
  return mapping[buildingType] || "terran_command_center";
}

/**
 * Check if two circles collide
 */
export function circlesCollide(
  pos1: [number, number, number],
  radius1: number,
  pos2: [number, number, number],
  radius2: number
): boolean {
  const dx = pos2[0] - pos1[0];
  const dz = pos2[2] - pos1[2];
  const distanceSquared = dx * dx + dz * dz;
  const minDistance = radius1 + radius2;
  return distanceSquared < minDistance * minDistance;
}

/**
 * Check if a unit would collide with anything at a given position
 */
export function wouldCollide(
  unit: Unit,
  newPosition: [number, number, number],
  allUnits: Unit[],
  allBuildings: PlacedBuilding[]
): boolean {
  const unitRadius = getUnitRadius(unit);

  // Check collision with other units (skip self and friendly units very close - they'll separate)
  for (const other of allUnits) {
    if (other.id === unit.id) continue;

    // Allow friendly units to overlap slightly to prevent spawn-stacking issues
    const otherRadius = getUnitRadius(other);
    const isFriendly = other.team === unit.team;
    const minRadius = isFriendly ? (unitRadius + otherRadius) * 0.5 : unitRadius + otherRadius;

    if (circlesCollide(newPosition, minRadius * 0.5, other.position, minRadius * 0.5)) {
      return true;
    }
  }

  // Check collision with buildings
  for (const building of allBuildings) {
    const buildingRadius = getBuildingRadius(building);
    if (circlesCollide(newPosition, unitRadius, building.position, buildingRadius)) {
      return true;
    }
  }

  return false;
}

/**
 * Try to find an alternate direction to avoid collision
 * Returns adjusted movement vector or null if can't avoid
 */
export function findAvoidanceVector(
  unit: Unit,
  desiredDx: number,
  desiredDz: number,
  moveSpeed: number,
  allUnits: Unit[],
  allBuildings: PlacedBuilding[]
): { dx: number; dz: number } | null {
  const currentPos = unit.position;
  const unitRadius = getUnitRadius(unit);

  // Try steering angles: -45°, -90°, 45°, 90°, 180°
  const angles = [-Math.PI / 4, -Math.PI / 2, Math.PI / 4, Math.PI / 2, Math.PI];

  for (const angle of angles) {
    // Rotate desired direction by angle
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const newDx = desiredDx * cos - desiredDz * sin;
    const newDz = desiredDx * sin + desiredDz * cos;

    // Normalize
    const length = Math.sqrt(newDx * newDx + newDz * newDz);
    if (length === 0) continue;

    const normalizedDx = (newDx / length) * moveSpeed;
    const normalizedDz = (newDz / length) * moveSpeed;

    const testPos: [number, number, number] = [
      currentPos[0] + normalizedDx,
      currentPos[1],
      currentPos[2] + normalizedDz,
    ];

    // Check if this direction is clear
    if (!wouldCollide(unit, testPos, allUnits, allBuildings)) {
      return { dx: normalizedDx, dz: normalizedDz };
    }
  }

  // No clear path found
  return null;
}
