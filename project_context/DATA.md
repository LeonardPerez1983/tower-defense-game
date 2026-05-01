# Data Reference

All CSVs live in `data/` and are loaded at runtime. Values are read as strings and parsed to numbers where expected.

## data/config.csv

- Schema: `key,value`
- Meaning: global tunables.
- Example rows:
  - `app_name,Battle Arena`
  - `energy_regen_rate,0.5` (base energy per second)
  - `max_energy,10`
  - `hand_size,4`
  - `max_units_per_team,8`
  - `tower_health,1000`
  - `max_workers,5` (maximum workers per team)
  - `energy_per_worker,0.2` (additional energy/sec per worker)

## data/cards.csv

- Schema: `id,name,cost,effect_type,effect_value,unit_id,building_id,card_type,faction,description`
- Meaning: Card definitions available to players
- Columns:
  - `id`: Unique identifier (string)
  - `name`: Display name (string)
  - `cost`: Energy required to play (number)
  - `effect_type`: `spawn_unit` | `spawn_building` | `damage` | `heal` | `stun`
  - `effect_value`: Parameter for effect (damage amount, heal amount) - blank for spawn
  - `unit_id`: References units.csv id (for spawn_unit cards) - blank otherwise
  - `building_id`: References buildings.csv id (for spawn_building cards) - blank otherwise
  - `card_type`: `unit` | `building` | `spell`
  - `faction`: `terran` | `zerg` | `protoss` | `neutral`
  - `description`: Player-facing tooltip text

## data/units.csv

- Schema: `id,health,speed,damage,attack_range,shape,color,faction`
- Meaning: Unit stats and appearance
- Columns:
  - `id`: Unique identifier (string)
  - `health`: Starting HP (number)
  - `speed`: Movement units per second (number)
  - `damage`: Damage per attack (number)
  - `attack_range`: Distance to start attacking (number)
  - `shape`: `box` | `sphere` | `cylinder` | `cone`
  - `color`: Hex color code (e.g., `#ff6b6b`)
  - `faction`: `terran` | `zerg` | `protoss` | `neutral`

## data/buildings.csv

- Schema: `id,name,cost,health,shape,color,width,height,depth,description`
- Meaning: Building stats and appearance
- Columns:
  - `id`: Unique identifier (string)
  - `name`: Display name (string)
  - `cost`: Energy required to build (number)
  - `health`: Building HP (number)
  - `shape`: `box` | `sphere` | `cylinder` | `cone`
  - `color`: Hex color code (e.g., `#3b82f6`)
  - `width`: X-axis size (number)
  - `height`: Y-axis size (number)
  - `depth`: Z-axis size (number)
  - `description`: Player-facing tooltip text

## data/tech_tree.csv

- Schema: `card_id,required_building,faction`
- Meaning: Tech tree prerequisites for unlocking cards
- Columns:
  - `card_id`: References cards.csv id (string)
  - `required_building`: Building id that must be placed to unlock this card, or "none" if always available (string)
  - `faction`: `terran` | `zerg` | `protoss`

## Validation rules

- When adding a new CSV, document its schema and constraints in this file.
- Use fail-fast validation in `loadData.ts` — missing required columns should throw on load, not fail silently at runtime.
