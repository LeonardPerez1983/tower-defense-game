/**
 * GameEntityRenderer - Integration layer between game logic and StarCraft visual models
 *
 * Maps game data (PlacedBuilding, Unit) to visual models from StarcraftPrototypeModels.
 * Provides drop-in replacements for Building.tsx and Unit.tsx rendering.
 */

import { Html } from "@react-three/drei";
import { PlacedBuilding, Unit, useGameState } from "../../engine/GameState";
import { StarcraftModel, ModelName } from "./StarcraftPrototypeModels";
import {
  UnitId,
  BuildingId,
  getUnitVisual,
  getBuildingVisual,
  getFactionColor,
} from "./starcraftVisualConfig";
import { ZergCreepField, ProtossShieldShimmer, TerranIndustrialLights, WorkerPips } from "./StarcraftFactionFX";
import StructureHealthBadge from "../../components/StructureHealthBadge";

// ============================================================================
// ID MAPPING - Maps game data IDs to visual IDs
// ============================================================================

const UNIT_ID_MAP: Record<string, UnitId> = {
  marine_unit: "terran_marine",
  firebat_unit: "terran_firebat",
  larva_unit: "zerg_larva",
  cocoon_unit: "zerg_cocoon",
  zergling_unit: "zerg_zergling",
  hydralisk_unit: "zerg_hydralisk",
  zealot_unit: "protoss_zealot",
  dragoon_unit: "protoss_dragoon",
};

const BUILDING_ID_MAP: Record<string, BuildingId> = {
  command_center: "terran_command_center",
  barracks: "terran_barracks",
  bunker: "terran_bunker",
  zerg_hatchery: "zerg_hatchery",
  spawning_pool: "zerg_spawning_pool",
  creep_colony: "zerg_creep_colony",
  sunken_colony: "zerg_sunken_colony",
  hydralisk_den: "zerg_spawning_pool", // Use Spawning Pool model as placeholder
  protoss_nexus: "protoss_nexus",
  protoss_gateway: "protoss_gateway",
  protoss_cannon: "protoss_photon_cannon",
};

// Zerg creep now imported from StarcraftFactionFX.tsx

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Determine which buildings should show HP badges
function shouldShowHealthBadge(buildingType: string): boolean {
  // Show HP for:
  // - Main structures (Command Center, Nexus, Hatchery)
  // - Defensive buildings (Bunker, Photon Cannon, Sunken Colony)
  const importantStructures = [
    "command_center",
    "protoss_nexus",
    "zerg_hatchery",
    "bunker",
    "protoss_cannon",
    "sunken_colony",
  ];
  return importantStructures.includes(buildingType);
}

// ============================================================================
// GAME BUILDING MODEL
// ============================================================================

interface GameBuildingModelProps {
  building: PlacedBuilding;
}

export function GameBuildingModel({ building }: GameBuildingModelProps) {
  const { state } = useGameState();
  const stats = building.stats;
  const visualId = BUILDING_ID_MAP[building.buildingType];

  // Debug logging

  // Fallback to simple geometry if visual not found
  if (!visualId) {
    return <FallbackBuilding building={building} />;
  }

  const visual = getBuildingVisual(visualId);
  const teamColor = building.team === "player" ? "#4a9eff" : "#ff6b6b";


  // Calculate health and shield percentages
  const healthPercent = (building.health / stats.health) * 100;
  const shieldPercent =
    stats.max_shields > 0 ? (building.shields / stats.max_shields) * 100 : 0;
  const hasShields = stats.max_shields > 0;

  // Construction progress
  const isConstructing = building.constructionStartTime !== undefined;
  const constructionProgress = isConstructing
    ? Math.min(
        1.0,
        building.constructionDuration
          ? (performance.now() - building.constructionStartTime!) /
            building.constructionDuration
          : 1.0
      )
    : 1.0;

  // Determine if this building should spawn creep
  const shouldSpawnCreep = visual.faction === "zerg";

  // Rotate to face enemy (player faces -Z, CPU faces +Z)
  const rotation: [number, number, number] = [0, building.team === "player" ? Math.PI : 0, 0];

  return (
    <group position={building.position} rotation={rotation}>
      {/* Zerg creep field */}
      {shouldSpawnCreep && visual.creepRadius && (
        <ZergCreepField
          position={[0, 0.02, 0]}
          radius={visual.creepRadius}
          variant={visual.creepRadius > 2 ? "large" : visual.creepRadius > 1.5 ? "medium" : "small"}
        />
      )}

      {/* StarCraft model */}
      {visual.model ? (
        <StarcraftModel
          model={visual.model}
          position={[0, 0, 0]}
          scale={visual.defaultScale * (isConstructing ? constructionProgress : 1.0)}
          teamColor={teamColor}
        />
      ) : (
        <mesh position={[0, visual.height / 2, 0]}>
          <boxGeometry args={[visual.radius * 2, visual.height, visual.radius * 2]} />
          <meshStandardMaterial color={teamColor} />
        </mesh>
      )}

      {/* Protoss shield shimmer */}
      {visual.faction === "protoss" && hasShields && (
        <ProtossShieldShimmer
          radius={visual.radius}
          height={visual.height}
          shieldPercent={shieldPercent}
          position={[0, visual.height / 2, 0]}
        />
      )}

      {/* Terran industrial lights */}
      {visual.faction === "terran" && !isConstructing && (
        <TerranIndustrialLights
          buildingType={building.buildingType}
          radius={visual.radius}
          height={visual.height}
        />
      )}

      {/* Worker pips for main buildings */}
      {(building.buildingType === "command_center" ||
        building.buildingType === "protoss_nexus" ||
        building.buildingType === "zerg_hatchery") &&
        !isConstructing && (
          <WorkerPips
            workerCount={building.team === "player" ? state.playerWorkerCount : state.cpuWorkerCount}
            maxWorkers={5}
            faction={visual.faction}
            radius={visual.radius}
            height={visual.height}
            team={building.team}
          />
        )}

      {/* Health/Shield Badge - Important structures only (no construction progress, not paused) */}
      {!isConstructing && shouldShowHealthBadge(building.buildingType) && state.phase === "playing" && !state.paused && (
        <Html
          position={building.team === "player"
            ? [0, -0.3, 0]  // Player: bottom of building
            : [0, visual.height * visual.defaultScale + 0.5, 0]  // Enemy: top of building
          }
          center
          style={{ pointerEvents: 'none' }}
        >
          <StructureHealthBadge
            hp={building.health}
            maxHp={stats.health}
            shield={building.shields}
            maxShield={stats.max_shields}
            faction={visual.faction}
            showNumber={false}
          />
        </Html>
      )}
    </group>
  );
}

// ============================================================================
// GAME UNIT MODEL
// ============================================================================

interface GameUnitModelProps {
  unit: Unit;
}

export function GameUnitModel({ unit }: GameUnitModelProps) {
  const stats = unit.stats;
  const visualId = UNIT_ID_MAP[unit.unitType];

  // Debug logging

  // Fallback to simple geometry if visual not found
  if (!visualId) {
    return <FallbackUnit unit={unit} />;
  }

  const visual = getUnitVisual(visualId);
  const teamColor = unit.team === "player" ? "#4a9eff" : "#ff6b6b";

  // Calculate health and shield percentages
  const healthPercent = (unit.health / stats.health) * 100;
  const shieldPercent =
    stats.max_shields > 0 ? (unit.shields / stats.max_shields) * 100 : 0;
  const hasShields = stats.max_shields > 0;

  // Rotate to face enemy (player faces -Z, CPU faces +Z)
  const rotation: [number, number, number] = [0, unit.team === "player" ? Math.PI : 0, 0];

  return (
    <group position={unit.position} rotation={rotation}>
      {/* StarCraft model */}
      <StarcraftModel
        model={visual.model}
        position={[0, 0, 0]}
        scale={visual.defaultScale}
        teamColor={teamColor}
      />

      {/* Protoss shield shimmer */}
      {visual.faction === "protoss" && hasShields && (
        <ProtossShieldShimmer
          radius={visual.radius * visual.defaultScale}
          height={visual.height * visual.defaultScale}
          shieldPercent={shieldPercent}
          position={[0, (visual.height * visual.defaultScale) / 2, 0]}
        />
      )}

      {/* No persistent HP bars for units - cleaner battlefield */}
    </group>
  );
}

// ============================================================================
// FALLBACK RENDERERS (for unmapped types)
// ============================================================================

function FallbackBuilding({ building }: { building: PlacedBuilding }) {
  const stats = building.stats;
  const healthPercent = (building.health / stats.health) * 100;

  return (
    <group position={building.position}>
      <mesh position={[0, stats.height / 2, 0]} castShadow>
        <boxGeometry args={[stats.width, stats.height, stats.depth]} />
        <meshStandardMaterial color={stats.color} />
      </mesh>

      <Html position={[0, stats.height + 0.5, 0]} center style={{ zIndex: 10 }}>
        <div className="bg-black/50 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
          <div className="flex items-center gap-1">
            <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-[10px]">{Math.round(building.health)}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

function FallbackUnit({ unit }: { unit: Unit }) {
  const stats = unit.stats;
  const healthPercent = (unit.health / stats.health) * 100;

  return (
    <group position={unit.position}>
      <mesh position={[0, 0.375, 0]} castShadow>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial color={stats.color} />
      </mesh>

      <Html
        position={[0, 1.25, 0]}
        center
        style={{ pointerEvents: "none", zIndex: 10 }}
      >
        <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs min-w-16">
          <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                unit.team === "player" ? "bg-green-400" : "bg-red-400"
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
