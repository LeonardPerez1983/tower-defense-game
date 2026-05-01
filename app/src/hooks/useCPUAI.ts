/**
 * useCPUAI - CPU opponent logic
 *
 * Uses production queue system like the player:
 * - Builds SCVs to boost economy
 * - Places buildings to unlock units
 * - Queues units from production buildings
 */

import { useEffect } from "react";
import { useGameState } from "../engine/GameState";
import { PlacedBuilding } from "../engine/GameState";
import { Building } from "../data/loadData";

interface Props {
  allBuildings: Building[];
}

export function useCPUAI({ allBuildings }: Props) {
  const { state, actions } = useGameState();

  useEffect(() => {
    if (state.phase !== "playing") return;

    const interval = setInterval(() => {
      if (state.cpuHand.length === 0) return;

      // Smart card selection: prioritize workers early, then buildings, then units
      let selectedCard = null;

      // Priority 1: Build workers first (up to 5)
      if (state.cpuWorkerCount < 5) {
        selectedCard = state.cpuHand.find(c => c.effect_type === "add_worker");
      }

      // Priority 2: Build buildings if we have workers
      if (!selectedCard && state.cpuWorkerCount > 0) {
        selectedCard = state.cpuHand.find(c => c.card_type === "building");
      }

      // Priority 3: Build units from production buildings
      if (!selectedCard) {
        selectedCard = state.cpuHand.find(c => c.effect_type === "spawn_unit");
      }

      // Fallback: pick random card if no priority matches
      if (!selectedCard) {
        selectedCard = state.cpuHand[Math.floor(Math.random() * state.cpuHand.length)];
      }

      // Check if CPU has enough energy
      if (state.cpuEnergy < selectedCard.cost) return;

      // Handle different card types
      if (selectedCard.effect_type === "add_worker") {
        // Worker: queue at base building (Command Center, Nexus, or Hatchery)
        const baseBuilding = state.buildings.find(
          b => b.team === "cpu" &&
              (b.buildingType === "command_center" ||
               b.buildingType === "protoss_nexus" ||
               b.buildingType === "zerg_hatchery")
        );
        if (baseBuilding) {
          actions.queueProduction("cpu", selectedCard, baseBuilding.id);
        }
      } else if (selectedCard.card_type === "upgrade" && selectedCard.effect_type === "upgrade_building") {
        // Upgrade card: find target building and upgrade it
        const targetBuilding = state.buildings.find(
          b => b.team === "cpu" &&
               b.buildingType === selectedCard.effect_value && // effect_value is the target building type
               b.constructionStartTime === undefined // Only completed buildings
        );

        if (targetBuilding && state.cpuEnergy >= selectedCard.cost) {
          actions.upgradeBuilding(targetBuilding.id, selectedCard.building_id); // building_id is the upgraded type

          // Remove card from hand and spend energy
          const hand = [...state.cpuHand];
          const cardIndex = hand.findIndex(c => c.id === selectedCard.id);
          if (cardIndex !== -1) {
            hand.splice(cardIndex, 1);
            actions.setCpuHand(hand);
          }
          actions.spendEnergy("cpu", selectedCard.cost);
        }
      } else if (selectedCard.card_type === "building") {
        // Building: requires at least 1 worker to construct
        if (state.cpuWorkerCount < 1) return;

        // Building: auto-place at CPU side
        const buildingStats = allBuildings.find(b => b.id === selectedCard.id);
        if (!buildingStats) return;

        const randomX = (Math.random() - 0.5) * 6; // -3 to +3
        const randomZ = -2 + Math.random() * -2; // -2 to -4
        const buildingId = `cpu-${Date.now()}-${Math.random()}`;

        const newBuilding: PlacedBuilding = {
          id: buildingId,
          buildingType: selectedCard.id,
          team: "cpu",
          position: [randomX, 0, randomZ],
          health: buildingStats.health,
          shields: buildingStats.max_shields,
          stats: buildingStats,
          constructionStartTime: performance.now(),
          constructionDuration: selectedCard.build_time * 1000,
        };

        actions.placeBuilding(newBuilding);
        actions.queueProduction("cpu", selectedCard, buildingId);
      } else if (selectedCard.effect_type === "spawn_unit") {
        // Zerg units morph from larva at Hatchery
        if (selectedCard.faction === "zerg") {
          const hatcheriesWithLarva = state.buildings.filter(
            b => b.team === "cpu" &&
                 b.buildingType === "zerg_hatchery" &&
                 b.constructionStartTime === undefined && // Only completed buildings
                 (state.larvaCount.get(b.id) || 0) > 0 // Must have larva
          );

          if (hatcheriesWithLarva.length > 0) {
            // Find Hatchery with shortest queue for parallel production
            const hatcheryWithShortestQueue = hatcheriesWithLarva.reduce((shortest, building) => {
              const currentQueueLength = state.cpuProductionQueue.filter(q => q.buildingId === building.id).length;
              const shortestQueueLength = state.cpuProductionQueue.filter(q => q.buildingId === shortest.id).length;
              return currentQueueLength < shortestQueueLength ? building : shortest;
            });

            actions.queueProduction("cpu", selectedCard, hatcheryWithShortestQueue.id);
          }
        } else {
          // Non-Zerg units: queue at appropriate production building (Barracks or Gateway)
          const productionBuildings = state.buildings.filter(
            b => b.team === "cpu" &&
                 (b.buildingType === "barracks" || b.buildingType === "protoss_gateway") &&
                 b.constructionStartTime === undefined // Only completed buildings
          );

          if (productionBuildings.length > 0) {
            // Find building with shortest queue for parallel production
            const buildingWithShortestQueue = productionBuildings.reduce((shortest, building) => {
              const currentQueueLength = state.cpuProductionQueue.filter(q => q.buildingId === building.id).length;
              const shortestQueueLength = state.cpuProductionQueue.filter(q => q.buildingId === shortest.id).length;
              return currentQueueLength < shortestQueueLength ? building : shortest;
            });

            actions.queueProduction("cpu", selectedCard, buildingWithShortestQueue.id);
          }
        }
      }
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [state.phase, state.cpuHand, state.cpuEnergy, state.buildings, allBuildings, actions]);
}
