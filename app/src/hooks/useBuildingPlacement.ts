/**
 * useBuildingPlacement - Handles interactive building placement
 *
 * Provides ghost preview and placement validation for buildings.
 */

import { useState } from "react";
import { Card } from "../data/loadData";
import { useGameState } from "../engine/GameState";

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

    // Check for overlapping buildings (1.5 unit spacing)
    const minDistance = 1.5;
    for (const building of state.buildings) {
      const dx = building.position[0] - x;
      const dz = building.position[2] - z;
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
