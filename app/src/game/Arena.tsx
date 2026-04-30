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

      {/* Water base (surrounds entire arena) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[25, 35]} />
        <meshStandardMaterial color="#4a9eff" />
      </mesh>

      {/* Main battlefield ground - Player side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 7]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Bridge/Chokepoint - Middle narrows here */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[4, 6]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Main battlefield ground - CPU side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -7]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Arena walls - Left side */}
      <mesh position={[-5, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 30]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Arena walls - Right side */}
      <mesh position={[5, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 30]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Chokepoint markers - Left */}
      <mesh position={[-2.2, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#6b5644" />
      </mesh>

      {/* Chokepoint markers - Right */}
      <mesh position={[2.2, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#6b5644" />
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
