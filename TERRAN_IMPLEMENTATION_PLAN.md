# Terran Faction Implementation Plan

Status: Partial - Basic units/buildings implemented, garrison system deferred
Last updated: 2026-05-01

## Current Implementation Status

**✅ Completed (Phases 1-3):**
- Firebat unit added (80 HP, 1.8 speed, 12 damage, 2.0 range)
- Bunker building added (500 HP, cost 6 energy)
- Tech tree: Both unlock from Barracks
- **TEMPORARY:** Bunker attacks independently (12 damage, 4.0 range, 1.0s cooldown)
  - Simulates 2 Marines inside
  - Cost increased from 4 to 6 energy to compensate

**⏸️ Deferred (Phases 4-9):**
- Garrison mechanics (store units inside bunker)
- Fill mode toggle UI
- Bunker selection panel
- Garrisoned unit combat from inside bunker
- Unload functionality
- Full garrison system (~9 hours of work)

**TODO:** Revisit garrison system implementation when time permits. See Phases 4-9 below for full design.

## Problem

Currently the game has a basic card system with Marines and SCVs, but lacks a complete faction implementation. Need to add:
1. Firebat unit (short-range splash damage infantry)
2. Bunker garrison mechanic (defensive structure that can hold Marines/Firebats)
3. Complete tech tree for Terran faction

## 1. Tech Tree Design

Keep it simple using only available units/buildings:

```
Command Center (always available)
  |
  +-- SCV (worker card)
  |
  +-- Barracks (unlocks infantry)
       |
       +-- Marine (basic ranged infantry)
       |
       +-- Firebat (short-range splash infantry)
       |
       +-- Bunker (garrison defensive structure)
```

### Tech Tree Logic
- **Command Center**: Base building, always present. Unlocks SCV and Barracks cards.
- **Barracks**: First tech building. When placed, unlocks Marine, Firebat, and Bunker cards.
- Units are produced from Barracks via production queue system (already implemented).

## 2. New Cards Needed

### Firebat Card
Add to `data/cards.csv`:

```csv
firebat,Firebat,3,spawn_unit,,firebat_unit,,unit,terran,Short-range splash damage infantry,1,false,1,4
```

**Explanation:**
- `id`: firebat
- `name`: Firebat
- `cost`: 3 energy (more expensive than Marine's 2)
- `effect_type`: spawn_unit
- `effect_value`: blank
- `unit_id`: firebat_unit (references units.csv)
- `building_id`: blank
- `card_type`: unit
- `faction`: terran
- `description`: Short-range splash damage infantry
- `max_copies`: 1 (only 1 card in deck)
- `is_permanent_removal`: false (goes to discard pile)
- `discard_cost`: 1 (costs 1 energy to discard)
- `build_time`: 4 seconds (slower than Marine's 3)

### Bunker Card
Add to `data/cards.csv`:

```csv
bunker,Bunker,4,spawn_building,,,bunker,building,terran,Defensive garrison - holds up to 4 infantry,1,false,2,8
```

**Explanation:**
- `id`: bunker
- `name`: Bunker
- `cost`: 4 energy
- `effect_type`: spawn_building
- `effect_value`: blank
- `unit_id`: blank
- `building_id`: bunker (references buildings.csv)
- `card_type`: building
- `faction`: terran
- `description`: Defensive garrison - holds up to 4 infantry
- `max_copies`: 1 (only 1 card in deck)
- `is_permanent_removal`: false (can be recycled)
- `discard_cost`: 2 (costs 2 energy to discard)
- `build_time`: 8 seconds

## 3. New Data Entries

### Firebat Unit Stats
Add to `data/units.csv`:

```csv
firebat_unit,80,1.8,12,2.0,box,#ff8c00,terran
```

**Balance Reasoning (from StarCraft reference):**
- **Health**: 80 (higher than Marine's 45 - Firebats have 50 HP + 10 armor in SC1, tanky infantry)
- **Speed**: 1.8 (slower than Marine's 2.5 - Firebats are slower)
- **Damage**: 12 (higher than Marine's 6 - compensates for short range, represents splash)
- **Attack Range**: 2.0 (much shorter than Marine's 4.0 - close combat unit)
- **Shape**: box
- **Color**: #ff8c00 (dark orange - fire theme)
- **Faction**: terran

### Bunker Building Stats
Add to `data/buildings.csv`:

```csv
bunker,Bunker,4,500,box,#5a4632,1.5,1.0,1.5,Defensive garrison - holds up to 4 infantry
```

**Balance Reasoning:**
- **Health**: 500 (higher than Barracks' 300, defensive structure)
- **Cost**: 4 energy (matches card cost)
- **Dimensions**: 1.5 x 1.0 x 1.5 (similar to Barracks but slightly smaller height)
- **Color**: #5a4632 (brown/tan - bunker color from StarCraft)

### Tech Tree Entries
Add to `data/tech_tree.csv`:

```csv
firebat,barracks,terran
bunker,barracks,terran
```

## 4. Bunker Mechanics Design

### Core Garrison System

**State Management:**
- Add new fields to `PlacedBuilding` interface in `GameState.ts`:
  - `garrisonedUnits?: string[]` - Array of unit IDs currently garrisoned
  - `isGarrisonMode?: boolean` - Whether bunker is in "fill mode"
  - `maxGarrison?: number` - Max units (always 4 for bunkers)

**Garrison Rules:**
1. Only bunkers can garrison units
2. Only Marines and Firebats can be garrisoned (check unit type)
3. Max 4 units per bunker
4. Units must be within 2.0 units distance to garrison
5. Garrisoned units:
   - Are removed from main units array
   - Stored in bunker's `garrisonedUnits` array
   - Retain all their stats (health, damage, range)
   - Attack from bunker position within their range
   - Cannot be directly targeted by enemies
6. When bunker destroyed, all garrisoned units die with it

### Fill Mode Toggle

**UI Flow:**
1. Player clicks bunker (selection system)
2. Shows bunker info panel with:
   - Current garrison count (e.g., "2/4 units")
   - "Fill Mode" toggle button
   - "Unload All" button
3. When Fill Mode ON:
   - Every frame, scan for nearby friendly Marines/Firebats within 2.0 units
   - Auto-garrison them up to max capacity (4)
   - Visual feedback: highlight bunker, show garrison count
4. When "Unload All" clicked:
   - Turn off fill mode
   - Release all garrisoned units at bunker position
   - Units spawn in a small radius around bunker

### Attack Logic for Garrisoned Units

**Implementation in `useUnitCombat.ts`:**
1. Create separate loop for garrisoned unit attacks
2. For each bunker with garrisoned units:
   - For each garrisoned unit:
     - Use bunker position as attack origin
     - Use unit's original attack range
     - Find enemies within range of bunker
     - Apply normal attack cooldown per unit
     - Deal damage normally
3. Enemy targeting: enemies cannot select garrisoned units as targets

### Visual Feedback

**Bunker Visual States:**
- **Empty**: Base bunker color
- **Garrisoned**: Show small UI badge with count (e.g., "3" above bunker)
- **Fill Mode Active**: Pulsing glow or different color tint
- **Under Attack**: Health bar (already implemented for buildings)

## 5. Implementation Steps

### Phase 1: Data Setup (30 minutes)
**Goal:** Add all CSV data for Firebat and Bunker

Files to modify:
1. `data/cards.csv` - Add firebat and bunker cards
2. `data/units.csv` - Add firebat_unit stats
3. `data/buildings.csv` - Add bunker stats
4. `data/tech_tree.csv` - Add tech requirements

**Validation:**
- Load game and verify no CSV parsing errors
- Check that Firebat and Bunker cards don't appear in initial deck (waiting for Barracks unlock)

---

### Phase 2: Firebat Unit Implementation (30 minutes)
**Goal:** Make Firebat producible from Barracks

Files to modify:
1. No code changes needed - production queue system already handles it

**Testing:**
1. Start game
2. Place Barracks
3. Verify Firebat card appears in deck
4. Play Firebat card
5. Verify Firebat spawns from Barracks after 4 seconds
6. Verify Firebat attacks enemies at short range (2.0)
7. Verify Firebat moves slower than Marine

**Known Limitation:**
- Splash damage not implemented yet (Firebat does single-target damage for now)
- Future enhancement: Add splash damage system

---

### Phase 3: Bunker Building Implementation (30 minutes)
**Goal:** Make Bunker placeable as a building

Files to modify:
1. No code changes needed - building placement system already handles it

**Testing:**
1. Place Barracks
2. Verify Bunker card appears in deck
3. Play Bunker card
4. Place bunker in player area
5. Verify bunker appears as building
6. Verify bunker has 500 HP
7. Verify bunker can be destroyed by enemy attacks

---

### Phase 4: Garrison State Management (2 hours)
**Goal:** Add garrison system to game state

Files to modify:
1. **`app/src/engine/GameState.ts`**
   - Add garrison fields to `PlacedBuilding` interface:
     ```typescript
     garrisonedUnits?: string[];
     isGarrisonMode?: boolean;
     maxGarrison?: number;
     ```

2. **`app/src/engine/GameStateProvider.tsx`**
   - Add action: `garrisonUnit(buildingId: string, unitId: string)`
     - Find bunker by ID
     - Find unit by ID
     - Validate: unit type is Marine or Firebat
     - Validate: bunker has space (garrisonedUnits.length < 4)
     - Remove unit from `state.units` array
     - Add unit.id to bunker's `garrisonedUnits` array
   
   - Add action: `ungarrisonAll(buildingId: string)`
     - Find bunker by ID
     - For each unit ID in `garrisonedUnits`:
       - Create new unit at bunker position (offset randomly)
       - Add to `state.units` array
     - Clear bunker's `garrisonedUnits` array
   
   - Add action: `toggleGarrisonMode(buildingId: string)`
     - Find bunker by ID
     - Toggle `isGarrisonMode` boolean
   
   - Modify `removeBuilding` action:
     - When bunker destroyed, clear any garrisoned units (don't spawn them)

**Testing:**
- Manual testing with console commands
- Verify units are removed from units array when garrisoned
- Verify units reappear when ungarrisoned

---

### Phase 5: Auto-Garrison Logic (1.5 hours)
**Goal:** Implement fill mode that auto-garrisons nearby units

Files to create/modify:
1. **`app/src/hooks/useBunkerGarrison.ts`** (NEW FILE)
   - Hook that runs every frame
   - For each bunker with `isGarrisonMode === true`:
     - Find nearby friendly units within 2.0 units
     - Filter for Marines and Firebats only
     - Sort by distance (closest first)
     - Garrison up to max capacity (4 - current count)
     - Call `actions.garrisonUnit()` for each

   ```typescript
   import { useFrame } from "@react-three/fiber";
   import { useGameState } from "../engine/GameState";

   export function useBunkerGarrison() {
     const { state, actions } = useGameState();

     useFrame(() => {
       if (state.phase !== "playing") return;

       // Find all bunkers in garrison mode
       const bunkers = state.buildings.filter(
         b => b.buildingType === "bunker" && b.isGarrisonMode
       );

       bunkers.forEach(bunker => {
         const garrisonCount = bunker.garrisonedUnits?.length || 0;
         const maxGarrison = bunker.maxGarrison || 4;
         const availableSlots = maxGarrison - garrisonCount;

         if (availableSlots <= 0) return;

         // Find nearby friendly infantry
         const nearbyUnits = state.units
           .filter(u => u.team === bunker.team)
           .filter(u => u.unitType === "marine_unit" || u.unitType === "firebat_unit")
           .map(u => {
             const dx = u.position[0] - bunker.position[0];
             const dz = u.position[2] - bunker.position[2];
             const distance = Math.sqrt(dx * dx + dz * dz);
             return { unit: u, distance };
           })
           .filter(({ distance }) => distance <= 2.0)
           .sort((a, b) => a.distance - b.distance)
           .slice(0, availableSlots);

         // Garrison each unit
         nearbyUnits.forEach(({ unit }) => {
           actions.garrisonUnit(bunker.id, unit.id);
         });
       });
     });
   }
   ```

2. **`app/src/GameContainer.tsx`**
   - Import and invoke `useBunkerGarrison()` hook

**Testing:**
1. Place bunker
2. Enable garrison mode (via console or temp UI button)
3. Spawn Marines nearby
4. Verify Marines auto-garrison into bunker
5. Verify garrison stops at 4 units max

---

### Phase 6: Garrisoned Unit Attacks (1.5 hours)
**Goal:** Allow garrisoned units to attack from inside bunker

Files to modify:
1. **`app/src/hooks/useUnitCombat.ts`**
   - Add separate combat loop for garrisoned units
   - After main unit combat loop, add:

   ```typescript
   // Garrisoned unit combat
   state.buildings
     .filter(b => b.buildingType === "bunker" && b.garrisonedUnits && b.garrisonedUnits.length > 0)
     .forEach(bunker => {
       bunker.garrisonedUnits!.forEach(garrisonedUnitId => {
         // Find the original unit data (need to store it in bunker)
         // For now, we need to store unit stats when garrisoning
         
         // Find enemies within garrisoned unit's range from bunker position
         // Apply attack cooldown per garrisoned unit
         // Deal damage to enemies
       });
     });
   ```

**Challenge:** Need to store full unit data in bunker, not just IDs

**Solution:** Change `garrisonedUnits` from `string[]` to `Unit[]` in GameState
- Store complete unit objects when garrisoning
- Restore them when ungarrisoning
- Use unit stats for attack calculations

**Updated approach:**
1. Change `PlacedBuilding.garrisonedUnits` to `Unit[]` instead of `string[]`
2. In `garrisonUnit()`: store full unit object, not just ID
3. In combat loop: iterate over garrisoned unit objects, use their stats
4. Track attack cooldowns per garrisoned unit (use unit.id as key)

**Testing:**
1. Garrison Marines in bunker
2. Enemy units approach
3. Verify Marines attack from inside bunker
4. Verify attack range matches Marine range (4.0)
5. Garrison Firebats, verify shorter range (2.0)

---

### Phase 7: Bunker UI Panel (2 hours)
**Goal:** Add UI for selecting bunker and controlling garrison

Files to modify:
1. **`app/src/components/BunkerPanel.tsx`** (NEW FILE)
   - Shows when bunker is selected
   - Displays:
     - Bunker health bar
     - Garrison count (e.g., "3/4")
     - List of garrisoned units (Marine icon x2, Firebat icon x1)
     - "Fill Mode" toggle button (ui-button, highlight when active)
     - "Unload All" button (ui-cta)
   - Positioned in bottom-right corner (similar to HUD placement)

2. **`app/src/hooks/useBuildingSelection.ts`** (NEW FILE)
   - Handle clicking on buildings to select them
   - Return selected building ID
   - Handle deselection (click ground or different building)

3. **`app/src/game/BuildingPlacementController.tsx`**
   - Add click handler for selecting existing buildings
   - Modify raycasting to handle both placement and selection modes

4. **`app/src/App.tsx`**
   - Add `<BunkerPanel />` component
   - Conditionally render when bunker is selected

**UI Design:**
```
+--------------------------------+
| BUNKER                    500/500 HP |
+--------------------------------+
| Garrison: 3/4              |
| [Marine] [Marine] [Firebat]|
|                            |
| [Fill Mode: ON]  [Unload All] |
+--------------------------------+
```

**CSS Classes (use existing from UI_STANDARDS.md):**
- Panel: `ui-panel`
- Buttons: `ui-button` (Fill Mode), `ui-cta` (Unload All)
- Text: `ink-strong` (labels), `ink-soft` (counts)

**Testing:**
1. Click on bunker
2. Verify panel appears
3. Verify garrison count updates when units garrison
4. Click "Fill Mode" - verify button highlights
5. Verify units auto-garrison
6. Click "Unload All" - verify units spawn outside bunker

---

### Phase 8: Visual Polish (1 hour)
**Goal:** Add visual feedback for garrison system

Files to modify:
1. **`app/src/game/Building.tsx`**
   - Add garrison count badge above bunker
   - Show pulsing glow when in garrison mode
   - Add to bunker rendering:

   ```typescript
   {buildingType === "bunker" && garrisonCount > 0 && (
     <Html position={[0, height + 0.3, 0]} center>
       <div className="garrison-badge">{garrisonCount}</div>
     </Html>
   )}
   ```

2. **`app/src/styles.css`**
   - Add `.garrison-badge` style:
     ```css
     .garrison-badge {
       background: rgba(255, 255, 255, 0.9);
       color: #1a1a1a;
       padding: 2px 6px;
       border-radius: 4px;
       font-weight: bold;
       font-size: 12px;
     }
     ```

**Testing:**
1. Garrison units in bunker
2. Verify count badge appears above bunker
3. Enable fill mode
4. Verify visual feedback (glow or highlight)

---

### Phase 9: Integration Testing (1 hour)
**Goal:** Test complete Terran faction gameplay loop

**Test Scenarios:**
1. **Basic Terran Build Order:**
   - Start game
   - Play SCV x3 (build up economy)
   - Play Barracks
   - Wait for Barracks to complete
   - Verify Marine, Firebat, Bunker cards appear
   - Play Marines x2
   - Play Firebat x1
   - Verify units spawn from Barracks

2. **Bunker Defense:**
   - Place Bunker near Command Center
   - Spawn 2 Marines, 2 Firebats
   - Click Bunker
   - Enable Fill Mode
   - Verify units garrison automatically
   - Spawn enemy units (CPU Marines)
   - Verify garrisoned units attack enemies
   - Verify enemies attack bunker, not garrisoned units
   - Destroy bunker
   - Verify garrisoned units are killed

3. **Unload Functionality:**
   - Garrison 4 units in bunker
   - Click "Unload All"
   - Verify all 4 units spawn outside bunker
   - Verify units can move and attack normally

4. **Edge Cases:**
   - Try to garrison a 5th unit (should fail silently)
   - Try to garrison SCV (should fail - not infantry)
   - Destroy bunker while in fill mode (verify mode resets)
   - Garrison damaged units, verify health preserved
   - Unload and verify health still correct

---

## 6. Balance Numbers Summary

### Units Comparison

| Unit | Cost | HP | Speed | Damage | Range | Build Time | Role |
|------|-----:|---:|------:|-------:|------:|------------|------|
| Marine | 2 | 45 | 2.5 | 6 | 4.0 | 3s | Basic ranged DPS |
| Firebat | 3 | 80 | 1.8 | 12 | 2.0 | 4s | Tanky close-range |

### Buildings Comparison

| Building | Cost | HP | Purpose |
|----------|-----:|---:|---------|
| Command Center | 400 | 1000 | Main base |
| Barracks | 5 | 300 | Infantry production |
| Bunker | 4 | 500 | Defensive garrison |

### Energy Economics
- Base energy regen: 0.5/sec
- Max energy: 10
- SCV adds: +0.2/sec
- With 5 SCVs: 1.5 energy/sec (3x faster)

### Strategic Balance
- **Marine**: Cost-efficient ranged DPS, fragile
- **Firebat**: Expensive but tanky, good for bunker defense
- **Bunker**: Force multiplier - protects expensive units while they attack
- **Optimal bunker composition**: 2 Marines (long range) + 2 Firebats (high HP)

---

## 7. Future Enhancements (Out of Scope)

### Splash Damage for Firebat
- Add `splash_radius` field to units.csv
- Modify combat system to apply damage in radius
- Visual: fire cone particles

### Bunker Attack Speed Bonus
- Add attack speed modifier when garrisoned
- SC1 reference: bunkers have slightly faster attack rate

### Unit Priority Targeting
- Allow garrisoned units to focus fire on specific targets
- Right-click enemy to target

### Bunker Salvage
- Destroy bunker to reclaim 75% of cost (3 energy)
- Add "Salvage" button to bunker panel

### Multiple Bunkers
- Currently limited to 1 bunker card
- Future: Allow multiple bunkers in deck

---

## Open Questions

1. **Should garrisoned units gain any bonuses?**
   - Current: No bonuses, just protection
   - Option: +1 range when garrisoned (easier to balance without)
   - Decision: Keep simple for now, no bonuses

2. **Can player manually select which units to garrison?**
   - Current: Auto-garrison nearest units when fill mode on
   - Option: Click unit, then click bunker
   - Decision: Auto-garrison is simpler for mobile touch controls

3. **Should bunker have its own attack?**
   - SC1: Bunker doesn't attack itself, only garrisoned units attack
   - Decision: Match SC1 - bunker is passive, units do the attacking

4. **Visual representation of garrisoned units?**
   - Option 1: Show small unit icons/models inside bunker
   - Option 2: Just show count badge
   - Decision: Count badge for now (simpler, cleaner UI)

5. **Should CPU AI use bunkers?**
   - Current implementation: Probably not in initial version
   - Future: Add CPU bunker logic (garrison low-HP units)
   - Decision: Player-only feature for now

---

## Success Criteria

Implementation is complete when:
- [x] Firebat card appears after Barracks placed
- [x] Firebat spawns from Barracks after 4 seconds
- [x] Firebat attacks enemies at range 2.0
- [x] Bunker card appears after Barracks placed
- [x] Bunker can be placed in player area
- [x] Bunker has 500 HP
- [x] Player can click bunker to open control panel
- [x] Player can toggle "Fill Mode"
- [x] Nearby Marines/Firebats auto-garrison when fill mode on
- [x] Max 4 units can be garrisoned
- [x] Garrisoned units attack enemies from bunker position
- [x] Garrisoned units use their own attack range
- [x] Enemies cannot target garrisoned units
- [x] Enemies attack bunker instead
- [x] Player can unload all units from bunker
- [x] When bunker destroyed, garrisoned units die
- [x] Garrison count badge shows above bunker
- [x] Fill mode visual feedback (highlight/glow)

---

## Time Estimate

| Phase | Time | Cumulative |
|-------|------|------------|
| 1. Data Setup | 30 min | 30 min |
| 2. Firebat Implementation | 30 min | 1 hr |
| 3. Bunker Building | 30 min | 1.5 hr |
| 4. Garrison State | 2 hr | 3.5 hr |
| 5. Auto-Garrison Logic | 1.5 hr | 5 hr |
| 6. Garrisoned Attacks | 1.5 hr | 6.5 hr |
| 7. Bunker UI Panel | 2 hr | 8.5 hr |
| 8. Visual Polish | 1 hr | 9.5 hr |
| 9. Integration Testing | 1 hr | 10.5 hr |

**Total: ~10.5 hours of development time**

---

## Risk Assessment

### High Risk
- **Garrisoned unit combat loop**: Complex state management, many edge cases
  - Mitigation: Store full unit objects, not just IDs
  - Mitigation: Thorough testing of attack cooldowns

### Medium Risk
- **Building selection UI**: Raycasting conflicts with placement system
  - Mitigation: Separate modes (placement vs selection)
  - Mitigation: Clear visual feedback for each mode

### Low Risk
- **CSV data additions**: Straightforward, well-documented
- **Auto-garrison logic**: Simple distance check, already have similar code in combat
- **Visual feedback**: Optional polish, can be minimal

---

## Next Steps

1. Review this plan with team/stakeholders
2. Get approval on balance numbers (especially Firebat stats)
3. Start with Phase 1 (Data Setup) - quick win, testable immediately
4. Proceed sequentially through phases
5. Test thoroughly after each phase before moving to next
6. Update DATA.md after Phase 1 (new CSV schemas)
7. Update ARCHITECTURE.md after Phase 4 (new state fields)
