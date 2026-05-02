/**
 * EnergyBar - Player energy display for bottom command tray
 *
 * Shows current energy with a segmented bar and pulsing animation when full.
 */

import { useGameState } from "../engine/GameState";

export default function EnergyBar() {
  const { state } = useGameState();

  const energyPercent = (state.playerEnergy / state.maxEnergy) * 100;
  const isFull = state.playerEnergy >= state.maxEnergy;

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm rounded px-3 py-2 shadow-lg border border-gray-700/50 w-full">
      <div className="flex flex-col gap-1.5">
        {/* Energy icon and current value */}
        <div className="flex items-center justify-between">
          <span className="text-xs">⚡</span>
          <span className="text-lg font-bold text-white tabular-nums">
            {Math.floor(state.playerEnergy)}
          </span>
          <span className="text-[8px] text-gray-400 font-semibold">
            /{state.maxEnergy}
          </span>
        </div>

        {/* Energy bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden relative">
          <div
            className={`h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 ${
              isFull ? 'animate-pulse' : ''
            }`}
            style={{ width: `${energyPercent}%` }}
          />
          {/* Segmented overlay */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: state.maxEnergy }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-gray-900/40 last:border-r-0"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
