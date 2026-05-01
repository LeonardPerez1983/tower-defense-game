/**
 * GameState - Central game state management
 *
 * Manages all game state: energy, units, cards, tower health, phase.
 * Uses React Context to share state across components.
 */

import { createContext, useContext } from "react";
import { Card, UnitStats, Building as BuildingStats } from "../data/loadData";

// Game phases
export type GamePhase = "splash" | "playing" | "gameover";

// Production queue entry
export interface ProductionQueueEntry {
  cardId: string;
  buildingId: string;  // Which building is producing this
  startTime: number;   // When production started (performance.now())
  buildTime: number;   // How long it takes (from CSV)
}

// Unit instance (spawned from card)
export interface Unit {
  id: string; // unique instance id
  unitType: string; // references UnitStats id
  team: "player" | "cpu";
  position: [number, number, number];
  health: number;
  shields: number; // current shield points
  lastShieldDamageTime?: number; // timestamp of last shield damage (for regen delay)
  stats: UnitStats;
  waypoints?: [number, number, number][]; // Pathfinding waypoints
  currentWaypointIndex?: number; // Which waypoint we're heading to
}

// Building instance (placed from card)
export interface PlacedBuilding {
  id: string; // unique instance id
  buildingType: string; // references BuildingStats id
  team: "player" | "cpu";
  position: [number, number, number];
  health: number;
  shields: number; // current shield points
  lastShieldDamageTime?: number; // timestamp of last shield damage (for regen delay)
  stats: BuildingStats;
  constructionStartTime?: number; // When construction started (undefined = complete)
  constructionDuration?: number; // How long construction takes (undefined = instant/complete)
  linkedUpgradeCardId?: string; // For Creep Colony: the upgrade card (sunken_colony) linked to this building
}

// Game state interface
export interface GameState {
  phase: GamePhase;
  playerFaction: "terran" | "protoss" | "zerg";
  cpuFaction: "terran" | "protoss" | "zerg";
  playerEnergy: number;
  cpuEnergy: number;
  playerHand: Card[];
  cpuHand: Card[];
  playerDeck: Card[];
  cpuDeck: Card[];
  playerDiscard: Card[];
  cpuDiscard: Card[];
  units: Unit[];
  buildings: PlacedBuilding[];
  playerWorkerCount: number;
  cpuWorkerCount: number;
  playerTowerHP: number;
  cpuTowerHP: number;
  // Config values from CSV
  maxEnergy: number;
  energyRegenRate: number;
  towerMaxHP: number;
  maxWorkers: number;
  energyPerWorker: number;
  // Production queue system
  playerProductionQueue: ProductionQueueEntry[];
  cpuProductionQueue: ProductionQueueEntry[];
  // Zerg creep system
  creepTiles: Set<string>; // Set of "x,z" coordinates with creep
  // Zerg larva system
  larvaCount: Map<string, number>; // Map of Hatchery building ID -> larva count (max 3 per Hatchery)
}

// Actions to modify state
export interface GameActions {
  setPhase: (phase: GamePhase) => void;
  setFactions: (playerFaction: "terran" | "protoss" | "zerg", cpuFaction: "terran" | "protoss" | "zerg") => void;
  addEnergy: (team: "player" | "cpu", amount: number) => void;
  spendEnergy: (team: "player" | "cpu", amount: number) => boolean;
  playCard: (team: "player" | "cpu", cardId: string, position: [number, number, number]) => void;
  spawnUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;
  damageUnit: (unitId: string, damage: number) => void;
  updateUnitPosition: (unitId: string, position: [number, number, number]) => void;
  setUnitWaypoints: (unitId: string, waypoints: [number, number, number][], currentIndex: number) => void;
  damageTower: (team: "player" | "cpu", damage: number) => void;
  placeBuilding: (building: PlacedBuilding) => void;
  removeBuilding: (buildingId: string) => void;
  damageBuilding: (buildingId: string, damage: number) => void;
  addWorker: (team: "player" | "cpu") => void;
  setPlayerHand: (cards: Card[]) => void;
  setCpuHand: (cards: Card[]) => void;
  initializeDeck: (team: "player" | "cpu", allCards: Card[]) => void;
  addCardsToDeck: (team: "player" | "cpu", cards: Card[]) => void;
  // Production queue actions
  queueProduction: (team: "player" | "cpu", card: Card, buildingId: string) => void;
  completeProduction: (team: "player" | "cpu", queueEntry: ProductionQueueEntry) => void;
  discardCard: (team: "player" | "cpu", cardId: string) => void;
  // Shield actions
  updateUnitShields: (unitId: string, shields: number) => void;
  updateBuildingShields: (buildingId: string, shields: number) => void;
  // Creep actions
  updateCreep: (creepTiles: Set<string>) => void;
  // Larva actions
  addLarva: (buildingId: string) => void;
  consumeLarva: (buildingId: string) => boolean;
  // Building upgrade actions
  upgradeBuilding: (buildingId: string, newBuildingType: string) => void;
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
  const maxWorkers = parseFloat(config.get("max_workers") || "5");
  const energyPerWorker = parseFloat(config.get("energy_per_worker") || "0.2");

  return {
    phase: "splash",
    playerFaction: "terran", // Default, will be set by splash screen
    cpuFaction: "terran", // Default, will be set by splash screen
    playerEnergy: maxEnergy,
    cpuEnergy: maxEnergy,
    playerHand: [],
    cpuHand: [],
    playerDeck: [],
    cpuDeck: [],
    playerDiscard: [],
    cpuDiscard: [],
    units: [],
    buildings: [],
    playerWorkerCount: 0,
    cpuWorkerCount: 0,
    playerTowerHP: towerHP,
    cpuTowerHP: towerHP,
    maxEnergy,
    energyRegenRate,
    towerMaxHP: towerHP,
    maxWorkers,
    energyPerWorker,
    playerProductionQueue: [],
    cpuProductionQueue: [],
    creepTiles: new Set<string>(),
    larvaCount: new Map<string, number>(),
  };
}
