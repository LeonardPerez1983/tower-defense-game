/**
 * useLarvaProduction - Manages Zerg larva spawning
 *
 * Each Hatchery spawns 1 larva every 10 seconds (max 3 larva per Hatchery).
 * Larva are consumed when Zerg units are produced.
 */

import { useEffect, useRef } from "react";
import { useGameState } from "../engine/GameState";

const LARVA_SPAWN_INTERVAL = 10000; // 10 seconds in milliseconds

export function useLarvaProduction() {
  const { state, actions } = useGameState();
  const lastSpawnTime = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (state.phase !== "playing") return;

    // Find all Hatcheries
    const hatcheries = state.buildings.filter(b => b.buildingType === "zerg_hatchery");

    // Set up interval to check for larva spawning
    const interval = setInterval(() => {
      const now = performance.now();

      hatcheries.forEach(hatchery => {
        // Skip if still under construction
        if (hatchery.constructionStartTime !== undefined) return;

        const lastSpawn = lastSpawnTime.current.get(hatchery.id) || 0;
        const timeSinceLastSpawn = now - lastSpawn;

        if (timeSinceLastSpawn >= LARVA_SPAWN_INTERVAL) {
          // Try to add larva (will fail if already at max 3)
          actions.addLarva(hatchery.id);
          lastSpawnTime.current.set(hatchery.id, now);
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [state.buildings, state.phase, actions]);
}
