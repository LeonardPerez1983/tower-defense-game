/**
 * HUD - Heads-Up Display
 *
 * Shows energy bars and tower health for both player and CPU.
 */

import { useGameState } from "../engine/GameState";
import { useState, useEffect } from "react";

const BATTLE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export default function HUD() {
  const { state } = useGameState();
  const [remainingTime, setRemainingTime] = useState(BATTLE_DURATION_MS);

  // Update countdown timer using requestAnimationFrame
  useEffect(() => {
    if (state.phase !== "playing" || !state.battleStartTime) {
      return;
    }

    let frameId: number;
    const updateTimer = () => {
      const elapsed = performance.now() - state.battleStartTime!;
      const remaining = Math.max(0, BATTLE_DURATION_MS - elapsed);
      setRemainingTime(remaining);
      frameId = requestAnimationFrame(updateTimer);
    };

    frameId = requestAnimationFrame(updateTimer);
    return () => cancelAnimationFrame(frameId);
  }, [state.phase, state.battleStartTime]);

  // Find Command Centers (they are the base/tower for each team)
  const playerCC = state.buildings.find(b => b.team === "player" && b.buildingType === "command_center");
  const cpuCC = state.buildings.find(b => b.team === "cpu" && b.buildingType === "command_center");

  const playerEnergyPercent = (state.playerEnergy / state.maxEnergy) * 100;
  const cpuEnergyPercent = (state.cpuEnergy / state.maxEnergy) * 100;

  const playerBaseHP = playerCC?.health ?? 0;
  const playerBaseMaxHP = playerCC?.stats.health ?? 1;
  const playerBasePercent = (playerBaseHP / playerBaseMaxHP) * 100;

  const cpuBaseHP = cpuCC?.health ?? 0;
  const cpuBaseMaxHP = cpuCC?.stats.health ?? 1;
  const cpuBasePercent = (cpuBaseHP / cpuBaseMaxHP) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Debug Button */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <a
          href="#debug"
          className="text-xs bg-gray-800/80 hover:bg-gray-700/80 text-white px-3 py-1 rounded backdrop-blur-sm transition-colors"
        >
          🎨 Model Viewer
        </a>
      </div>

      {/* Battle Timer */}
      {state.phase === "playing" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Time Remaining</div>
              <div className="text-2xl font-bold text-white tabular-nums">
                {Math.floor(remainingTime / 60000)}:{String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CPU Stats (Top-Left) */}
      <div className="absolute top-4 left-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md w-64">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">CPU Base</span>
            <span className="text-gray-600">{Math.round(cpuBaseHP)} / {cpuBaseMaxHP} HP</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${cpuBasePercent}%` }}
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

          <div className="flex items-center justify-between text-xs mt-2">
            <span className="font-semibold text-gray-700">Workers</span>
            <span className="text-gray-600">{state.cpuWorkerCount} / {state.maxWorkers}</span>
          </div>
        </div>
      </div>

      {/* Player Stats (Top-Right) */}
      <div className="absolute top-4 right-4">
        <div className="bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md w-64">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700">Your Base</span>
            <span className="text-gray-600">{Math.round(playerBaseHP)} / {playerBaseMaxHP} HP</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${playerBasePercent}%` }}
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

          <div className="flex items-center justify-between text-xs mt-2">
            <span className="font-semibold text-gray-700">Workers</span>
            <span className="text-gray-600">{state.playerWorkerCount} / {state.maxWorkers}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
