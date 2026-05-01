# Zerg Implementation Plan

Status: Active
Last updated: 2026-05-01

## Problem

Zerg faction needs unique production and territorial control mechanics:
- Creep system (can only build on creep, creep spreads from buildings)
- Larva-based production (units morph from larva → cocoon → final unit)
- Building morph (Creep Colony → Sunken Colony)
- Faction-specific buffs/debuffs on creep

## Design

### Creep System
- **Purple ground texture** spreads around Zerg buildings
- **Build restriction**: Zerg can ONLY build on creep
- **Creep spread radius**: 
  - Hatchery: 5.0 units
  - Spawning Pool: 3.0 units
  - Creep Colony: 4.0 units
  - Sunken Colony: 4.0 units
- **Buffs/Debuffs**:
  - Zerg units: +1 HP/sec regeneration on creep
  - Non-Zerg units: -25% movement speed, -15% damage on creep

### Larva Production
- **Hatchery starts with 3 larva**, max 3
- **Playing a unit card**:
  1. Consumes 1 larva
  2. Spawns cocoon at hatchery position
  3. Cocoon morphs into unit after build time
  4. Cocoon bursts, unit appears
- **Larva regeneration**: Hatchery auto-generates 1 larva every 15 seconds (when < 3)

### Building Morph
- **Creep Colony** (75 energy, basic building)
  - Spreads creep
  - No attack
- **Morph to Sunken Colony** (+50 energy, 10s morph time)
  - Keeps creep spread
  - Gains attack: 40 damage, 5.0 range, 1.5s cooldown

### Tech Tree
```
Hatchery (starts built)
  ├─> Zergling (requires Hatchery, produced from larva)
  ├─> Spawning Pool (requires Hatchery)
  │   └─> Hydralisk (requires Spawning Pool, produced from larva)
  └─> Creep Colony (requires Hatchery)
      └─> Sunken Colony (morph from Creep Colony)
```

## Balance Numbers

### Units

| Unit | Cost | HP | Speed | Damage | Range | Build Time | Produced From |
|------|------|----|----|--------|-------|------------|---------------|
| Zergling | 1 | 35 | 3.5 | 5 | 1.0 (melee) | 3s | Larva |
| Hydralisk | 2 | 80 | 2.0 | 10 | 4.0 | 5s | Larva |

### Buildings

| Building | Cost | HP | Size | Build Time | Creep Radius | Attack |
|----------|------|----|----|------------|--------------|--------|
| Hatchery | - (starts) | 1000 | 4.8x1.5x2.4 | - | 5.0 | No |
| Spawning Pool | 4 | 400 | 3.2x0.8x1.6 | 10s | 3.0 | No |
| Creep Colony | 2 | 300 | 2.4x1.2x1.0 | 6s | 4.0 | No |
| Sunken Colony | +3 (morph) | 400 | 2.8x1.4x1.2 | 10s (morph) | 4.0 | 40 dmg, 5.0 range |

### Creep Effects

| Effect | Zerg Units | Non-Zerg Units |
|--------|------------|----------------|
| HP Regen | +1 HP/sec | - |
| Move Speed | - | -25% |
| Damage | - | -15% |

## Stub CSV Data

### cards.csv additions
```csv
id,name,cost,effect_type,effect_value,unit_id,building_id,card_type,faction,description,max_copies,is_permanent_removal,discard_cost,build_time
zergling,Zergling,1,spawn_unit,,zergling_unit,,unit,zerg,Fast melee attacker,1,false,1,3
hydralisk,Hydralisk,2,spawn_unit,,hydralisk_unit,,unit,zerg,Ranged spiker,1,false,1,5
spawning_pool,Spawning Pool,4,spawn_building,,,spawning_pool_building,building,zerg,Unlocks advanced units,1,false,2,10
creep_colony,Creep Colony,2,spawn_building,,,creep_colony_building,building,zerg,Spreads creep - can morph to Sunken,1,false,2,6
sunken_colony,Sunken Colony,3,morph_building,,,sunken_colony_building,building,zerg,Defensive structure (morph from Creep Colony),1,false,2,10
```

### units.csv additions
```csv
id,health,speed,damage,attack_range,shape,color,faction,max_shields,shield_regen_delay,shield_regen_rate
zergling_unit,35,3.5,5,1.0,box,#9b59b6,zerg,0,0,0
hydralisk_unit,80,2.0,10,4.0,cylinder,#9b59b6,zerg,0,0,0
```

### buildings.csv additions
```csv
id,name,cost,health,shape,color,width,height,depth,description,max_shields,shield_regen_delay,shield_regen_rate,attack_damage,attack_range,attack_cooldown,creep_radius
spawning_pool_building,Spawning Pool,4,400,box,#7a4d7a,3.2,0.8,1.6,Evolution chamber for advanced units,0,0,0,0,0,0,3.0
creep_colony_building,Creep Colony,2,300,cylinder,#9b59b6,2.4,1.2,1.0,Spreads creep - morphs to Sunken,0,0,0,0,0,0,4.0
sunken_colony_building,Sunken Colony,3,400,cylinder,#7a4d7a,2.8,1.4,1.2,Defensive structure with tentacles,0,0,0,40,5.0,1.5,4.0
```

**Note:** Added `creep_radius` column to buildings.csv

### tech_tree.csv additions
```csv
card_id,required_building,faction
zergling,zerg_hatchery,zerg
hydralisk,zerg_spawning_pool,zerg
spawning_pool,zerg_hatchery,zerg
creep_colony,zerg_hatchery,zerg
sunken_colony,zerg_creep_colony,zerg
```

## Implementation

### Phase 1: Data Setup (1-2 hours)
**Files to modify:**
- `data/cards.csv` - Add Zerg cards
- `data/units.csv` - Add Zergling, Hydralisk
- `data/buildings.csv` - Add Spawning Pool, Creep Colony, Sunken Colony, `creep_radius` column
- `data/tech_tree.csv` - Add Zerg tech requirements
- `data/loadData.ts` - Parse `creep_radius` field

**Testing:** Load game, verify Zerg data loads

### Phase 2: Creep System (3-4 hours)

**New file:** `app/src/game/Creep.tsx`
```typescript
export function Creep({ creepTiles }: { creepTiles: [number, number, number][] }) {
  return (
    <group>
      {creepTiles.map((pos, i) => (
        <mesh key={i} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.5, 16]} />
          <meshStandardMaterial color="#3d1f3d" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}
```

**New hook:** `app/src/hooks/useCreepGeneration.ts`
- Iterates player/CPU Zerg buildings
- For each building, calculates creep tiles within `creepRadius`
- Updates `state.playerCreepTiles` and `state.cpuCreepTiles`
- Recalculates when buildings are built/destroyed

**Files to modify:**
- `app/src/engine/GameState.ts`
  ```typescript
  interface GameState {
    // ... existing
    playerCreepTiles: [number, number, number][]; // Array of [x, y, z] positions
    cpuCreepTiles: [number, number, number][];
  }
  ```

- `app/src/game/Arena.tsx` - Render `<Creep>` component

**Testing:** Build Hatchery, verify purple creep appears

### Phase 3: Larva Production (3-4 hours)

**Files to modify:**
- `app/src/engine/GameState.ts`
  ```typescript
  interface PlacedBuilding {
    // ... existing
    larvaCount?: number; // For Hatcheries only
    lastLarvaSpawnTime?: number;
  }
  ```

**New hook:** `app/src/hooks/useLarvaRegeneration.ts`
```typescript
export function useLarvaRegeneration() {
  const { state, actions } = useGameState();
  
  useFrame(() => {
    const now = performance.now();
    
    state.buildings.forEach(building => {
      if (building.buildingType !== "hatchery_building") return;
      
      const larvaCount = building.larvaCount || 0;
      if (larvaCount >= 3) return; // Max larva
      
      const timeSinceLastSpawn = now - (building.lastLarvaSpawnTime || 0);
      if (timeSinceLastSpawn >= 15000) { // 15 seconds
        actions.addLarva(building.id);
      }
    });
  });
}
```

**Files to modify:**
- `app/src/engine/GameStateProvider.tsx`
  - Modify `queueProduction` for Zerg:
    - Check larva count > 0
    - Consume 1 larva
    - Spawn cocoon entity
  - Add `addLarva` action

**Testing:** Hatchery starts with 3 larva, regenerates after use

### Phase 4: Building Morph (2-3 hours)

**Files to modify:**
- `app/src/engine/GameState.ts`
  ```typescript
  interface PlacedBuilding {
    // ... existing
    isMorphing?: boolean;
    morphTarget?: string; // Target building ID
    morphStartTime?: number;
    morphDuration?: number;
  }
  ```

**New hook:** `app/src/hooks/useBuildingMorph.ts`
- Checks buildings with `isMorphing: true`
- When morph completes:
  - Replace building type
  - Keep position, HP, creep
  - Update stats (Sunken gets attack)

**Files to modify:**
- `app/src/components/BuildingPanel.tsx` (NEW)
  - Shows "Morph to Sunken Colony" button on Creep Colony
  - Shows progress bar during morph

**Testing:** Morph Creep Colony → Sunken Colony, verify it attacks

### Phase 5: Creep Buffs/Debuffs (2 hours)

**New hook:** `app/src/hooks/useCreepEffects.ts`
```typescript
export function useCreepEffects() {
  const { state } = useGameState();
  
  useFrame((_, delta) => {
    state.units.forEach(unit => {
      const isOnCreep = isPositionOnCreep(unit.position, state);
      
      if (unit.stats.faction === "zerg" && isOnCreep) {
        // Regen +1 HP/sec
        unit.health = Math.min(unit.health + delta, unit.stats.health);
      }
      
      if (unit.stats.faction !== "zerg" && isOnCreep) {
        // Apply speed/damage debuff
        unit.speedModifier = 0.75;
        unit.damageModifier = 0.85;
      } else {
        unit.speedModifier = 1.0;
        unit.damageModifier = 1.0;
      }
    });
  });
}
```

**Testing:** Zerg units regen on creep, Terran units slowed on creep

### Phase 6: Building Placement Restriction (1 hour)

**Files to modify:**
- `app/src/hooks/useBuildingPlacement.ts`
  - Check if placement position is on creep (for Zerg buildings)
  - Show red ghost if not on creep

**Testing:** Zerg can't place buildings off creep

### Phase 7: UI & Polish (2-3 hours)

- Larva counter on Hatchery UI
- Cocoon visual entity (show during morph)
- Morph progress bar
- Creep visual polish (animate edges?)

**Testing:** All UI elements clear and functional

## Total Estimate
15-20 hours

## Open Questions

**Q: How big are creep tiles?**
A: 1x1 unit grid, checking integer positions

**Q: Can creep overlap enemy territory?**
A: Yes, creep spreads everywhere. Non-Zerg units just get debuffed.

**Q: What if Hatchery is destroyed?**
A: Creep remains (doesn't recede). Buildings on that creep stay functional.

**Q: Can you morph while building is damaged?**
A: Yes, no restriction.

**Q: Do cocoons have HP? Can they be killed?**
A: No, cocoons are invulnerable during morph time (simpler implementation).
