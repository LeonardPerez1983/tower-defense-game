/**
 * useCreepSystem - Manages Zerg creep spreading
 *
 * Hatcheries generate creep in a radius around them.
 * Zerg buildings (except Hatchery) require creep to be placed.
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";

const CREEP_RADIUS = 4.0; // Radius in game units

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
          if (distance <= CREEP_RADIUS) {
            newCreepTiles.add(`${x},${z}`);
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
