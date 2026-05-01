/**
 * SplashScreen - Initial menu screen
 *
 * Shows game title and start button.
 * Initializes player and CPU hands when Start is clicked.
 */

import { useGameState } from "../engine/GameState";
import { loadCards, loadBuildings, loadTechTree } from "../data/loadData";
import { PlacedBuilding } from "../engine/GameState";

export default function SplashScreen() {
  const { state, actions } = useGameState();

  const handleStart = async () => {
    // Load game data
    const allCards = await loadCards();
    const allBuildings = await loadBuildings();
    const techTree = await loadTechTree();

    // Place starting Command Centers for both teams
    const commandCenterStats = allBuildings.find(b => b.id === "command_center");
    if (commandCenterStats) {
      // Player Command Center (acts as the base/tower for player)
      const playerCC: PlacedBuilding = {
        id: `player-cc-start`,
        buildingType: "command_center",
        team: "player",
        position: [0, 0, 6],
        health: commandCenterStats.health,
        stats: commandCenterStats,
      };
      actions.placeBuilding(playerCC);

      // CPU Command Center (acts as the base/tower for CPU)
      const cpuCC: PlacedBuilding = {
        id: `cpu-cc-start`,
        buildingType: "command_center",
        team: "cpu",
        position: [0, 0, -6],
        health: commandCenterStats.health,
        stats: commandCenterStats,
      };
      actions.placeBuilding(cpuCC);
    }

    // Filter cards based on starting buildings (Command Center is already placed)
    // Players start with Command Center, so they can use SCV and Barracks
    const getStartingCards = () => {
      return allCards.filter(card => {
        const techReq = techTree.find(t => t.card_id === card.id);
        // Include cards with no requirement or requiring command_center
        if (!techReq) return true;
        if (techReq.required_building === "none") return true;
        if (techReq.required_building === "command_center") return true;
        return false; // Marines require barracks, not available yet
      });
    };

    const startingCards = getStartingCards();

    // Initialize decks with starting cards only
    actions.initializeDeck("player", startingCards);
    actions.initializeDeck("cpu", startingCards);

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
        <p className="text-sm text-gray-600">v0.2.0 - Phase 3: StarCraft Royale</p>

        {/* Instructions */}
        <div className="text-sm text-gray-700 text-center max-w-xs">
          <p>Build workers to boost energy!</p>
          <p className="text-xs text-gray-500 mt-1">Each worker adds +0.2 energy/sec (max 5)</p>
        </div>

        {/* Start button */}
        <button className="ui-cta mt-4" onClick={handleStart}>
          Start Battle
        </button>
      </div>
    </div>
  );
}
