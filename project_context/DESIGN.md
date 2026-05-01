# Design

## North Star

Create a satisfying mobile tower defense battle game that's easy to learn but has strategic depth. Players should feel smart when they make a good play and understand why they won or lost.

## Design Principles

1. **Instant feedback**: Every action should have immediate visual/audio response
2. **Clear information**: Players always know energy cost, unit stats, tower health
3. **Data-driven balance**: All tuning happens in CSV files for rapid iteration
4. **Mobile-first**: Vertical format, large touch targets, runs at 60fps

## Core Loop

1. Energy regenerates automatically (1 per 2 seconds)
2. Player picks a card from hand (4 cards visible)
3. Card costs energy - some spawn units, others have direct effects
4. Units walk toward enemy tower and attack
5. First to destroy enemy tower (1000 HP) wins
6. Match lasts 3-5 minutes

## Card System

### Card States

Cards exist in one of five states:

| State | Location | Max Size | Description |
|-------|----------|----------|-------------|
| **Deck** | `playerDeck` array | Unlimited | Cards waiting to be drawn, face-down |
| **Hand** | `playerHand` array | 4 cards | Visible cards player can play |
| **Discard** | `playerDiscard` array | Unlimited | Used cards waiting to reshuffle into deck |
| **Playing** | Temporary | N/A | Card is executing effects (ephemeral state) |
| **Removed** | Gone | N/A | Permanently removed from game (workers) |

### Card Lifecycle

```
Game Start
  ↓
[Deck] ← Initialize with starting cards (5 workers)
  ↓
Draw 4 → [Hand]
  ↓
Player clicks card
  ↓
[Playing] ← Card leaves hand, energy spent
  ↓
Execute effects in order
  ↓
  ├─→ Has "remove" effect? → [Removed] (gone forever)
  └─→ No remove effect? → [Discard] (recyclable)
  ↓
Check hand < 4? → Try to draw
```

### Card Effects

Effects execute in **declaration order**. Each card defines 1-3 effects:

**Worker Cards (SCV/Probe/Drone):**
1. `queue_worker` - Add to production queue at base building
2. `remove_card` - Remove from game (prevents discard)

**Unit Cards (Marine/Zealot/Zergling):**
1. `queue_unit` - Add to production queue at production building
(No remove effect → goes to discard after playing)

**Building Cards (Barracks/Gateway/Photon Cannon):**
1. **Requires:** At least 1 worker exists (workers construct buildings)
2. `place_building` - Place building at location (enters construction)
(No remove effect → goes to discard after playing)

### Draw System

**When to check for draw:**
- After any card is played (effects resolved)
- After any unlock triggers (building completes → unlocks cards)

**Draw algorithm:**
```
if hand.length < 4:
  if deck.length > 0:
    draw 1 card from deck
  else if discard.length > 0:
    shuffle discard → deck
    draw 1 card from deck
  else:
    no cards available (stop)
```

**Key principle:** Draw happens AFTER action resolution, not during.

### Worker Limit Enforcement

Workers are self-limiting through card scarcity:
- Start with exactly 5 worker cards
- Each play removes 1 card permanently
- After 5 plays, no worker cards exist
- **No explicit counter needed** - physical card count enforces limit

### Tech Unlocks

When buildings complete construction:
1. Find cards unlocked by this building (from tech tree)
2. Add unlocked cards to **discard pile** (not deck)
3. Trigger draw check

**Tech tree structure:**
- **Base buildings unlock production buildings**: Command Center/Nexus → Barracks/Gateway/Photon Cannon
- **Production buildings unlock units**: Barracks → Marine, Gateway → Zealot/Dragoon
- **Workers are NOT in tech tree** - they're starting cards

**Why discard?** Newly unlocked cards shuffle into deck naturally when deck empties.

### Initialization Rules

**Starting state (Protoss example):**
- Deck: 5 Probe cards
- Hand: 4 Probes (drawn from deck)
- Discard: empty
- Workers: 0

**Faction-specific:**
- Terran: 5 SCV cards
- Protoss: 5 Probe cards  
- Zerg: 5 Drone cards

All use identical lifecycle, just different card IDs.

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-30 | Energy regen: 1 per 2 seconds | Balanced pacing like Clash Royale |
| 2026-04-30 | Hand size: 4 cards | Fits mobile screen, matches CR |
| 2026-04-30 | Max 8 units per team | Performance budget for 60fps |
| 2026-04-30 | Win: Destroy tower (1000 HP) | Clear objective, strategic target |
| 2026-04-30 | Procedural 3D shapes | Fast prototyping, no art assets needed |
| 2026-05-01 | Worker cards self-limit via scarcity | Simpler than counter, physically enforced |
| 2026-05-01 | Unlocked cards → discard pile | Natural shuffle timing, cleaner flow |
