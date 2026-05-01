/**
 * StarcraftAnimationHelpers - Reusable animation helpers for primitive models
 *
 * Simple transform-based animations using useFrame.
 * No skeletal animation, no imported clips.
 */

import { useFrame } from "@react-three/fiber";
import { RefObject } from "react";
import { Group } from "three";

// ============================================================================
// IDLE ANIMATIONS
// ============================================================================

/**
 * Gentle vertical bob for idle units
 */
export function useIdleBob(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.03,
  speed: number = 2
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amplitude;
  });
}

/**
 * Organic pulse (scale) for cocoons, eggs, bio structures
 */
export function usePulse(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.05,
  speed: number = 1.5
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * speed) * amplitude;
    ref.current.scale.set(pulse, pulse, pulse);
  });
}

/**
 * Small wiggle for larvae
 */
export function useWiggle(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.1,
  speed: number = 4
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * speed) * amplitude;
  });
}

// ============================================================================
// MOVEMENT ANIMATIONS
// ============================================================================

/**
 * Bouncy movement bob (walking/running)
 */
export function useMoveBob(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.08,
  speed: number = 8
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.position.y = Math.abs(Math.sin(clock.elapsedTime * speed)) * amplitude;
  });
}

/**
 * Crawler/quadruped scamper (Zergling)
 */
export function useCrawlerBob(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.06,
  speed: number = 10
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.position.y = Math.abs(Math.sin(clock.elapsedTime * speed)) * amplitude;
    // Slight side-to-side
    ref.current.rotation.z = Math.sin(clock.elapsedTime * speed * 0.5) * 0.05;
  });
}

/**
 * Slithering motion (Hydralisk)
 */
export function useSlither(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.04,
  speed: number = 6
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amplitude;
    ref.current.rotation.z = Math.sin(clock.elapsedTime * speed * 0.8) * 0.08;
  });
}

/**
 * Mechanical walker bob (Dragoon)
 */
export function useWalkerBob(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.1,
  speed: number = 6
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    // Step-like motion (square wave approximation)
    const step = Math.floor(clock.elapsedTime * speed) % 2;
    ref.current.position.y = step * amplitude;
  });
}

/**
 * Hover/float motion (Protoss units with anti-gravity)
 */
export function useHoverFloat(
  ref: RefObject<Group>,
  enabled: boolean = true,
  amplitude: number = 0.05,
  speed: number = 2
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * speed) * amplitude + amplitude;
  });
}

// ============================================================================
// ATTACK ANIMATIONS
// ============================================================================

/**
 * Ranged weapon recoil (rifles, cannons)
 */
export function useRangedRecoil(
  ref: RefObject<Group>,
  enabled: boolean = true,
  intensity: number = 0.05,
  speed: number = 12
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    const recoil = Math.max(0, Math.sin(clock.elapsedTime * speed)) * intensity;
    ref.current.rotation.x = -recoil;
  });
}

/**
 * Melee lunge (Zergling, Zealot)
 */
export function useMeleeLunge(
  ref: RefObject<Group>,
  enabled: boolean = true,
  intensity: number = 0.15,
  speed: number = 8
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    const lunge = Math.max(0, Math.sin(clock.elapsedTime * speed));
    ref.current.position.z = lunge * intensity;
    ref.current.rotation.x = lunge * 0.2;
  });
}

/**
 * Heavy weapon burst (Firebat, heavy units)
 */
export function useHeavyBurst(
  ref: RefObject<Group>,
  enabled: boolean = true,
  intensity: number = 0.08,
  speed: number = 6
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    const burst = Math.max(0, Math.sin(clock.elapsedTime * speed));
    ref.current.rotation.x = -burst * intensity;
    ref.current.position.y = -burst * intensity * 0.5;
  });
}

/**
 * Building attack pulse (Sunken Colony, Photon Cannon)
 */
export function useBuildingAttackPulse(
  ref: RefObject<Group>,
  enabled: boolean = true,
  intensity: number = 0.1,
  speed: number = 8
) {
  useFrame(({ clock }) => {
    if (!ref.current || !enabled) return;
    const pulse = Math.max(0, Math.sin(clock.elapsedTime * speed));
    const scale = 1 + pulse * intensity;
    ref.current.scale.set(scale, scale, scale);
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combine multiple animation effects
 */
export function useAnimationState(
  ref: RefObject<Group>,
  isMoving: boolean,
  isAttacking: boolean,
  moveStyle: "none" | "walker" | "crawler" | "slither" | "hover" = "walker",
  attackStyle: "none" | "melee_lunge" | "ranged_recoil" | "heavy_burst" = "none"
) {
  // Movement animations
  switch (moveStyle) {
    case "walker":
      useMoveBob(ref, isMoving);
      break;
    case "crawler":
      useCrawlerBob(ref, isMoving);
      break;
    case "slither":
      useSlither(ref, isMoving);
      break;
    case "hover":
      useHoverFloat(ref, isMoving);
      break;
  }

  // Attack animations
  switch (attackStyle) {
    case "melee_lunge":
      useMeleeLunge(ref, isAttacking);
      break;
    case "ranged_recoil":
      useRangedRecoil(ref, isAttacking);
      break;
    case "heavy_burst":
      useHeavyBurst(ref, isAttacking);
      break;
  }

  // Idle animation when not moving or attacking
  const isIdle = !isMoving && !isAttacking;
  useIdleBob(ref, isIdle);
}
