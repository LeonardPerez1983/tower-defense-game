/**
 * GameOverOverlay - Polished full-screen game over overlay
 */

import VictoryEffect from "./VictoryEffect";
import DefeatEffect from "./DefeatEffect";

type BattleResult = "victory" | "defeat" | "tie" | null;
type Faction = "terran" | "protoss" | "zerg";

interface GameOverOverlayProps {
  result: BattleResult;
  playerFaction?: Faction;
  cpuFaction?: Faction;
  winCondition?: string; // Description of how the game was won/lost
  onPlayAgain?: () => void;
  onBackToMenu?: () => void;
}

export default function GameOverOverlay({
  result,
  playerFaction = "terran",
  cpuFaction = "terran",
  winCondition,
  onPlayAgain,
  onBackToMenu,
}: GameOverOverlayProps) {
  if (!result) return null;

  const isVictory = result === "victory";
  const isTie = result === "tie";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Effects layer */}
      {isVictory && <VictoryEffect playerFaction={playerFaction} />}
      {!isVictory && !isTie && <DefeatEffect />}
      {isTie && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      )}

      {/* Content layer */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Main title */}
        <div className="mb-8">
          <h1
            className={`text-6xl md:text-8xl font-bold mb-4 animate-fade-in ${
              isVictory
                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400"
                : isTie
                ? "text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-400"
                : "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500"
            }`}
          >
            {isVictory ? "Victory" : isTie ? "Draw" : "Defeat"}
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            {isVictory ? "Mission Complete" : isTie ? "Time's Up" : "Mission Failed"}
          </p>
          {winCondition && (
            <p className="text-sm text-gray-400 italic">{winCondition}</p>
          )}
        </div>

        {/* Faction info */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="text-gray-500 mb-1">Your Faction</p>
              <p className="text-white font-bold capitalize">{playerFaction}</p>
            </div>
            <div className="text-2xl text-gray-600">VS</div>
            <div>
              <p className="text-gray-500 mb-1">Enemy Faction</p>
              <p className="text-white font-bold capitalize">{cpuFaction}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-lg rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            {isVictory ? "Play Again" : "Try Again"}
          </button>
          <button
            onClick={onBackToMenu}
            className="flex-1 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-bold text-lg rounded-xl border-2 border-gray-600 hover:border-gray-500 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
