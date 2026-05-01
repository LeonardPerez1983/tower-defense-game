# QA Test Plan - Production Queue System Implementation

## Purpose

This test plan ensures the game remains playable and regression-free during the production queue system refactor.

**Test after each implementation phase** to catch issues early.

---

## Baseline Tests (Current System - Phase 3)

These tests verify the game worked **before** starting the queue system refactor.

### T1: Game Launches

**Steps:**
1. Run `npm run dev`
2. Open http://localhost:5173
3. Verify splash screen shows with "Start Battle" button

**Expected:**
- Splash screen visible
- No console errors
- "Battle Arena" title displayed
- Version shows "v0.2.0 - Phase 3: StarCraft Royale"

---

### T2: Game Initializes Correctly

**Steps:**
1. Click "Start Battle"
2. Observe HUD elements

**Expected:**
- Energy bar shows 10/10 energy
- Player Command Center health: 500/500
- CPU Command Center health: 500/500
- 4 cards visible in hand at bottom
- All cards show proper names, costs, descriptions

---

### T3: Energy Regeneration

**Steps:**
1. Start game
2. Wait 4 seconds (should regen 2 energy: 0.5/sec × 4 = 2)
3. Observe energy bar

**Expected:**
- Energy increases over time
- Reaches 10 and stops (max cap)
- HUD updates smoothly

---

### T4: Play SCV Card (Worker)

**Steps:**
1. Start game
2. Click SCV card (costs 2 energy)
3. Observe hand and energy

**Expected:**
- Energy decreases from 10 to 8
- SCV card removed from hand
- New card drawn immediately to replace it
- Worker count should increment (not visible yet, but internal state)
- No visible unit spawns (SCVs are abstract)

---

### T5: Build Barracks

**Steps:**
1. Play 1 SCV card first (need worker to build)
2. Wait for energy to regen back to 5+
3. Click Barracks card
4. Placement mode activates (green ghost building follows cursor)
5. Click on player's side (Z > 1) to place
6. Observe building placement

**Expected:**
- Placement ghost appears (green or red based on valid location)
- Instructions show: "Click to place • Right-click or ESC to cancel"
- Can place building on player's side
- Building appears on map after placement
- Energy deducted (5 cost)

---

### T6: Marine Card Unlocks

**Steps:**
1. Build Barracks (follow T5)
2. Wait for Barracks placement
3. Check hand

**Expected:**
- Marine card appears in hand (tech tree unlocked)
- Marine card shows: 1 energy cost, "Basic infantry unit" description

---

### T7: Spawn Marine

**Steps:**
1. Unlock Marines (build Barracks)
2. Click Marine card
3. Observe unit spawn

**Expected:**
- Marine spawns on player's side (Z ≈ 4.5)
- Red box appears on map (marine_unit color)
- Health bar above Marine
- Energy decreases by 1

---

### T8: Unit Movement (Pathfinding)

**Steps:**
1. Spawn Marine
2. Watch Marine behavior

**Expected:**
- Marine walks forward toward enemy side
- Uses bridge to cross river (doesn't walk through water)
- Follows waypoints: spawn → bridge approach → bridge → exit → enemy base
- Movement is smooth, not jittery

---

### T9: Unit Combat

**Steps:**
1. Spawn player Marine
2. Use dev tools or CPU AI to spawn enemy Marine
3. Wait for units to meet

**Expected:**
- Units stop moving when in attack range
- Units attack each other (health bars decrease)
- Dead unit disappears when health ≤ 0
- Winning unit resumes movement toward base

---

### T10: Building Health and Damage

**Steps:**
1. Spawn Marine on player's side
2. Let Marine reach enemy Command Center
3. Observe combat

**Expected:**
- Marine attacks Command Center
- Command Center health decreases
- HUD shows updated health
- If Command Center reaches 0 HP → Game Over

---

### T11: Game Over Condition

**Steps:**
1. Spawn many Marines
2. Let them destroy enemy Command Center

**Expected:**
- When enemy CC health = 0 → phase changes to "gameover"
- Game over screen shows: "You Won!" or "CPU Won!"
- Game stops (no more energy regen, units frozen)

---

### T12: Hand Size and Deck Cycling

**Steps:**
1. Play 4 cards rapidly
2. Observe hand

**Expected:**
- Hand always shows 4 cards (draws automatically)
- When deck runs out → shuffle discard back into deck
- Cards cycle through deck/discard correctly

---

### T13: CPU AI Functions

**Steps:**
1. Start game
2. Wait and observe CPU behavior

**Expected:**
- CPU plays cards automatically (every 3 seconds)
- CPU spawns units
- CPU places buildings
- CPU energy decreases when playing cards
- CPU follows same rules as player

---

## Unit Tests (Automated)

Run before each manual test session:

```bash
npm test
```

**Expected output:**
```
✓ GameState - Initial State (8 tests)
  ✓ should initialize with correct energy values
  ✓ should initialize with correct tower HP
  ✓ should initialize with zero workers
  ✓ should initialize empty production queues
  ✓ should initialize empty removed cards lists
  ✓ should initialize SCV build counts at zero
  ✓ should start in splash phase
  ✓ should initialize empty hands and decks

✓ GameState - Config Parsing (2 tests)
  ✓ should parse config values as numbers
  ✓ should handle missing config with defaults

Test Files  1 passed (1)
     Tests  10 passed (10)
```

---

## Regression Checklist

After implementing **each phase** of the production queue system:

### Phase 1: Data Model
- [ ] T1: Game launches
- [ ] T2: Game initializes
- [ ] Unit tests pass

### Phase 2: Dynamic Hand
- [ ] T1-T3: Basic game flow works
- [ ] T12: Hand updates dynamically based on buildings
- [ ] **NEW:** Hand shows 5 SCVs at start (not 4 random cards)
- [ ] Unit tests pass

### Phase 3: Production Queue
- [ ] T4: SCV queues production (doesn't spawn immediately)
- [ ] T7: Marine queues production
- [ ] **NEW:** Units spawn from buildings after timer
- [ ] **NEW:** Multiple queued items process in order
- [ ] Unit tests pass

### Phase 4: UI Updates
- [ ] T5: Building placement still works
- [ ] **NEW:** Production queue UI shows active builds
- [ ] **NEW:** Discard button works
- [ ] Unit tests pass

### Phase 5: Remove Old System
- [ ] All T1-T13 tests still pass
- [ ] No console errors
- [ ] Unit tests pass

### Phase 6: CPU AI
- [ ] T13: CPU uses queue system
- [ ] CPU builds workers, buildings, units
- [ ] Unit tests pass

---

## Performance Benchmarks

Test on target device (iPhone SE or mid-range Android):

- **Frame rate:** 55-60 FPS with 8 units on screen
- **Load time:** < 2 seconds on 4G
- **Memory:** < 200 MB RAM usage
- **No frame drops** when spawning units

Use browser DevTools → Performance tab to measure.

---

## Known Issues / Expected Failures

During implementation phases, some tests will intentionally fail:

**Phase 2 (Dynamic Hand):**
- T4-T7 will break temporarily (card playing changes)
- Expected: Need to update click handlers

**Phase 3 (Production Queue):**
- T4, T7 spawn immediately → should queue instead
- Expected: Units appear after build timer, not instantly

**Phase 5 (Remove Old System):**
- Old deck/discard logic removed
- Expected: Clean transition to new system

---

## Emergency Rollback Criteria

If **any** of these occur, STOP and fix before continuing:

1. Game doesn't launch (white screen, crash)
2. >3 unrelated tests fail simultaneously
3. Console shows runtime errors during normal play
4. Frame rate drops below 30 FPS
5. Can't complete a full match (start → game over)

Rollback to previous Git commit and investigate.

---

## Test Reporting

After each phase, document results:

```markdown
## Phase X Test Results - [Date]

**Unit Tests:** ✅ 10/10 passed
**Manual Tests:** ✅ 12/13 passed (T7 expected failure - in progress)

### Issues Found:
- None

### Next Steps:
- Continue to Phase X+1
```

Save in `project_context/TEST_RESULTS.md`
