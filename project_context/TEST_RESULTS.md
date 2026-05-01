# Baseline Test Results - 2026-04-30

## Purpose

This document records the baseline test results for the Battle Arena game **before** implementing the production queue system (StarCraft-style build orders). These results establish what currently works and what needs human QA verification.

---

## Update: Manual Testing Complete ✅

**Human QA Status:** All critical tests passed
- Game launches correctly
- Full match playable (start → game over)
- Marines attack Command Centers successfully
- Building placement works
- Energy system, workers, pathfinding all functional

**Issue Resolved:**
- ✅ Command Center HP updated from 500 → 1000 to match config.csv

---

## Summary

- **Unit Tests:** ✅ 10/10 passed
- **Manual Tests:** ✅ Critical gameplay verified by human QA
- **Code Inspection:** Structural analysis completed
- **Status:** ✅ Ready to proceed with production queue implementation

---

## Automated Test Results

### Unit Tests (npm test)

**Status:** ✅ ALL PASSING

```
Test Files  1 passed (1)
     Tests  10 passed (10)
  Duration  1.25s
```

**Details:**
- ✅ GameState - Initial State (8 tests)
  - ✅ should initialize with correct energy values
  - ✅ should initialize with correct tower HP
  - ✅ should initialize with zero workers
  - ✅ should initialize empty production queues
  - ✅ should initialize empty removed cards lists
  - ✅ should initialize SCV build counts at zero
  - ✅ should start in splash phase
  - ✅ should initialize empty hands and decks

- ✅ GameState - Config Parsing (2 tests)
  - ✅ should parse config values as numbers
  - ✅ should handle missing config with defaults

**Notes:**
- Production queue state fields exist in data model but are not yet used
- Tests confirm baseline data structures are correct

---

## Manual Test Results

These tests require a human QA tester with browser access to verify visual and interactive elements.

### T1: Game Launches

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Run `npm run dev`
2. Open http://localhost:5173
3. Verify splash screen shows with "Start Battle" button

**Expected Results:**
- Splash screen visible
- No console errors
- "Battle Arena" title displayed
- Version shows "v0.2.0 - Phase 3: StarCraft Royale"

**Code Inspection Notes:**
- ✅ SplashScreen component exists at `app/src/components/SplashScreen.tsx`
- ✅ Version string hardcoded: "v0.2.0 - Phase 3: StarCraft Royale"
- ✅ Uses proper UI classes: `ui-cta` for start button
- ✅ No obvious syntax errors

**Human QA Priority:** MEDIUM - One-time check

---

### T2: Game Initializes Correctly

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Click "Start Battle"
2. Observe HUD elements

**Expected Results:**
- Energy bar shows 10/10 energy (from config.csv)
- Player Command Center health: 500/500
- CPU Command Center health: 500/500
- 4 cards visible in hand at bottom
- All cards show proper names, costs, descriptions

**Code Inspection Notes:**
- ✅ `config.csv` sets `max_energy=10`, `energy_regen_rate=0.5`
- ✅ `buildings.csv` shows Command Center has 500 HP
- ✅ `SplashScreen.tsx` creates both player and CPU Command Centers on game start
- ✅ Initial deck draw logic in `initializeDeck()` draws 4 cards
- ⚠️ NOTE: `tower_health` in config.csv is 1000, but Command Center building health is 500 - potential inconsistency

**Potential Issues:**
- Tower health config (1000) doesn't match Command Center health (500) - which one is used?

**Human QA Priority:** HIGH - Core initialization

---

### T3: Energy Regeneration

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Start game
2. Wait 4 seconds (should regen 2 energy: 0.5/sec × 4 = 2)
3. Observe energy bar

**Expected Results:**
- Energy increases over time
- Reaches 10 and stops (max cap)
- HUD updates smoothly

**Code Inspection Notes:**
- ✅ `useEnergyTimer.ts` hook exists and should handle regeneration
- ✅ Config shows `energy_regen_rate=0.5` (base) + `energy_per_worker=0.2` (per worker)
- ✅ Energy capped at `max_energy=10` in `addEnergy()` method

**Human QA Priority:** HIGH - Core mechanic

---

### T4: Play SCV Card (Worker)

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Start game
2. Click SCV card (costs 2 energy)
3. Observe hand and energy

**Expected Results:**
- Energy decreases from 10 to 8
- SCV card removed from hand
- New card drawn immediately to replace it
- Worker count should increment (not visible yet, but internal state)
- No visible unit spawns (SCVs are abstract)

**Code Inspection Notes:**
- ✅ SCV card in `cards.csv`: `id=worker, cost=2, effect_type=add_worker`
- ✅ `playCard()` method handles `effect_type === "add_worker"` by incrementing `playerWorkerCount`
- ✅ Card draw logic executes immediately after playing (lines 82-103 in GameStateProvider.tsx)
- ✅ Worker max is 5 (`max_workers=5` in config.csv)
- ✅ Deck reshuffles when empty (discard → deck)

**Human QA Priority:** HIGH - Tests deck cycling + worker system

---

### T5: Build Barracks

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Play 1 SCV card first (need worker to build)
2. Wait for energy to regen back to 5+
3. Click Barracks card
4. Placement mode activates (green ghost building follows cursor)
5. Click on player's side (Z > 1) to place
6. Observe building placement

**Expected Results:**
- Placement ghost appears (green or red based on valid location)
- Instructions show: "Click to place • Right-click or ESC to cancel"
- Can place building on player's side
- Building appears on map after placement
- Energy deducted (5 cost)

**Code Inspection Notes:**
- ✅ Barracks card in `cards.csv`: `id=barracks, cost=5, effect_type=spawn_building`
- ✅ Building stats in `buildings.csv`: 300 HP, dimensions 1.5×1.125×1.5
- ❌ **CRITICAL ISSUE FOUND:** Cards.csv shows `building_id` column is EMPTY for Barracks card
- ✅ `BuildingPlacementController.tsx` and `GhostBuilding.tsx` exist for placement UI
- ✅ `useBuildingPlacement.ts` hook manages placement state

**Potential Issues:**
- Building placement logic may fail because `card.building_id` is undefined
- Code in `playCard()` line 126: looks up building by `card.id` (not `card.building_id`) - this might work but is inconsistent with data model

**Human QA Priority:** CRITICAL - Tests building placement system

---

### T6: Marine Card Unlocks

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Build Barracks (follow T5)
2. Wait for Barracks placement
3. Check hand

**Expected Results:**
- Marine card appears in hand (tech tree unlocked)
- Marine card shows: 1 energy cost, "Basic infantry unit" description

**Code Inspection Notes:**
- ✅ Marine card in `cards.csv`: `id=marine, cost=1, effect_type=spawn_unit, unit_id=marine_unit`
- ✅ Tech tree CSV shows: Marine requires Barracks
- ✅ `useTechTree.ts` filters available cards by buildings owned
- ✅ `useTechTreeUnlocking.ts` should add cards to deck when buildings are placed
- ⚠️ Unclear if cards are automatically drawn or just added to deck - need to verify draw logic

**Human QA Priority:** HIGH - Tests tech tree unlocking

---

### T7: Spawn Marine

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Unlock Marines (build Barracks)
2. Click Marine card
3. Observe unit spawn

**Expected Results:**
- Marine spawns on player's side (Z ≈ 4.5)
- Red box appears on map (marine_unit color = #ff6b6b)
- Health bar above Marine
- Energy decreases by 1

**Code Inspection Notes:**
- ✅ Marine unit in `units.csv`: 45 HP, speed 2.5, damage 6, range 4.0, box shape, red color
- ✅ `playCard()` method handles `effect_type === "spawn_unit"` (lines 112-124)
- ✅ Creates Unit object with stats from CSV
- ✅ `Unit.tsx` component renders units with health bars
- ⚠️ Spawn position hardcoded in playCard call - need to verify where this comes from

**Human QA Priority:** HIGH - Tests unit spawning

---

### T8: Unit Movement (Pathfinding)

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Spawn Marine
2. Watch Marine behavior

**Expected Results:**
- Marine walks forward toward enemy side
- Uses bridge to cross river (doesn't walk through water)
- Follows waypoints: spawn → bridge approach → bridge → exit → enemy base
- Movement is smooth, not jittery

**Code Inspection Notes:**
- ✅ `useUnitMovement.ts` hook exists for pathfinding
- ✅ `Arena.tsx` should define river and bridge geometry
- ✅ Unit stats show speed = 2.5 units/sec
- ⚠️ Cannot verify waypoint logic without visual inspection
- ⚠️ Cannot verify bridge collision without testing

**Human QA Priority:** HIGH - Core gameplay mechanic

---

### T9: Unit Combat

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Spawn player Marine
2. Use dev tools or CPU AI to spawn enemy Marine
3. Wait for units to meet

**Expected Results:**
- Units stop moving when in attack range (4.0 units)
- Units attack each other (health bars decrease)
- Dead unit disappears when health ≤ 0
- Winning unit resumes movement toward base

**Code Inspection Notes:**
- ✅ `useUnitCombat.ts` hook exists for combat logic
- ✅ Marine stats: damage = 6, attack_range = 4.0, health = 45
- ✅ `damageUnit()` and `removeUnit()` methods exist
- ⚠️ Attack rate not defined in CSV - unclear how often units attack
- ⚠️ Cannot verify combat visuals without browser

**Human QA Priority:** HIGH - Core gameplay mechanic

---

### T10: Building Health and Damage

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Spawn Marine on player's side
2. Let Marine reach enemy Command Center
3. Observe combat

**Expected Results:**
- Marine attacks Command Center
- Command Center health decreases
- HUD shows updated health
- If Command Center reaches 0 HP → Game Over

**Code Inspection Notes:**
- ✅ Command Center health: 500 HP (from buildings.csv)
- ✅ Marine damage: 6 per attack
- ✅ `damageBuilding()` method exists and checks for Command Center destruction
- ✅ Game over logic: Sets `phase = "gameover"` when CC destroyed
- ⚠️ Unclear if units can attack buildings - combat hook may only handle unit-vs-unit

**Potential Issues:**
- Need to verify units can target buildings (not just other units)

**Human QA Priority:** CRITICAL - Win condition

---

### T11: Game Over Condition

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Spawn many Marines
2. Let them destroy enemy Command Center

**Expected Results:**
- When enemy CC health = 0 → phase changes to "gameover"
- Game over screen shows: "You Won!" or "CPU Won!"
- Game stops (no more energy regen, units frozen)

**Code Inspection Notes:**
- ✅ Game over logic in `damageBuilding()` when CC health ≤ 0
- ✅ Phase changes to "gameover"
- ⚠️ No game over screen component found in codebase
- ⚠️ Energy timer and combat hooks may not check phase before executing

**Potential Issues:**
- Game over screen may not exist yet
- Systems may continue running after game over

**Human QA Priority:** HIGH - Win/loss experience

---

### T12: Hand Size and Deck Cycling

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Play 4 cards rapidly
2. Observe hand

**Expected Results:**
- Hand always shows 4 cards (draws automatically)
- When deck runs out → shuffle discard back into deck
- Cards cycle through deck/discard correctly

**Code Inspection Notes:**
- ✅ `hand_size=4` in config.csv
- ✅ Draw logic in `playCard()` (lines 82-103) draws immediately after playing
- ✅ Deck reshuffle logic: When deck empty, shuffle discard back
- ✅ Initial deck has 4 copies of each card (line 215 in GameStateProvider.tsx)
- ✅ Tech tree unlocks add 4 more copies (lines 320-324)

**Human QA Priority:** MEDIUM - Verify no edge cases in cycling

---

### T13: CPU AI Functions

**Status:** ⚠️ CANNOT VERIFY (needs browser)

**What to test:**
1. Start game
2. Wait and observe CPU behavior

**Expected Results:**
- CPU plays cards automatically (every 3 seconds)
- CPU spawns units
- CPU places buildings
- CPU energy decreases when playing cards
- CPU follows same rules as player

**Code Inspection Notes:**
- ✅ `useCPUAI.ts` hook exists
- ⚠️ Cannot verify AI behavior without running game
- ⚠️ Cannot verify timing or decision-making logic

**Human QA Priority:** MEDIUM - Can test manually once T1-T10 work

---

## Code-Level Issues Found

### Critical Issues

1. **Building ID Inconsistency (T5)**
   - `cards.csv` has empty `building_id` column for Barracks card
   - Code uses `card.id` instead of `card.building_id` to look up building stats
   - **Risk:** Building placement may fail or use wrong building
   - **Location:** `GameStateProvider.tsx` line 126

2. **Tower vs Command Center Health Mismatch (T2)**
   - `config.csv` sets `tower_health=1000`
   - `buildings.csv` sets Command Center `health=500`
   - **Risk:** Unclear which value is actually used for win condition
   - **Location:** Config parsing vs building stats

3. **Missing Game Over Screen (T11)**
   - No component found for game over state
   - Phase changes to "gameover" but no UI handles it
   - **Risk:** Game ends but player sees nothing
   - **Location:** Missing component

### Medium Issues

4. **Attack Rate Undefined**
   - Units have damage and range but no attack speed
   - **Risk:** Combat may be too fast or too slow
   - **Location:** `units.csv` missing column

5. **Unit-Building Combat Unclear**
   - Combat hook may only handle unit-vs-unit
   - **Risk:** Marines may not be able to attack Command Center
   - **Location:** `useUnitCombat.ts` - needs inspection

### Low Issues

6. **No Production Queue Implementation**
   - Queue methods defined in interface but not implemented
   - **Expected:** This is Phase 3 work, intentionally incomplete
   - **Location:** `GameStateProvider.tsx` missing methods

---

## Recommendations for Human QA

### Priority Order

**MUST TEST FIRST (Blocking issues):**
1. **T2** - Game initializes - verify which tower health is used
2. **T5** - Building placement works despite data inconsistency
3. **T10** - Units can attack buildings (Command Center)
4. **T11** - Game over triggers and shows something

**TEST SECOND (Core mechanics):**
5. **T3** - Energy regeneration works smoothly
6. **T4** - SCV/worker system functions
7. **T6** - Tech tree unlocking works
8. **T7** - Marine spawning works
9. **T8** - Unit pathfinding and movement

**TEST THIRD (Polish and edge cases):**
10. **T9** - Unit combat is balanced and functional
11. **T12** - Deck cycling handles edge cases
12. **T13** - CPU AI is challenging but fair

**SKIP FOR NOW:**
13. **T1** - Splash screen (low risk, easy to verify later)

### Testing Environment

Run the following before testing:
```bash
cd "C:/Users/LeonardPerez/Documents/Lotus Design/AI Workshop/tower-defense-game"
npm run dev
```

Open browser to: http://localhost:5173

Use browser DevTools Console to check for:
- Runtime errors
- Warning messages
- Failed data loads

### What to Document

For each test, record:
- ✅ PASS / ❌ FAIL / ⚠️ PARTIAL
- What you observed (screenshot if possible)
- Any console errors
- Differences from expected behavior
- Performance notes (FPS drops, lag, delays)

### Known Limitations

These are EXPECTED and do not need bug reports:
- No production queue system (Phase 3 incomplete)
- No queue UI (Phase 4 not started)
- Old deck/discard system still in use (Phase 5 not started)
- CPU AI may not use queue system (Phase 6 not started)

---

## Next Steps

1. **Human QA:** Complete manual testing using priority order above
2. **Fix Critical Issues:** Address building ID mismatch, tower health inconsistency, game over screen
3. **Verify Baseline:** Ensure all T1-T13 tests pass before starting production queue refactor
4. **Document Results:** Update this file with human QA findings
5. **Proceed to Phase 4:** Only start refactor after baseline is confirmed working

---

## Test Environment Details

- **Test Date:** 2026-04-30
- **Node Version:** (check with `node --version`)
- **npm Version:** (check with `npm --version`)
- **Browser:** (TBD - recommend Chrome/Edge for DevTools)
- **OS:** Windows 11 Pro 10.0.26200
- **Project Path:** `C:/Users/LeonardPerez/Documents/Lotus Design/AI Workshop/tower-defense-game`

---

## Appendix: File Inventory

### Data Files (CSV)
- ✅ `data/config.csv` - 9 settings
- ✅ `data/cards.csv` - 3 cards (worker, barracks, marine)
- ✅ `data/units.csv` - 2 units (worker_unit, marine_unit)
- ✅ `data/buildings.csv` - 2 buildings (command_center, barracks)
- ✅ `data/tech_tree.csv` - Tech requirements

### Key Source Files
- ✅ `app/src/engine/GameState.ts` - State interface
- ✅ `app/src/engine/GameStateProvider.tsx` - State management
- ✅ `app/src/components/SplashScreen.tsx` - Main menu
- ✅ `app/src/components/HUD.tsx` - Energy/health display
- ✅ `app/src/components/CardHand.tsx` - Card UI
- ✅ `app/src/game/Arena.tsx` - 3D scene
- ✅ `app/src/game/Unit.tsx` - Unit renderer
- ✅ `app/src/game/Building.tsx` - Building renderer
- ✅ `app/src/hooks/useEnergyTimer.ts` - Energy regen
- ✅ `app/src/hooks/useUnitMovement.ts` - Pathfinding
- ✅ `app/src/hooks/useUnitCombat.ts` - Combat
- ✅ `app/src/hooks/useTechTree.ts` - Tech unlocking
- ✅ `app/src/hooks/useCPUAI.ts` - AI opponent

### Test Files
- ✅ `app/src/test/gameState.test.ts` - 10 passing unit tests
- ✅ `app/src/test/setup.ts` - Test configuration

---

## Changelog

- **2026-04-30:** Initial baseline test analysis completed
  - Ran unit tests: 10/10 passing
  - Completed code inspection for all T1-T13 tests
  - Identified 3 critical issues, 2 medium issues
  - Documented human QA priorities
