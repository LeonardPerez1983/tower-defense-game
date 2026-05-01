# Zerg Implementation Plan

**Status:** Active  
**Last updated:** 2026-05-01

## Overview

This plan implements Zerg as a playable faction with unique mechanics: creep spreading, larva production, unit morphing, and tech tree. The implementation focuses on 8 entities: Larva, Cocoon, Zergling, Hydralisk, Hatchery, Spawning Pool, Creep Colony, and Sunken Colony.

## Core Zerg Mechanics

### 1. Creep System

**Design:**
- Creep is a purple ground texture that spreads around Zerg buildings
- Zerg units get light regeneration on creep (+1 HP/sec)
- Non-Zerg units suffer movement penalty on creep (-25% speed) and attack penalty (-15% damage)
- Only Zerg can build on creep
- Buildings spread creep in a radius around them

**Implementation:**

#### Data Changes

**New CSV: `data/creep_tiles.csv`**
```csv
x,z,team,source_building_id
```
This CSV is dynamically managed at runtime (not pre-populated). It tracks active creep tiles.

**Add to `data/config.csv`:**
```csv
creep_tile_size,1.0
creep_spread_radius_base,3.0
creep_spread_radius_colony,5.0
creep_regen_rate,1.0
creep_enemy_speed_penalty,0.25
creep_enemy_damage_penalty,0.15
```

**Add columns to `data/buildings.csv`:**
- `faction` (already exists conceptually, ensure it's populated)
- `spreads_creep` (boolean: "true" or "false")
- `creep_radius` (number: radius in world units)

#### Code Changes

**New file: `app/src/game/CreepTiles.tsx`**
- React component that renders creep tiles as flat purple planes
- Reads creep tile positions from game state
- Uses instanced rendering for performance (all tiles share one material/geometry)

```typescript
// Pseudocode structure
interface CreepTile {
  x: number;
  z: number;
  team: "player" | "cpu";
}

function CreepTiles({ tiles }: { tiles: CreepTile[] }) {
  // Use THREE.InstancedMesh for performance
  // Purple color (#6b1f8f with 70% opacity)
  // Flat plane at y=0.01 (just above ground to avoid z-fighting)
}
```

**Update `app/src/engine/GameState.ts`:**
```typescript
export interface CreepTile {
  x: number;
  z: number;
  team: "player" | "cpu";
  sourceBuildingId: string; // Which building generated this creep
}

export interface GameState {
  // ... existing fields
  creepTiles: CreepTile[];
}
```

**Update `app/src/engine/GameStateProvider.tsx`:**
Add actions:
```typescript
addCreepTiles: (tiles: CreepTile[]) => void;
removeCreepTiles: (buildingId: string) => void; // Remove all creep from a destroyed building
```

**New hook: `app/src/hooks/useCreepSystem.ts`**
- Monitors buildings with `spreads_creep: true`
- Generates creep tiles in radius around each building
- Applies buffs/debuffs to units based on creep position
- Removes creep when building is destroyed

```typescript
// Pseudocode
function useCreepSystem() {
  useEffect(() => {
    // On building placement: generate creep tiles in radius
    // On building destruction: remove associated creep tiles
  }, [state.buildings]);

  // Apply creep effects to units every frame
  useFrame(() => {
    state.units.forEach(unit => {
      const onCreep = isOnCreep(unit.position, state.creepTiles);
      if (onCreep) {
        if (unit.stats.faction === "zerg") {
          // Apply regen
        } else {
          // Apply penalties (handled in movement/combat hooks)
        }
      }
    });
  });
}
```

**Update `app/src/hooks/useUnitMovement.ts`:**
- Check if unit is on enemy creep
- Apply speed penalty: `effectiveSpeed = unit.stats.speed * (1 - creepSpeedPenalty)`

**Update `app/src/hooks/useUnitCombat.ts`:**
- Check if attacking unit is on enemy creep
- Apply damage penalty: `effectiveDamage = unit.stats.damage * (1 - creepDamagePenalty)`

**Update `app/src/game/Arena.tsx`:**
```typescript
import CreepTiles from "./CreepTiles";

// In render:
<CreepTiles tiles={state.creepTiles} />
```

---

### 2. Larva Production System

**Design:**
- Hatchery has a larva pool (max 3 larva)
- Playing a unit card consumes 1 larva (larva → cocoon morph)
- Cocoon is the "morphing" visual state (unit building)
- After build time completes, cocoon bursts → unit spawns
- Hatchery auto-generates 1 larva every 15 seconds (up to max 3)

**Implementation:**

#### Data Changes

**Add to `data/config.csv`:**
```csv
larva_max_per_hatchery,3
larva_spawn_interval,15
cocoon_morph_time,3
```

**Add to `data/units.csv`:**
```csv
id,health,speed,damage,attack_range,shape,color,faction
larva_unit,25,0,0,0,sphere,#8b4789,zerg
cocoon_unit,200,0,0,0,cone,#4a235a,zerg
```

**Add to `data/buildings.csv`:**
```csv
id,name,cost,health,shape,color,width,height,depth,description,faction,spreads_creep,creep_radius
hatchery,Hatchery,300,1500,box,#6b1f8f,2.5,1.5,2.5,Zerg main base - produces larva,zerg,true,3.0
```

#### Code Changes

**Update `app/src/engine/GameState.ts`:**
```typescript
export interface PlacedBuilding {
  // ... existing fields
  larvaCount?: number; // For Hatchery: current larva available
  lastLarvaSpawnTime?: number; // For Hatchery: when last larva was generated
}

export interface Unit {
  // ... existing fields
  isCocoon?: boolean; // True if this is a cocoon (morphing state)
  cocoonStartTime?: number; // When cocoon started morphing
  cocoonTargetUnitType?: string; // What unit the cocoon will become
}
```

**Update `app/src/engine/GameStateProvider.tsx`:**
Add actions:
```typescript
consumeLarva: (buildingId: string) => boolean; // Returns true if larva was available
addLarva: (buildingId: string) => void; // Add 1 larva to hatchery (up to max)
spawnCocoon: (position: [number, number, number], targetUnitType: string, team: "player" | "cpu", buildingId: string) => void;
```

**New hook: `app/src/hooks/useLarvaProduction.ts`**
```typescript
// Pseudocode
function useLarvaProduction() {
  useFrame(() => {
    const now = performance.now();
    const larvaSpawnInterval = parseFloat(config.get("larva_spawn_interval")) * 1000;

    state.buildings.forEach(building => {
      if (building.buildingType === "hatchery") {
        const larvaCount = building.larvaCount || 0;
        const lastSpawn = building.lastLarvaSpawnTime || 0;

        if (larvaCount < 3 && now - lastSpawn >= larvaSpawnInterval) {
          actions.addLarva(building.id);
        }
      }
    });
  });
}
```

**New hook: `app/src/hooks/useCocoonMorphing.ts`**
```typescript
// Pseudocode
function useCocoonMorphing() {
  useFrame(() => {
    const now = performance.now();

    state.units.forEach(unit => {
      if (unit.isCocoon && unit.cocoonStartTime && unit.cocoonTargetUnitType) {
        const elapsed = (now - unit.cocoonStartTime) / 1000;
        const card = allCards.find(c => c.unit_id === unit.cocoonTargetUnitType);

        if (card && elapsed >= card.build_time) {
          // Morph complete: remove cocoon, spawn unit
          actions.removeUnit(unit.id);
          
          const unitStats = allUnits.find(u => u.id === unit.cocoonTargetUnitType);
          if (unitStats) {
            const newUnit: Unit = {
              id: `${unit.team}-${Date.now()}-${Math.random()}`,
              unitType: unit.cocoonTargetUnitType,
              team: unit.team,
              position: unit.position,
              health: unitStats.health,
              stats: unitStats,
            };
            actions.spawnUnit(newUnit);
          }
        }
      }
    });
  });
}
```

**Update card play logic in `GameStateProvider.tsx`:**
When playing a Zerg unit card:
1. Check if player has a Hatchery
2. Check if Hatchery has available larva
3. If yes: consume larva, spawn cocoon at Hatchery position
4. Cocoon morphs into target unit after build_time

---

### 3. Building Morph: Creep Colony → Sunken Colony

**Design:**
- Creep Colony is a basic defensive building (no attack, just spreads creep)
- Can morph into Sunken Colony (defensive structure with ranged attack)
- Morph costs additional resources and time
- Sunken Colony inherits position and some stats from Creep Colony

**Implementation:**

#### Data Changes

**Add to `data/buildings.csv`:**
```csv
id,name,cost,health,shape,color,width,height,depth,description,faction,spreads_creep,creep_radius,can_morph_to,morph_cost,morph_time
creep_colony,Creep Colony,75,400,cylinder,#6b1f8f,1.0,1.2,1.0,Defensive structure - spreads creep,zerg,true,5.0,sunken_colony,50,10
sunken_colony,Sunken Colony,0,500,cone,#4a235a,1.2,1.5,1.2,Defensive tower - attacks ground units,zerg,true,5.0,,,
```

**Add to `data/units.csv` (for Sunken Colony attack):**
```csv
id,health,speed,damage,attack_range,shape,color,faction
sunken_tentacle,0,0,40,5.0,cylinder,#9b59b6,zerg
```
Note: Sunken Colony doesn't use a unit entry for its stats. Instead, we'll handle its attack in a building-specific system.

**Better approach - Add columns to buildings.csv:**
- `damage` (number: damage per attack, 0 if non-attacking)
- `attack_range` (number: attack range, 0 if non-attacking)
- `attack_cooldown` (number: seconds between attacks)

Updated `data/buildings.csv`:
```csv
id,name,cost,health,shape,color,width,height,depth,description,faction,spreads_creep,creep_radius,can_morph_to,morph_cost,morph_time,damage,attack_range,attack_cooldown
creep_colony,Creep Colony,75,400,cylinder,#6b1f8f,1.0,1.2,1.0,Defensive structure - spreads creep,zerg,true,5.0,sunken_colony,50,10,0,0,0
sunken_colony,Sunken Colony,0,500,cone,#4a235a,1.2,1.5,1.2,Defensive tower - attacks ground units,zerg,true,5.0,,,40,5.0,1.5
```

#### Code Changes

**Update `app/src/engine/GameState.ts`:**
```typescript
export interface PlacedBuilding {
  // ... existing fields
  morphingTo?: string; // Building ID it's morphing into
  morphStartTime?: number; // When morph started
  morphDuration?: number; // How long morph takes
  lastAttackTime?: number; // For attacking buildings (Sunken Colony)
}
```

**Update `app/src/engine/GameStateProvider.tsx`:**
Add action:
```typescript
morphBuilding: (buildingId: string, targetBuildingType: string) => void;
```

**New hook: `app/src/hooks/useBuildingMorph.ts`**
```typescript
// Pseudocode
function useBuildingMorph() {
  useFrame(() => {
    const now = performance.now();

    state.buildings.forEach(building => {
      if (building.morphingTo && building.morphStartTime && building.morphDuration) {
        const elapsed = (now - building.morphStartTime) / 1000;

        if (elapsed >= building.morphDuration) {
          // Morph complete: change building type
          const targetStats = allBuildings.find(b => b.id === building.morphingTo);
          if (targetStats) {
            actions.removeBuilding(building.id);
            
            const morphedBuilding: PlacedBuilding = {
              ...building,
              buildingType: building.morphingTo,
              stats: targetStats,
              health: targetStats.health, // Full health after morph
              morphingTo: undefined,
              morphStartTime: undefined,
              morphDuration: undefined,
            };
            actions.placeBuilding(morphedBuilding);
          }
        }
      }
    });
  });
}
```

**New hook: `app/src/hooks/useBuildingCombat.ts`**
```typescript
// Pseudocode
function useBuildingCombat() {
  useFrame((state, delta) => {
    const now = performance.now();

    state.buildings.forEach(building => {
      if (building.stats.damage > 0 && building.stats.attack_range > 0) {
        // Find nearest enemy unit in range
        const target = findNearestEnemy(building, state.units);
        
        if (target) {
          const lastAttack = building.lastAttackTime || 0;
          const cooldown = building.stats.attack_cooldown * 1000;

          if (now - lastAttack >= cooldown) {
            // Attack!
            actions.damageUnit(target.id, building.stats.damage);
            // Update last attack time
            // (Need to add updateBuilding action)
          }
        }
      }
    });
  });
}
```

**UI for morphing:**
- Add UI button on Creep Colony card/tooltip: "Morph to Sunken Colony"
- Show morph progress bar during morphing

---

### 4. Tech Tree System

**Design:**
- Command Center unlocks: SCV (Terran)
- Barracks unlocks: Marine (Terran)
- Hatchery unlocks: Larva production, Zergling, Hydralisk (after Spawning Pool)
- Spawning Pool unlocks: Zergling, Hydralisk

**Simplified Zerg tech tree:**
1. Start with Hatchery card available
2. Hatchery unlocks: Zergling, Spawning Pool, Creep Colony cards
3. Spawning Pool unlocks: Hydralisk card
4. Creep Colony can morph to Sunken Colony (in-game action, not a card)

**Implementation:**

#### Data Changes

**Update `data/tech_tree.csv`:**
```csv
card_id,required_building,faction
worker,command_center,terran
barracks,command_center,terran
marine,barracks,terran
zergling,hatchery,zerg
hydralisk,spawning_pool,zerg
spawning_pool,hatchery,zerg
creep_colony,hatchery,zerg
hatchery,none,zerg
```

**Add to `data/cards.csv`:**
```csv
id,name,cost,effect_type,effect_value,unit_id,building_id,card_type,faction,description,max_copies,is_permanent_removal,discard_cost,build_time
hatchery,Hatchery,300,spawn_building,,,hatchery,building,zerg,Main base - produces larva,1,false,2,15
spawning_pool,Spawning Pool,200,spawn_building,,,spawning_pool,building,zerg,Tech building - unlocks Zerglings and Hydralisks,1,false,2,10
creep_colony,Creep Colony,75,spawn_building,,,creep_colony,building,zerg,Defensive structure - spreads creep,3,false,1,5
zergling,Zergling,50,spawn_unit,,zergling_unit,,unit,zerg,Fast melee attacker,3,false,1,4
hydralisk,Hydralisk,75,spawn_unit,,hydralisk_unit,,unit,zerg,Ranged attacker,2,false,1,6
```

**Add to `data/units.csv`:**
```csv
id,health,speed,damage,attack_range,shape,color,faction
zergling_unit,35,3.5,5,1.0,sphere,#9b59b6,zerg
hydralisk_unit,80,2.0,10,4.5,cylinder,#4a235a,zerg
```

**Add to `data/buildings.csv`:**
```csv
id,name,cost,health,shape,color,width,height,depth,description,faction,spreads_creep,creep_radius,can_morph_to,morph_cost,morph_time,damage,attack_range,attack_cooldown
spawning_pool,Spawning Pool,200,750,box,#6b1f8f,1.5,1.2,1.5,Tech building - unlocks advanced units,zerg,true,3.0,,,0,0,0
```

#### Code Changes

**No major code changes needed** - the existing `useTechTree.ts` and `useTechTreeUnlocking.ts` hooks already handle this. Just need to:
1. Ensure faction-specific deck initialization (player chooses Terran or Zerg at game start)
2. Filter cards by faction in deck building

**Update `app/src/components/SplashScreen.tsx`:**
Add faction selection UI:
```typescript
// Add state for faction selection
const [selectedFaction, setSelectedFaction] = useState<"terran" | "zerg">("terran");

// Filter starter cards by faction
const starterCards = allCards.filter(c => 
  c.faction === selectedFaction && 
  techTree.find(t => t.card_id === c.id && t.required_building === "none")
);
```

---

### 5. Balance Numbers

Based on StarCraft Brood War stats (scaled for this game):

#### Units

| Unit | Cost | HP | Speed | Damage | Range | Build Time | Notes |
|------|------|----|----|--------|-------|------------|-------|
| Larva | 0 | 25 | 0 | 0 | 0 | Auto-spawn | Not a playable card |
| Cocoon | 0 | 200 | 0 | 0 | 0 | Varies | Morphing state |
| Zergling | 50 | 35 | 3.5 | 5 | 1.0 | 4s | Fast, weak melee swarm unit |
| Hydralisk | 75 | 80 | 2.0 | 10 | 4.5 | 6s | Ranged attacker |

#### Buildings

| Building | Cost | HP | Spreads Creep | Creep Radius | Damage | Range | Cooldown | Notes |
|----------|------|----|----|-------|--------|-------|----------|-------|
| Hatchery | 300 | 1500 | Yes | 3.0 | 0 | 0 | 0 | Main base, produces larva |
| Spawning Pool | 200 | 750 | Yes | 3.0 | 0 | 0 | 0 | Tech building |
| Creep Colony | 75 | 400 | Yes | 5.0 | 0 | 0 | 0 | Creep spreader |
| Sunken Colony | +50 | 500 | Yes | 5.0 | 40 | 5.0 | 1.5s | Defensive tower |

#### Creep Effects

| Effect | Value | Notes |
|--------|-------|-------|
| Zerg unit regen on creep | +1 HP/sec | Light sustain advantage |
| Enemy speed penalty | -25% | Significant slowdown |
| Enemy damage penalty | -15% | Moderate combat debuff |
| Creep tile size | 1.0 units | Grid-based |
| Base creep radius | 3.0 units | Most buildings |
| Colony creep radius | 5.0 units | Creep Colony expansion |

#### Resource Economy

| Metric | Value | Notes |
|--------|-------|-------|
| Larva max per Hatchery | 3 | Limits production burst |
| Larva spawn interval | 15s | Steady production |
| Creep Colony morph cost | +50 energy | Additional investment |
| Creep Colony morph time | 10s | Vulnerable during morph |

#### Comparison to Terran

**Terran (current):**
- Marine: 50 energy, 45 HP, 2.5 speed, 6 damage, 4.0 range, 3s build
- SCV: 50 energy (permanent removal), adds +0.13 energy/sec

**Zerg (new):**
- Zergling: 50 energy, 35 HP, 3.5 speed, 5 damage, 1.0 range, 4s build + larva wait
- Hydralisk: 75 energy, 80 HP, 2.0 speed, 10 damage, 4.5 range, 6s build + larva wait

**Balance notes:**
- Zerg units are cheaper/weaker (Zergling) or similar cost but larva-gated
- Creep advantage compensates for larva production delay
- Hatchery (300) is cheaper than Command Center (400) to offset larva system complexity

---

## Implementation Steps

### Phase 1: Data Setup (1-2 hours)

1. **Update CSV files:**
   - Add config values for creep system
   - Add Zerg units to `units.csv`
   - Add Zerg buildings to `buildings.csv`
   - Add Zerg cards to `cards.csv`
   - Update `tech_tree.csv` with Zerg entries
   - Add new columns to `buildings.csv` (spreads_creep, creep_radius, etc.)

2. **Update data loading:**
   - Update `app/src/data/loadData.ts` to handle new building columns
   - Add validation for new fields

### Phase 2: Creep System (3-4 hours)

1. **State management:**
   - Add `creepTiles: CreepTile[]` to GameState
   - Add creep-related actions to GameStateProvider
   - Add creep config to initial state

2. **Rendering:**
   - Create `app/src/game/CreepTiles.tsx` component
   - Use instanced mesh for performance
   - Add to Arena.tsx scene

3. **Creep generation:**
   - Create `app/src/hooks/useCreepSystem.ts`
   - Generate creep tiles on building placement
   - Remove creep tiles on building destruction
   - Apply hex grid or circular pattern

4. **Creep effects:**
   - Update `useUnitMovement.ts` to check creep and apply speed penalty
   - Update `useUnitCombat.ts` to check creep and apply damage penalty
   - Add regen logic in `useCreepSystem.ts` (apply healing to Zerg units on creep)

### Phase 3: Larva Production (3-4 hours)

1. **State management:**
   - Add `larvaCount`, `lastLarvaSpawnTime` to PlacedBuilding interface
   - Add `isCocoon`, `cocoonStartTime`, `cocoonTargetUnitType` to Unit interface
   - Add larva-related actions to GameStateProvider

2. **Larva spawning:**
   - Create `app/src/hooks/useLarvaProduction.ts`
   - Auto-generate larva on Hatchery every 15s (up to max 3)
   - Initialize Hatchery with 3 larva on placement

3. **Cocoon morphing:**
   - Create `app/src/hooks/useCocoonMorphing.ts`
   - When Zerg unit card is played: consume larva, spawn cocoon
   - Cocoon morphs into target unit after build_time
   - Update card play logic in GameStateProvider.tsx

4. **Visuals:**
   - Update `app/src/game/Unit.tsx` to render Larva and Cocoon models
   - Add special rendering for cocoon (pulsing animation?)
   - Add larva counter UI on Hatchery (show 0-3 larva icons)

### Phase 4: Building Morph (2-3 hours)

1. **State management:**
   - Add `morphingTo`, `morphStartTime`, `morphDuration` to PlacedBuilding
   - Add `morphBuilding` action to GameStateProvider

2. **Morph logic:**
   - Create `app/src/hooks/useBuildingMorph.ts`
   - Handle Creep Colony → Sunken Colony morph
   - Update building stats and visuals after morph completes

3. **UI:**
   - Add "Morph to Sunken Colony" button on Creep Colony
   - Show morph progress bar during morphing
   - Disable morphing if not enough energy

### Phase 5: Building Combat (2 hours)

1. **State management:**
   - Add `lastAttackTime` to PlacedBuilding
   - Add `damage`, `attack_range`, `attack_cooldown` columns to buildings.csv

2. **Combat logic:**
   - Create `app/src/hooks/useBuildingCombat.ts`
   - Sunken Colony attacks nearest enemy in range
   - Apply damage on cooldown
   - Visual feedback (projectile? tentacle animation?)

### Phase 6: Tech Tree & Faction Selection (2 hours)

1. **Update tech tree data:**
   - Add Zerg entries to `tech_tree.csv`
   - Ensure `useTechTree.ts` filters by faction

2. **Faction selection:**
   - Update `SplashScreen.tsx` to add faction choice UI
   - Initialize deck based on selected faction
   - Filter cards by faction throughout game

3. **CPU opponent:**
   - Update `useCPUAI.ts` to handle Zerg-specific logic:
     - Check larva availability before playing unit cards
     - Prioritize Spawning Pool → Hydralisk tech path
     - Build Creep Colonies for map control

### Phase 7: Balance & Polish (2-3 hours)

1. **Tuning:**
   - Playtest Zerg vs Terran matchups
   - Adjust unit stats, costs, build times
   - Tune creep effects (regen rate, penalties)

2. **Visual polish:**
   - Add particle effects for cocoon bursting
   - Add creep spreading animation (optional)
   - Add attack visuals for Sunken Colony

3. **UI polish:**
   - Tooltips for Zerg-specific mechanics
   - Larva counter on Hatchery
   - Creep coverage indicator

---

## File Changes Summary

### New Files

1. `app/src/game/CreepTiles.tsx` - Creep tile rendering
2. `app/src/hooks/useCreepSystem.ts` - Creep generation and effects
3. `app/src/hooks/useLarvaProduction.ts` - Larva auto-spawning
4. `app/src/hooks/useCocoonMorphing.ts` - Cocoon → unit morphing
5. `app/src/hooks/useBuildingMorph.ts` - Building morphing system
6. `app/src/hooks/useBuildingCombat.ts` - Building attack logic

### Modified Files

1. `data/config.csv` - Add creep/larva config values
2. `data/cards.csv` - Add Zerg cards
3. `data/units.csv` - Add Zerg units
4. `data/buildings.csv` - Add Zerg buildings + new columns
5. `data/tech_tree.csv` - Add Zerg tech tree
6. `app/src/data/loadData.ts` - Parse new building columns
7. `app/src/engine/GameState.ts` - Add creep tiles, larva state, morph state
8. `app/src/engine/GameStateProvider.tsx` - Add new actions, update card play logic
9. `app/src/game/Arena.tsx` - Add CreepTiles component
10. `app/src/game/Unit.tsx` - Handle Larva/Cocoon rendering
11. `app/src/game/Building.tsx` - Show morph progress, larva counter
12. `app/src/hooks/useUnitMovement.ts` - Apply creep speed penalty
13. `app/src/hooks/useUnitCombat.ts` - Apply creep damage penalty
14. `app/src/components/SplashScreen.tsx` - Add faction selection UI
15. `app/src/hooks/useCPUAI.ts` - Add Zerg-specific AI logic

---

## Testing Checklist

- [ ] Creep tiles render correctly around Zerg buildings
- [ ] Creep spreads in proper radius (3.0 for most, 5.0 for Colony)
- [ ] Creep removed when building destroyed
- [ ] Zerg units regenerate on creep
- [ ] Non-Zerg units slowed/weakened on creep
- [ ] Hatchery starts with 3 larva
- [ ] Hatchery auto-generates larva every 15s (up to max 3)
- [ ] Playing Zergling/Hydralisk consumes 1 larva
- [ ] Cocoon spawns at Hatchery location
- [ ] Cocoon morphs into target unit after build time
- [ ] Cannot play unit card if no larva available
- [ ] Creep Colony can morph to Sunken Colony
- [ ] Sunken Colony attacks enemies in range
- [ ] Spawning Pool unlocks Hydralisk card
- [ ] Faction selection works on splash screen
- [ ] Zerg vs Terran matchup is balanced
- [ ] CPU can play Zerg effectively

---

## Open Questions

1. **Larva visuals:** Should larva be visible as tiny units near Hatchery, or just shown as UI icons?
   - **Recommendation:** UI icons only (simpler, cleaner). Show 0-3 larva icons on Hatchery health bar.

2. **Creep placement restriction:** Should we enforce "can only build on creep" strictly, or allow first Hatchery anywhere?
   - **Recommendation:** First Hatchery can be placed anywhere (creates initial creep). All other Zerg buildings require existing creep.

3. **Cocoon positioning:** Should cocoon spawn at Hatchery location or at chosen card play location?
   - **Recommendation:** Hatchery location (like SC1). This makes larva system more central to Zerg identity.

4. **Sunken Colony attack visuals:** Projectile or melee tentacle?
   - **Recommendation:** Melee tentacle animation (extends toward target). Use damage number popup for feedback.

5. **Creep expansion strategy:** Should Creep Colony be very cheap to encourage creep spreading?
   - **Recommendation:** Yes - cost 75 (cheaper than Spawning Pool at 200). Encourages map control playstyle.

---

## Next Steps

1. Review this plan with team
2. Confirm balance numbers
3. Begin Phase 1 (data setup)
4. Implement phases sequentially
5. Playtest after Phase 6
6. Iterate on balance in Phase 7

---

## Appendix: CSV Stub Data

### data/config.csv (additions)
```csv
creep_tile_size,1.0
creep_spread_radius_base,3.0
creep_spread_radius_colony,5.0
creep_regen_rate,1.0
creep_enemy_speed_penalty,0.25
creep_enemy_damage_penalty,0.15
larva_max_per_hatchery,3
larva_spawn_interval,15
cocoon_morph_time,3
```

### data/units.csv (additions)
```csv
id,health,speed,damage,attack_range,shape,color,faction
larva_unit,25,0,0,0,sphere,#8b4789,zerg
cocoon_unit,200,0,0,0,cone,#4a235a,zerg
zergling_unit,35,3.5,5,1.0,sphere,#9b59b6,zerg
hydralisk_unit,80,2.0,10,4.5,cylinder,#4a235a,zerg
```

### data/buildings.csv (additions + new columns)

**New columns to add to ALL buildings:**
- `faction`
- `spreads_creep` (boolean)
- `creep_radius` (number)
- `can_morph_to` (string, building id or empty)
- `morph_cost` (number)
- `morph_time` (number)
- `damage` (number)
- `attack_range` (number)
- `attack_cooldown` (number)

**Existing buildings (update with new columns):**
```csv
id,name,cost,health,shape,color,width,height,depth,description,faction,spreads_creep,creep_radius,can_morph_to,morph_cost,morph_time,damage,attack_range,attack_cooldown
command_center,Command Center,400,1000,box,#3b82f6,1.875,1.5,1.875,Base building - produces workers,terran,false,0,,,0,0,0
barracks,Barracks,5,300,box,#ef4444,1.5,1.125,1.5,Infantry production - unlocks Marines,terran,false,0,,,0,0,0
```

**New Zerg buildings:**
```csv
id,name,cost,health,shape,color,width,height,depth,description,faction,spreads_creep,creep_radius,can_morph_to,morph_cost,morph_time,damage,attack_range,attack_cooldown
hatchery,Hatchery,300,1500,box,#6b1f8f,2.5,1.5,2.5,Zerg main base - produces larva,zerg,true,3.0,,,0,0,0
spawning_pool,Spawning Pool,200,750,box,#6b1f8f,1.5,1.2,1.5,Tech building - unlocks advanced units,zerg,true,3.0,,,0,0,0
creep_colony,Creep Colony,75,400,cylinder,#6b1f8f,1.0,1.2,1.0,Defensive structure - spreads creep,zerg,true,5.0,sunken_colony,50,10,0,0,0
sunken_colony,Sunken Colony,0,500,cone,#4a235a,1.2,1.5,1.2,Defensive tower - attacks ground units,zerg,true,5.0,,,40,5.0,1.5
```

### data/cards.csv (additions)
```csv
id,name,cost,effect_type,effect_value,unit_id,building_id,card_type,faction,description,max_copies,is_permanent_removal,discard_cost,build_time
hatchery,Hatchery,300,spawn_building,,,hatchery,building,zerg,Main base - produces larva,1,false,2,15
spawning_pool,Spawning Pool,200,spawn_building,,,spawning_pool,building,zerg,Tech building - unlocks Zerglings and Hydralisks,1,false,2,10
creep_colony,Creep Colony,75,spawn_building,,,creep_colony,building,zerg,Defensive structure - spreads creep,3,false,1,5
zergling,Zergling,50,spawn_unit,,zergling_unit,,unit,zerg,Fast melee attacker,3,false,1,4
hydralisk,Hydralisk,75,spawn_unit,,hydralisk_unit,,unit,zerg,Ranged attacker,2,false,1,6
```

### data/tech_tree.csv (additions)
```csv
card_id,required_building,faction
hatchery,none,zerg
zergling,hatchery,zerg
spawning_pool,hatchery,zerg
creep_colony,hatchery,zerg
hydralisk,spawning_pool,zerg
```
