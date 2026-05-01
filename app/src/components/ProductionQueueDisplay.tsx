/**
 * ProductionQueueDisplay - Shows active production queues for all buildings
 *
 * Displays build progress bars and queued items for each production building.
 */

import { useGameState } from "../engine/GameState";

export function ProductionQueueDisplay() {
  const { state } = useGameState();

  if (state.phase !== "playing") return null;

  // Group queue entries by building
  const queuesByBuilding = new Map<string, typeof state.playerProductionQueue>();
  state.playerProductionQueue.forEach(entry => {
    if (!queuesByBuilding.has(entry.buildingId)) {
      queuesByBuilding.set(entry.buildingId, []);
    }
    queuesByBuilding.get(entry.buildingId)!.push(entry);
  });

  if (queuesByBuilding.size === 0) return null;

  return (
    <div className="absolute top-4 left-4 pointer-events-none z-30">
      <div className="bg-gray-900/95 rounded-lg p-3 border border-gray-700">
        <div className="text-gray-200 text-sm font-bold mb-2">⚙️ Production</div>
        {Array.from(queuesByBuilding.entries()).map(([buildingId, entries]) => {
          const building = state.buildings.find(b => b.id === buildingId);
          if (!building) return null;

          const activeEntry = entries[0]; // First in queue is actively building
          const queuedEntries = entries.slice(1);

          // Calculate progress
          const now = performance.now();
          const elapsed = now - activeEntry.startTime;
          const progress = Math.min(100, (elapsed / (activeEntry.buildTime * 1000)) * 100);

          return (
            <div key={buildingId} className="mb-3 last:mb-0 min-w-56">
              {/* Building name */}
              <div className="text-white text-xs font-semibold mb-1.5">{building.stats.name}</div>

              {/* Active production progress */}
              <div className="bg-gray-700 rounded-full h-4 mb-1 overflow-hidden border border-gray-600">
                <div
                  className="bg-blue-500 h-full transition-all duration-100 flex items-center justify-center"
                  style={{ width: `${progress}%` }}
                >
                  <span className="text-white text-xs font-bold drop-shadow">{Math.floor(progress)}%</span>
                </div>
              </div>

              {/* Progress text */}
              <div className="text-gray-400 text-xs mb-1">
                Building: {activeEntry.cardId.replace(/_/g, ' ')}
              </div>

              {/* Queued items */}
              {queuedEntries.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-gray-500 text-xs">Queue:</span>
                  {queuedEntries.map((entry, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 bg-gray-700 rounded border border-gray-600 flex items-center justify-center"
                      title={`Queued: ${entry.cardId}`}
                    >
                      <span className="text-gray-400 text-xs">{idx + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
