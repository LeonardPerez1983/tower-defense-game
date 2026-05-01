/**
 * useProductionQueue - Processes production queues for all buildings
 *
 * Handles timer countdown and spawning completed units.
 * Runs every frame to check if any production has completed.
 */

import { useFrame } from "@react-three/fiber";
import { useGameState } from "../engine/GameState";

export function useProductionQueue() {
  const { state, actions } = useGameState();

  useFrame(() => {
    if (state.phase !== "playing") return;

    const now = performance.now();

    // Process player queue
    processQueue("player", state.playerProductionQueue, now);

    // Process CPU queue
    processQueue("cpu", state.cpuProductionQueue, now);
  });

  function processQueue(
    team: "player" | "cpu",
    queue: typeof state.playerProductionQueue,
    now: number
  ) {
    // Group entries by building to find active (first) entry per building
    const buildingQueues = new Map<string, typeof queue>();

    queue.forEach(entry => {
      if (!buildingQueues.has(entry.buildingId)) {
        buildingQueues.set(entry.buildingId, []);
      }
      buildingQueues.get(entry.buildingId)!.push(entry);
    });

    // Check each building's active production
    buildingQueues.forEach((entries, buildingId) => {
      const activeEntry = entries[0]; // First in queue for this building

      // Check if build complete
      const elapsed = now - activeEntry.startTime;
      if (elapsed >= activeEntry.buildTime * 1000) {
        actions.completeProduction(team, activeEntry);
      }
    });
  }
}
