/**
 * Arena - 3D Battlefield Scene
 *
 * Sets up the 3D environment: lighting, camera, ground plane, and demo shapes.
 * Camera positioned for top-down Clash Royale-style view.
 */

export default function Arena() {
  return (
    <>
      {/* Sky/Background color */}
      <color attach="background" args={["#87ceeb"]} />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      {/* Ground plane - battlefield */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 30]} />
        <meshStandardMaterial color="#90c690" />
      </mesh>

      {/* Demo shapes - simple primitives to verify rendering */}
      {/* Player side (positive Z) - Red Box */}
      <mesh position={[0, 0.5, 8]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>

      {/* Center - Cyan Sphere */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>

      {/* CPU side (negative Z) - Green Cylinder */}
      <mesh position={[0, 0.75, -8]}>
        <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
        <meshStandardMaterial color="#95e1d3" />
      </mesh>

      {/* Lane markers */}
      <mesh position={[-3, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>
      <mesh position={[3, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="#ffaa00" />
      </mesh>
    </>
  );
}
