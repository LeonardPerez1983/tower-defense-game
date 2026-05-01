/**
 * SplashScreen - Initial menu screen
 *
 * Shows game title, faction selection, and start button.
 * Initializes player and CPU with faction-specific buildings and cards.
 */

import { useState } from "react";
import { useGameState } from "../engine/GameState";
import { loadCards, loadBuildings, loadTechTree } from "../data/loadData";
import { PlacedBuilding } from "../engine/GameState";

type Faction = "terran" | "protoss" | "zerg";

export default function SplashScreen() {
  const { state, actions } = useGameState();
  const [playerFaction, setPlayerFaction] = useState<Faction>("terran");

  const handleStart = async () => {
    // CPU picks random faction
    const factions: Faction[] = ["terran", "protoss", "zerg"];
    const cpuFaction = factions[Math.floor(Math.random() * factions.length)];

    // Set factions (this also sets starting energy)
    actions.setFactions(playerFaction, cpuFaction);

    // Load game data
    const allCards = await loadCards();
    const allBuildings = await loadBuildings();
    const techTree = await loadTechTree();

    // Place starting base buildings for both teams
    const getBaseId = (faction: Faction) => {
      if (faction === "terran") return "command_center";
      if (faction === "protoss") return "protoss_nexus";
      return "zerg_hatchery";
    };

    const playerBaseId = getBaseId(playerFaction);
    const cpuBaseId = getBaseId(cpuFaction);

    const playerBaseStats = allBuildings.find(b => b.id === playerBaseId);
    const cpuBaseStats = allBuildings.find(b => b.id === cpuBaseId);

    if (playerBaseStats) {
      const playerBase: PlacedBuilding = {
        id: `player-base-start`,
        buildingType: playerBaseId,
        team: "player",
        position: [0, 0, 6],
        health: playerBaseStats.health,
        shields: playerBaseStats.max_shields,
        stats: playerBaseStats,
      };
      actions.placeBuilding(playerBase);
    }

    if (cpuBaseStats) {
      const cpuBase: PlacedBuilding = {
        id: `cpu-base-start`,
        buildingType: cpuBaseId,
        team: "cpu",
        position: [0, 0, -6],
        health: cpuBaseStats.health,
        shields: cpuBaseStats.max_shields,
        stats: cpuBaseStats,
      };
      actions.placeBuilding(cpuBase);
    }

    // Initialize larva for Zerg Hatcheries (start with 3 larva)
    if (playerFaction === "zerg") {
      actions.addLarva(`player-base-start`);
      actions.addLarva(`player-base-start`);
      actions.addLarva(`player-base-start`);
    }
    if (cpuFaction === "zerg") {
      actions.addLarva(`cpu-base-start`);
      actions.addLarva(`cpu-base-start`);
      actions.addLarva(`cpu-base-start`);
    }

    // Initialize starting deck: 5 worker cards of the appropriate faction
    const getWorkerCardId = (faction: Faction) => {
      if (faction === "terran") return "worker";
      if (faction === "protoss") return "protoss_probe";
      return "zerg_drone";
    };

    const playerWorkerCardId = getWorkerCardId(playerFaction);
    const cpuWorkerCardId = getWorkerCardId(cpuFaction);

    const playerWorkerCard = allCards.find(c => c.id === playerWorkerCardId);
    const cpuWorkerCard = allCards.find(c => c.id === cpuWorkerCardId);

    const playerStartingCards = playerWorkerCard
      ? [playerWorkerCard, playerWorkerCard, playerWorkerCard, playerWorkerCard, playerWorkerCard]
      : [];
    const cpuStartingCards = cpuWorkerCard
      ? [cpuWorkerCard, cpuWorkerCard, cpuWorkerCard, cpuWorkerCard, cpuWorkerCard]
      : [];

    actions.initializeDeck("player", playerStartingCards);
    actions.initializeDeck("cpu", cpuStartingCards);

    actions.setPhase("playing");
  };

  const getFactionColor = (faction: Faction) => {
    switch (faction) {
      case "terran":
        return "from-blue-500 to-blue-600";
      case "protoss":
        return "from-yellow-500 to-yellow-600";
      case "zerg":
        return "from-purple-500 to-purple-600";
    }
  };

  const getFactionName = (faction: Faction) => {
    switch (faction) {
      case "terran":
        return "Terran";
      case "protoss":
        return "Protoss";
      case "zerg":
        return "Zerg";
    }
  };

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl pointer-events-auto flex flex-col items-center gap-6 max-w-md">
        {/* Logo */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white text-4xl font-bold">BA</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          Battle Arena
        </h1>

        {/* Version */}
        <p className="text-sm text-gray-600">v0.3.0 - Multi-Faction</p>

        {/* Faction Selection */}
        <div className="w-full">
          <h2 className="text-sm font-semibold text-gray-700 mb-2 text-center">
            Choose Your Faction
          </h2>
          <div className="flex gap-3">
            {/* Terran */}
            <button
              onClick={() => setPlayerFaction("terran")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                playerFaction === "terran"
                  ? "border-blue-500 bg-blue-50 scale-105"
                  : "border-gray-300 bg-white hover:border-blue-300"
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${getFactionColor("terran")} flex items-center justify-center mb-2`}>
                <span className="text-white text-xl font-bold">T</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Terran</p>
              <p className="text-xs text-gray-500 mt-1">Versatile</p>
            </button>

            {/* Protoss */}
            <button
              onClick={() => setPlayerFaction("protoss")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                playerFaction === "protoss"
                  ? "border-yellow-500 bg-yellow-50 scale-105"
                  : "border-gray-300 bg-white hover:border-yellow-300"
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${getFactionColor("protoss")} flex items-center justify-center mb-2`}>
                <span className="text-white text-xl font-bold">P</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Protoss</p>
              <p className="text-xs text-gray-500 mt-1">Shields</p>
            </button>

            {/* Zerg */}
            <button
              onClick={() => setPlayerFaction("zerg")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                playerFaction === "zerg"
                  ? "border-purple-500 bg-purple-50 scale-105"
                  : "border-gray-300 bg-white hover:border-purple-300"
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-lg bg-gradient-to-br ${getFactionColor("zerg")} flex items-center justify-center mb-2`}>
                <span className="text-white text-xl font-bold">Z</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Zerg</p>
              <p className="text-xs text-gray-500 mt-1">Swarm</p>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-700 text-center max-w-xs">
          <p>Build workers to boost energy!</p>
          <p className="text-xs text-gray-500 mt-1">Each worker adds +0.2 energy/sec (max 5)</p>
          <p className="text-xs text-gray-500 mt-1 italic">CPU will be randomly assigned a faction</p>
        </div>

        {/* Start button */}
        <button className="ui-cta mt-2 w-full" onClick={handleStart}>
          Start Battle
        </button>
      </div>
    </div>
  );
}
