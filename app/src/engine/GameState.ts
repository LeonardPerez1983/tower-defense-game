/**
 * GameState - Central game state management
 *
 * Manages all game state: energy, units, cards, tower health, phase.
 * Uses React Context to share state across components.
 */

import { createContext, useContext } from "react";
import { Card, UnitStats } from "../data/loadData";

// Game phases
export type GamePhase = "splash" | "playing" | "gameover";

// Unit instance (spawned from card)
export interface Unit {
  id: string; // unique instance id
  unitType: string; // references UnitStats id
  team: "player" | "cpu";
  position: [number, number, number];
  health: number;
  stats: UnitStats;
}

// Game state interface
export interface GameState {
  phase: GamePhase;
  playerEnergy: number;
  cpuEnergy: number;
  playerHand: Card[];
  cpuHand: Card[];
  units: Unit[];
  playerTowerHP: number;
  cpuTowerHP: number;
  // Config values from CSV
  maxEnergy: number;
  energyRegenRate: number;
  towerMaxHP: number;
}

// Actions to modify state
export interface GameActions {
  setPhase: (phase: GamePhase) => void;
  addEnergy: (team: "player" | "cpu", amount: number) => void;
  spendEnergy: (team: "player" | "cpu", amount: number) => boolean;
  playCard: (team: "player" | "cpu", cardId: string, position: [number, number, number]) => void;
  spawnUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;
  damageUnit: (unitId: string, damage: number) => void;
  damageTower: (team: "player" | "cpu", damage: number) => void;
  setPlayerHand: (cards: Card[]) => void;
  setCpuHand: (cards: Card[]) => void;
}

// Context
export const GameStateContext = createContext<{
  state: GameState;
  actions: GameActions;
} | null>(null);

// Hook to use game state
export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useGameState must be used within GameStateProvider");
  }
  return context;
}

// Initial state factory
export function createInitialState(
  config: Map<string, string>
): GameState {
  const maxEnergy = parseFloat(config.get("max_energy") || "10");
  const energyRegenRate = parseFloat(config.get("energy_regen_rate") || "0.5");
  const towerHP = parseFloat(config.get("tower_health") || "1000");

  return {
    phase: "splash",
    playerEnergy: maxEnergy,
    cpuEnergy: maxEnergy,
    playerHand: [],
    cpuHand: [],
    units: [],
    playerTowerHP: towerHP,
    cpuTowerHP: towerHP,
    maxEnergy,
    energyRegenRate,
    towerMaxHP: towerHP,
  };
}
