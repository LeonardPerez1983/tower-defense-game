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
    <div className="absolute top-28 left-4 pointer-events-none z-30">
      <div className="space-y-1">
        {Array.from(queuesByBuilding.entries()).map(([buildingId, entries]) => {
          const building = state.buildings.find(b => b.id === buildingId);
          if (!building) return null;

          const activeEntry = entries[0]; // First in queue is actively building
          const queuedEntries = entries.slice(1);

          // Calculate progress
          const now = performance.now();
          const elapsed = now - activeEntry.startTime;
          const progress = Math.min(100, (elapsed / (activeEntry.buildTime * 1000)) * 100);

          // Get unit name from card ID
          const unitName = activeEntry.cardId.replace(/_/g, ' ').replace('unit', '').trim();

          return (
            <div key={buildingId} className="min-w-32">
              {/* Compact production info */}
              <div className="flex items-center gap-1.5">
                {/* Progress bar */}
                <div className="flex-1">
                  <div className="bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full transition-all duration-100"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {/* Progress percentage */}
                <span className="text-white text-xs font-bold tabular-nums drop-shadow-lg">
                  {Math.floor(progress)}%
                </span>
              </div>

              {/* Unit name + queue count */}
              <div className="flex items-center justify-between">
                <span className="text-white text-[10px] font-semibold drop-shadow-lg">{unitName}</span>
                {queuedEntries.length > 0 && (
                  <span className="text-gray-300 text-[10px] drop-shadow-lg">+{queuedEntries.length}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
