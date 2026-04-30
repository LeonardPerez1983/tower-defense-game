# 3D Standards

Standards for 3D rendering using React Three Fiber and Three.js.

## Procedural Shape Library

Available primitive shapes (via `@react-three/drei` or Three.js):

| Shape | Use Case | Polygon Count |
|-------|----------|---------------|
| `<Box>` or `boxGeometry` | Warriors, buildings, blocky units | 12 triangles |
| `<Sphere>` or `sphereGeometry` | Tanks, orbs, rounded units | 32 segments (low-poly) |
| `<Cylinder>` or `cylinderGeometry` | Archers, towers, pillars | 16 segments |
| `<Cone>` or `coneGeometry` | Projectiles, markers | 16 segments |

**Performance rule:** Keep total triangles under 5000 on screen at once for 60fps on mobile.

## Camera Setup

Default camera configuration:

```typescript
<Canvas camera={{ position: [0, 10, 15], fov: 50 }}>
```

- **Position**: `[0, 10, 15]` gives top-down Clash Royale-style view
- **FOV**: 50 (field of view) - balances perspective without distortion
- **Near/Far planes**: Default (0.1 / 1000) works for this scale

## Lighting

Standard scene lighting:

```typescript
<ambientLight intensity={0.5} />
<directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
```

- **Ambient**: 0.5 intensity, white (#ffffff) - prevents pure black shadows
- **Directional**: 0.8 intensity, positioned at `[10, 10, 5]` - main light source
- **Shadows**: Enable on directional light for depth (performance cost: ~10% FPS)

## Materials

Standard materials for units:

- **Default**: `<meshStandardMaterial color={csvColor} />` - PBR material, works with lighting
- **Flat shading**: Add `flatShading` prop for low-poly aesthetic
- **Metalness/Roughness**: 0.2 / 0.8 for most units (slight sheen, mostly matte)

Avoid `meshBasicMaterial` (ignores lighting) unless intentionally making UI elements.

## Coordinate System

- **X-axis**: Left (-) to right (+)
- **Y-axis**: Down (-) to up (+) - units at y=0, towers at y=0
- **Z-axis**: Player side (positive) to CPU side (negative)

Battlefield layout:

```
CPU Tower: z = -10
CPU spawn zone: z = -8 to -5
Midfield: z = 0
Player spawn zone: z = 5 to 8
Player Tower: z = 10
```

## Performance Budget

Target: 60fps on iPhone SE (2020)

- **Max units**: 8 per team = 16 total
- **Triangles per unit**: ~32 average
- **Total triangles**: ~500 (well under 5000 budget)
- **Draw calls**: Use instancing for repeated shapes (10 warriors = 1 draw call)

## Testing Checklist

Before committing 3D changes:

- [ ] Runs at 55-60fps on test device
- [ ] Shapes visible from default camera angle
- [ ] Lighting looks consistent (no pure black or blown-out white)
- [ ] Units scale appropriately (not too tiny or huge)
