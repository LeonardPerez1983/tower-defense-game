/**
 * StarcraftLightingRig - Reusable lighting setup for StarCraft-themed battles
 *
 * Provides a balanced lighting setup optimized for gameplay readability
 * in a dark space environment while maintaining visual polish.
 */

import { ContactShadows } from "@react-three/drei";

type Faction = "terran" | "zerg" | "protoss";

interface StarcraftLightingRigProps {
  faction?: Faction;
  quality?: "low" | "medium" | "high";
  enableShadows?: boolean;
  enableFactionAccent?: boolean;
}

// Faction-specific accent light colors
const FACTION_COLORS: Record<Faction, { primary: string; secondary: string }> = {
  terran: { primary: "#4a9eff", secondary: "#ffb366" }, // Cool blue / amber
  zerg: { primary: "#9d4edd", secondary: "#52b788" },   // Purple / green
  protoss: { primary: "#3d85c6", secondary: "#ffd700" }, // Blue / gold
};

export default function StarcraftLightingRig({
  faction = "terran",
  quality = "medium",
  enableShadows = true,
  enableFactionAccent = true,
}: StarcraftLightingRigProps) {
  // Quality settings
  const shadowQuality = quality === "high" ? 2048 : quality === "medium" ? 1024 : 512;
  const contactShadowResolution = quality === "high" ? 1024 : quality === "medium" ? 512 : 256;

  // Faction accent configuration
  const factionColor = FACTION_COLORS[faction];

  return (
    <>
      {/* ===== AMBIENT / FILL LIGHT ===== */}
      {/* SC2-style: Much darker ambient for dramatic contrast */}
      <hemisphereLight
        args={["#3a4a7a", "#1a1e3a", 0.3]} // Cool blue sky, dark ground, low intensity
        position={[0, 10, 0]}
      />

      {/* Minimal ambient - SC2 has very dark shadows */}
      <ambientLight intensity={0.15} color="#4a5a7a" />

      {/* ===== KEY LIGHT (Main Directional) ===== */}
      {/* SC2-style: Sharp, cooler white with strong shadows */}
      <directionalLight
        position={[12, 18, 8]}
        intensity={2.2}
        color="#e8f0ff"
        castShadow={enableShadows}
        shadow-mapSize-width={shadowQuality}
        shadow-mapSize-height={shadowQuality}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-bias={-0.0005}
      />

      {/* ===== RIM LIGHT (Back/Side Light) ===== */}
      {/* SC2-style: Strong cool rim for silhouette separation */}
      <directionalLight
        position={[-10, 14, -12]}
        intensity={1.4}
        color="#6ba5ff"
      />

      {/* ===== FILL LIGHT (Opposite Side) ===== */}
      {/* SC2-style: Very subtle cool fill */}
      <directionalLight
        position={[-6, 10, 5]}
        intensity={0.3}
        color="#8aa8d0"
      />

      {/* ===== FACTION ACCENT LIGHTS ===== */}
      {/* Optional subtle colored lights to reinforce faction identity */}
      {enableFactionAccent && (
        <>
          {/* Primary faction color - player side */}
          <pointLight
            position={[0, 6, 8]}
            intensity={0.8}
            color={factionColor.primary}
            distance={12}
            decay={2}
          />

          {/* Secondary faction color - subtle accent */}
          <pointLight
            position={[0, 4, -8]}
            intensity={0.4}
            color={factionColor.secondary}
            distance={10}
            decay={2}
          />
        </>
      )}

      {/* ===== CONTACT SHADOWS ===== */}
      {/* SC2-style: Darker, sharper shadows for better definition */}
      {enableShadows && (
        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.65}
          scale={30}
          blur={1.5}
          far={10}
          resolution={contactShadowResolution}
          color="#000000"
        />
      )}
    </>
  );
}
