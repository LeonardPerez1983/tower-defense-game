/**
 * StarcraftPrototypeModels - Low-poly primitive models for StarCraft-inspired units
 *
 * Uses only Three.js primitives for fast prototyping.
 * No imported models, no GLTF, no external assets.
 * Optimized for top-down/isometric camera readability.
 */

import { useRef } from "react";
import { Group, Mesh } from "three";
import { useFrame } from "@react-three/fiber";

// ============================================================================
// SHARED TYPES
// ============================================================================

export type ModelName =
  | "TerranMarine"
  | "TerranFirebat"
  | "TerranCommandCenter"
  | "TerranBarracks"
  | "TerranBunker"
  | "ZergLarva"
  | "ZergCocoon"
  | "Zergling"
  | "Hydralisk"
  | "ZergHatchery"
  | "ZergSpawningPool"
  | "ZergCreepColony"
  | "ZergSunkenColony"
  | "ProtossZealot"
  | "ProtossDragoon"
  | "ProtossNexus"
  | "ProtossGateway"
  | "ProtossPhotonCannon";

export type UnitModelProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  teamColor?: string;
  isMoving?: boolean;
  isAttacking?: boolean;
};

// ============================================================================
// COMMON COMPONENTS
// ============================================================================

export function UnitShadow({ radius = 0.5 }: { radius?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <circleGeometry args={[radius, 16]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.3} />
    </mesh>
  );
}

export function GlowSphere({
  position = [0, 0, 0],
  radius = 0.1,
  color = "#00ffff",
  intensity = 2
}: {
  position?: [number, number, number];
  radius?: number;
  color?: string;
  intensity?: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
    </mesh>
  );
}

export function EnergyBlade({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  length = 1,
  color = "#00ccff",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[0.15, length, 0.05]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.8} />
    </mesh>
  );
}

export function LowPolySpike({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  height = 0.3,
  color = "#8b4789",
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  height?: number;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[0.08, height, 4]} />
      <meshStandardMaterial color={color} flatShading />
    </mesh>
  );
}

// ============================================================================
// TERRAN MODELS
// ============================================================================

export function TerranMarine({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#4a9eff",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);
  const projectileRef = useRef<Mesh>(null);

  // Attacking animation with moving projectile
  useFrame(({ clock }) => {
    if (groupRef.current && isAttacking) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 8) * 0.05;
    }

    // Projectile travels forward when attacking
    if (projectileRef.current && isAttacking) {
      const progress = (clock.elapsedTime * 3) % 1; // Loop every 0.33 seconds
      projectileRef.current.position.z = 0.5 + progress * 2; // Travel 2 units forward
      projectileRef.current.visible = progress < 0.8; // Disappear near end
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.45} />

      <group ref={groupRef}>
        {/* Legs */}
        <mesh position={[-0.15, 0.15, 0]}>
          <boxGeometry args={[0.15, 0.3, 0.15]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[0.15, 0.15, 0]}>
          <boxGeometry args={[0.15, 0.3, 0.15]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.4, 0.5, 0.3]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Shoulders */}
        <mesh position={[-0.28, 0.65, 0]}>
          <boxGeometry args={[0.2, 0.25, 0.25]} />
          <meshStandardMaterial color="#666666" flatShading />
        </mesh>
        <mesh position={[0.28, 0.65, 0]}>
          <boxGeometry args={[0.2, 0.25, 0.25]} />
          <meshStandardMaterial color="#666666" flatShading />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color="#777777" flatShading />
        </mesh>

        {/* Visor glow */}
        <GlowSphere position={[0, 0.95, 0.13]} radius={0.08} color="#ff4400" intensity={1.5} />

        {/* Rifle - oversized for readability */}
        <mesh position={[0.3, 0.5, 0.3]} rotation={[0, 0, -Math.PI / 6]}>
          <boxGeometry args={[0.1, 0.6, 0.1]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>

        {/* Muzzle */}
        <mesh position={[0.35, 0.5, 0.5]}>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 6]} />
          <meshStandardMaterial color="#222222" flatShading />
        </mesh>

        {/* Attack muzzle flash */}
        {isAttacking && (
          <GlowSphere position={[0.35, 0.5, 0.58]} radius={0.12} color="#ffaa00" intensity={3} />
        )}

        {/* Bullet projectile */}
        {isAttacking && (
          <mesh ref={projectileRef} position={[0.35, 0.5, 0.6]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffaa00" emissiveIntensity={2} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function TerranBarracks({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#4a9eff",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>

      {/* Main building body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#606060" flatShading />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.1, 0.2, 1.6]} />
        <meshStandardMaterial color="#505050" flatShading />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.4, 0.76]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#333333" flatShading />
      </mesh>

      {/* Team color stripe */}
      <mesh position={[0, 0.9, 0.76]}>
        <boxGeometry args={[2, 0.15, 0.02]} />
        <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.5} />
      </mesh>

      {/* Windows */}
      <GlowSphere position={[-0.6, 0.7, 0.76]} radius={0.1} color="#ffaa00" intensity={1} />
      <GlowSphere position={[0.6, 0.7, 0.76]} radius={0.1} color="#ffaa00" intensity={1} />

      {/* Industrial details */}
      <mesh position={[-0.9, 0.5, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#707070" flatShading />
      </mesh>
      <mesh position={[0.9, 0.5, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#707070" flatShading />
      </mesh>
    </group>
  );
}

// Placeholder stubs for remaining models (will be implemented by agents)
export function TerranFirebat({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#4a9eff",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);
  const flameLeftRef = useRef<Mesh>(null);
  const flameRightRef = useRef<Mesh>(null);

  // Heavy recoil animation when attacking
  useFrame(({ clock }) => {
    if (groupRef.current && isAttacking) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 6) * 0.08;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 6) * 0.1;
    }

    // Flame cone projectiles
    if (isAttacking) {
      const progress = (clock.elapsedTime * 4) % 1; // Faster flame loop
      const distance = progress * 1.2; // Shorter range for flamer
      const scale = 1 + progress * 2; // Cone expands as it travels

      if (flameLeftRef.current) {
        flameLeftRef.current.position.z = 0.45 + distance;
        flameLeftRef.current.scale.set(scale, scale, scale);
        flameLeftRef.current.visible = progress < 0.7;
      }
      if (flameRightRef.current) {
        flameRightRef.current.position.z = 0.45 + distance;
        flameRightRef.current.scale.set(scale, scale, scale);
        flameRightRef.current.visible = progress < 0.7;
      }
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.55} />

      <group ref={groupRef}>
        {/* Legs - wider stance */}
        <mesh position={[-0.2, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[0.2, 0.15, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.2]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>

        {/* Torso - bulkier */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.5, 0.5, 0.35]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Shoulders - heavier */}
        <mesh position={[-0.35, 0.65, 0]}>
          <boxGeometry args={[0.25, 0.3, 0.3]} />
          <meshStandardMaterial color="#666666" flatShading />
        </mesh>
        <mesh position={[0.35, 0.65, 0]}>
          <boxGeometry args={[0.25, 0.3, 0.3]} />
          <meshStandardMaterial color="#666666" flatShading />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.9, 0]}>
          <boxGeometry args={[0.28, 0.25, 0.25]} />
          <meshStandardMaterial color="#777777" flatShading />
        </mesh>

        {/* Visor glow */}
        <GlowSphere position={[0, 0.95, 0.13]} radius={0.08} color="#ff4400" intensity={1.5} />

        {/* Twin flamer tanks on back */}
        <mesh position={[-0.15, 0.7, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 8]} />
          <meshStandardMaterial color="#ff6600" flatShading />
        </mesh>
        <mesh position={[0.15, 0.7, -0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.4, 8]} />
          <meshStandardMaterial color="#ff6600" flatShading />
        </mesh>

        {/* Dual flamer nozzles in hands */}
        <mesh position={[-0.35, 0.5, 0.25]} rotation={[0, 0, -Math.PI / 6]}>
          <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>
        <mesh position={[0.35, 0.5, 0.25]} rotation={[0, 0, Math.PI / 6]}>
          <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
          <meshStandardMaterial color="#333333" flatShading />
        </mesh>

        {/* Attack muzzle flash - dual orange bursts */}
        {isAttacking && (
          <>
            <GlowSphere position={[-0.35, 0.5, 0.45]} radius={0.15} color="#ff6600" intensity={3} />
            <GlowSphere position={[0.35, 0.5, 0.45]} radius={0.15} color="#ff6600" intensity={3} />
          </>
        )}

        {/* Flame cone projectiles */}
        {isAttacking && (
          <>
            <mesh ref={flameLeftRef} position={[-0.35, 0.5, 0.45]}>
              <coneGeometry args={[0.15, 0.4, 6]} />
              <meshStandardMaterial
                color="#ff6600"
                emissive="#ff4400"
                emissiveIntensity={2}
                transparent
                opacity={0.7}
              />
            </mesh>
            <mesh ref={flameRightRef} position={[0.35, 0.5, 0.45]}>
              <coneGeometry args={[0.15, 0.4, 6]} />
              <meshStandardMaterial
                color="#ff6600"
                emissive="#ff4400"
                emissiveIntensity={2}
                transparent
                opacity={0.7}
              />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export function TerranCommandCenter({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#4a9eff",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>

      {/* Main building body - large HQ */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[3.5, 2.2, 2.5]} />
        <meshStandardMaterial color="#606060" flatShading />
      </mesh>

      {/* Landing pad base on top */}
      <mesh position={[0, 2.3, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 16]} />
        <meshStandardMaterial color="#505050" flatShading />
      </mesh>

      {/* Antenna on landing pad */}
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 8]} />
        <meshStandardMaterial color="#707070" flatShading />
      </mesh>

      {/* Team color stripe across facade */}
      <mesh position={[0, 1.8, 1.26]}>
        <boxGeometry args={[3.5, 0.25, 0.02]} />
        <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.5} />
      </mesh>

      {/* Windows - multiple glowing points */}
      <GlowSphere position={[-1.2, 1.5, 1.26]} radius={0.12} color="#ffaa00" intensity={1} />
      <GlowSphere position={[-0.4, 1.5, 1.26]} radius={0.12} color="#ffaa00" intensity={1} />
      <GlowSphere position={[0.4, 1.5, 1.26]} radius={0.12} color="#ffaa00" intensity={1} />
      <GlowSphere position={[1.2, 1.5, 1.26]} radius={0.12} color="#ffaa00" intensity={1} />
      <GlowSphere position={[-1.2, 0.8, 1.26]} radius={0.12} color="#ffaa00" intensity={1} />
      <GlowSphere position={[1.2, 0.8, 1.26]} radius={0.12} color="#ffaa00" intensity={1} />

      {/* Industrial pipes on sides */}
      <mesh position={[-1.7, 1.1, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#707070" flatShading />
      </mesh>
      <mesh position={[1.7, 1.1, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
        <meshStandardMaterial color="#707070" flatShading />
      </mesh>

      {/* Vents on sides */}
      <mesh position={[-1.76, 0.5, -0.5]}>
        <boxGeometry args={[0.02, 0.4, 0.6]} />
        <meshStandardMaterial color="#404040" flatShading />
      </mesh>
      <mesh position={[1.76, 0.5, -0.5]}>
        <boxGeometry args={[0.02, 0.4, 0.6]} />
        <meshStandardMaterial color="#404040" flatShading />
      </mesh>
    </group>
  );
}

export function TerranBunker({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#4a9eff",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);
  const bulletLeftRef = useRef<Mesh>(null);
  const bulletRightRef = useRef<Mesh>(null);

  // Slight shake when attacking
  useFrame(({ clock }) => {
    if (groupRef.current && isAttacking) {
      groupRef.current.position.x = Math.sin(clock.elapsedTime * 10) * 0.03;
    }

    // Bullet projectiles from firing slots
    if (isAttacking) {
      const progress = (clock.elapsedTime * 3.5) % 1;
      if (bulletLeftRef.current) {
        bulletLeftRef.current.position.z = 0.8 + progress * 2;
        bulletLeftRef.current.visible = progress < 0.8;
      }
      // Offset right bullet slightly for stagger effect
      const progressRight = (clock.elapsedTime * 3.5 + 0.3) % 1;
      if (bulletRightRef.current) {
        bulletRightRef.current.position.z = 0.8 + progressRight * 2;
        bulletRightRef.current.visible = progressRight < 0.8;
      }
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>

      <group ref={groupRef}>
        {/* Main bunker body - thick armored walls */}
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.8, 1.4]} />
          <meshStandardMaterial color="#4a4a4a" flatShading />
        </mesh>

        {/* Armored roof with slight slope */}
        <mesh position={[0, 0.85, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.9, 0.15, 1.5]} />
          <meshStandardMaterial color="#505050" flatShading />
        </mesh>

        {/* Firing slots - dark recessed rectangles on front */}
        <mesh position={[-0.5, 0.5, 0.71]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} />
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </mesh>
        <mesh position={[0.5, 0.5, 0.71]}>
          <boxGeometry args={[0.3, 0.15, 0.05]} />
          <meshStandardMaterial color="#1a1a1a" flatShading />
        </mesh>

        {/* Team color marker lights */}
        <GlowSphere position={[-0.8, 0.75, 0.7]} radius={0.08} color={teamColor} intensity={1.5} />
        <GlowSphere position={[0.8, 0.75, 0.7]} radius={0.08} color={teamColor} intensity={1.5} />

        {/* Armor plate detail on front */}
        <mesh position={[0, 0.2, 0.71]}>
          <boxGeometry args={[1.6, 0.3, 0.05]} />
          <meshStandardMaterial color="#3a3a3a" flatShading />
        </mesh>

        {/* Corner reinforcements */}
        <mesh position={[-0.85, 0.4, 0.65]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[0.85, 0.4, 0.65]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[-0.85, 0.4, -0.65]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>
        <mesh position={[0.85, 0.4, -0.65]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#555555" flatShading />
        </mesh>

        {/* Attack muzzle flash from firing slots */}
        {isAttacking && (
          <>
            <GlowSphere position={[-0.5, 0.5, 0.78]} radius={0.1} color="#ffaa00" intensity={3} />
            <GlowSphere position={[0.5, 0.5, 0.78]} radius={0.1} color="#ffaa00" intensity={3} />

            {/* Bullet projectiles */}
            <mesh ref={bulletLeftRef} position={[-0.5, 0.5, 0.8]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffaa00" emissiveIntensity={2} />
            </mesh>
            <mesh ref={bulletRightRef} position={[0.5, 0.5, 0.8]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color="#ffff00" emissive="#ffaa00" emissiveIntensity={2} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
}

export function ZergLarva({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);

  // Wiggle animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.3} />

      <group ref={groupRef}>
        {/* Worm-like body - stretched sphere */}
        <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>
        <mesh position={[0, 0.15, 0]} scale={[2.5, 1, 1]}>
          <sphereGeometry args={[0.15, 8, 6]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Small bio glow */}
        <GlowSphere position={[0, 0.2, 0]} radius={0.05} color="#44ff44" intensity={1.5} />
      </group>
    </group>
  );
}

export function ZergCocoon({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);

  // Pulsing animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.08;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.4} />

      <group ref={groupRef}>
        {/* Oval pod - squashed sphere */}
        <mesh position={[0, 0.25, 0]} scale={[1, 1.3, 0.9]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Green glow accents */}
        <GlowSphere position={[0, 0.15, 0.28]} radius={0.06} color="#44ff44" intensity={2} />
        <GlowSphere position={[0.15, 0.3, 0]} radius={0.05} color="#44ff44" intensity={1.5} />
        <GlowSphere position={[-0.15, 0.3, 0]} radius={0.05} color="#44ff44" intensity={1.5} />

        {/* Small organic texture details */}
        <mesh position={[0, 0.4, 0]} scale={[0.8, 0.6, 0.8]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>
      </group>
    </group>
  );
}

export function Zergling({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);

  // Attack lunge animation
  useFrame(({ clock }) => {
    if (groupRef.current && isAttacking) {
      groupRef.current.position.z = Math.sin(clock.elapsedTime * 10) * 0.15;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.4} />

      <group ref={groupRef}>
        {/* Low quadruped body - stay close to ground */}
        <mesh position={[0, 0.2, 0]} scale={[1.2, 0.6, 0.8]}>
          <sphereGeometry args={[0.25, 8, 6]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Head */}
        <mesh position={[0, 0.25, 0.35]} scale={[0.8, 0.7, 1]}>
          <sphereGeometry args={[0.15, 6, 6]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Green glow eyes */}
        <GlowSphere position={[-0.08, 0.28, 0.42]} radius={0.04} color="#44ff44" intensity={2.5} />
        <GlowSphere position={[0.08, 0.28, 0.42]} radius={0.04} color="#44ff44" intensity={2.5} />

        {/* Clawed limbs - small cones */}
        <mesh position={[-0.2, 0.08, 0.15]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.05, 0.2, 4]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>
        <mesh position={[0.2, 0.08, 0.15]} rotation={[0, 0, -Math.PI / 4]}>
          <coneGeometry args={[0.05, 0.2, 4]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>
        <mesh position={[-0.2, 0.08, -0.1]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.05, 0.2, 4]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>
        <mesh position={[0.2, 0.08, -0.1]} rotation={[0, 0, -Math.PI / 4]}>
          <coneGeometry args={[0.05, 0.2, 4]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>

        {/* Spiky back */}
        <LowPolySpike position={[-0.1, 0.4, 0.1]} rotation={[Math.PI / 6, 0, -Math.PI / 6]} height={0.25} color="#7a4d7a" />
        <LowPolySpike position={[0.1, 0.4, 0.1]} rotation={[Math.PI / 6, 0, Math.PI / 6]} height={0.25} color="#7a4d7a" />
        <LowPolySpike position={[0, 0.42, -0.05]} rotation={[Math.PI / 6, 0, 0]} height={0.3} color="#7a4d7a" />
      </group>
    </group>
  );
}

export function Hydralisk({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const spineRef = useRef<Mesh>(null);

  // Head recoil animation when attacking
  useFrame(({ clock }) => {
    if (headRef.current && isAttacking) {
      headRef.current.position.z = -Math.abs(Math.sin(clock.elapsedTime * 8)) * 0.15;
    } else if (headRef.current) {
      headRef.current.position.z = 0;
    }

    // Spine projectile
    if (spineRef.current && isAttacking) {
      const progress = (clock.elapsedTime * 3) % 1;
      spineRef.current.position.z = 0.3 + progress * 2.5;
      spineRef.current.visible = progress < 0.85;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.5} />

      <group ref={groupRef}>
        {/* Upright snake/insect body */}
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.2, 0.6, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Lower body segment */}
        <mesh position={[0, 0.15, 0.05]}>
          <cylinderGeometry args={[0.2, 0.22, 0.3, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Head with crest */}
        <mesh ref={headRef} position={[0, 0.75, 0.2]}>
          <group>
            <mesh position={[0, 0, 0]} scale={[0.8, 1, 1.2]}>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshStandardMaterial color={teamColor} flatShading />
            </mesh>

            {/* Bio glow eyes */}
            <GlowSphere position={[-0.08, 0, 0.15]} radius={0.05} color="#44ff44" intensity={2.5} />
            <GlowSphere position={[0.08, 0, 0.15]} radius={0.05} color="#44ff44" intensity={2.5} />

            {/* Head crest spikes */}
            <LowPolySpike position={[-0.12, 0.15, -0.05]} rotation={[0, 0, -Math.PI / 4]} height={0.35} color="#7a4d7a" />
            <LowPolySpike position={[0.12, 0.15, -0.05]} rotation={[0, 0, Math.PI / 4]} height={0.35} color="#7a4d7a" />
            <LowPolySpike position={[0, 0.18, -0.08]} rotation={[0, 0, 0]} height={0.4} color="#7a4d7a" />
          </group>
        </mesh>

        {/* Back spines */}
        <LowPolySpike position={[-0.08, 0.65, -0.1]} rotation={[-Math.PI / 6, 0, -Math.PI / 8]} height={0.4} color="#7a4d7a" />
        <LowPolySpike position={[0.08, 0.65, -0.1]} rotation={[-Math.PI / 6, 0, Math.PI / 8]} height={0.4} color="#7a4d7a" />
        <LowPolySpike position={[-0.1, 0.5, -0.08]} rotation={[-Math.PI / 6, 0, -Math.PI / 6]} height={0.35} color="#7a4d7a" />
        <LowPolySpike position={[0.1, 0.5, -0.08]} rotation={[-Math.PI / 6, 0, Math.PI / 6]} height={0.35} color="#7a4d7a" />
        <LowPolySpike position={[-0.08, 0.35, -0.05]} rotation={[-Math.PI / 8, 0, -Math.PI / 8]} height={0.3} color="#7a4d7a" />
        <LowPolySpike position={[0.08, 0.35, -0.05]} rotation={[-Math.PI / 8, 0, Math.PI / 8]} height={0.3} color="#7a4d7a" />

        {/* Bio glow accent on body */}
        <GlowSphere position={[0, 0.45, 0.18]} radius={0.06} color="#44ff44" intensity={1.8} />

        {/* Spine projectile */}
        {isAttacking && (
          <mesh ref={spineRef} position={[0, 0.75, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 0.25, 6]} />
            <meshStandardMaterial color="#44ff44" emissive="#33dd33" emissiveIntensity={2} />
          </mesh>
        )}
      </group>
    </group>
  );
}

export function ZergHatchery({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Creep base - flat dark purple disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshStandardMaterial color="#3d1f3d" />
      </mesh>

      {/* Large organic mound - irregular sphere cluster */}
      <mesh position={[0, 0.4, 0]} scale={[1.3, 0.8, 1.1]}>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Additional organic lumps */}
      <mesh position={[-0.3, 0.3, 0.2]} scale={[0.8, 0.6, 0.9]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color="#7a4d7a" flatShading />
      </mesh>
      <mesh position={[0.3, 0.35, -0.1]} scale={[0.9, 0.7, 0.8]}>
        <sphereGeometry args={[0.45, 8, 6]} />
        <meshStandardMaterial color="#7a4d7a" flatShading />
      </mesh>
      <mesh position={[0, 0.25, -0.4]} scale={[1, 0.6, 0.7]}>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Maw/opening in front - dark recessed area */}
      <mesh position={[0, 0.35, 0.65]}>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial color="#1a0d1a" flatShading />
      </mesh>
      <mesh position={[0, 0.25, 0.7]} scale={[1.2, 0.8, 0.6]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshStandardMaterial color="#2a1a2a" flatShading />
      </mesh>

      {/* Sacs and spikes on surface */}
      <mesh position={[0.5, 0.45, 0.3]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[-0.5, 0.4, -0.2]}>
        <sphereGeometry args={[0.18, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[0.2, 0.55, -0.4]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>

      <LowPolySpike position={[-0.6, 0.5, 0.1]} rotation={[0, 0, -Math.PI / 6]} height={0.4} color="#7a4d7a" />
      <LowPolySpike position={[0.6, 0.55, -0.3]} rotation={[0, 0, Math.PI / 6]} height={0.45} color="#7a4d7a" />
      <LowPolySpike position={[0, 0.7, -0.2]} rotation={[0, 0, 0]} height={0.5} color="#7a4d7a" />
      <LowPolySpike position={[-0.3, 0.6, 0.4]} rotation={[Math.PI / 8, 0, -Math.PI / 8]} height={0.35} color="#7a4d7a" />

      {/* Green bio-glow accents */}
      <GlowSphere position={[0, 0.4, 0.68]} radius={0.12} color="#44ff44" intensity={2} />
      <GlowSphere position={[0.4, 0.45, 0.2]} radius={0.08} color="#44ff44" intensity={1.5} />
      <GlowSphere position={[-0.4, 0.38, -0.15]} radius={0.08} color="#44ff44" intensity={1.5} />
      <GlowSphere position={[0.15, 0.55, -0.35]} radius={0.06} color="#44ff44" intensity={1.2} />
    </group>
  );
}

export function ZergSpawningPool({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Fleshy pool base - flattened cylinder */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.7, 0.8, 0.3, 12]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Pool interior */}
      <mesh position={[0, 0.31, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.05, 12]} />
        <meshStandardMaterial color="#2a1a2a" flatShading />
      </mesh>

      {/* Green glowing center */}
      <GlowSphere position={[0, 0.34, 0]} radius={0.25} color="#44ff44" intensity={2.5} />

      {/* Organic rim - irregular cylinders */}
      <mesh position={[0.5, 0.25, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#7a4d7a" flatShading />
      </mesh>
      <mesh position={[-0.5, 0.25, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#7a4d7a" flatShading />
      </mesh>
      <mesh position={[0, 0.25, 0.5]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#7a4d7a" flatShading />
      </mesh>
      <mesh position={[0, 0.25, -0.5]} rotation={[-Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#7a4d7a" flatShading />
      </mesh>

      {/* Eggs/sacs around edges */}
      <mesh position={[0.6, 0.12, 0.3]} scale={[0.8, 1.2, 0.9]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[-0.6, 0.12, -0.3]} scale={[0.9, 1.1, 0.8]}>
        <sphereGeometry args={[0.13, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[0.3, 0.1, 0.6]} scale={[0.7, 1, 0.8]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[-0.3, 0.1, -0.6]} scale={[0.8, 1.1, 0.7]}>
        <sphereGeometry args={[0.11, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[0.7, 0.08, -0.1]} scale={[0.6, 0.9, 0.7]}>
        <sphereGeometry args={[0.09, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>
      <mesh position={[-0.7, 0.08, 0.1]} scale={[0.7, 1, 0.6]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial color="#6a3d6a" flatShading />
      </mesh>

      {/* Additional green glow accents */}
      <GlowSphere position={[0.55, 0.15, 0.25]} radius={0.05} color="#44ff44" intensity={1.5} />
      <GlowSphere position={[-0.55, 0.15, -0.25]} radius={0.05} color="#44ff44" intensity={1.5} />
      <GlowSphere position={[0.25, 0.13, 0.55]} radius={0.04} color="#44ff44" intensity={1.2} />
      <GlowSphere position={[-0.25, 0.13, -0.55]} radius={0.04} color="#44ff44" intensity={1.2} />
    </group>
  );
}

export function ZergCreepColony({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);

  // Idle pulse animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.04;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={groupRef}>
        {/* Organic base */}
        <mesh position={[0, 0.25, 0]} scale={[1.1, 0.6, 1]}>
          <sphereGeometry args={[0.5, 10, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Lower mound */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.55, 0.6, 0.15, 12]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>

        {/* Tentacle/spine silhouette - cylinders */}
        <mesh position={[0, 0.6, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.6, 8]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>
        <mesh position={[-0.2, 0.5, 0.1]} rotation={[0, 0, Math.PI / 8]}>
          <cylinderGeometry args={[0.06, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>
        <mesh position={[0.2, 0.5, -0.1]} rotation={[0, 0, -Math.PI / 8]}>
          <cylinderGeometry args={[0.06, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>

        {/* Spine tips - cones */}
        <mesh position={[0, 0.92, 0]}>
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshStandardMaterial color="#6a3d6a" flatShading />
        </mesh>
        <mesh position={[-0.2, 0.76, 0.1]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshStandardMaterial color="#6a3d6a" flatShading />
        </mesh>
        <mesh position={[0.2, 0.76, -0.1]}>
          <coneGeometry args={[0.06, 0.2, 8]} />
          <meshStandardMaterial color="#6a3d6a" flatShading />
        </mesh>

        {/* Additional spikes */}
        <LowPolySpike position={[-0.35, 0.35, 0]} rotation={[0, 0, -Math.PI / 4]} height={0.3} color="#7a4d7a" />
        <LowPolySpike position={[0.35, 0.35, 0]} rotation={[0, 0, Math.PI / 4]} height={0.3} color="#7a4d7a" />
        <LowPolySpike position={[0, 0.4, 0.35]} rotation={[Math.PI / 4, 0, 0]} height={0.25} color="#7a4d7a" />
        <LowPolySpike position={[0, 0.4, -0.35]} rotation={[-Math.PI / 4, 0, 0]} height={0.25} color="#7a4d7a" />

        {/* Green glow accents */}
        <GlowSphere position={[0, 0.3, 0]} radius={0.1} color="#44ff44" intensity={1.8} />
        <GlowSphere position={[0, 0.85, 0]} radius={0.05} color="#44ff44" intensity={1.5} />
        <GlowSphere position={[-0.2, 0.7, 0.1]} radius={0.04} color="#44ff44" intensity={1.2} />
        <GlowSphere position={[0.2, 0.7, -0.1]} radius={0.04} color="#44ff44" intensity={1.2} />
      </group>
    </group>
  );
}

export function ZergSunkenColony({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  teamColor = "#9b59b6",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);
  const tentacleRef = useRef<Group>(null);
  const emergingTentacleRef = useRef<Mesh>(null);

  // Idle pulse animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      const pulse = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.04;
      groupRef.current.scale.set(pulse, pulse, pulse);
    }

    // Attack: main tentacle goes down (burrows)
    if (tentacleRef.current && isAttacking) {
      const progress = (clock.elapsedTime * 3.33) % 1; // ~0.3s cycle
      // Go down in first 30% of cycle
      if (progress < 0.3) {
        tentacleRef.current.position.y = -(progress / 0.3) * 0.5;
      } else {
        tentacleRef.current.position.y = 0;
      }
    } else if (tentacleRef.current) {
      tentacleRef.current.position.y = 0;
    }

    // Emerging tentacle at enemy location (appears after 0.3s delay)
    if (emergingTentacleRef.current && isAttacking) {
      const progress = (clock.elapsedTime * 3.33) % 1;
      // Start emerging at 30% mark (0.3s delay)
      if (progress >= 0.3 && progress < 0.7) {
        const emergeProgress = (progress - 0.3) / 0.4;
        emergingTentacleRef.current.position.y = emergeProgress * 0.6 - 0.05;
        emergingTentacleRef.current.visible = true;
      } else {
        emergingTentacleRef.current.visible = false;
      }
    }
  });

  const glowIntensity = isAttacking ? 3 : 2;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={groupRef}>
        {/* Heavier organic base */}
        <mesh position={[0, 0.3, 0]} scale={[1.3, 0.7, 1.2]}>
          <sphereGeometry args={[0.55, 10, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Lower mound - larger */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.65, 0.7, 0.2, 12]} />
          <meshStandardMaterial color="#7a4d7a" flatShading />
        </mesh>

        {/* Side organic growths */}
        <mesh position={[-0.4, 0.25, 0]} scale={[0.6, 0.5, 0.6]}>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshStandardMaterial color="#6a3d6a" flatShading />
        </mesh>
        <mesh position={[0.4, 0.25, 0]} scale={[0.6, 0.5, 0.6]}>
          <sphereGeometry args={[0.3, 8, 6]} />
          <meshStandardMaterial color="#6a3d6a" flatShading />
        </mesh>

        {/* Larger tentacles/spines - more aggressive pose */}
        <group ref={tentacleRef}>
          <mesh position={[0, 0.7, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#7a4d7a" flatShading />
          </mesh>
          <mesh position={[-0.25, 0.6, 0.15]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.08, 0.12, 0.7, 8]} />
            <meshStandardMaterial color="#7a4d7a" flatShading />
          </mesh>
          <mesh position={[0.25, 0.6, -0.15]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.08, 0.12, 0.7, 8]} />
            <meshStandardMaterial color="#7a4d7a" flatShading />
          </mesh>
          <mesh position={[-0.15, 0.55, -0.2]} rotation={[Math.PI / 8, 0, Math.PI / 10]}>
            <cylinderGeometry args={[0.07, 0.1, 0.6, 8]} />
            <meshStandardMaterial color="#7a4d7a" flatShading />
          </mesh>
          <mesh position={[0.15, 0.55, 0.2]} rotation={[-Math.PI / 8, 0, -Math.PI / 10]}>
            <cylinderGeometry args={[0.07, 0.1, 0.6, 8]} />
            <meshStandardMaterial color="#7a4d7a" flatShading />
          </mesh>

          {/* Spine tips - larger cones */}
          <mesh position={[0, 1.12, 0]}>
            <coneGeometry args={[0.1, 0.35, 8]} />
            <meshStandardMaterial color="#6a3d6a" flatShading />
          </mesh>
          <mesh position={[-0.25, 0.96, 0.15]}>
            <coneGeometry args={[0.08, 0.3, 8]} />
            <meshStandardMaterial color="#6a3d6a" flatShading />
          </mesh>
          <mesh position={[0.25, 0.96, -0.15]}>
            <coneGeometry args={[0.08, 0.3, 8]} />
            <meshStandardMaterial color="#6a3d6a" flatShading />
          </mesh>
          <mesh position={[-0.15, 0.86, -0.2]}>
            <coneGeometry args={[0.07, 0.25, 8]} />
            <meshStandardMaterial color="#6a3d6a" flatShading />
          </mesh>
          <mesh position={[0.15, 0.86, 0.2]}>
            <coneGeometry args={[0.07, 0.25, 8]} />
            <meshStandardMaterial color="#6a3d6a" flatShading />
          </mesh>
        </group>

        {/* More pronounced spikes on base */}
        <LowPolySpike position={[-0.5, 0.45, 0.1]} rotation={[0, 0, -Math.PI / 3]} height={0.4} color="#7a4d7a" />
        <LowPolySpike position={[0.5, 0.45, -0.1]} rotation={[0, 0, Math.PI / 3]} height={0.4} color="#7a4d7a" />
        <LowPolySpike position={[0, 0.5, 0.5]} rotation={[Math.PI / 3, 0, 0]} height={0.35} color="#7a4d7a" />
        <LowPolySpike position={[0, 0.5, -0.5]} rotation={[-Math.PI / 3, 0, 0]} height={0.35} color="#7a4d7a" />
        <LowPolySpike position={[-0.4, 0.5, -0.3]} rotation={[-Math.PI / 6, 0, -Math.PI / 6]} height={0.3} color="#7a4d7a" />
        <LowPolySpike position={[0.4, 0.5, 0.3]} rotation={[Math.PI / 6, 0, Math.PI / 6]} height={0.3} color="#7a4d7a" />

        {/* Brighter green glow when attacking */}
        <GlowSphere position={[0, 0.35, 0]} radius={0.15} color="#44ff44" intensity={glowIntensity} />
        <GlowSphere position={[0, 1.05, 0]} radius={0.08} color="#44ff44" intensity={glowIntensity} />
        <GlowSphere position={[-0.25, 0.9, 0.15]} radius={0.06} color="#44ff44" intensity={glowIntensity * 0.8} />
        <GlowSphere position={[0.25, 0.9, -0.15]} radius={0.06} color="#44ff44" intensity={glowIntensity * 0.8} />
        <GlowSphere position={[-0.15, 0.8, -0.2]} radius={0.05} color="#44ff44" intensity={glowIntensity * 0.7} />
        <GlowSphere position={[0.15, 0.8, 0.2]} radius={0.05} color="#44ff44" intensity={glowIntensity * 0.7} />

        {/* Emerging tentacle at enemy location */}
        {isAttacking && (
          <mesh ref={emergingTentacleRef} position={[0, 0, 2.5]}>
            <group>
              {/* Tentacle spike tip */}
              <mesh position={[0, 0.3, 0]}>
                <coneGeometry args={[0.08, 0.4, 6]} />
                <meshStandardMaterial color="#7a4d7a" emissive="#44ff44" emissiveIntensity={1.5} />
              </mesh>
              {/* Tentacle body */}
              <mesh position={[0, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
                <meshStandardMaterial color="#7a4d7a" flatShading />
              </mesh>
            </group>
          </mesh>
        )}
      </group>
    </group>
  );
}

export function ProtossZealot({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.1,
  teamColor = "#f1c40f",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const groupRef = useRef<Group>(null);
  const leftBladeRef = useRef<Mesh>(null);
  const rightBladeRef = useRef<Mesh>(null);

  // Attack animation: blade lunge forward
  useFrame(({ clock }) => {
    if (groupRef.current && isAttacking) {
      groupRef.current.position.z = Math.sin(clock.elapsedTime * 10) * 0.15;
    }
    if (leftBladeRef.current && rightBladeRef.current && isAttacking) {
      const pulse = Math.sin(clock.elapsedTime * 10);
      leftBladeRef.current.position.x = -0.25 + pulse * 0.1;
      rightBladeRef.current.position.x = 0.25 - pulse * 0.1;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.4} />

      <group ref={groupRef}>
        {/* Tall legs - emphasize vertical silhouette */}
        <mesh position={[-0.12, 0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>
        <mesh position={[0.12, 0.25, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Tall torso - golden armor */}
        <mesh position={[0, 0.75, 0]}>
          <boxGeometry args={[0.35, 0.6, 0.25]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Shoulders */}
        <mesh position={[-0.25, 0.9, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.2]} />
          <meshStandardMaterial color="#d4af37" flatShading />
        </mesh>
        <mesh position={[0.25, 0.9, 0]}>
          <boxGeometry args={[0.15, 0.2, 0.2]} />
          <meshStandardMaterial color="#d4af37" flatShading />
        </mesh>

        {/* Elegant head with crest */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.3, 8]} />
          <meshStandardMaterial color={teamColor} flatShading />
        </mesh>

        {/* Head crest - tall cone on top */}
        <mesh position={[0, 1.45, 0]}>
          <coneGeometry args={[0.1, 0.25, 8]} />
          <meshStandardMaterial color="#d4af37" flatShading />
        </mesh>

        {/* Blue energy glow accents */}
        <GlowSphere position={[0, 0.75, 0.14]} radius={0.08} color="#00ccff" intensity={2} />
        <GlowSphere position={[0, 1.2, 0.08]} radius={0.06} color="#00ccff" intensity={2} />

        {/* OVERSIZED psi blades - 40% bigger than expected */}
        <group ref={leftBladeRef}>
          <EnergyBlade position={[-0.25, 0.85, 0.15]} rotation={[0, 0, Math.PI / 6]} length={1.4} color="#00ccff" />
        </group>
        <group ref={rightBladeRef}>
          <EnergyBlade position={[0.25, 0.85, 0.15]} rotation={[0, 0, -Math.PI / 6]} length={1.4} color="#00ccff" />
        </group>
      </group>
    </group>
  );
}

export function ProtossDragoon({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.2,
  teamColor = "#f1c40f",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const cannonRef = useRef<Mesh>(null);
  const coreRef = useRef<Mesh>(null);
  const plasmaRef = useRef<Mesh>(null);

  // Attack: cannon recoil + core glow pulse
  useFrame(({ clock }) => {
    if (cannonRef.current && isAttacking) {
      cannonRef.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 12) * 0.1;
    }
    if (coreRef.current && isAttacking) {
      const intensity = 2 + Math.sin(clock.elapsedTime * 12) * 1;
      (coreRef.current.material as any).emissiveIntensity = intensity;
    }

    // Plasma projectile
    if (plasmaRef.current && isAttacking) {
      const progress = (clock.elapsedTime * 3.5) % 1;
      plasmaRef.current.position.z = 0.35 + progress * 2.2;
      plasmaRef.current.visible = progress < 0.8;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <UnitShadow radius={0.55} />

      {/* Four-legged walker - WIDE and LOW stance */}
      {/* Front left leg */}
      <mesh position={[-0.3, 0.15, 0.25]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>
      {/* Front right leg */}
      <mesh position={[0.3, 0.15, 0.25]} rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>
      {/* Back left leg */}
      <mesh position={[-0.3, 0.15, -0.25]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>
      {/* Back right leg */}
      <mesh position={[0.3, 0.15, -0.25]} rotation={[0, 0, -Math.PI / 8]}>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Golden armored body - low center of gravity */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.5, 0.3, 0.4]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Blue energy core in center */}
      <mesh ref={coreRef} position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
      </mesh>

      {/* Plasma cannon on top */}
      <mesh ref={cannonRef} position={[0, 0.5, 0.1]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>

      {/* Cannon barrel tip */}
      <mesh position={[0, 0.72, 0.25]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
        <meshStandardMaterial color="#555555" flatShading />
      </mesh>

      {/* Energy glow at barrel tip */}
      {isAttacking && (
        <>
          <GlowSphere position={[0, 0.78, 0.3]} radius={0.15} color="#00ccff" intensity={3} />

          {/* Plasma orb projectile */}
          <mesh ref={plasmaRef} position={[0, 0.78, 0.35]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#00ccff" emissive="#00aaff" emissiveIntensity={2.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

export function ProtossNexus({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 4.5,
  teamColor = "#f1c40f",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const crystalRef = useRef<Mesh>(null);

  // Crystal pulse animation
  useFrame(({ clock }) => {
    if (crystalRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 2) * 0.5 + 2;
      (crystalRef.current.material as any).emissiveIntensity = pulse;
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Golden base structure */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1, 0.3, 1]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Elegant pillars at corners */}
      <mesh position={[-0.4, 0.5, -0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>
      <mesh position={[0.4, 0.5, -0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>
      <mesh position={[-0.4, 0.5, 0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>
      <mesh position={[0.4, 0.5, 0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>

      {/* Central blue energy crystal - large and glowing */}
      <mesh ref={crystalRef} position={[0, 0.65, 0]}>
        <coneGeometry args={[0.25, 0.8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} transparent opacity={0.9} />
      </mesh>

      {/* Floating crystal details */}
      <GlowSphere position={[-0.3, 0.9, 0]} radius={0.08} color="#00ccff" intensity={2} />
      <GlowSphere position={[0.3, 0.9, 0]} radius={0.08} color="#00ccff" intensity={2} />
      <GlowSphere position={[0, 0.9, -0.3]} radius={0.08} color="#00ccff" intensity={2} />
      <GlowSphere position={[0, 0.9, 0.3]} radius={0.08} color="#00ccff" intensity={2} />

      {/* Top platform */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Blue energy glow at base */}
      <GlowSphere position={[0, 0.35, 0]} radius={0.15} color="#00ccff" intensity={1.5} />
    </group>
  );
}

export function ProtossGateway({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 3.6,
  teamColor = "#f1c40f",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const portalRef = useRef<Mesh>(null);

  // Portal pulse animation
  useFrame(({ clock }) => {
    if (portalRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 3) * 0.3 + 1.5;
      (portalRef.current.material as any).emissiveIntensity = pulse;
      portalRef.current.scale.set(1, 1 + Math.sin(clock.elapsedTime * 3) * 0.05, 1);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Golden arch structure - left pillar */}
      <mesh position={[-0.35, 0.5, 0]}>
        <boxGeometry args={[0.15, 1, 0.2]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Right pillar */}
      <mesh position={[0.35, 0.5, 0]}>
        <boxGeometry args={[0.15, 1, 0.2]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Top beam */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.85, 0.15, 0.2]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Crystal accents at top corners */}
      <mesh position={[-0.35, 1.15, 0]}>
        <coneGeometry args={[0.06, 0.15, 4]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0.35, 1.15, 0]}>
        <coneGeometry args={[0.06, 0.15, 4]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.08, 0.2, 4]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.5} />
      </mesh>

      {/* Blue portal energy in center */}
      <mesh ref={portalRef} position={[0, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.9, 0.05]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>

      {/* Blue energy particles/glow */}
      <GlowSphere position={[0, 0.3, 0.08]} radius={0.08} color="#00ccff" intensity={2} />
      <GlowSphere position={[0, 0.7, 0.08]} radius={0.08} color="#00ccff" intensity={2} />
      <GlowSphere position={[-0.15, 0.5, 0.08]} radius={0.06} color="#00ccff" intensity={2} />
      <GlowSphere position={[0.15, 0.5, 0.08]} radius={0.06} color="#00ccff" intensity={2} />

      {/* Base */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.25]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>
    </group>
  );
}

export function ProtossPhotonCannon({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 2.4,
  teamColor = "#f1c40f",
  isMoving = false,
  isAttacking = false,
}: UnitModelProps) {
  const coreRef = useRef<Mesh>(null);
  const barrelRef = useRef<Mesh>(null);
  const boltRef = useRef<Mesh>(null);

  // Attack: energy pulse (scale + brightness) + cannon recoil
  useFrame(({ clock }) => {
    if (coreRef.current && isAttacking) {
      const pulse = Math.sin(clock.elapsedTime * 15);
      const scale = 1 + pulse * 0.2;
      coreRef.current.scale.set(scale, scale, scale);
      (coreRef.current.material as any).emissiveIntensity = 2 + pulse * 1.5;
    }
    if (barrelRef.current && isAttacking) {
      barrelRef.current.position.y = 0.5 - Math.abs(Math.sin(clock.elapsedTime * 15)) * 0.08;
    }

    // Crackling ball projectile
    if (boltRef.current && isAttacking) {
      const progress = (clock.elapsedTime * 4) % 1;
      boltRef.current.position.z = 0.2 + progress * 2.3;
      boltRef.current.visible = progress < 0.75;
      // Crackling effect - rapid scale pulsing
      const crackle = 1 + Math.sin(clock.elapsedTime * 30) * 0.3;
      boltRef.current.scale.set(crackle, crackle, crackle);
    }
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Golden base platform */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 0.3, 8]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Central blue energy weapon core */}
      <mesh ref={coreRef} position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={2} />
      </mesh>

      {/* Cannon barrel pointing upward */}
      <mesh ref={barrelRef} position={[0, 0.5, 0]} rotation={[Math.PI / 6, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.4, 8]} />
        <meshStandardMaterial color="#d4af37" flatShading />
      </mesh>

      {/* Crystal focus lens at barrel tip */}
      <mesh position={[0, 0.68, 0.15]}>
        <coneGeometry args={[0.06, 0.12, 4]} />
        <meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={1.5} transparent opacity={0.8} />
      </mesh>

      {/* Golden support structures */}
      <mesh position={[-0.2, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>
      <mesh position={[0.2, 0.25, 0]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>
      <mesh position={[0, 0.25, -0.2]}>
        <boxGeometry args={[0.08, 0.35, 0.08]} />
        <meshStandardMaterial color={teamColor} flatShading />
      </mesh>

      {/* Attack energy pulse */}
      {isAttacking && (
        <>
          <GlowSphere position={[0, 0.75, 0.2]} radius={0.18} color="#00ccff" intensity={4} />

          {/* Crackling energy ball projectile */}
          <mesh ref={boltRef} position={[0, 0.75, 0.2]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#00ccff" emissive="#0099ff" emissiveIntensity={3} />
          </mesh>
        </>
      )}

      {/* Ambient energy glow */}
      <GlowSphere position={[0, 0.35, 0]} radius={0.12} color="#00ccff" intensity={1} />
    </group>
  );
}

// ============================================================================
// SWITCH COMPONENT
// ============================================================================

export function StarcraftModel({
  model,
  ...props
}: UnitModelProps & { model: ModelName }) {
  switch (model) {
    case "TerranMarine": return <TerranMarine {...props} />;
    case "TerranFirebat": return <TerranFirebat {...props} />;
    case "TerranCommandCenter": return <TerranCommandCenter {...props} />;
    case "TerranBarracks": return <TerranBarracks {...props} />;
    case "TerranBunker": return <TerranBunker {...props} />;
    case "ZergLarva": return <ZergLarva {...props} />;
    case "ZergCocoon": return <ZergCocoon {...props} />;
    case "Zergling": return <Zergling {...props} />;
    case "Hydralisk": return <Hydralisk {...props} />;
    case "ZergHatchery": return <ZergHatchery {...props} />;
    case "ZergSpawningPool": return <ZergSpawningPool {...props} />;
    case "ZergCreepColony": return <ZergCreepColony {...props} />;
    case "ZergSunkenColony": return <ZergSunkenColony {...props} />;
    case "ProtossZealot": return <ProtossZealot {...props} />;
    case "ProtossDragoon": return <ProtossDragoon {...props} />;
    case "ProtossNexus": return <ProtossNexus {...props} />;
    case "ProtossGateway": return <ProtossGateway {...props} />;
    case "ProtossPhotonCannon": return <ProtossPhotonCannon {...props} />;
    default: return null;
  }
}

// ============================================================================
// FACTION SHOWCASE
// ============================================================================

export function FactionModelShowcase() {
  const terranModels: ModelName[] = ["TerranMarine", "TerranFirebat", "TerranCommandCenter", "TerranBarracks", "TerranBunker"];
  const zergModels: ModelName[] = ["ZergLarva", "ZergCocoon", "Zergling", "Hydralisk", "ZergHatchery", "ZergSpawningPool", "ZergCreepColony", "ZergSunkenColony"];
  const protossModels: ModelName[] = ["ProtossZealot", "ProtossDragoon", "ProtossNexus", "ProtossGateway", "ProtossPhotonCannon"];

  return (
    <group>
      {/* Terran row */}
      {terranModels.map((model, i) => (
        <StarcraftModel
          key={model}
          model={model}
          position={[i * 3 - 7, 0, -8]}
          teamColor="#4a9eff"
        />
      ))}

      {/* Zerg row */}
      {zergModels.map((model, i) => (
        <StarcraftModel
          key={model}
          model={model}
          position={[i * 3 - 10.5, 0, 0]}
          teamColor="#9b59b6"
        />
      ))}

      {/* Protoss row */}
      {protossModels.map((model, i) => (
        <StarcraftModel
          key={model}
          model={model}
          position={[i * 3 - 6, 0, 8]}
          teamColor="#f1c40f"
        />
      ))}
    </group>
  );
}
