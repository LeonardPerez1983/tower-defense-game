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
import { useMemo } from "react";
import * as THREE from "three";
import { ProjectileVFX, MuzzleFlashVFX, MeleeImpactVFX, DeathExplosionVFX } from "./visuals/CombatEffects";
import { useBattleTimer } from "../hooks/useBattleTimer";

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

  // Enforce 3-minute battle timer
  useBattleTimer();

  // Generate starfield
  const starfield = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50; // x
      positions[i * 3 + 1] = Math.random() * 20 + 10; // y (high up)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
    }
    return positions;
  }, []);

  return (
    <>
      {/* Outer space background - lighter for visibility */}
      <color attach="background" args={["#1a1a2e"]} />

      {/* Distant starfield */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starfield.length / 3}
            array={starfield}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.2} color="#ffffff" sizeAttenuation={true} />
      </points>

      {/* Lighting setup - much brighter for visibility */}
      <ambientLight intensity={0.9} color="#e8f0ff" />
      <directionalLight position={[10, 15, 5]} intensity={1.4} color="#ffffff" castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} color="#a0b8ff" />
      <pointLight position={[0, 8, 0]} intensity={0.8} color="#6b9eff" distance={25} />

      {/* Deep space void - large dark background with distant stars */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#2a2a4a" emissiveIntensity={0.3} />
      </mesh>

      {/* Metal platform - Player side (bottom) - Z=1 to Z=9 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          color="#6b7c95"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      {/* Platform grid lines - Player side */}
      <lineSegments position={[0, 0.01, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(10, 8, 4, 3)]} />
        <lineBasicMaterial color="#94a3b8" opacity={0.5} transparent />
      </lineSegments>

      {/* Space gap across middle (void between platforms) - Z=-1 to Z=1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[10, 2]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive="#3b4c6b"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Metal platform - CPU side (top) - Z=-9 to Z=-1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          color="#6b7c95"
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>
      {/* Platform grid lines - CPU side */}
      <lineSegments position={[0, 0.01, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(10, 8, 4, 3)]} />
        <lineBasicMaterial color="#94a3b8" opacity={0.5} transparent />
      </lineSegments>

      {/* Left bridge (metal connector crossing gap) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.02, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          color="#8b9bb0"
          metalness={0.6}
          roughness={0.4}
          emissive="#5a8eff"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Left bridge edge lights */}
      <mesh position={[-2.5, 0.05, 1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-2.5, 0.05, -1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>

      {/* Right bridge (metal connector crossing gap) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.02, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          color="#8b9bb0"
          metalness={0.6}
          roughness={0.4}
          emissive="#5a8eff"
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Right bridge edge lights */}
      <mesh position={[2.5, 0.05, 1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[2.5, 0.05, -1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.05, 0.05]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>

      {/* Side barriers - Left (metallic space station walls) */}
      <mesh position={[-5.25, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 19]} />
        <meshStandardMaterial
          color="#5a6b7f"
          metalness={0.7}
          roughness={0.3}
          emissive="#3b5998"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Side barriers - Right (metallic space station walls) */}
      <mesh position={[5.25, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 19]} />
        <meshStandardMaterial
          color="#5a6b7f"
          metalness={0.7}
          roughness={0.3}
          emissive="#3b5998"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Back barrier - Player side (wider to overlap with side walls) */}
      <mesh position={[0, 0.5, 9.5]}>
        <boxGeometry args={[11, 1, 0.5]} />
        <meshStandardMaterial
          color="#5a6b7f"
          metalness={0.7}
          roughness={0.3}
          emissive="#3b5998"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Back barrier - CPU side (wider to overlap with side walls) */}
      <mesh position={[0, 0.5, -9.5]}>
        <boxGeometry args={[11, 1, 0.5]} />
        <meshStandardMaterial
          color="#5a6b7f"
          metalness={0.7}
          roughness={0.3}
          emissive="#3b5998"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Render all buildings (including base Command Centers that act as towers) */}
      {state.buildings.map((building) => (
        <Building key={building.id} building={building} />
      ))}

      {/* Render all units */}
      {state.units.map((unit) => (
        <Unit key={unit.id} unit={unit} />
      ))}

      {/* Combat visual effects */}
      {state.activeProjectiles.map((projectile) => (
        <ProjectileVFX
          key={projectile.id}
          projectile={projectile}
          onComplete={actions.removeProjectile}
        />
      ))}
      {state.activeMuzzleFlashes.map((flash) => (
        <MuzzleFlashVFX
          key={flash.id}
          flash={flash}
          onComplete={actions.removeMuzzleFlash}
        />
      ))}
      {state.activeMeleeImpacts.map((impact) => (
        <MeleeImpactVFX
          key={impact.id}
          impact={impact}
          onComplete={actions.removeMeleeImpact}
        />
      ))}
      {state.activeDeathExplosions.map((explosion) => (
        <DeathExplosionVFX
          key={explosion.id}
          explosion={explosion}
          onComplete={actions.removeDeathExplosion}
        />
      ))}

      {/* Building placement ghost preview */}
      <BuildingPlacementController placementState={buildingPlacement} />
    </>
  );
}
