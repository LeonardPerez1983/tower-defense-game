# React Three Fiber StarCraft-Inspired Visual Prototype Plan

Purpose: create a fast private prototype visual layer for a Vite + React + TypeScript game using `@react-three/fiber` for the 3D layer and React DOM + Tailwind for the 2D UI.

This version reflects the current prototype direction:
- Clash-Royale-like lane gameplay
- StarCraft-inspired factions and visuals
- Space-platform battlefield in outer space
- Minimal HUD
- In-world HP bars
- Worker pips/stars near the command structure
- Simple SVG card icons
- Faction flavor through lightweight effects
- **Zerg creep as a simple ground effect generated in code**

## Core Constraints

- No Unity
- No Blender
- No imported 3D models
- No GLTF
- No external art assets
- Use React Three Fiber primitive meshes
- Use simple materials, simple shaders, and generated textures only if needed
- Use React DOM + Tailwind for HUD
- Prioritize a practical prototype over perfect fidelity

---

# Current Visual Priorities

## 1. Battlefield
- Replace grass/ground with a metal space platform
- Replace river/water with a space gap / void
- Use a dark outer-space background with subtle static stars
- Keep the center readable for lane combat

## 2. HUD
- Keep the HUD minimal
- No large top player/enemy command panels
- Use a small timer only
- Show HP mostly through in-world health bars
- Show worker count as tiny pips/stars near the command structure
- Keep the bottom command tray as the main persistent UI

## 3. Faction Flavor
- Zerg: creep and organic pulsing
- Protoss: shield shimmer
- Terran: industrial lights / exhaust accents

---

# Recommended Zerg Creep Approach

If you want Claude to build this quickly and reliably, the best approach is:

## Recommended default
Use a **flat ground overlay** made of one or more transparent planes slightly above the ground, with:
- dark purple / brown base color
- soft green-purple emissive accents
- irregular organic alpha/edge
- slow pulse animation
- optional subtle edge wobble

This gives you something that reads as creep without requiring advanced rendering.

## Avoid for the first pass
Do **not** start with:
- heavy postprocessing
- complex fluid simulation
- large custom shader systems
- geometry that physically distorts the floor

Those are overkill for your current prototype.

---

# Three Practical Implementation Levels

## Level 1 - Easiest: Layered Blob Planes

Use 2-4 overlapping circular or elliptical planes under a Zerg building.

### Pros
- Extremely easy for Claude to implement
- No shader required
- Easy to tune

### Cons
- More stylized / less organic
- Shape may look a bit too clean unless varied

### Visual recipe
- plane A: dark purple translucent blob
- plane B: slightly smaller greenish emissive inner blob
- plane C: optional soft ring or edge highlight
- animate opacity/emissiveIntensity very slightly over time

This is the safest first implementation.

## Level 2 - Best Balance: Generated Organic Alpha Texture on a Plane

Use one plane with a generated organic alpha texture from code.

### Pros
- Still practical
- Looks much more like creep
- No external asset needed if generated with canvas/noise in code

### Cons
- Slightly more setup than Level 1

### Visual recipe
- generate a small canvas texture in code
- draw an irregular blob shape / noisy mask
- use it as `alphaMap` on a plane
- use a purple-brown `meshStandardMaterial` or `meshBasicMaterial`
- add slight emissive tint and slow pulse

This is my recommended production prototype option.

## Level 3 - Simple Shader Edge Animation

Use a plane with a short custom shader or shaderMaterial that adds subtle animated edge/noise.

### Pros
- Most convincing of the lightweight options
- Easy to get a living-organic edge feel

### Cons
- Slightly harder to maintain
- More likely Claude will overcomplicate it if not constrained

### Use this only after Level 1 or 2 works.

---

# Best Simple Design Rules for Creep

1. Creep should sit **slightly above** the ground to avoid z-fighting.
2. Creep should be **wider than the building footprint**.
3. Creep edges should be irregular, not perfectly circular.
4. Creep should be visually subtle enough that units remain readable.
5. Creep should pulse slowly, not constantly flicker.
6. Buildings that should spawn creep:
   - Hatchery
   - Spawning Pool
   - Creep Colony
   - Sunken Colony
7. Optional: creep can be stronger around the base and softer at the outer edge.

---

# Clean Request List for Claude

## Request 1: Create the creep component only

Use this first if you want a focused result.

```md
Create a simple Zerg creep ground effect for my Vite + React + TypeScript prototype using React Three Fiber.

Create this file:
src/game/visuals/StarcraftFactionFX.tsx

Goal:
Create a practical `ZergCreepField` component that makes Zerg buildings feel like they are spreading creep over the battlefield.

Constraints:
- No external textures or image assets.
- No heavy postprocessing.
- Keep it lightweight and easy to tune.
- Ground plane is XZ, Y is height.
- The creep should render slightly above the ground.
- It should work as a simple visual effect only.
- Prioritize readability from a top-down/isometric camera.

Create:
- `ZergCreepField`
- optional small helpers if needed

Props:
type ZergCreepFieldProps = {
  position?: [number, number, number]
  radius?: number
  opacity?: number
  pulseSpeed?: number
  variant?: "small" | "medium" | "large"
}

Implementation target:
- Use either:
  1. several overlapping transparent planes/circles for an organic blob, or
  2. one plane with a generated alpha texture from code.
- Use dark purple / brown as the main color.
- Add a subtle green-purple emissive or glow feel.
- Add a very slow pulse animation.
- The edge should feel organic, not perfectly geometric.
- Avoid complex shaders unless they stay short and practical.

Also export helper presets for:
- hatchery creep size
- spawning pool creep size
- colony creep size
```

## Request 2: Integrate creep into building rendering

```md
Update my React Three Fiber entity rendering so Zerg buildings automatically show creep under them.

Existing files:
- src/game/visuals/StarcraftFactionFX.tsx
- src/game/visuals/starcraftVisualConfig.ts
- src/game/visuals/GameEntityRenderer.tsx

Goal:
Render `ZergCreepField` under Zerg buildings that should spawn creep.

Requirements:
- Use a `shouldSpawnCreep` boolean in building visual config.
- Render creep under:
  - Hatchery
  - Spawning Pool
  - Creep Colony
  - Sunken Colony
- Size the creep using either building radius or a creepRadius field.
- Render the creep slightly above the floor and below the building.
- Keep the integration data-driven.
- Do not spawn creep under Terran or Protoss buildings.
```

## Request 3: Add a slightly better edge pulse later

```md
Refine my Zerg creep ground effect so the outer edge feels more alive.

Keep the existing component API and implementation style.

Goals:
- Keep it lightweight.
- Add a subtle animated edge wobble or noise pulse.
- Do not make it distracting.
- Preserve readability of units and buildings.
- Do not introduce heavy shader complexity.
```

---

# Clean Implementation List

## Step 1
Create `ZergCreepField` by itself.

## Step 2
Test it on an empty scene under one Hatchery.

## Step 3
Add `shouldSpawnCreep` and optionally `creepRadius` to building config.

Suggested config shape:

```ts
BUILDING_VISUALS: Record<BuildingId, {
  model: ModelName
  faction: Faction
  defaultScale: number
  radius: number
  height: number
  canAttack: boolean
  shouldSpawnCreep?: boolean
  creepRadius?: number
}>
```

## Step 4
Render the creep in `GameBuildingModel` before rendering the building mesh.

Pseudo structure:

```tsx
<group position={[x, 0, z]}>
  {visual.shouldSpawnCreep && (
    <ZergCreepField
      position={[0, 0.02, 0]}
      radius={visual.creepRadius ?? visual.radius * 1.8}
      variant={visual.radius > 1.5 ? "large" : "medium"}
    />
  )}

  <StarcraftModel ... />
</group>
```

## Step 5
Tune by building type.

Suggested starting values:
- Hatchery: `radius * 2.2`
- Spawning Pool: `radius * 1.6`
- Creep Colony: `radius * 1.4`
- Sunken Colony: `radius * 1.5`

## Step 6
Only after it works, optionally add:
- stronger edge irregularity
- more organic alpha
- slow emissive pulse
- spread based on morph/upgrade state

---

# What I Would Ask Claude to Build First

If you want the shortest path, ask for this exact order:

1. `StarcraftFactionFX.tsx` with `ZergCreepField`
2. update `starcraftVisualConfig.ts` with `shouldSpawnCreep` and `creepRadius`
3. update `GameEntityRenderer.tsx` to place creep under Zerg buildings
4. optional refinement pass for edge animation

That is enough for a convincing first creep pass.

---

# Final Recommendation

For your prototype, I would choose:

## Best first implementation
**Level 2: one plane with generated alpha texture**, plus:
- slight emissive pulse
- dark purple organic shape
- subtle green-purple inner glow

## If Claude struggles
Fallback to:
**Level 1: overlapping semi-transparent blob planes**

That fallback is still totally acceptable for a prototype.
