# Data Reference

All CSVs live in `data/` and are loaded at runtime. Values are read as strings and parsed to numbers where expected.

## data/config.csv

- Schema: `key,value`
- Meaning: global tunables.
- Example rows:
  - `app_name,Battle Arena`
  - `energy_regen_rate,0.5` (energy per second)
  - `max_energy,10`
  - `hand_size,4`
  - `max_units_per_team,8`
  - `tower_health,1000`

## data/cards.csv (to be created)

- Schema: `id,name,cost,effect_type,effect_value,unit_id,description`
- Meaning: Card definitions available to players
- Columns:
  - `id`: Unique identifier (string)
  - `name`: Display name (string)
  - `cost`: Energy required to play (number)
  - `effect_type`: `spawn_unit` | `damage` | `heal` | `stun`
  - `effect_value`: Parameter for effect (damage amount, heal amount) - blank for spawn
  - `unit_id`: References units.csv id (for spawn_unit cards)
  - `description`: Player-facing tooltip text

## data/units.csv (to be created)

- Schema: `id,health,speed,damage,attack_range,shape,color`
- Meaning: Unit stats and appearance
- Columns:
  - `id`: Unique identifier (string)
  - `health`: Starting HP (number)
  - `speed`: Movement units per second (number)
  - `damage`: Damage per attack (number)
  - `attack_range`: Distance to start attacking (number)
  - `shape`: `box` | `sphere` | `cylinder` | `cone`
  - `color`: Hex color code (e.g., `#ff6b6b`)

## Validation rules

- When adding a new CSV, document its schema and constraints in this file.
- Use fail-fast validation in `loadData.ts` — missing required columns should throw on load, not fail silently at runtime.
