/**
 * Arena - 3D Battlefield Scene
 *
 * Clash Royale layout: horizontal river across middle, two vertical bridges
 */

import { useGameState } from "../engine/GameState";
import Unit from "./Unit";
import Building from "./Building";
import { useUnitMovement } from "../hooks/useUnitMovement";
import { useUnitCombat } from "../hooks/useUnitCombat";
import { useProductionQueue } from "../hooks/useProductionQueue";
import { useShieldRegeneration } from "../hooks/useShieldRegeneration";
import { useCreepSystem } from "../hooks/useCreepSystem";
import { useLarvaProduction } from "../hooks/useLarvaProduction";
import { useCreepRegeneration } from "../hooks/useCreepRegeneration";
import { useBuildingPlacement } from "../hooks/useBuildingPlacement";
import BuildingPlacementController from "./BuildingPlacementController";

interface Props {
  buildingPlacement: ReturnType<typeof useBuildingPlacement>;
}

export default function Arena({ buildingPlacement }: Props) {
  const { state } = useGameState();

  // Move units toward enemy base
  useUnitMovement();

  // Handle unit combat
  useUnitCombat();

  // Process production queues
  useProductionQueue();

  // Regenerate Protoss shields
  useShieldRegeneration();

  // Manage Zerg creep spreading
  useCreepSystem();

  // Manage Zerg larva production
  useLarvaProduction();

  // Regenerate Zerg units on creep
  useCreepRegeneration();

  return (
    <>
      {/* Sky/Background color - dark for outside arena */}
      <color attach="background" args={["#1a1a1a"]} />

      {/* Lighting setup */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 15, 5]} intensity={0.9} castShadow />

      {/* Dark border/void plane - large background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0f0f0f" />
      </mesh>

      {/* Main grass - Player side (bottom) - Z=1 to Z=9 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Horizontal river across middle (left to right) - Z=-1 to Z=1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[10, 2]} />
        <meshStandardMaterial color="#4a9eff" />
      </mesh>

      {/* Main grass - CPU side (top) - Z=-9 to Z=-1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#7cb87c" />
      </mesh>

      {/* Left bridge (vertical bridge crossing horizontal river) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.02, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Right bridge (vertical bridge crossing horizontal river) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.02, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial color="#c8a882" />
      </mesh>

      {/* Side walls - Left (encloses all green area) */}
      <mesh position={[-5.25, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 19]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Side walls - Right (encloses all green area) */}
      <mesh position={[5.25, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 19]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Back wall - Player side (wider to overlap with side walls) */}
      <mesh position={[0, 0.5, 9.5]}>
        <boxGeometry args={[11, 1, 0.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Back wall - CPU side (wider to overlap with side walls) */}
      <mesh position={[0, 0.5, -9.5]}>
        <boxGeometry args={[11, 1, 0.5]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>

      {/* Render all buildings (including base Command Centers that act as towers) */}
      {state.buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}

      {/* Render all units */}
      {state.units.map((unit) => (
        <Unit key={unit.id} unit={unit} />
      ))}

      {/* Building placement ghost preview */}
      <BuildingPlacementController placementState={buildingPlacement} />
    </>
  );
}
