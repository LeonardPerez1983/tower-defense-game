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
import EnergyBar from "./EnergyBar";
import CardIcon from "./icons/CardIcons";
import { playSfx } from "../audio/soundManager";
import * as sfx from "../audio/sfx";

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
      playSfx(sfx.ui_click);
      return;
    }

    // Normal mode: check energy
    if (state.playerEnergy < card.cost) {
      playSfx(sfx.ui_error);
      return;
    }

    // Play card sound
    playSfx(sfx.card_play);

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
    <div className="absolute bottom-1 left-0 right-0 px-2 pointer-events-none z-50 overflow-visible">
      <div className="max-w-4xl mx-auto overflow-visible">
        {/* Discard mode toggle - compact icon (only when not placing) */}
        {!buildingPlacement.isPlacing && (
          <div className="absolute -top-6 right-0 pointer-events-auto">
            <button
              onClick={() => setDiscardMode(!discardMode)}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all shadow-lg ${
                discardMode
                  ? 'bg-red-500 text-white scale-110'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={discardMode ? 'Exit Discard Mode' : 'Discard Cards'}
            >
              🗑️
            </button>
          </div>
        )}

        {/* Cancel placement button (only when placing) */}
        {buildingPlacement.isPlacing && (
          <div className="absolute -top-6 right-0 pointer-events-auto">
            <button
              onClick={() => buildingPlacement.cancelPlacement()}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all shadow-lg bg-red-500 text-white hover:bg-red-600 active:scale-95"
              title="Cancel Placement"
            >
              ✖️
            </button>
          </div>
        )}

        {/* Placement mode instructions */}
        {buildingPlacement.isPlacing && (
          <div className="text-center mb-0.5 pointer-events-none">
            <div className="inline-block bg-gray-900/90 text-white px-2 py-0.5 rounded text-[10px]">
              Tap to place • Tap ✖️ to cancel
            </div>
          </div>
        )}

        {/* Bottom command container: Energy (25%) + Cards (75%) */}
        <div className="flex gap-2 items-center">
          {/* Energy bar - 25% left */}
          <div className="w-1/4 pointer-events-auto">
            <EnergyBar />
          </div>

          {/* Card hand - 75% right - allow overflow */}
          <div className="w-3/4 flex gap-1.5 justify-center items-center overflow-visible pointer-events-auto">
        {displayHand.map((card, index) => {
          const canAfford = state.playerEnergy >= card.cost;
          const discardCost = discardMode ? card.discard_cost : undefined;
          const canAffordDiscard = discardMode && discardCost !== undefined && state.playerEnergy >= discardCost;
          const isDisabled = discardMode ? !canAffordDiscard : (!canAfford || buildingPlacement.isPlacing);

          // Calculate progress toward affording (for visual feedback)
          const energyProgress = Math.min(1, state.playerEnergy / card.cost);

          return (
            <button
              key={`${card.id}-${index}`}
              onClick={() => handleCardClick(card)}
              disabled={isDisabled}
              className={`
                relative flex-shrink-0 w-20 rounded shadow-lg transition-all overflow-hidden
                ${!isDisabled
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'cursor-not-allowed'
                }
                ${discardMode ? 'border-2 border-red-500' : 'border-2'}
                ${canAfford && !discardMode
                  ? 'border-cyan-400 bg-gradient-to-b from-gray-900 to-gray-800'
                  : 'border-gray-600 bg-gradient-to-b from-gray-800 to-gray-900'
                }
              `}
            >
              {/* Grayscale overlay for unaffordable cards */}
              {!canAfford && !discardMode && (
                <div className="absolute inset-0 bg-black/50 pointer-events-none" />
              )}

              {/* Circular progress indicator (shows energy progress) */}
              {!canAfford && !discardMode && (
                <svg className="absolute top-1 right-1 w-6 h-6 transform rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="3"
                    opacity="0.3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeDasharray={`${energyProgress * 62.8} 62.8`}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Card content container */}
              <div className="relative flex flex-col items-center p-2 h-full">
                {/* SVG Icon */}
                <div className="w-12 h-12 mb-1 flex items-center justify-center">
                  <CardIcon
                    cardId={card.id}
                    faction={card.faction as any}
                    className="w-full h-full"
                  />
                </div>

                {/* Card title */}
                <div className={`text-[9px] font-bold text-center leading-tight mb-auto ${
                  canAfford ? 'text-white' : 'text-gray-500'
                }`}>
                  {card.name}
                </div>

                {/* Cost badge - bottom centered */}
                <div className={`
                  mt-1 px-1.5 py-0.5 rounded-full text-xs font-bold leading-none
                  ${discardMode
                    ? (canAffordDiscard ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-400')
                    : (canAfford ? 'bg-cyan-500 text-white' : 'bg-gray-600 text-gray-400')
                  }
                `}>
                  {discardMode ? (discardCost || '—') : card.cost}
                </div>
              </div>
            </button>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );
}
