/**
 * useBuildingPlacement - Handles interactive building placement
 *
 * Provides ghost preview and placement validation for buildings.
 */

import { useState } from "react";
import { Card } from "../data/loadData";
import { useGameState } from "../engine/GameState";
import { getBuildingRadius } from "../utils/collisionUtils";

export interface PlacementState {
  card: Card | null;
  position: [number, number, number] | null;
  isValid: boolean;
}

export function useBuildingPlacement() {
  const { state } = useGameState();
  const [placementState, setPlacementState] = useState<PlacementState>({
    card: null,
    position: null,
    isValid: false,
  });

  const startPlacement = (card: Card) => {
    setPlacementState({
      card,
      position: null,
      isValid: false,
    });
  };

  const updatePosition = (position: [number, number, number]) => {
    if (!placementState.card) return;

    const isValid = validatePlacement(position);
    setPlacementState({
      ...placementState,
      position,
      isValid,
    });
  };

  const validatePlacement = (position: [number, number, number]): boolean => {
    const [x, , z] = position;

    // Must be on player's side (Z > 1)
    if (z <= 1) return false;

    // Must be within arena bounds
    if (Math.abs(x) > 4.5) return false;
    if (z < 1 || z > 8.5) return false;

    // Prevent building on or near bridges
    const BRIDGE_LEFT_X = -2.5;
    const BRIDGE_RIGHT_X = 2.5;
    const RIVER_Z_MIN = -1;
    const RIVER_Z_MAX = 1;
    const BRIDGE_BUFFER = 1.5;

    // Check if too close to left bridge
    if (Math.abs(x - BRIDGE_LEFT_X) < BRIDGE_BUFFER &&
        z > RIVER_Z_MIN - BRIDGE_BUFFER && z < RIVER_Z_MAX + BRIDGE_BUFFER) {
      return false;
    }

    // Check if too close to right bridge
    if (Math.abs(x - BRIDGE_RIGHT_X) < BRIDGE_BUFFER &&
        z > RIVER_Z_MIN - BRIDGE_BUFFER && z < RIVER_Z_MAX + BRIDGE_BUFFER) {
      return false;
    }

    // Get radius of building being placed (estimate 1.5 if can't determine)
    let placingRadius = 1.5;
    if (placementState.card?.building_id) {
      // Create a temporary building to get its radius
      const tempBuilding = {
        id: "temp",
        buildingType: placementState.card.building_id,
        team: "player" as const,
        position: [0, 0, 0] as [number, number, number],
        health: 0,
        shields: 0,
        stats: {} as any,
      };
      placingRadius = getBuildingRadius(tempBuilding);
    }

    // Check for overlapping buildings (use actual radii + small buffer)
    for (const building of state.buildings) {
      const buildingRadius = getBuildingRadius(building);
      const minDistance = placingRadius + buildingRadius + 0.2; // 0.2 buffer

      const dx = building.position[0] - x;
      const dz = building.position[2] - z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < minDistance) return false;
    }

    // Check for overlapping units (prevent building on top of units)
    for (const unit of state.units.filter(u => u.team === "player")) {
      const minDistance = placingRadius + 0.5; // Assume 0.5 unit radius + buffer
      const dx = unit.position[0] - x;
      const dz = unit.position[2] - z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      if (distance < minDistance) return false;
    }

    return true;
  };

  const cancelPlacement = () => {
    setPlacementState({
      card: null,
      position: null,
      isValid: false,
    });
  };

  const confirmPlacement = (): [number, number, number] | null => {
    if (!placementState.position || !placementState.isValid) return null;
    const position = placementState.position;
    cancelPlacement();
    return position;
  };

  return {
    placementState,
    startPlacement,
    updatePosition,
    cancelPlacement,
    confirmPlacement,
    isPlacing: placementState.card !== null,
  };
}
