/**
 * starcraftVisualConfig - Data-driven visual mapping for StarCraft models
 *
 * Maps unit/building IDs to visual models, scales, VFX, and animation styles.
 */

import { ModelName } from "./StarcraftPrototypeModels";

export type Faction = "terran" | "zerg" | "protoss";

export type UnitId =
  | "terran_marine"
  | "terran_firebat"
  | "zerg_larva"
  | "zerg_cocoon"
  | "zerg_zergling"
  | "zerg_hydralisk"
  | "protoss_zealot"
  | "protoss_dragoon";

export type BuildingId =
  | "terran_command_center"
  | "terran_barracks"
  | "terran_bunker"
  | "zerg_hatchery"
  | "zerg_spawning_pool"
  | "zerg_creep_colony"
  | "zerg_sunken_colony"
  | "protoss_nexus"
  | "protoss_gateway"
  | "protoss_photon_cannon";

export type AttackVfxType =
  | "terran_bullet"
  | "terran_flame"
  | "zerg_slash"
  | "zerg_spine"
  | "zerg_tentacle"
  | "protoss_blade_slash"
  | "protoss_plasma"
  | "protoss_cannon_bolt";

export type MoveStyle = "none" | "walker" | "crawler" | "slither" | "hover";
export type AttackStyle = "none" | "melee_lunge" | "ranged_recoil" | "heavy_burst" | "pulse";

// ============================================================================
// UNIT VISUALS
// ============================================================================

export const UNIT_VISUALS: Record<UnitId, {
  model: ModelName;
  faction: Faction;
  defaultScale: number;
  radius: number;
  height: number;
  attackVfx?: AttackVfxType;
  moveStyle: MoveStyle;
  attackStyle: AttackStyle;
}> = {
  terran_marine: {
    model: "TerranMarine",
    faction: "terran",
    defaultScale: 1.0,
    radius: 0.45,
    height: 1.1,
    attackVfx: "terran_bullet",
    moveStyle: "walker",
    attackStyle: "ranged_recoil",
  },
  terran_firebat: {
    model: "TerranFirebat",
    faction: "terran",
    defaultScale: 1.08,
    radius: 0.5,
    height: 1.15,
    attackVfx: "terran_flame",
    moveStyle: "walker",
    attackStyle: "heavy_burst",
  },
  zerg_larva: {
    model: "ZergLarva",
    faction: "zerg",
    defaultScale: 0.55,
    radius: 0.3,
    height: 0.3,
    moveStyle: "none",
    attackStyle: "none",
  },
  zerg_cocoon: {
    model: "ZergCocoon",
    faction: "zerg",
    defaultScale: 0.7,
    radius: 0.35,
    height: 0.5,
    moveStyle: "none",
    attackStyle: "none",
  },
  zerg_zergling: {
    model: "Zergling",
    faction: "zerg",
    defaultScale: 0.85,
    radius: 0.5,
    height: 0.6,
    attackVfx: "zerg_slash",
    moveStyle: "crawler",
    attackStyle: "melee_lunge",
  },
  zerg_hydralisk: {
    model: "Hydralisk",
    faction: "zerg",
    defaultScale: 1.15,
    radius: 0.55,
    height: 1.4,
    attackVfx: "zerg_spine",
    moveStyle: "slither",
    attackStyle: "ranged_recoil",
  },
  protoss_zealot: {
    model: "ProtossZealot",
    faction: "protoss",
    defaultScale: 1.1,
    radius: 0.5,
    height: 1.3,
    attackVfx: "protoss_blade_slash",
    moveStyle: "hover",
    attackStyle: "melee_lunge",
  },
  protoss_dragoon: {
    model: "ProtossDragoon",
    faction: "protoss",
    defaultScale: 1.2,
    radius: 0.75,
    height: 1.5,
    attackVfx: "protoss_plasma",
    moveStyle: "walker",
    attackStyle: "ranged_recoil",
  },
};

// ============================================================================
// BUILDING VISUALS
// ============================================================================

export const BUILDING_VISUALS: Record<BuildingId, {
  model: ModelName;
  faction: Faction;
  defaultScale: number;
  radius: number;
  height: number;
  attackVfx?: AttackVfxType;
  canAttack: boolean;
  upgradeFrom?: BuildingId;
  shouldSpawnCreep?: boolean;
  creepRadius?: number;
}> = {
  terran_command_center: {
    model: "TerranCommandCenter",
    faction: "terran",
    defaultScale: 1.0,
    radius: 2.2,
    height: 1.8,
    canAttack: false,
  },
  terran_barracks: {
    model: "TerranBarracks",
    faction: "terran",
    defaultScale: 0.8,
    radius: 1.5,
    height: 1.2,
    canAttack: false,
  },
  terran_bunker: {
    model: "TerranBunker",
    faction: "terran",
    defaultScale: 0.7,
    radius: 1.3,
    height: 0.9,
    attackVfx: "terran_bullet",
    canAttack: true,
  },
  zerg_hatchery: {
    model: "ZergHatchery",
    faction: "zerg",
    defaultScale: 1.0,
    radius: 2.4,
    height: 1.5,
    canAttack: false,
    shouldSpawnCreep: true,
    creepRadius: 5.28, // radius * 2.2
  },
  zerg_spawning_pool: {
    model: "ZergSpawningPool",
    faction: "zerg",
    defaultScale: 1.2,
    radius: 1.6,
    height: 0.8,
    canAttack: false,
    shouldSpawnCreep: true,
    creepRadius: 2.56, // radius * 1.6
  },
  zerg_creep_colony: {
    model: "ZergCreepColony",
    faction: "zerg",
    defaultScale: 0.9,
    radius: 1.0,
    height: 1.2,
    canAttack: false,
    shouldSpawnCreep: true,
    creepRadius: 1.4, // radius * 1.4
  },
  zerg_sunken_colony: {
    model: "ZergSunkenColony",
    faction: "zerg",
    defaultScale: 1.0,
    radius: 1.2,
    height: 1.4,
    attackVfx: "zerg_tentacle",
    canAttack: true,
    upgradeFrom: "zerg_creep_colony",
    shouldSpawnCreep: true,
    creepRadius: 1.8, // radius * 1.5
  },
  protoss_nexus: {
    model: "ProtossNexus",
    faction: "protoss",
    defaultScale: 1.0,
    radius: 2.2,
    height: 2.0,
    canAttack: false,
  },
  protoss_gateway: {
    model: "ProtossGateway",
    faction: "protoss",
    defaultScale: 1.0,
    radius: 1.8,
    height: 2.2,
    canAttack: false,
  },
  protoss_photon_cannon: {
    model: "ProtossPhotonCannon",
    faction: "protoss",
    defaultScale: 0.9,
    radius: 1.0,
    height: 1.6,
    attackVfx: "protoss_cannon_bolt",
    canAttack: true,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getUnitVisual(unitId: UnitId) {
  return UNIT_VISUALS[unitId];
}

export function getBuildingVisual(buildingId: BuildingId) {
  return BUILDING_VISUALS[buildingId];
}

export function getFactionColor(faction: Faction): string {
  switch (faction) {
    case "terran": return "#4a9eff";
    case "zerg": return "#9b59b6";
    case "protoss": return "#f1c40f";
  }
}
