/**
 * useCreepSystem - Manages Zerg creep spreading
 *
 * Hatcheries generate creep in a radius around them.
 * Zerg buildings (except Hatchery) require creep to be placed.
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";

const CREEP_RADIUS = 2.5; // Radius in game units (reduced from 4.0)

// Arena boundaries (matching Arena.tsx layout)
const PLATFORM_X_MIN = -5;
const PLATFORM_X_MAX = 5;
const PLAYER_PLATFORM_Z_MIN = 1;
const PLAYER_PLATFORM_Z_MAX = 9;
const CPU_PLATFORM_Z_MIN = -9;
const CPU_PLATFORM_Z_MAX = -1;
const BRIDGE_LEFT_X_MIN = -3.5;
const BRIDGE_LEFT_X_MAX = -1.5;
const BRIDGE_RIGHT_X_MIN = 1.5;
const BRIDGE_RIGHT_X_MAX = 3.5;
const BRIDGE_Z_MIN = -1;
const BRIDGE_Z_MAX = 1;

/**
 * Check if a position is on a valid platform (not in space)
 */
function isValidCreepPosition(x: number, z: number): boolean {
  // Check X bounds (all platforms)
  if (x < PLATFORM_X_MIN || x > PLATFORM_X_MAX) return false;

  // Player platform: Z from 1 to 9 (full platform)
  if (z >= PLAYER_PLATFORM_Z_MIN && z <= PLAYER_PLATFORM_Z_MAX) {
    return true;
  }

  // CPU platform: Z from -9 to -1 (full platform)
  if (z >= CPU_PLATFORM_Z_MIN && z <= CPU_PLATFORM_Z_MAX) {
    return true;
  }

  // Gap area (between platforms): only valid if on a bridge
  // Gap is strictly between -1 and 1 (exclusive of platform edges)
  if (z > CPU_PLATFORM_Z_MAX && z < PLAYER_PLATFORM_Z_MIN) {
    // In gap - check if on a bridge
    const onLeftBridge = x >= BRIDGE_LEFT_X_MIN && x <= BRIDGE_LEFT_X_MAX;
    const onRightBridge = x >= BRIDGE_RIGHT_X_MIN && x <= BRIDGE_RIGHT_X_MAX;
    return onLeftBridge || onRightBridge;
  }

  // Outside all valid areas
  return false;
}

export function useCreepSystem() {
  const { state, actions } = useGameState();

  useEffect(() => {
    if (state.phase !== "playing") return;

    // Find all Hatcheries and Creep Colonies (both expand creep)
    const creepBuildings = state.buildings.filter(
      b => b.buildingType === "zerg_hatchery" ||
           b.buildingType === "creep_colony" ||
           b.buildingType === "sunken_colony" // Sunken colonies also maintain creep
    );

    // Generate creep tiles from all creep-generating buildings
    const newCreepTiles = new Set<string>();

    creepBuildings.forEach(building => {
      const [bx, , bz] = building.position;

      // Generate creep in a radius around the building
      for (let x = Math.floor(bx - CREEP_RADIUS); x <= Math.ceil(bx + CREEP_RADIUS); x++) {
        for (let z = Math.floor(bz - CREEP_RADIUS); z <= Math.ceil(bz + CREEP_RADIUS); z++) {
          const distance = Math.sqrt((x - bx) ** 2 + (z - bz) ** 2);

          // Check if within creep radius
          if (distance <= CREEP_RADIUS) {
            // Restrict creep to valid platform areas (no creep in space)
            const isOnPlatform = isValidCreepPosition(x, z);
            if (isOnPlatform) {
              newCreepTiles.add(`${x},${z}`);
            }
          }
        }
      }
    });

    // Update creep state
    actions.updateCreep(newCreepTiles);

  }, [state.buildings, state.phase, actions]);
}

/**
 * Check if a position has creep
 */
export function hasCreepAt(creepTiles: Set<string>, position: [number, number, number]): boolean {
  const [x, , z] = position;
  const tileX = Math.floor(x);
  const tileZ = Math.floor(z);
  return creepTiles.has(`${tileX},${tileZ}`);
}
