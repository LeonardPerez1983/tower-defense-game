/**
 * BuildingPlacementController - Handles raycasting and placement interaction
 *
 * Tracks mouse/touch position, raycasts to ground plane, updates ghost preview.
 */

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Raycaster, Vector2, Plane, Vector3 } from "three";
import { useBuildingPlacement } from "../hooks/useBuildingPlacement";
import { useGameState } from "../engine/GameState";
import GhostBuilding from "./GhostBuilding";
import { loadBuildings } from "../data/loadData";
import { useState } from "react";
import { Building } from "../data/loadData";

interface Props {
  placementState: ReturnType<typeof useBuildingPlacement>;
}

export default function BuildingPlacementController({ placementState }: Props) {
  const { camera, gl } = useThree();
  const { actions } = useGameState();
  const [buildingStats, setBuildingStats] = useState<Building | null>(null);

  const { placementState: state, updatePosition, confirmPlacement, cancelPlacement } = placementState;

  // Load building stats when card changes
  useEffect(() => {
    if (state.card) {
      loadBuildings().then(buildings => {
        const stats = buildings.find(b => b.id === state.card!.id);
        setBuildingStats(stats || null);
      });
    } else {
      setBuildingStats(null);
    }
  }, [state.card]);

  useEffect(() => {
    if (!state.card) return;

    const raycaster = new Raycaster();
    const mouse = new Vector2();
    const groundPlane = new Plane(new Vector3(0, 1, 0), 0); // Y=0 plane
    const intersection = new Vector3();

    const handleMove = (event: MouseEvent | TouchEvent) => {
      // Get normalized device coordinates
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast to ground plane
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(groundPlane, intersection);

      if (intersection) {
        const position: [number, number, number] = [
          Math.round(intersection.x * 2) / 2, // Snap to 0.5 grid
          0,
          Math.round(intersection.z * 2) / 2,
        ];
        updatePosition(position);
      }
    };

    const handleClick = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();

      // Right-click or two-finger tap cancels
      if ('button' in event && event.button === 2) {
        cancelPlacement();
        return;
      }

      // Left-click or tap confirms
      const position = confirmPlacement();
      if (position && state.card) {
        actions.playCard("player", state.card.id, position);
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      cancelPlacement();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelPlacement();
      }
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchend', handleClick);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchend', handleClick);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.card, camera, gl, updatePosition, confirmPlacement, cancelPlacement, actions]);

  // Render ghost preview
  if (!state.card || !state.position || !buildingStats) return null;

  return (
    <GhostBuilding
      buildingStats={buildingStats}
      position={state.position}
      isValid={state.isValid}
    />
  );
}
