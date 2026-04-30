/**
 * SplashScreen - Initial menu screen
 *
 * Shows game title and start button.
 * Initializes player and CPU hands when Start is clicked.
 */

import { useGameState } from "../engine/GameState";
import { loadCards } from "../data/loadData";

export default function SplashScreen() {
  const { state, actions } = useGameState();

  const handleStart = async () => {
    // Load cards and deal hands
    const allCards = await loadCards();

    // Give player a hand of 4 random cards
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);
    const playerHand = shuffled.slice(0, 4);
    const cpuHand = shuffled.slice(4, 8);

    actions.setPlayerHand(playerHand);
    actions.setCpuHand(cpuHand);
    actions.setPhase("playing");
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl pointer-events-auto flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-bold">BA</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          Battle Arena
        </h1>

        {/* Version */}
        <p className="text-sm text-gray-600">v0.1.0 - Phase 2: Cards & Energy</p>

        {/* Instructions */}
        <div className="text-sm text-gray-700 text-center max-w-xs">
          <p>Tap cards to spawn units!</p>
          <p className="text-xs text-gray-500 mt-1">Energy regenerates at 1 per 2 seconds</p>
        </div>

        {/* Start button */}
        <button className="ui-cta mt-4" onClick={handleStart}>
          Start Battle
        </button>
      </div>
    </div>
  );
}
