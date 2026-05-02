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
import { useTexture } from "@react-three/drei";

interface Props {
  buildingPlacement: ReturnType<typeof useBuildingPlacement>;
}

export default function Arena({ buildingPlacement }: Props) {
  const { state, actions } = useGameState();

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

  // Load space station textures
  const platformTexture = useTexture('/platform-texture.png');
  const bridgeTexture = useTexture('/bridge-texture.png');

  // Configure texture tiling (smaller tiles)
  useMemo(() => {
    platformTexture.wrapS = THREE.RepeatWrapping;
    platformTexture.wrapT = THREE.RepeatWrapping;
    platformTexture.repeat.set(12, 12); // Tile 12x12 times (3x smaller)
    platformTexture.needsUpdate = true;

    bridgeTexture.wrapS = THREE.RepeatWrapping;
    bridgeTexture.wrapT = THREE.RepeatWrapping;
    bridgeTexture.repeat.set(6, 6); // Tile 6x6 times (3x smaller)
    bridgeTexture.needsUpdate = true;
  }, [platformTexture, bridgeTexture]);

  // Generate starfield - more stars, various sizes and brightnesses
  const starfield = useMemo(() => {
    const positions = new Float32Array(500 * 3);
    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60; // x
      positions[i * 3 + 1] = Math.random() * 25 + 5; // y (higher up)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60; // z
    }
    return positions;
  }, []);

  return (
    <>
      {/* Outer space background - deep space blue */}
      <color attach="background" args={["#0a0e27"]} />

      {/* Distant starfield - brighter and varied sizes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starfield.length / 3}
            array={starfield}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.15} color="#e0e8ff" sizeAttenuation={true} transparent opacity={0.9} />
      </points>

      {/* Larger bright stars */}
      <points position={[10, 15, -20]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1}
            array={new Float32Array([0, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.5} color="#a0c8ff" sizeAttenuation={true} />
      </points>
      <points position={[-15, 18, -25]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1}
            array={new Float32Array([0, 0, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.4} color="#ffa0c8" sizeAttenuation={true} />
      </points>

      {/* Lighting setup - very bright for detail visibility */}
      <ambientLight intensity={1.8} color="#f0f4ff" />
      <directionalLight position={[10, 15, 5]} intensity={2.5} color="#ffffff" castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={1.2} color="#a0b8ff" />
      <directionalLight position={[0, 12, -8]} intensity={1.0} color="#ffffff" />
      <pointLight position={[0, 10, 5]} intensity={1.5} color="#ffffff" distance={20} />
      <pointLight position={[0, 10, -5]} intensity={1.5} color="#ffffff" distance={20} />

      {/* Deep space void - nebula-like background */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0a0e27"
          emissive="#1a2040"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Metal platform - Player side (bottom) - Z=1 to Z=9 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          map={platformTexture}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Space gap across middle - deep space void - Z=-1 to Z=1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[10, 2]} />
        <meshStandardMaterial
          color="#0a0e27"
          emissive="#1a2555"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Nebula-like glow in the gap */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2, -0.04, 0]}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial
          color="#2a3a7a"
          emissive="#4a5aff"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2, -0.04, 0]}>
        <planeGeometry args={[3, 1.5]} />
        <meshStandardMaterial
          color="#3a2a7a"
          emissive="#7a4aff"
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Metal platform - CPU side (top) - Z=-9 to Z=-1 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, -5]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial
          map={platformTexture}
          metalness={0.7}
          roughness={0.4}
        />
      </mesh>

      {/* Left bridge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.5, 0.02, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={bridgeTexture}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Left bridge edge lights */}
      <mesh position={[-2.5, 0.03, 1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.03, 0.03]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-2.5, 0.03, -1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.03, 0.03]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>

      {/* Right bridge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.5, 0.02, 0]}>
        <planeGeometry args={[2, 2]} />
        <meshStandardMaterial
          map={bridgeTexture}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Right bridge edge lights */}
      <mesh position={[2.5, 0.03, 1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.03, 0.03]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[2.5, 0.03, -1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[2, 0.03, 0.03]} />
        <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.8} />
      </mesh>

      {/* Side barriers - Left (industrial metal walls) */}
      <mesh position={[-5.25, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 19]} />
        <meshStandardMaterial
          color="#454d5a"
          metalness={0.8}
          roughness={0.5}
        />
      </mesh>

      {/* Side barriers - Right (industrial metal walls) */}
      <mesh position={[5.25, 0.5, 0]}>
        <boxGeometry args={[0.5, 1, 19]} />
        <meshStandardMaterial
          color="#454d5a"
          metalness={0.8}
          roughness={0.5}
        />
      </mesh>

      {/* Back barrier - Player side (industrial metal) */}
      <mesh position={[0, 0.5, 9.5]}>
        <boxGeometry args={[11, 1, 0.5]} />
        <meshStandardMaterial
          color="#454d5a"
          metalness={0.8}
          roughness={0.5}
        />
      </mesh>

      {/* Back barrier - CPU side (industrial metal) */}
      <mesh position={[0, 0.5, -9.5]}>
        <boxGeometry args={[11, 1, 0.5]} />
        <meshStandardMaterial
          color="#454d5a"
          metalness={0.8}
          roughness={0.5}
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
