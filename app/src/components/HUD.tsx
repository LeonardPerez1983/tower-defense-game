/**
 * HUD - Heads-Up Display
 *
 * Shows energy bars and tower health for both player and CPU.
 */

import { useGameState } from "../engine/GameState";

export default function HUD() {
  const { state } = useGameState();

  const playerEnergyPercent = (state.playerEnergy / state.maxEnergy) * 100;
  const cpuEnergyPercent = (state.cpuEnergy / state.maxEnergy) * 100;
  const playerTowerPercent = (state.playerTowerHP / state.towerMaxHP) * 100;
  const cpuTowerPercent = (state.cpuTowerHP / state.towerMaxHP) * 100;

  return (
    <div className="absolute inset-x-0 top-0 p-4 pointer-events-none z-40">
      {/* CPU Stats (Top) */}
      <div className="mb-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">CPU Tower</span>
            <span className="text-gray-600">{Math.round(state.cpuTowerHP)} HP</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${cpuTowerPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-2 mb-1">
            <span className="font-semibold text-gray-700">CPU Energy</span>
            <span className="text-gray-600">{Math.round(state.cpuEnergy)} / {state.maxEnergy}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${cpuEnergyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Player Stats (Bottom) */}
      <div className="absolute bottom-32 left-0 right-0 px-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md max-w-xs mx-auto">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">Your Tower</span>
            <span className="text-gray-600">{Math.round(state.playerTowerHP)} HP</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${playerTowerPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mt-2 mb-1">
            <span className="font-semibold text-gray-700">Your Energy</span>
            <span className="text-gray-600">{Math.round(state.playerEnergy)} / {state.maxEnergy}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${playerEnergyPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
