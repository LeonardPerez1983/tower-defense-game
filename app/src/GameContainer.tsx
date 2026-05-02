/**
 * GameContainer - Main game wrapper with state management
 *
 * Loads all CSV data and wraps the game in GameStateProvider.
 * Handles initialization and state management.
 */

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { GameStateProvider } from "./engine/GameStateProvider";
import { loadConfig, loadCards, loadUnits, loadBuildings, loadTechTree, Card, UnitStats, Building, TechTreeEntry } from "./data/loadData";
import Arena from "./game/Arena";
import HUD from "./components/HUD";
import CardHand from "./components/CardHand";
import StartMenuPage from "./ui/menu/StartMenuPage";
import GameOverOverlay from "./ui/battle/GameOverOverlay";
import { ProductionQueueDisplay } from "./components/ProductionQueueDisplay";
import LarvaDisplay from "./components/LarvaDisplay";
import { useEnergyTimer } from "./hooks/useEnergyTimer";
import { useCPUAI } from "./hooks/useCPUAI";
import { useTechTreeUnlocking } from "./hooks/useTechTreeUnlocking";
import { useGameState, PlacedBuilding } from "./engine/GameState";
import { useBuildingPlacement } from "./hooks/useBuildingPlacement";

// Inner component that uses game state hooks
interface GameContentProps {
  allCards: Card[];
  allBuildings: Building[];
  techTree: TechTreeEntry[];
}

function GameContent({ allCards, allBuildings, techTree }: GameContentProps) {
  const { state, actions } = useGameState();

  // Start energy regeneration and CPU AI
  useEnergyTimer();
  useCPUAI({ allBuildings });
  useTechTreeUnlocking({ allCards, techTree }); // Tech tree unlocks (Nexus → Gateway, Gateway → Zealot, etc.)

  // Building placement system
  const buildingPlacement = useBuildingPlacement();

  // Handle game initialization from start menu
  const handleGameStart = async (playerFaction: "terran" | "protoss" | "zerg") => {
    // CPU picks random faction
    const factions: ("terran" | "protoss" | "zerg")[] = ["terran", "protoss", "zerg"];
    const cpuFaction = factions[Math.floor(Math.random() * factions.length)];

    // Set factions
    actions.setFactions(playerFaction, cpuFaction);

    // Place starting base buildings for both teams
    const getBaseId = (faction: "terran" | "protoss" | "zerg") => {
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

    // Initialize larva for Zerg Hatcheries
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

    // Initialize starting deck: 5 worker cards
    const getWorkerCardId = (faction: "terran" | "protoss" | "zerg") => {
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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* LAYER 1: 3D Background (WebGL Canvas) - only render when playing */}
      {state.phase === "playing" && (
        <Canvas
          camera={{ position: [0, 18, 14], fov: 40 }}
          className="absolute inset-x-0 top-0"
          style={{ height: 'calc(100vh - 140px)' }}
          shadows
        >
          <Arena buildingPlacement={buildingPlacement} />
        </Canvas>
      )}

      {/* LAYER 2: 2D UI Overlay */}
      {state.phase === "splash" && (
        <StartMenuPage onStart={handleGameStart} />
      )}

      {state.phase === "playing" && (
        <div className="absolute inset-0 pointer-events-none">
          <HUD />
          <ProductionQueueDisplay />
          <LarvaDisplay />
          <CardHand buildingPlacement={buildingPlacement} techTree={techTree} />
        </div>
      )}

      {state.phase === "gameover" && (
        <GameOverOverlay
          result={state.winner === "player" ? "victory" : state.winner === "cpu" ? "defeat" : "tie"}
          playerFaction={state.playerFaction}
          cpuFaction={state.cpuFaction}
          onPlayAgain={() => window.location.reload()}
          onBackToMenu={() => {
            window.location.reload();
            // In future: actions.setPhase("splash");
          }}
        />
      )}
    </div>
  );
}

// Outer component that loads data and provides context
export default function GameContainer() {
  const [config, setConfig] = useState<Map<string, string>>(new Map());
  const [cards, setCards] = useState<Card[]>([]);
  const [units, setUnits] = useState<UnitStats[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [techTree, setTechTree] = useState<TechTreeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadConfig(), loadCards(), loadUnits(), loadBuildings(), loadTechTree()])
      .then(([configData, cardsData, unitsData, buildingsData, techTreeData]) => {
        setConfig(configData);
        setCards(cardsData);
        setUnits(unitsData);
        setBuildings(buildingsData);
        setTechTree(techTreeData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load game data:", error);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">Loading Battle Arena...</p>
        </div>
      </div>
    );
  }

  return (
    <GameStateProvider config={config} allCards={cards} allUnits={units} allBuildings={buildings} techTree={techTree}>
      <GameContent allCards={cards} allBuildings={buildings} techTree={techTree} />
    </GameStateProvider>
  );
}
