# Architecture Map

## Key files

- `app/index.html`: Vite entry HTML.
- `app/src/main.tsx`: React entry point.
- `app/src/App.tsx`: Main app shell - combines 3D canvas + 2D UI overlay.
- `app/src/styles.css`: Tailwind base, theme variables, app-shell sizing.
- `app/src/data/loadData.ts`: CSV loading + validation.
- `data/config.csv`: Global tunables (energy rate, tower HP, etc.).

## 3D Game Layer (React Three Fiber)

- `app/src/game/Arena.tsx`: 3D scene setup (lighting, camera, ground).
- `app/src/game/Unit.tsx`: Individual unit (mesh, movement, health bar).
- `app/src/game/Tower.tsx`: Player/CPU towers with HP.
- `app/src/game/ProceduralShapes.tsx`: Reusable 3D shapes library.

## 2D UI Layer (React DOM + Tailwind)

- `app/src/components/HUD.tsx`: Energy bar, tower health, timer.
- `app/src/components/CardHand.tsx`: Card tray at screen bottom.
- `app/src/components/SplashScreen.tsx`: Main menu.
- `app/src/components/GameOverPanel.tsx`: Victory/defeat overlay.

## Game Logic (Pure TypeScript)

- `app/src/engine/GameState.ts`: Central state (units, energy, phase, tower HP).
- `app/src/engine/CardSystem.ts`: Card playing, cost validation.
- `app/src/engine/EnergySystem.ts`: Auto-regeneration logic.
- `app/src/engine/UnitAI.ts`: Movement, target selection.
- `app/src/engine/CombatSystem.ts`: Damage calculations, death.
- `app/src/engine/CPUAI.ts`: Opponent decision-making.

## Data flow

- CSVs in `data/` are loaded at runtime via `loadData.ts` (Vite `publicDir` points to `../data`). See DATA.md for CSV schemas.
- Game state lives in React state (context/reducer pattern when complexity warrants it).
- 3D canvas renders at 60fps using `useFrame` hook.
- 2D UI overlays 3D using CSS absolute positioning.

## Where to change things

- React UI: `app/src/components/*`
- 3D scene: `app/src/game/*`
- Game state + rules: `app/src/engine/*`
- Data loading + validation: `app/src/data/loadData.ts`
- Tuning values: `data/config.csv`, `data/cards.csv`, `data/units.csv` (document in DATA.md)
