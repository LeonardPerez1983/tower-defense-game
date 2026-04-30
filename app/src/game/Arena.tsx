/**
 * Arena - 3D Battlefield Scene
 *
 * Sets up the 3D environment: lighting, camera, ground plane, and demo shapes.
 * Camera positioned for top-down Clash Royale-style view.
 */

import { Box, Sphere, Cylinder } from './ProceduralShapes';

export default function Arena() {
  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />

      {/* Ground plane - battlefield */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 30]} />
        <meshStandardMaterial color="#e8dcc4" />
      </mesh>

      {/* Demo shapes - Phase 1 visualization */}
      {/* Player side (positive Z) */}
      <Box color="#ff6b6b" position={[0, 0.5, 8]} />

      {/* Center */}
      <Sphere color="#4ecdc4" position={[0, 0.5, 0]} />

      {/* CPU side (negative Z) */}
      <Cylinder color="#95e1d3" position={[0, 0.75, -8]} />

      {/* Lane markers (left and right) */}
      <Box color="#c4c4c4" position={[-3, 0.2, 0]} />
      <Box color="#c4c4c4" position={[3, 0.2, 0]} />
    </>
  );
}
