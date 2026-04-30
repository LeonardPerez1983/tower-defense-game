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

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-30 | Energy regen: 1 per 2 seconds | Balanced pacing like Clash Royale |
| 2026-04-30 | Hand size: 4 cards | Fits mobile screen, matches CR |
| 2026-04-30 | Max 8 units per team | Performance budget for 60fps |
| 2026-04-30 | Win: Destroy tower (1000 HP) | Clear objective, strategic target |
| 2026-04-30 | Procedural 3D shapes | Fast prototyping, no art assets needed |
