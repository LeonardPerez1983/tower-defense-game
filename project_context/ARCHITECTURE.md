# Architecture Map

## Key files

- `app/index.html`: Vite entry HTML.
- `app/src/main.tsx`: React entry point.
- `app/src/App.tsx`: Main app shell - combines 3D canvas + 2D UI overlay.
- `app/src/GameContainer.tsx`: Data loading, context provider, game lifecycle.
- `app/src/styles.css`: Tailwind base, theme variables, app-shell sizing.
- `app/src/data/loadData.ts`: CSV loading + validation.
- `data/config.csv`: Global tunables (energy rate, max workers, etc.).

## 3D Game Layer (React Three Fiber)

- `app/src/game/Arena.tsx`: 3D scene setup (lighting, camera, ground, river, bridges).
- `app/src/game/Unit.tsx`: Individual unit (mesh, health bar).
- `app/src/game/Building.tsx`: Building mesh renderer (Command Center, Barracks).
- `app/src/game/GhostBuilding.tsx`: Semi-transparent building preview during placement.
- `app/src/game/BuildingPlacementController.tsx`: Raycasting and placement interaction.

## 2D UI Layer (React DOM + Tailwind)

- `app/src/components/HUD.tsx`: Energy bar, Command Center health.
- `app/src/components/CardHand.tsx`: Card tray with placement mode support.
- `app/src/components/SplashScreen.tsx`: Main menu, initializes Command Centers.

## Game State (React Context)

- `app/src/engine/GameState.ts`: Central state interface and context.
- `app/src/engine/GameStateProvider.tsx`: State provider with actions (play card, damage, movement, deck cycling).

## Game Systems (React Hooks)

- `app/src/hooks/useEnergyTimer.ts`: Auto-regeneration (base + workers).
- `app/src/hooks/useUnitMovement.ts`: Waypoint pathfinding through bridges.
- `app/src/hooks/useUnitCombat.ts`: Attack nearest enemy, damage calculation.
- `app/src/hooks/useBuildingPlacement.ts`: Placement state and validation.
- `app/src/hooks/useTechTree.ts`: Filter available cards by buildings owned.
- `app/src/hooks/useTechTreeUnlocking.ts`: Auto-add cards when buildings placed.
- `app/src/hooks/useCPUAI.ts`: Opponent decision-making.

## Data flow

- CSVs in `data/` are loaded at runtime via `loadData.ts` (Vite `publicDir` points to `../data`). See DATA.md for CSV schemas.
- Game state lives in React state (context/reducer pattern when complexity warrants it).
- 3D canvas renders at 60fps using `useFrame` hook.
- 2D UI overlays 3D using CSS absolute positioning.

## Where to change things

- React UI: `app/src/components/*`
- 3D scene: `app/src/game/*`
- Game state: `app/src/engine/GameState.ts` and `app/src/engine/GameStateProvider.tsx`
- Game systems: `app/src/hooks/*`
- Data loading + validation: `app/src/data/loadData.ts`
- Tuning values: `data/config.csv`, `data/cards.csv`, `data/units.csv`, `data/buildings.csv`, `data/tech_tree.csv` (document in DATA.md)
