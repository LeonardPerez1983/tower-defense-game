/**
 * GameContainer - Main game wrapper with state management
 *
 * Loads all CSV data and wraps the game in GameStateProvider.
 * Handles initialization and state management.
 */

import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { GameStateProvider } from "./engine/GameStateProvider";
import { loadConfig, loadCards, loadUnits, Card, UnitStats } from "./data/loadData";
import Arena from "./game/Arena";
import HUD from "./components/HUD";
import CardHand from "./components/CardHand";
import SplashScreen from "./components/SplashScreen";
import { useEnergyTimer } from "./hooks/useEnergyTimer";
import { useCPUAI } from "./hooks/useCPUAI";
import { useGameState } from "./engine/GameState";

// Inner component that uses game state hooks
function GameContent() {
  const { state } = useGameState();

  // Start energy regeneration and CPU AI
  useEnergyTimer();
  useCPUAI();

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* LAYER 1: 3D Background (WebGL Canvas) - reserve bottom 140px for cards */}
      <Canvas
        camera={{ position: [0, 14, 8], fov: 35 }}
        className="absolute inset-x-0 top-0"
        style={{ height: 'calc(100vh - 140px)' }}
        shadows
      >
        <Arena />
      </Canvas>

      {/* LAYER 2: 2D UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {state.phase === "splash" && <SplashScreen />}
        {state.phase === "playing" && (
          <>
            <HUD />
            <CardHand />
          </>
        )}
        {state.phase === "gameover" && (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl pointer-events-auto">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Game Over!
              </h1>
              <p className="text-lg text-gray-700">
                {state.playerTowerHP > 0 ? "You Won!" : "CPU Won!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Outer component that loads data and provides context
export default function GameContainer() {
  const [config, setConfig] = useState<Map<string, string>>(new Map());
  const [cards, setCards] = useState<Card[]>([]);
  const [units, setUnits] = useState<UnitStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadConfig(), loadCards(), loadUnits()])
      .then(([configData, cardsData, unitsData]) => {
        setConfig(configData);
        setCards(cardsData);
        setUnits(unitsData);
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
    <GameStateProvider config={config} allCards={cards} allUnits={units}>
      <GameContent />
    </GameStateProvider>
  );
}
