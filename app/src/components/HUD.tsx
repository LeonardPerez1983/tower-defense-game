/**
 * HUD - Heads-Up Display
 *
 * Shows energy bars and tower health for both player and CPU.
 */

import { useGameState } from "../engine/GameState";
import { useState, useEffect } from "react";
import SettingsMenu from "./SettingsMenu";

const BATTLE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export default function HUD() {
  const { state, actions } = useGameState();
  const [remainingTime, setRemainingTime] = useState(BATTLE_DURATION_MS);

  // Update countdown timer using requestAnimationFrame
  useEffect(() => {
    if (state.phase !== "playing" || !state.battleStartTime || state.paused) {
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
  }, [state.phase, state.battleStartTime, state.paused]);

  return (
    <>
      {/* Settings Menu - renders when paused */}
      <SettingsMenu />

      {/* HUD elements - only show when NOT paused */}
      {!state.paused && (
        <div className="absolute inset-0 pointer-events-none z-40">
          {/* Settings Button */}
          <div className="absolute top-4 left-4 pointer-events-auto">
            <button
              onClick={() => actions.setPaused(true)}
              className="text-sm bg-gray-800/80 hover:bg-gray-700/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-colors font-semibold"
            >
              ⚙️ Settings
            </button>
          </div>

          {/* Battle Timer - positioned under settings button */}
          {state.phase === "playing" && (
            <div className="absolute top-16 left-4">
              <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
                <div className="text-xl font-bold text-white tabular-nums">
                  {Math.floor(remainingTime / 60000)}:{String(Math.floor((remainingTime % 60000) / 1000)).padStart(2, '0')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
