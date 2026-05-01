# Protoss Faction Implementation Plan

Status: Active
Last updated: 2026-05-01

## Problem

Currently only Terran faction is playable. We need to add Protoss as a second playable faction with:
- Shield system (shields absorb damage before health, auto-regenerate)
- 6 units/buildings: Probe, Zealot, Dragoon, Nexus, Gateway, Photon Cannon
- Simplified tech tree (no pylon power requirements)
- Probes work like SCVs (generate energy)

## Design

### 1. Shield System

**How Shields Work:**
- All Protoss units and buildings have both shields and health
- Damage order: Shields absorb damage first, then health
- Shield regeneration:
  - Starts after 3 seconds of not taking damage (no recent shield damage timestamp)
  - Regenerates at 2 shield points per second
  - Stops immediately when taking any damage
  - Does not regenerate above max shield value

**Shield Values (scaled from StarCraft):**

From STARCRAFT_REFERENCE.md, Protoss units have shields. In StarCraft, shields are typically ~50% of total HP for most units. For this game, we'll scale appropriately:

| Unit/Building | Health | Max Shields | Total Effective HP | Notes |
|--------------|--------|-------------|-------------------|-------|
| Probe | 20 | 20 | 40 | Worker (SC: 20hp/20s) |
| Zealot | 60 | 60 | 120 | Melee tank (SC: 100hp/60s) |
| Dragoon | 50 | 50 | 100 | Ranged (SC: 80hp/80s) |
| Nexus | 600 | 400 | 1000 | Main base (SC: 750hp/750s) |
| Gateway | 300 | 200 | 500 | Production (SC: 500hp/500s) |
| Photon Cannon | 60 | 60 | 120 | Static defense (SC: 100hp/100s) |

**Regen Timing:**
- Delay before regen starts: 3.0 seconds (after last damage)
- Regen rate: 2 shields/second
- Example: Zealot with 60 max shields fully regenerates in 30 seconds after taking no damage for 3 seconds

**UI Display:**
- Health bar shows two segments:
  - Top segment: Blue shield bar (shows current_shields / max_shields)
  - Bottom segment: Green/red health bar (shows current_health / max_health)
- Both bars should be visible when both are present
- When shields are depleted, only health bar shows

### 2. Tech Tree (Simplified)

Protoss follows StarCraft model: Nexus → Gateway → Units. No pylon power requirements.

**Tech Tree Flow:**
```
Nexus (starts built, like Terran Command Center)
  ↓
Probe (requires Nexus, max 5 like SCVs)
  ↓
Gateway (requires Nexus)
  ↓
Zealot (requires Gateway)
Dragoon (requires Gateway)
Photon Cannon (requires Gateway, static defense)
```

**Simplifications:**
- No Cybernetics Core requirement for Dragoons (they unlock with Gateway)
- No Forge requirement for Photon Cannons (they unlock with Gateway)
- No pylon power field mechanics
- All units available immediately when Gateway is built

### 3. Worker System

**Probes work exactly like SCVs:**
- Generate +0.2 energy/sec per Probe
- Max 5 Probes per team
- Probe card costs 2 energy, has 2 second build time
- Probe card is permanently removed after use (like SCV)
- Build from Nexus using production queue
- No visible worker units (abstract resource generation)

### 4. Balance Numbers

**Reference: StarCraft Brood War Stats**

From STARCRAFT_REFERENCE.md:
- Probe: 50 minerals, 5 damage (Normal), 20hp/20shields
- Zealot: 100 minerals, 16 damage (Normal), 100hp/60shields, Melee
- Dragoon: 125m/50g, 20 damage (Explosive), 80hp/80shields, Ranged

**Scaled for this game:**

#### Cards

| Card ID | Name | Cost | Build Time | Effect | Unit/Building ID | Card Type | Max Copies | Permanent Removal | Discard Cost |
|---------|------|------|-----------|--------|-----------------|-----------|------------|-------------------|--------------|
| protoss_probe | Probe | 2 | 2 | add_worker | - | spell | 5 | true | 0 |
| protoss_gateway | Gateway | 5 | 10 | spawn_building | - | building | 2 | false | 2 |
| protoss_zealot | Zealot | 5 | 7 | spawn_unit | zealot_unit | unit | 3 | false | 1 |
| protoss_dragoon | Dragoon | 4 | 5 | spawn_unit | dragoon_unit | unit | 3 | false | 1 |
| protoss_cannon | Photon Cannon | 5 | 8 | spawn_building | - | building | 3 | false | 2 |

**Cost Rationale:**
- Probe (2): Same as SCV - worker cards should be cheap
- Nexus: **Removed as card - Protoss starts with Nexus** (like Terran starts with Command Center)
- Gateway (5): Same as Barracks - tier 1 production building
- Zealot (5): **BALANCED - More expensive than Marine (2)** - very tanky melee unit with shields (120 effective HP vs Marine's 45 HP)
- Dragoon (4): More than Marine (2) - stronger ranged unit with shields
- Photon Cannon (5): Defensive building, moderate cost

**Starting Conditions:**
- Protoss players start with 7 energy (Terran starts with 10)
- Protoss players start with 1 Nexus already built
- This balances the shield advantage and powerful units

#### Units

| Unit ID | Health | Shields | Speed | Damage | Attack Range | Shape | Color | Faction |
|---------|--------|---------|-------|--------|--------------|-------|-------|---------|
| probe_unit | 20 | 20 | 2.0 | 3 | 1.0 | box | #FFD700 | protoss |
| zealot_unit | 60 | 60 | 2.8 | 12 | 1.5 | cylinder | #4169E1 | protoss |
| dragoon_unit | 50 | 50 | 2.0 | 15 | 5.0 | box | #1E90FF | protoss |

**Unit Rationale:**
- Probe: 20hp/20s, weak attack (for construction defense flavor), slow
- Zealot: 60hp/60s (120 total), high damage, fast melee (1.5 range for melee), tanky frontline
- Dragoon: 50hp/50s (100 total), moderate damage, slow but long range (5.0), ranged DPS

**Colors:**
- Golden (#FFD700) for Probe - classic Protoss gold
- Royal Blue (#4169E1) for Zealot - strong blue
- Dodger Blue (#1E90FF) for Dragoon - brighter blue

**Shape:**
- Probe: box (small worker)
- Zealot: cylinder (tall standing warrior)
- Dragoon: box (quadrupedal walker)

#### Buildings

| Building ID | Name | Cost | Health | Shields | Shape | Color | Width | Height | Depth |
|------------|------|------|--------|---------|-------|-------|-------|--------|-------|
| protoss_nexus | Nexus | 10 | 600 | 400 | sphere | #FFD700 | 2.5 | 2.0 | 2.5 |
| protoss_gateway | Gateway | 5 | 300 | 200 | box | #4169E1 | 1.8 | 1.8 | 1.8 |
| protoss_cannon | Photon Cannon | 5 | 60 | 60 | cylinder | #00CED1 | 1.0 | 2.0 | 1.0 |

**Building Rationale:**
- Nexus: 600hp/400s (1000 total) - same as Command Center, large sphere
- Gateway: 300hp/200s (500 total) - production building, smaller than Nexus
- Photon Cannon: 60hp/60s (120 total) - static defense tower

**Colors:**
- Gold (#FFD700) for Nexus - iconic Protoss color
- Royal Blue (#4169E1) for Gateway - matches faction
- Dark Turquoise (#00CED1) for Photon Cannon - energy weapon color

#### Tech Tree

| Card ID | Required Building | Faction |
|---------|------------------|---------|
| protoss_probe | protoss_nexus | protoss |
| protoss_nexus | none | protoss |
| protoss_gateway | protoss_nexus | protoss |
| protoss_zealot | protoss_gateway | protoss |
| protoss_dragoon | protoss_gateway | protoss |
| protoss_cannon | protoss_gateway | protoss |

### 5. Photon Cannon Mechanics

Photon Cannons are static defense buildings that auto-attack enemies like units do.

**Stats:**
- Attack range: 7.0 (longer than units)
- Damage: 20 per attack
- Attack cooldown: 1.5 seconds (slower than units)
- Can attack both ground and air (ground only for now)
- Does not move (position is fixed)
- Uses same combat system as units (checks for enemies in range)

**Implementation:**
- Photon Cannon is a building, but participates in combat like a unit
- Combat hook checks buildings with attack capabilities
- Needs building properties: `attack_damage`, `attack_range`, `attack_cooldown` (optional columns)

## Implementation

### Phase 1: Data Schema Changes

**Files to modify:**
1. `data/units.csv` - Add shield columns
2. `data/buildings.csv` - Add shield columns and combat stats
3. `data/cards.csv` - Add Protoss cards
4. `data/tech_tree.csv` - Add Protoss tech dependencies

**Schema Changes:**

#### units.csv
Add columns: `max_shields`, `shield_regen_delay`, `shield_regen_rate`

```csv
id,health,max_shields,shield_regen_delay,shield_regen_rate,speed,damage,attack_range,shape,color,faction
worker_unit,60,0,0,0,2.0,5,1.0,box,#3b82f6,terran
marine_unit,45,0,0,0,2.5,6,4.0,box,#ff6b6b,terran
probe_unit,20,20,3.0,2.0,2.0,3,1.0,box,#FFD700,protoss
zealot_unit,60,60,3.0,2.0,2.8,12,1.5,cylinder,#4169E1,protoss
dragoon_unit,50,50,3.0,2.0,2.0,15,5.0,box,#1E90FF,protoss
```

**Note:** Terran units have 0 for all shield values (no shields).

#### buildings.csv
Add columns: `max_shields`, `shield_regen_delay`, `shield_regen_rate`, `attack_damage`, `attack_range`, `attack_cooldown`

```csv
id,name,cost,health,max_shields,shield_regen_delay,shield_regen_rate,attack_damage,attack_range,attack_cooldown,shape,color,width,height,depth,description
command_center,Command Center,400,1000,0,0,0,0,0,0,box,#3b82f6,1.875,1.5,1.875,Base building - produces workers
barracks,Barracks,5,300,0,0,0,0,0,0,box,#ef4444,1.5,1.125,1.5,Infantry production - unlocks Marines
protoss_nexus,Nexus,10,600,400,3.0,2.0,0,0,0,sphere,#FFD700,2.5,2.0,2.5,Protoss base - produces Probes
protoss_gateway,Gateway,5,300,200,3.0,2.0,0,0,0,box,#4169E1,1.8,1.8,1.8,Unit production - unlocks Zealots and Dragoons
protoss_cannon,Photon Cannon,5,60,60,3.0,2.0,20,7.0,1.5,cylinder,#00CED1,1.0,2.0,1.0,Static defense - attacks enemies automatically
```

**Note:** Most buildings have attack values of 0 (non-combat). Photon Cannon has combat stats.

#### cards.csv
```csv
id,name,cost,effect_type,effect_value,unit_id,building_id,card_type,faction,description,max_copies,is_permanent_removal,discard_cost,build_time
worker,SCV,2,add_worker,,,,spell,terran,Hire worker - generates +0.2 energy/sec,5,true,0,2
barracks,Barracks,5,spawn_building,,,,building,terran,Infantry production - unlocks Marines,1,false,2,10
marine,Marine,2,spawn_unit,,marine_unit,,unit,terran,Basic infantry unit,1,false,1,3
protoss_probe,Probe,2,add_worker,,,,spell,protoss,Hire worker - generates +0.2 energy/sec,5,true,0,2
protoss_gateway,Gateway,5,spawn_building,,,,building,protoss,Unit production - unlocks Zealots and Dragoons,2,false,2,10
protoss_zealot,Zealot,5,spawn_unit,,zealot_unit,,unit,protoss,Powerful melee warrior with shields,3,false,1,7
protoss_dragoon,Dragoon,4,spawn_unit,,dragoon_unit,,unit,protoss,Ranged attacker with shields,3,false,1,5
protoss_cannon,Photon Cannon,5,spawn_building,,,,building,protoss,Static defense - attacks enemies automatically,3,false,2,8
```

**Note:** Nexus is NOT a card - Protoss players start with a Nexus already built (like Terran starts with Command Center)

#### tech_tree.csv
```csv
card_id,required_building,faction
worker,command_center,terran
barracks,command_center,terran
marine,barracks,terran
protoss_probe,protoss_nexus,protoss
protoss_gateway,protoss_nexus,protoss
protoss_zealot,protoss_gateway,protoss
protoss_dragoon,protoss_gateway,protoss
protoss_cannon,protoss_gateway,protoss
```

**Note:** Nexus is not in tech_tree.csv because it's not a card - it's the starting building for Protoss

### Phase 2: TypeScript Interface Changes

**Files to modify:**
1. `app/src/data/loadData.ts` - Update interfaces and parsers
2. `app/src/engine/GameState.ts` - Add shield fields to Unit and PlacedBuilding interfaces
3. `app/src/engine/GameStateProvider.tsx` - Initialize shields, handle shield damage

#### loadData.ts Changes

**UnitStats interface:**
```typescript
export interface UnitStats {
  id: string;
  health: number;
  max_shields: number;           // NEW
  shield_regen_delay: number;    // NEW (seconds)
  shield_regen_rate: number;     // NEW (shields per second)
  speed: number;
  damage: number;
  attack_range: number;
  shape: "box" | "sphere" | "cylinder" | "cone";
  color: string;
  faction: "terran" | "zerg" | "protoss" | "neutral";
}
```

**Building interface:**
```typescript
export interface Building {
  id: string;
  name: string;
  cost: number;
  health: number;
  max_shields: number;           // NEW
  shield_regen_delay: number;    // NEW (seconds)
  shield_regen_rate: number;     // NEW (shields per second)
  attack_damage: number;         // NEW (0 = no attack)
  attack_range: number;          // NEW (0 = no attack)
  attack_cooldown: number;       // NEW (seconds, 0 = use default)
  shape: "box" | "sphere" | "cylinder" | "cone";
  color: string;
  width: number;
  height: number;
  depth: number;
  description: string;
}
```

**Update parsers:**
```typescript
export async function loadUnits(): Promise<UnitStats[]> {
  const rows = await loadCsv("units.csv", [
    "id", "health", "max_shields", "shield_regen_delay", "shield_regen_rate",
    "speed", "damage", "attack_range", "shape", "color", "faction"
  ]);
  return rows.map((r) => ({
    id: r.id,
    health: parseFloat(r.health),
    max_shields: parseFloat(r.max_shields),
    shield_regen_delay: parseFloat(r.shield_regen_delay),
    shield_regen_rate: parseFloat(r.shield_regen_rate),
    speed: parseFloat(r.speed),
    damage: parseFloat(r.damage),
    attack_range: parseFloat(r.attack_range),
    shape: r.shape as UnitStats["shape"],
    color: r.color,
    faction: r.faction as UnitStats["faction"],
  }));
}

export async function loadBuildings(): Promise<Building[]> {
  const rows = await loadCsv("buildings.csv", [
    "id", "name", "cost", "health", "max_shields", "shield_regen_delay", "shield_regen_rate",
    "attack_damage", "attack_range", "attack_cooldown",
    "shape", "color", "width", "height", "depth", "description"
  ]);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    cost: parseFloat(r.cost),
    health: parseFloat(r.health),
    max_shields: parseFloat(r.max_shields),
    shield_regen_delay: parseFloat(r.shield_regen_delay),
    shield_regen_rate: parseFloat(r.shield_regen_rate),
    attack_damage: parseFloat(r.attack_damage),
    attack_range: parseFloat(r.attack_range),
    attack_cooldown: parseFloat(r.attack_cooldown),
    shape: r.shape as Building["shape"],
    color: r.color,
    width: parseFloat(r.width),
    height: parseFloat(r.height),
    depth: parseFloat(r.depth),
    description: r.description,
  }));
}
```

#### GameState.ts Changes

**Unit interface:**
```typescript
export interface Unit {
  id: string;
  unitType: string;
  team: "player" | "cpu";
  position: [number, number, number];
  health: number;
  shields: number;                    // NEW: current shield points
  lastShieldDamageTime?: number;      // NEW: timestamp of last shield damage (for regen delay)
  stats: UnitStats;
  waypoints?: [number, number, number][];
  currentWaypointIndex?: number;
}
```

**PlacedBuilding interface:**
```typescript
export interface PlacedBuilding {
  id: string;
  buildingType: string;
  team: "player" | "cpu";
  position: [number, number, number];
  health: number;
  shields: number;                    // NEW: current shield points
  lastShieldDamageTime?: number;      // NEW: timestamp of last shield damage (for regen delay)
  stats: BuildingStats;
  constructionStartTime?: number;
  constructionDuration?: number;
}
```

**GameActions interface - add shield damage actions:**
```typescript
export interface GameActions {
  // ... existing actions ...
  damageUnit: (unitId: string, damage: number) => void;
  damageBuilding: (buildingId: string, damage: number) => void;
  // Note: damageUnit and damageBuilding will handle shield logic internally
}
```

#### GameStateProvider.tsx Changes

**Update spawn logic to initialize shields:**

In `playCard` action (spawn_unit):
```typescript
const newUnit: Unit = {
  id: `${team}-${Date.now()}-${Math.random()}`,
  unitType: card.unit_id,
  team,
  position,
  health: unitStats.health,
  shields: unitStats.max_shields,  // NEW: initialize to max
  stats: unitStats,
};
```

In `playCard` action (spawn_building):
```typescript
const newBuilding: PlacedBuilding = {
  id: `${team}-${Date.now()}-${Math.random()}`,
  buildingType: card.id,
  team,
  position,
  health: buildingStats.health,
  shields: buildingStats.max_shields,  // NEW: initialize to max
  stats: buildingStats,
};
```

In `completeProduction` action (spawn_unit from building):
```typescript
const newUnit: Unit = {
  id: `${team}-${Date.now()}-${Math.random()}`,
  unitType: card.unit_id!,
  team,
  position: spawnPos,
  health: unitStats.health,
  shields: unitStats.max_shields,  // NEW: initialize to max
  stats: unitStats,
};
```

**Update damage logic to handle shields:**

```typescript
damageUnit: (unitId: string, damage: number) => {
  setState((prev) => {
    const currentTime = performance.now();
    
    return {
      ...prev,
      units: prev.units.map((u) => {
        if (u.id !== unitId) return u;
        
        let remainingDamage = damage;
        let newShields = u.shields;
        let newHealth = u.health;
        
        // Shields absorb damage first
        if (newShields > 0) {
          if (remainingDamage >= newShields) {
            remainingDamage -= newShields;
            newShields = 0;
          } else {
            newShields -= remainingDamage;
            remainingDamage = 0;
          }
        }
        
        // Remaining damage goes to health
        if (remainingDamage > 0) {
          newHealth = Math.max(0, newHealth - remainingDamage);
        }
        
        return {
          ...u,
          shields: newShields,
          health: newHealth,
          lastShieldDamageTime: newShields < u.stats.max_shields ? currentTime : u.lastShieldDamageTime,
        };
      }),
    };
  });
},

damageBuilding: (buildingId: string, damage: number) => {
  setState((prev) => {
    const currentTime = performance.now();
    
    const updatedBuildings = prev.buildings.map((b) => {
      if (b.id !== buildingId) return b;
      
      let remainingDamage = damage;
      let newShields = b.shields;
      let newHealth = b.health;
      
      // Shields absorb damage first
      if (newShields > 0) {
        if (remainingDamage >= newShields) {
          remainingDamage -= newShields;
          newShields = 0;
        } else {
          newShields -= remainingDamage;
          remainingDamage = 0;
        }
      }
      
      // Remaining damage goes to health
      if (remainingDamage > 0) {
        newHealth = Math.max(0, newHealth - remainingDamage);
      }
      
      return {
        ...b,
        shields: newShields,
        health: newHealth,
        lastShieldDamageTime: newShields < b.stats.max_shields ? currentTime : b.lastShieldDamageTime,
      };
    });
    
    // Check for Command Center/Nexus destruction (game over)
    const destroyedBuilding = updatedBuildings.find(b => b.id === buildingId);
    if (destroyedBuilding && 
        (destroyedBuilding.buildingType === "command_center" || destroyedBuilding.buildingType === "protoss_nexus") && 
        destroyedBuilding.health <= 0) {
      return {
        ...prev,
        buildings: updatedBuildings,
        phase: "gameover",
      };
    }
    
    return {
      ...prev,
      buildings: updatedBuildings,
    };
  });
},
```

### Phase 3: Shield Regeneration System

Create new hook: `app/src/hooks/useShieldRegeneration.ts`

```typescript
/**
 * useShieldRegeneration - Handles shield regeneration for Protoss units/buildings
 *
 * Shields regenerate after not taking damage for X seconds.
 * Regenerates at Y shields per second until max.
 */

import { useFrame } from "@react-three/fiber";
import { useGameState } from "../engine/GameState";

export function useShieldRegeneration() {
  const { state, actions } = useGameState();

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    const currentTime = performance.now();

    // Regenerate unit shields
    state.units.forEach(unit => {
      if (unit.shields < unit.stats.max_shields) {
        const timeSinceLastDamage = unit.lastShieldDamageTime 
          ? (currentTime - unit.lastShieldDamageTime) / 1000  // Convert to seconds
          : Infinity;

        // Only regen if delay has passed
        if (timeSinceLastDamage >= unit.stats.shield_regen_delay) {
          const regenAmount = unit.stats.shield_regen_rate * delta;
          const newShields = Math.min(
            unit.stats.max_shields,
            unit.shields + regenAmount
          );

          // Update shields (create new updateUnitShields action)
          if (newShields > unit.shields) {
            actions.updateUnitShields(unit.id, newShields);
          }
        }
      }
    });

    // Regenerate building shields
    state.buildings.forEach(building => {
      if (building.shields < building.stats.max_shields) {
        const timeSinceLastDamage = building.lastShieldDamageTime 
          ? (currentTime - building.lastShieldDamageTime) / 1000
          : Infinity;

        if (timeSinceLastDamage >= building.stats.shield_regen_delay) {
          const regenAmount = building.stats.shield_regen_rate * delta;
          const newShields = Math.min(
            building.stats.max_shields,
            building.shields + regenAmount
          );

          if (newShields > building.shields) {
            actions.updateBuildingShields(building.id, newShields);
          }
        }
      }
    });
  });
}
```

**Add to GameActions in GameState.ts:**
```typescript
updateUnitShields: (unitId: string, shields: number) => void;
updateBuildingShields: (buildingId: string, shields: number) => void;
```

**Implement in GameStateProvider.tsx:**
```typescript
updateUnitShields: (unitId: string, shields: number) => {
  setState((prev) => ({
    ...prev,
    units: prev.units.map((u) =>
      u.id === unitId ? { ...u, shields } : u
    ),
  }));
},

updateBuildingShields: (buildingId: string, shields: number) => {
  setState((prev) => ({
    ...prev,
    buildings: prev.buildings.map((b) =>
      b.id === buildingId ? { ...b, shields } : b
    ),
  }));
},
```

**Register hook in Arena.tsx:**
```typescript
import { useShieldRegeneration } from "../hooks/useShieldRegeneration";

export default function Arena() {
  // ... existing hooks ...
  useShieldRegeneration();  // NEW
  // ...
}
```

### Phase 4: UI Changes for Shield Display

**Files to modify:**
1. `app/src/game/Unit.tsx` - Update health bar to show shields
2. `app/src/game/Building.tsx` - Update health bar to show shields

#### Unit.tsx Changes

Replace health bar rendering with dual-bar system:

```typescript
const healthPercent = (unit.health / unit.stats.health) * 100;
const shieldPercent = unit.stats.max_shields > 0 
  ? (unit.shields / unit.stats.max_shields) * 100 
  : 0;
const hasShields = unit.stats.max_shields > 0;

return (
  <group position={unit.position}>
    {/* 3D Mesh */}
    <mesh ref={meshRef} castShadow position={[0, unitHeight / 2, 0]}>
      {renderGeometry()}
      <meshStandardMaterial color={stats.color} />
    </mesh>

    {/* Health/Shield bar above unit */}
    <Html position={[0, unitHeight + 0.5, 0]} center style={{ pointerEvents: "none", zIndex: 10 }}>
      <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs min-w-16">
        {hasShields && (
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-0.5">
            <div
              className="h-full transition-all bg-blue-400"
              style={{ width: `${shieldPercent}%` }}
            />
          </div>
        )}
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
```

#### Building.tsx Changes

Apply same dual-bar system to buildings (check if Building.tsx exists, if not, it renders inline in Arena.tsx - find and update that location).

### Phase 5: Photon Cannon Combat

**Files to modify:**
1. `app/src/hooks/useUnitCombat.ts` - Add building combat logic

#### useUnitCombat.ts Changes

Add combat logic for buildings after unit combat:

```typescript
export function useUnitCombat() {
  const { state, actions } = useGameState();

  const lastAttackTime = useRef<Map<string, number>>(new Map());

  useFrame((_, delta) => {
    if (state.phase !== "playing") return;

    const currentTime = performance.now();

    // EXISTING: Unit combat
    state.units.forEach(unit => {
      // ... existing unit combat code ...
    });

    // NEW: Building combat (Photon Cannons, etc.)
    state.buildings.forEach(building => {
      // Skip buildings that don't attack
      if (building.stats.attack_damage <= 0 || building.stats.attack_range <= 0) {
        return;
      }

      // Find all enemies (units and buildings)
      const enemyUnits = state.units.filter(u => u.team !== building.team);
      const enemyBuildings = state.buildings.filter(b => b.team !== building.team);

      // Find nearest enemy within attack range
      let nearestEnemy: { type: "unit" | "building"; id: string; distance: number } | null = null;

      // Check enemy units
      enemyUnits.forEach(enemy => {
        const dx = enemy.position[0] - building.position[0];
        const dz = enemy.position[2] - building.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= building.stats.attack_range) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "unit", id: enemy.id, distance };
          }
        }
      });

      // Check enemy buildings
      enemyBuildings.forEach(enemy => {
        const dx = enemy.position[0] - building.position[0];
        const dz = enemy.position[2] - building.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance <= building.stats.attack_range) {
          if (!nearestEnemy || distance < nearestEnemy.distance) {
            nearestEnemy = { type: "building", id: enemy.id, distance };
          }
        }
      });

      // Attack if target found and cooldown elapsed
      if (nearestEnemy) {
        const lastAttack = lastAttackTime.current.get(building.id) || 0;
        const attackCooldown = (building.stats.attack_cooldown || 1.0) * 1000; // Default 1 sec

        if (currentTime - lastAttack >= attackCooldown) {
          lastAttackTime.current.set(building.id, currentTime);

          // Deal damage
          if (nearestEnemy.type === "unit") {
            actions.damageUnit(nearestEnemy.id, building.stats.attack_damage);
          } else {
            actions.damageBuilding(nearestEnemy.id, building.stats.attack_damage);
          }
        }
      }
    });

    // EXISTING: Clean up dead units
    state.units.forEach(unit => {
      if (unit.health <= 0) {
        actions.removeUnit(unit.id);
        lastAttackTime.current.delete(unit.id);
      }
    });

    // EXISTING: Clean up destroyed buildings
    state.buildings.forEach(building => {
      if (building.health <= 0 && 
          building.buildingType !== "command_center" && 
          building.buildingType !== "protoss_nexus") {
        actions.removeBuilding(building.id);
        lastAttackTime.current.delete(building.id);  // NEW: clean up building attacks
      }
    });
  });
}
```

### Phase 6: Faction Selection (Future - Not Required for Initial Implementation)

For now, assume players manually choose which faction's cards to use. A future update could add:
- Faction selection screen before game start
- Filter cards by selected faction
- Separate decks for Terran vs Protoss
- CPU can randomly select a faction

This is NOT required for initial Protoss implementation.

### Phase 7: Testing Checklist

- [ ] Protoss cards appear in deck correctly
- [ ] Probe card generates energy like SCV
- [ ] Max 5 Probes enforced
- [ ] Nexus can be built and produces Probes
- [ ] Gateway unlocks Zealot/Dragoon/Cannon cards
- [ ] Zealot spawns with 60hp/60shields, melee attacks
- [ ] Dragoon spawns with 50hp/50shields, ranged attacks
- [ ] Photon Cannon spawns with 60hp/60shields, auto-attacks enemies
- [ ] Shield damage is applied before health damage
- [ ] Shields regenerate after 3 seconds of no damage
- [ ] Shield regen rate is 2/second
- [ ] Shield bars display correctly (blue on top, health below)
- [ ] Photon Cannon has 7.0 attack range
- [ ] Photon Cannon attacks every 1.5 seconds
- [ ] Game over when Nexus is destroyed
- [ ] Tech tree dependencies work (Gateway requires Nexus, etc.)

## Open Questions

1. **Should Nexus work like Command Center?**
   - Answer: Yes - it's the main base building for Protoss
   - Game over condition when destroyed
   - Probes are built from Nexus using production queue

2. **Do we need faction selection UI?**
   - Answer: Not for initial implementation
   - Players can manually use Protoss cards if in their deck
   - Future: add faction picker in splash screen

3. **Should Gateway auto-produce units?**
   - Answer: No - same as Barracks, player must play cards to queue production
   - Gateway just unlocks cards in deck

4. **Do shields regenerate during construction?**
   - Answer: Yes - buildings under construction still have shields that can regenerate
   - Construction time is separate from shield mechanics

5. **Can Photon Cannons attack air units?**
   - Answer: Not in initial implementation (no air units yet)
   - When air units are added, Photon Cannon should attack both ground and air

## Notes

- This plan keeps scope tight: only 6 Protoss entities (Probe, Zealot, Dragoon, Nexus, Gateway, Photon Cannon)
- No advanced Protoss units (Archons, Carriers, etc.) for now
- No pylon power requirements (simplified)
- Shield system is the main differentiator from Terran
- Photon Cannon is the first building that participates in combat
- All values are scaled from StarCraft but balanced for this game's pace
- Total implementation time: ~4-6 hours
