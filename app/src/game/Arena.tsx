/**
 * Arena - 3D Battlefield Scene
 *
 * Clash Royale layout: horizontal river across middle, two vertical bridges
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

      {/* Main grass - Player side (bottom) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 3.5]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Horizontal river across middle (left to right) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[10, 3]} />
        <meshStandardMaterial color="#4a9eff" />
      </mesh>

      {/* Main grass - CPU side (top) - SAME SIZE as player */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5.5]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Left bridge (vertical bridge crossing horizontal river) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.02, -0.5]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Right bridge (vertical bridge crossing horizontal river) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.02, -0.5]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Side walls - Left (tight to battlefield edge) */}
      <mesh position={[-5.25, 0.5, -1]}>
        <boxGeometry args={[0.5, 1, 17]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Side walls - Right (tight to battlefield edge) */}
      <mesh position={[5.25, 0.5, -1]}>
        <boxGeometry args={[0.5, 1, 17]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Player Tower - Center back */}
      <mesh position={[0, 1.2, 7.5]}>
        <cylinderGeometry args={[0.9, 0.9, 2.5, 8]} />
        <meshStandardMaterial color={state.playerTowerHP > 0 ? "#4ade80" : "#6b7280"} />
      </mesh>
      {/* Player tower top */}
      <mesh position={[0, 2.7, 7.5]}>
        <coneGeometry args={[1.1, 1, 8]} />
        <meshStandardMaterial color={state.playerTowerHP > 0 ? "#22c55e" : "#4b5563"} />
      </mesh>

      {/* CPU Tower - Center back */}
      <mesh position={[0, 1.2, -9.5]}>
        <cylinderGeometry args={[0.9, 0.9, 2.5, 8]} />
        <meshStandardMaterial color={state.cpuTowerHP > 0 ? "#f87171" : "#6b7280"} />
      </mesh>
      {/* CPU tower top */}
      <mesh position={[0, 2.7, -9.5]}>
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
