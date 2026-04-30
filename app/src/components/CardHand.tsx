/**
 * CardHand - Player's card tray at bottom of screen
 *
 * Displays 4 cards that the player can tap to play.
 * Shows cost, name, and visual feedback for affordability.
 */

import { useGameState } from "../engine/GameState";
import { Card } from "../data/loadData";

export default function CardHand() {
  const { state, actions } = useGameState();

  const handleCardClick = (card: Card) => {
    if (state.playerEnergy < card.cost) {
      // Not enough energy - could add shake animation here
      console.log("Not enough energy!");
      return;
    }

    // Spawn at player's side (Z = 8, random X position)
    const randomX = (Math.random() - 0.5) * 4; // -2 to +2
    actions.playCard("player", card.id, [randomX, 0, 8]);
  };

  if (state.phase !== "playing") return null;

  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 pointer-events-none">
      <div className="flex gap-2 justify-center max-w-md mx-auto pointer-events-auto">
        {state.playerHand.map((card) => {
          const canAfford = state.playerEnergy >= card.cost;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={!canAfford}
              className={`
                flex-1 bg-white rounded-lg p-3 shadow-lg transition-all
                ${canAfford
                  ? 'hover:scale-105 active:scale-95 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
            >
              {/* Energy cost badge */}
              <div className="flex justify-between items-start mb-2">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${canAfford ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
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
