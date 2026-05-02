/**
 * SettingsMenu - Pause menu overlay
 *
 * Pauses the game and provides access to settings and model viewer.
 */

import { useGameState } from "../engine/GameState";
import AudioSettings from "../ui/settings/AudioSettings";

export default function SettingsMenu() {
  const { state, actions } = useGameState();

  if (!state.paused) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-auto" style={{ zIndex: 99999 }}>
      {/* Backdrop to cover everything */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content layer */}
      <div className="relative z-10 bg-gray-900 rounded-lg shadow-2xl p-6 w-80 max-w-[90vw]">
        <h2 className="text-xl font-bold text-white mb-4 text-center">Paused</h2>

        {/* Audio Settings Section */}
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Audio</h3>
          <AudioSettings />
        </div>

        <div className="space-y-2">
          {/* Resume Button */}
          <button
            onClick={() => actions.setPaused(false)}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
          >
            Resume Game
          </button>

          {/* Restart Match */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
          >
            Restart Match
          </button>

          {/* Model Viewer */}
          <a
            href="#debug"
            onClick={() => actions.setPaused(false)}
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-3 rounded text-center transition-colors text-sm"
          >
            🎨 Model Viewer
          </a>

          {/* Back to Menu */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-3 rounded transition-colors text-sm"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
