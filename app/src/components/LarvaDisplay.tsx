/**
 * LarvaDisplay - Shows larva count for Zerg Hatcheries
 *
 * Displays a badge showing available larva (0-3) for each Hatchery.
 */

import { useGameState } from "../engine/GameState";

export default function LarvaDisplay() {
  const { state } = useGameState();

  // Find all player Hatcheries
  const playerHatcheries = state.buildings.filter(
    b => b.team === "player" && b.buildingType === "zerg_hatchery"
  );

  if (playerHatcheries.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 pointer-events-none z-40">
      <div className="bg-purple-900/90 rounded-lg p-3 border border-purple-500">
        <div className="text-purple-200 text-sm font-bold mb-2 flex items-center gap-2">
          <span>🥚</span>
          <span>Larva</span>
        </div>
        {playerHatcheries.map((hatchery, idx) => {
          const larvaCount = state.larvaCount.get(hatchery.id) || 0;
          const isUnderConstruction = hatchery.constructionStartTime !== undefined;

          return (
            <div key={hatchery.id} className="flex items-center gap-2 mb-1">
              <div className="text-purple-300 text-xs">#{idx + 1}:</div>
              {isUnderConstruction ? (
                <div className="text-purple-400 text-xs italic">Building...</div>
              ) : (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 ${
                        i < larvaCount
                          ? 'bg-purple-400 border-purple-300'
                          : 'bg-purple-900 border-purple-700'
                      }`}
                      title={`Larva ${i + 1}`}
                    />
                  ))}
                </div>
              )}
              <div className="text-purple-300 text-xs ml-1">{larvaCount}/3</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
