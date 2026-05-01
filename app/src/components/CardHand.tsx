/**
 * CardHand - Player's card tray at bottom of screen
 *
 * Displays 4 cards that the player can tap to play.
 * Shows cost, name, and visual feedback for affordability.
 */

import { useGameState } from "../engine/GameState";
import { Card } from "../data/loadData";
import { useBuildingPlacement } from "../hooks/useBuildingPlacement";

interface Props {
  buildingPlacement: ReturnType<typeof useBuildingPlacement>;
}

export default function CardHand({ buildingPlacement }: Props) {
  const { state, actions } = useGameState();

  // Enforce max 4 cards in hand (safety check)
  const displayHand = state.playerHand.slice(0, 4);

  const handleCardClick = (card: Card) => {
    if (state.playerEnergy < card.cost) {
      // Not enough energy
      return;
    }

    // Check if this is a building card - if so, enter placement mode
    if (card.card_type === "building") {
      buildingPlacement.startPlacement(card);
      return;
    }

    // For unit/spell cards, spawn immediately at player's side
    const randomX = (Math.random() - 0.5) * 4; // -2 to +2
    actions.playCard("player", card.id, [randomX, 0, 4.5]);
  };

  if (state.phase !== "playing") return null;

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 pointer-events-none z-50">
      {/* Placement mode instructions */}
      {buildingPlacement.isPlacing && (
        <div className="text-center mb-2 pointer-events-none">
          <div className="inline-block bg-gray-900/90 text-white px-4 py-2 rounded-lg text-sm">
            Click to place • Right-click or ESC to cancel
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center max-w-md mx-auto pointer-events-auto">
        {displayHand.map((card, index) => {
          const canAfford = state.playerEnergy >= card.cost;
          const isDisabled = !canAfford || buildingPlacement.isPlacing;

          return (
            <button
              key={`${card.id}-${index}`}
              onClick={() => handleCardClick(card)}
              disabled={isDisabled}
              className={`
                flex-1 bg-white rounded-lg p-3 shadow-lg transition-all
                ${!isDisabled
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Energy cost badge */}
              <div className="flex justify-between items-start mb-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${!isDisabled ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
                `}>
                  {card.cost}
                </div>
              </div>

              {/* Card name */}
              <div className="text-sm font-bold text-gray-900 mb-1">
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
