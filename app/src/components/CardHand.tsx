/**
 * CardHand - Player's card tray at bottom of screen
 *
 * Displays cards dynamically based on build order.
 * Variable hand size, discard mode, production queue system.
 */

import { useState } from "react";
import { useGameState } from "../engine/GameState";
import { Card, TechTreeEntry } from "../data/loadData";
import { useBuildingPlacement } from "../hooks/useBuildingPlacement";

interface Props {
  buildingPlacement: ReturnType<typeof useBuildingPlacement>;
  techTree: TechTreeEntry[];
}

export default function CardHand({ buildingPlacement, techTree }: Props) {
  const { state, actions } = useGameState();
  const [discardMode, setDiscardMode] = useState(false);

  // Display full hand (variable size, no longer limited to 4)
  const displayHand = state.playerHand;

  const handleCardClick = (card: Card) => {
    // Discard mode: spend energy to discard card
    if (discardMode && card.discard_cost !== undefined && card.discard_cost > 0) {
      if (state.playerEnergy < card.discard_cost) return;
      actions.discardCard("player", card.id);
      setDiscardMode(false); // Auto-exit discard mode after use
      return;
    }

    // Normal mode: check energy
    if (state.playerEnergy < card.cost) return;

    // Upgrade cards: find target building and upgrade it
    if (card.card_type === "upgrade" && card.effect_type === "upgrade_building") {
      // Find first building that matches the target type
      const targetBuilding = state.buildings.find(
        b => b.team === "player" &&
             b.buildingType === card.effect_value && // effect_value is the target building type
             b.constructionStartTime === undefined // Only completed buildings
      );

      if (targetBuilding) {
        // Upgrade the building
        actions.upgradeBuilding(targetBuilding.id, card.building_id); // building_id is the upgraded type

        // Remove card from hand
        const hand = [...state.playerHand];
        const cardIndex = hand.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          hand.splice(cardIndex, 1);
          actions.setPlayerHand(hand);
        }

        // Spend energy
        actions.spendEnergy("player", card.cost);
      }
      return;
    }

    // Building cards: require at least 1 worker and enter placement mode
    if (card.card_type === "building") {
      // Need at least one worker to construct buildings
      if (state.playerWorkerCount < 1) return;
      buildingPlacement.startPlacement(card);
      return;
    }

    // Worker cards: queue production at base building (Command Center, Nexus, or Hatchery)
    if (card.effect_type === "add_worker") {
      const baseBuilding = state.buildings.find(
        b => b.team === "player" &&
            (b.buildingType === "command_center" ||
             b.buildingType === "protoss_nexus" ||
             b.buildingType === "zerg_hatchery")
      );
      if (baseBuilding) {
        actions.queueProduction("player", card, baseBuilding.id);
      }
      return;
    }

    // Unit cards: queue production at appropriate building
    if (card.effect_type === "spawn_unit") {
      // Zerg units morph from larva at Hatchery
      if (card.faction === "zerg") {
        // Find all completed Hatcheries with available larva
        const hatcheriesWithLarva = state.buildings.filter(
          b => b.team === "player" &&
               b.buildingType === "zerg_hatchery" &&
               b.constructionStartTime === undefined && // Only completed buildings
               (state.larvaCount.get(b.id) || 0) > 0 // Must have larva
        );

        if (hatcheriesWithLarva.length > 0) {
          // Find Hatchery with shortest queue for parallel production
          const hatcheryWithShortestQueue = hatcheriesWithLarva.reduce((shortest, building) => {
            const currentQueueLength = state.playerProductionQueue.filter(q => q.buildingId === building.id).length;
            const shortestQueueLength = state.playerProductionQueue.filter(q => q.buildingId === shortest.id).length;
            return currentQueueLength < shortestQueueLength ? building : shortest;
          });

          actions.queueProduction("player", card, hatcheryWithShortestQueue.id);
        }
        return;
      }

      // Non-Zerg units: queue production at required building from tech tree
      const techEntry = techTree.find(t => t.card_id === card.id);
      if (!techEntry || techEntry.required_building === "none") return;

      // Find all completed production buildings of the required type
      const productionBuildings = state.buildings.filter(
        b => b.team === "player" &&
             b.buildingType === techEntry.required_building &&
             b.constructionStartTime === undefined // Only completed buildings
      );

      if (productionBuildings.length > 0) {
        // Find building with shortest queue for parallel production
        const buildingWithShortestQueue = productionBuildings.reduce((shortest, building) => {
          const currentQueueLength = state.playerProductionQueue.filter(q => q.buildingId === building.id).length;
          const shortestQueueLength = state.playerProductionQueue.filter(q => q.buildingId === shortest.id).length;
          return currentQueueLength < shortestQueueLength ? building : shortest;
        });

        actions.queueProduction("player", card, buildingWithShortestQueue.id);
      }
      return;
    }
  };

  if (state.phase !== "playing") return null;

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 pointer-events-none z-50">
      {/* Discard mode toggle */}
      {!buildingPlacement.isPlacing && (
        <div className="absolute top-0 right-8 pointer-events-auto">
          <button
            onClick={() => setDiscardMode(!discardMode)}
            className={`px-3 py-1 rounded-t text-xs font-bold transition-colors ${
              discardMode
                ? 'bg-red-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {discardMode ? 'Discard Mode ON' : 'Discard'}
          </button>
        </div>
      )}

      {/* Placement mode instructions */}
      {buildingPlacement.isPlacing && (
        <div className="text-center mb-2 pointer-events-none">
          <div className="inline-block bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm">
            Click to place • Right-click or ESC to cancel
          </div>
        </div>
      )}

      {/* Discard mode instructions */}
      {discardMode && (
        <div className="text-center mb-2 pointer-events-none">
          <div className="inline-block bg-red-600/90 text-white px-4 py-2 rounded-lg text-sm">
            Click a card to discard (costs energy)
          </div>
        </div>
      )}

      {/* Card hand - horizontal scroll for > 4 cards */}
      <div className="flex gap-2 justify-center max-w-full mx-auto pointer-events-auto overflow-x-auto pb-2">
        {displayHand.map((card, index) => {
          const canAfford = state.playerEnergy >= card.cost;
          const discardCost = discardMode ? card.discard_cost : undefined;
          const canAffordDiscard = discardMode && discardCost !== undefined && state.playerEnergy >= discardCost;
          const isDisabled = discardMode ? !canAffordDiscard : (!canAfford || buildingPlacement.isPlacing);

          return (
            <button
              key={`${card.id}-${index}`}
              onClick={() => handleCardClick(card)}
              disabled={isDisabled}
              className={`
                flex-shrink-0 w-24 bg-white rounded-lg p-2 shadow-lg transition-all
                ${!isDisabled
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
                ${discardMode ? 'border-2 border-red-500' : ''}
              `}
            >
              {/* Energy cost badge */}
              <div className="flex justify-between items-start mb-1">
                <div className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${discardMode
                    ? (canAffordDiscard ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600')
                    : (!isDisabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600')
                  }
                `}>
                  {discardMode ? (discardCost || '—') : card.cost}
                </div>
              </div>

              {/* Card name */}
              <div className="text-xs font-bold text-gray-900 mb-1">
                {card.name}
              </div>

              {/* Card description */}
              <div className="text-xs text-gray-600 line-clamp-2">
                {card.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
