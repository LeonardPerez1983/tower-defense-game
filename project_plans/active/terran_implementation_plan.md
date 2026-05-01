# Terran Implementation Plan

Status: Active
Last updated: 2026-05-01

## Problem

Terran faction needs additional units and mechanics to be complete:
- Missing Firebat unit (short-range heavy infantry)
- Missing Bunker garrison mechanic (defensive structure that holds troops)

## Design

### Firebat Unit
- Short-range (2.0) heavy damage infantry
- Slower than Marines but tankier
- Produced from Barracks
- 3 energy cost

### Bunker Mechanics
- Defensive building that can garrison up to 4 Marines/Firebats
- **Fill Mode Toggle**: Player can enable auto-garrison mode
  - When enabled, nearby Marines/Firebats automatically enter the bunker
  - Units within 2.0 range are pulled in
- **Garrisoned Combat**: Units inside attack normally using their own range/damage
  - Attack originates from bunker position
  - Enemies cannot target garrisoned units
- **Unload All**: Player can release all troops back to battlefield
- **Bunker Destruction**: If bunker is destroyed, all garrisoned units die with it

## Tech Tree

Simple linear progression:
```
Command Center (starts built)
  ├─> SCV (worker, max 5)
  └─> Barracks (requires Command Center)
      ├─> Marine
      ├─> Firebat
      └─> Bunker
```

## Balance Numbers

### Units

| Unit | Cost | HP | Speed | Damage | Range | Build Time |
|------|------|----|----|--------|-------|------------|
| Marine | 2 | 45 | 2.0 | 6 | 4.0 | 3s |
| Firebat | 3 | 80 | 1.5 | 12 | 2.0 | 4s |
| SCV | 2 | 60 | 1.8 | - | - | 5s |

### Buildings

| Building | Cost | HP | Size | Build Time |
|----------|------|----|----|------------|
| Command Center | - (starts) | 1000 | 4.5x1.8x2.2 | - |
| Barracks | 5 | 500 | 3.0x1.2x1.5 | 12s |
| Bunker | 4 | 500 | 2.6x0.9x1.3 | 8s |

**Bunker Garrison Capacity**: 4 units (Marines and/or Firebats)

## Stub CSV Data

### cards.csv additions
```csv
id,name,cost,effect_type,effect_value,unit_id,building_id,card_type,faction,description,max_copies,is_permanent_removal,discard_cost,build_time
firebat,Firebat,3,spawn_unit,,firebat_unit,,unit,terran,Heavy assault infantry with flamethrower,1,false,1,4
bunker,Bunker,4,spawn_building,,,bunker_building,building,terran,Defensive structure - garrison troops inside,1,false,2,8
```

### units.csv additions
```csv
id,health,speed,damage,attack_range,shape,color,faction,max_shields,shield_regen_delay,shield_regen_rate
firebat_unit,80,1.5,12,2.0,box,#ff6b6b,terran,0,0,0
```

### buildings.csv additions
```csv
id,name,cost,health,shape,color,width,height,depth,description,max_shields,shield_regen_delay,shield_regen_rate,attack_damage,attack_range,attack_cooldown
bunker_building,Bunker,4,500,box,#4a4a4a,2.6,0.9,1.3,Defensive garrison structure,0,0,0,0,0,0
```

### tech_tree.csv additions
```csv
card_id,required_building,faction
firebat,terran_barracks,terran
bunker,terran_barracks,terran
```

## Implementation

### Phase 1: Data Setup (1 hour)
**Files to modify:**
- `data/cards.csv` - Add Firebat and Bunker cards
- `data/units.csv` - Add Firebat stats
- `data/buildings.csv` - Add Bunker stats
- `data/tech_tree.csv` - Add tech requirements

**Testing:** Load game, verify no parse errors

### Phase 2: Bunker State Management (2 hours)
**Files to modify:**
- `app/src/engine/GameState.ts`
  ```typescript
  interface PlacedBuilding {
    // ... existing fields
    garrisonedUnits?: string[]; // Array of unit IDs
    fillModeEnabled?: boolean;
  }
  ```

- `app/src/engine/GameStateProvider.tsx`
  ```typescript
  interface GameActions {
    // ... existing actions
    garrisonUnit: (buildingId: string, unitId: string) => void;
    ungarrisonAll: (buildingId: string) => void;
    toggleFillMode: (buildingId: string) => void;
  }
  ```

**Testing:** Add garrison actions, verify state updates

### Phase 3: Auto-Garrison Logic (2 hours)
**New file:** `app/src/hooks/useBunkerGarrison.ts`
```typescript
export function useBunkerGarrison() {
  const { state, actions } = useGameState();
  
  useFrame(() => {
    const bunkers = state.playerBuildings.filter(b => 
      b.buildingType === "bunker_building" && b.fillModeEnabled
    );
    
    bunkers.forEach(bunker => {
      const garrisonCount = bunker.garrisonedUnits?.length || 0;
      if (garrisonCount >= 4) return; // Full
      
      // Find nearby Marines/Firebats
      const nearbyUnits = state.units.filter(u =>
        u.team === "player" &&
        (u.unitType === "marine_unit" || u.unitType === "firebat_unit") &&
        distance(u.position, bunker.position) <= 2.0
      );
      
      nearbyUnits.slice(0, 4 - garrisonCount).forEach(unit => {
        actions.garrisonUnit(bunker.id, unit.id);
      });
    });
  });
}
```

**Testing:** Place bunker, enable fill mode, spawn Marines nearby, verify they auto-garrison

### Phase 4: Garrisoned Unit Combat (2 hours)
**Files to modify:**
- `app/src/hooks/useUnitCombat.ts`
  - Add loop for garrisoned units
  - Use bunker position + unit's own attack range
  - Attack enemies in range

```typescript
// In useUnitCombat, add after regular unit combat loop:
state.buildings.forEach(building => {
  building.garrisonedUnits?.forEach(garrisonedUnitId => {
    const unit = findUnitById(garrisonedUnitId);
    if (!unit) return;
    
    const target = findNearestEnemy(building.position, unit.stats.attack_range);
    if (target && canAttack(unit)) {
      actions.damageUnit(target.id, unit.stats.damage);
      unit.lastAttackTime = now;
    }
  });
});
```

**Testing:** Garrison Marines, verify they attack from bunker position

### Phase 5: Bunker UI (2 hours)
**New file:** `app/src/components/BunkerPanel.tsx`
- Shows garrison count (e.g., "3/4")
- Fill mode toggle button
- Unload all button

**Files to modify:**
- `app/src/game/Building.tsx` - Show garrison count overlay on bunker

**Testing:** UI controls work, visual feedback clear

### Phase 6: Edge Cases (1.5 hours)
- Bunker destroyed → garrisoned units die
- Garrisoned unit removed from unit list (not rendered, not targetable)
- Units can't be double-garrisoned
- Unload spawns units near bunker (not inside it)

**Testing checklist:**
- [ ] Destroy bunker with 4 units → all die
- [ ] Garrisoned units don't appear in unit list
- [ ] Can't garrison more than 4 units
- [ ] Unload places units at valid positions
- [ ] Fill mode auto-disables when full
- [ ] Garrisoned units attack correctly
- [ ] Range extends from bunker, not original unit position

## Total Estimate
~10.5 hours

## Open Questions
- Should garrisoned units get a defensive bonus? (Recommend: no, bunker HP is the defense)
- Should units auto-exit if bunker HP is critical? (Recommend: no, adds complexity)
- Can you manually select which units to unload? (Recommend: no, "unload all" is simpler)
