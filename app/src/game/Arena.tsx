/**
 * Arena - 3D Battlefield Scene
 *
 * Clash Royale-inspired arena with boundaries, water, and chokepoint.
 * Camera positioned for steep top-down view matching reference.
 */

import { useGameState } from "../engine/GameState";
import Unit from "./Unit";

export default function Arena() {
  const { state } = useGameState();

  return (
    <>
      {/* Sky/Background color */}
      <color attach="background" args={["#87ceeb"]} />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={0.9} castShadow />

      {/* Water base (only in middle river area) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[14, 26]} />
        <meshStandardMaterial color="#4a9eff" />
      </mesh>

      {/* Main battlefield ground - Player side (extends to edge) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 8.5]}>
        <planeGeometry args={[10, 11]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Left bridge (at 1/3 horizontal position) - overlaps grass on both ends */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.01, 0]}>
        <planeGeometry args={[2.5, 10]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Right bridge (at 2/3 horizontal position) - overlaps grass on both ends */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.01, 0]}>
        <planeGeometry args={[2.5, 10]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Main battlefield ground - CPU side (extends to edge) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -8.5]}>
        <planeGeometry args={[10, 11]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Arena walls - Left side */}
      <mesh position={[-6, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 26]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Arena walls - Right side */}
      <mesh position={[6, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 26]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Center water river between bridges (narrower) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[1.5, 10]} />
        <meshStandardMaterial color="#2b7fd9" />
      </mesh>

      {/* Player Tower - Center back */}
      <mesh position={[0, 1.2, 11]}>
        <cylinderGeometry args={[0.9, 0.9, 2.5, 8]} />
        <meshStandardMaterial color={state.playerTowerHP > 0 ? "#4ade80" : "#6b7280"} />
      </mesh>
      {/* Player tower top */}
      <mesh position={[0, 2.7, 11]}>
        <coneGeometry args={[1.1, 1, 8]} />
        <meshStandardMaterial color={state.playerTowerHP > 0 ? "#22c55e" : "#4b5563"} />
      </mesh>

      {/* CPU Tower - Center back */}
      <mesh position={[0, 1.2, -11]}>
        <cylinderGeometry args={[0.9, 0.9, 2.5, 8]} />
        <meshStandardMaterial color={state.cpuTowerHP > 0 ? "#f87171" : "#6b7280"} />
      </mesh>
      {/* CPU tower top */}
      <mesh position={[0, 2.7, -11]}>
        <coneGeometry args={[1.1, 1, 8]} />
        <meshStandardMaterial color={state.cpuTowerHP > 0 ? "#ef4444" : "#4b5563"} />
      </mesh>

      {/* Render all units */}
      {state.units.map((unit) => (
        <Unit key={unit.id} unit={unit} />
      ))}
    </>
  );
}
