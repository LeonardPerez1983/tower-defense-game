# Battle Arena

A 3D tower defense battle game for mobile web. Players battle a CPU opponent in real-time by playing cards that cost energy. Destroy the enemy tower to win.

## Core gameplay loop

- Start with 10 energy, regenerates at 1 per 2 seconds
- 4 cards in hand (some spawn units, others have direct effects)
- Units walk toward enemy tower and attack
- Each side has a tower with 1000 HP
- First to destroy enemy tower wins
- Matches last 3-5 minutes

## Run locally

```bash
npm install
npm run dev
```

Open the Vite dev server URL (defaults to `http://localhost:5173`).

## Testing

- Save/Load: (describe persistence approach when implemented)
- Resetting: clear site data or use an incognito window.
