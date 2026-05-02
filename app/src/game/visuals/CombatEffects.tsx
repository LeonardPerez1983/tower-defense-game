/**
 * CombatEffects - Visual effects for combat (projectiles, muzzle flashes, impacts)
 */

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { AttackVfxType } from "./starcraftVisualConfig";

// ============================================================================
// PROJECTILE COMPONENT
// ============================================================================

export interface Projectile {
  id: string;
  startPos: [number, number, number];
  endPos: [number, number, number];
  vfxType: AttackVfxType;
  startTime: number;
  duration: number; // milliseconds to reach target
}

interface ProjectileProps {
  projectile: Projectile;
  onComplete: (id: string) => void;
}

export function ProjectileVFX({ projectile, onComplete }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    const elapsed = performance.now() - projectile.startTime;
    progress.current = Math.min(1, elapsed / projectile.duration);

    // Lerp position
    const [sx, sy, sz] = projectile.startPos;
    const [ex, ey, ez] = projectile.endPos;

    meshRef.current.position.x = sx + (ex - sx) * progress.current;
    meshRef.current.position.y = sy + (ey - sy) * progress.current;
    meshRef.current.position.z = sz + (ez - sz) * progress.current;

    // Complete when reached target
    if (progress.current >= 1) {
      onComplete(projectile.id);
    }
  });

  // Different visuals per VFX type
  const renderProjectile = () => {
    switch (projectile.vfxType) {
      case "terran_bullet":
        return (
          <>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffaa00"
              emissiveIntensity={2.0}
            />
          </>
        );

      case "terran_flame":
        return (
          <>
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial
              color="#ff4400"
              emissive="#ff6600"
              emissiveIntensity={2.5}
              transparent
              opacity={0.8}
            />
          </>
        );

      case "zerg_spine":
        return (
          <>
            <coneGeometry args={[0.12, 0.6, 6]} />
            <meshStandardMaterial
              color="#8844ff"
              emissive="#aa44ff"
              emissiveIntensity={1.5}
            />
          </>
        );

      case "protoss_plasma":
        return (
          <>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial
              color="#4a9eff"
              emissive="#60a5fa"
              emissiveIntensity={2.0}
            />
          </>
        );

      case "protoss_cannon_bolt":
        return (
          <>
            <sphereGeometry args={[0.35, 8, 8]} />
            <meshStandardMaterial
              color="#00ffaa"
              emissive="#00ffaa"
              emissiveIntensity={2.5}
            />
          </>
        );

      case "zerg_tentacle":
        return (
          <>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial
              color="#663399"
              emissive="#883399"
              emissiveIntensity={1.2}
            />
          </>
        );

      default:
        // Generic projectile
        return (
          <>
            <sphereGeometry args={[0.25, 8, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={1.5}
            />
          </>
        );
    }
  };

  return <mesh ref={meshRef}>{renderProjectile()}</mesh>;
}

// ============================================================================
// MUZZLE FLASH COMPONENT
// ============================================================================

export interface MuzzleFlash {
  id: string;
  position: [number, number, number];
  vfxType: AttackVfxType;
  startTime: number;
}

interface MuzzleFlashProps {
  flash: MuzzleFlash;
  onComplete: (id: string) => void;
}

export function MuzzleFlashVFX({ flash, onComplete }: MuzzleFlashProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const duration = 150; // ms

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = performance.now() - flash.startTime;
    const progress = Math.min(1, elapsed / duration);

    // Fade out quickly
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = 1 - progress;
    }

    // Scale up slightly
    const scale = 1 + progress * 0.3;
    meshRef.current.scale.set(scale, scale, scale);

    if (progress >= 1) {
      onComplete(flash.id);
    }
  });

  // Color based on VFX type
  const getFlashColor = () => {
    switch (flash.vfxType) {
      case "terran_bullet":
        return "#ffaa00";
      case "terran_flame":
        return "#ff4400";
      case "protoss_plasma":
      case "protoss_cannon_bolt":
        return "#4a9eff";
      case "zerg_spine":
      case "zerg_tentacle":
        return "#aa44ff";
      default:
        return "#ffffff";
    }
  };

  const color = getFlashColor();

  return (
    <mesh ref={meshRef} position={flash.position}>
      <sphereGeometry args={[0.4, 8, 8]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3.0}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

// ============================================================================
// MELEE IMPACT EFFECT
// ============================================================================

export interface MeleeImpact {
  id: string;
  position: [number, number, number];
  startTime: number;
}

interface MeleeImpactProps {
  impact: MeleeImpact;
  onComplete: (id: string) => void;
}

export function MeleeImpactVFX({ impact, onComplete }: MeleeImpactProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const duration = 200; // ms

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = performance.now() - impact.startTime;
    const progress = Math.min(1, elapsed / duration);

    // Expand and fade
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = 1 - progress;
    }

    const scale = 0.5 + progress * 0.8;
    meshRef.current.scale.set(scale, scale, scale);

    if (progress >= 1) {
      onComplete(impact.id);
    }
  });

  return (
    <mesh ref={meshRef} position={impact.position}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive="#ffffff"
        emissiveIntensity={2.0}
        transparent
        opacity={1}
      />
    </mesh>
  );
}

// ============================================================================
// DEATH EXPLOSION EFFECT
// ============================================================================

export interface DeathExplosion {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  startTime: number;
}

interface DeathExplosionProps {
  explosion: DeathExplosion;
  onComplete: (id: string) => void;
}

export function DeathExplosionVFX({ explosion, onComplete }: DeathExplosionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const duration = 400; // ms

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = performance.now() - explosion.startTime;
    const progress = Math.min(1, elapsed / duration);

    // Expand and fade
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = 1 - progress;
    }

    const scale = 0.5 + progress * 2;
    meshRef.current.scale.set(scale, scale, scale);

    if (progress >= 1) {
      onComplete(explosion.id);
    }
  });

  return (
    <mesh ref={meshRef} position={explosion.position}>
      <sphereGeometry args={[explosion.size, 12, 12]} />
      <meshStandardMaterial
        color={explosion.color}
        emissive={explosion.color}
        emissiveIntensity={1.5}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
