/**
 * CardIcons - SVG icon library for command cards
 *
 * Simple inline SVG icons for all cards (units, buildings, workers).
 * No external assets required.
 */

import { Faction } from "../../game/visuals/starcraftVisualConfig";

interface CardIconProps {
  cardId: string;
  faction?: Faction;
  className?: string;
}

export default function CardIcon({ cardId, faction, className = "" }: CardIconProps) {
  const getFactionColor = () => {
    switch (faction) {
      case "terran":
        return "#4a9eff";
      case "protoss":
        return "#f1c40f";
      case "zerg":
        return "#9b59b6";
      default:
        return "#888888";
    }
  };

  const color = getFactionColor();

  // Render appropriate icon based on card ID
  switch (cardId) {
    // ========== TERRAN UNITS ==========
    case "worker":
    case "scv":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* SCV helmet and body */}
          <rect x="20" y="12" width="24" height="20" rx="4" fill={color} />
          <rect x="24" y="32" width="16" height="24" rx="2" fill={color} opacity="0.8" />
          {/* Visor */}
          <rect x="24" y="16" width="16" height="8" fill="#222" opacity="0.6" />
          {/* Tool arm */}
          <path d="M 44 40 L 56 36 L 54 42 L 44 44 Z" fill={color} opacity="0.7" />
        </svg>
      );

    case "zerg_drone":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Organic worker body */}
          <ellipse cx="32" cy="38" rx="16" ry="14" fill={color} opacity="0.9" />
          {/* Head */}
          <ellipse cx="32" cy="26" rx="10" ry="9" fill={color} />
          {/* Mandibles/claws */}
          <path d="M 22 30 L 16 26 L 20 28 Z" fill={color} opacity="0.7" />
          <path d="M 42 30 L 48 26 L 44 28 Z" fill={color} opacity="0.7" />
          {/* Spine details */}
          <circle cx="32" cy="22" r="2" fill={color} opacity="0.6" />
          <circle cx="28" cy="36" r="2" fill={color} opacity="0.5" />
          <circle cx="36" cy="36" r="2" fill={color} opacity="0.5" />
        </svg>
      );

    case "marine":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Marine helmet */}
          <rect x="22" y="10" width="20" height="18" rx="3" fill={color} />
          {/* Body armor */}
          <rect x="20" y="28" width="24" height="26" rx="2" fill={color} opacity="0.8" />
          {/* Visor */}
          <rect x="26" y="14" width="12" height="6" fill="#0af" opacity="0.8" />
          {/* Rifle */}
          <rect x="42" y="36" width="14" height="3" fill="#666" />
          <circle cx="54" cy="37.5" r="2" fill="#444" />
        </svg>
      );

    case "firebat":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Heavy helmet */}
          <rect x="20" y="8" width="24" height="22" rx="4" fill={color} />
          {/* Body */}
          <rect x="18" y="30" width="28" height="24" rx="2" fill={color} opacity="0.8" />
          {/* Flame nozzles (dual) */}
          <rect x="10" y="38" width="8" height="4" fill="#ff6600" />
          <rect x="46" y="38" width="8" height="4" fill="#ff6600" />
          {/* Visor */}
          <rect x="24" y="14" width="16" height="8" fill="#f60" opacity="0.7" />
        </svg>
      );

    // ========== TERRAN BUILDINGS ==========
    case "barracks":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Industrial building box */}
          <rect x="12" y="20" width="40" height="32" rx="2" fill={color} opacity="0.9" />
          {/* Roof */}
          <path d="M 10 20 L 32 10 L 54 20 Z" fill={color} />
          {/* Door */}
          <rect x="26" y="36" width="12" height="16" fill="#222" opacity="0.6" />
          {/* Windows */}
          <rect x="16" y="26" width="6" height="6" fill="#4af" opacity="0.5" />
          <rect x="42" y="26" width="6" height="6" fill="#4af" opacity="0.5" />
        </svg>
      );

    case "bunker":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Low defensive dome */}
          <ellipse cx="32" cy="40" rx="26" ry="18" fill={color} opacity="0.9" />
          {/* Gun ports */}
          <rect x="16" y="32" width="8" height="4" fill="#222" />
          <rect x="40" y="32" width="8" height="4" fill="#222" />
          {/* Top hatch */}
          <ellipse cx="32" cy="28" rx="10" ry="6" fill={color} opacity="0.7" />
        </svg>
      );

    case "command_center":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Large industrial HQ */}
          <rect x="8" y="16" width="48" height="36" rx="2" fill={color} opacity="0.9" />
          {/* Top structure */}
          <rect x="20" y="8" width="24" height="12" fill={color} />
          {/* Side wings */}
          <rect x="4" y="28" width="8" height="16" fill={color} opacity="0.7" />
          <rect x="52" y="28" width="8" height="16" fill={color} opacity="0.7" />
          {/* Windows */}
          <rect x="14" y="22" width="6" height="8" fill="#4af" opacity="0.5" />
          <rect x="28" y="22" width="8" height="8" fill="#4af" opacity="0.5" />
          <rect x="44" y="22" width="6" height="8" fill="#4af" opacity="0.5" />
        </svg>
      );

    // ========== ZERG UNITS ==========
    case "larva":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Small worm blob */}
          <ellipse cx="32" cy="36" rx="16" ry="12" fill={color} opacity="0.9" />
          <ellipse cx="28" cy="32" rx="10" ry="8" fill={color} />
          {/* Segments */}
          <circle cx="24" cy="36" r="3" fill={color} opacity="0.6" />
          <circle cx="32" cy="36" r="3" fill={color} opacity="0.6" />
          <circle cx="40" cy="36" r="3" fill={color} opacity="0.6" />
        </svg>
      );

    case "zergling":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Low clawed creature */}
          <ellipse cx="32" cy="38" rx="18" ry="14" fill={color} opacity="0.9" />
          {/* Head */}
          <ellipse cx="28" cy="28" rx="12" ry="10" fill={color} />
          {/* Claws */}
          <path d="M 16 38 L 10 32 L 14 36 Z" fill={color} opacity="0.7" />
          <path d="M 48 38 L 54 32 L 50 36 Z" fill={color} opacity="0.7" />
          {/* Spine ridge */}
          <path d="M 32 24 L 34 18 L 36 24 Z" fill={color} opacity="0.6" />
        </svg>
      );

    case "hydralisk":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Serpent body */}
          <ellipse cx="32" cy="42" rx="14" ry="18" fill={color} opacity="0.9" />
          {/* Head with spines */}
          <ellipse cx="32" cy="24" rx="10" ry="12" fill={color} />
          {/* Spine motifs */}
          <path d="M 24 20 L 22 12 L 26 18 Z" fill={color} opacity="0.7" />
          <path d="M 32 18 L 32 10 L 34 18 Z" fill={color} opacity="0.7" />
          <path d="M 40 20 L 42 12 L 38 18 Z" fill={color} opacity="0.7" />
          {/* Scythe claws */}
          <path d="M 20 36 L 12 30 L 18 34 Z" fill={color} opacity="0.6" />
          <path d="M 44 36 L 52 30 L 46 34 Z" fill={color} opacity="0.6" />
        </svg>
      );

    // ========== ZERG BUILDINGS ==========
    case "zerg_hatchery":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Organic mound */}
          <ellipse cx="32" cy="42" rx="28" ry="20" fill={color} opacity="0.9" />
          <ellipse cx="32" cy="32" rx="22" ry="16" fill={color} />
          {/* Spawn openings */}
          <ellipse cx="22" cy="36" rx="6" ry="8" fill="#222" opacity="0.5" />
          <ellipse cx="42" cy="36" rx="6" ry="8" fill="#222" opacity="0.5" />
          {/* Organic details */}
          <path d="M 32 20 Q 28 24 32 28 Q 36 24 32 20 Z" fill={color} opacity="0.6" />
        </svg>
      );

    case "spawning_pool":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pool base */}
          <ellipse cx="32" cy="44" rx="24" ry="16" fill={color} opacity="0.8" />
          {/* Egg cluster */}
          <ellipse cx="24" cy="36" rx="8" ry="10" fill={color} opacity="0.9" />
          <ellipse cx="32" cy="32" rx="10" ry="12" fill={color} />
          <ellipse cx="40" cy="36" rx="8" ry="10" fill={color} opacity="0.9" />
          {/* Organic veins */}
          <path d="M 32 28 Q 26 32 24 38" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M 32 28 Q 38 32 40 38" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
      );

    case "hydralisk_den":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Den base */}
          <ellipse cx="32" cy="46" rx="26" ry="14" fill={color} opacity="0.8" />
          {/* Central structure */}
          <ellipse cx="32" cy="32" rx="18" ry="20" fill={color} opacity="0.9" />
          {/* Spine motifs (Hydralisk characteristic) */}
          <path d="M 22 28 L 18 18 L 24 26 Z" fill={color} opacity="0.7" />
          <path d="M 32 24 L 32 14 L 34 24 Z" fill={color} opacity="0.7" />
          <path d="M 42 28 L 46 18 L 40 26 Z" fill={color} opacity="0.7" />
          {/* Opening */}
          <ellipse cx="32" cy="36" rx="8" ry="10" fill="#222" opacity="0.5" />
          {/* Organic veins */}
          <path d="M 32 30 Q 24 34 20 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M 32 30 Q 40 34 44 40" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
        </svg>
      );

    case "creep_colony":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Organic stalk tower */}
          <ellipse cx="32" cy="48" rx="16" ry="10" fill={color} opacity="0.7" />
          <rect x="26" y="26" width="12" height="26" rx="4" fill={color} opacity="0.9" />
          {/* Top bulb */}
          <ellipse cx="32" cy="22" rx="12" ry="10" fill={color} />
          {/* Tendrils */}
          <path d="M 26 28 Q 18 26 16 32" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M 38 28 Q 46 26 48 32" stroke={color} strokeWidth="2" fill="none" opacity="0.6" />
        </svg>
      );

    case "sunken_colony":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Larger spine tower */}
          <ellipse cx="32" cy="50" rx="20" ry="12" fill={color} opacity="0.8" />
          <rect x="24" y="24" width="16" height="30" rx="4" fill={color} opacity="0.9" />
          {/* Tentacles emerging */}
          <path d="M 32 20 Q 22 16 18 24" stroke={color} strokeWidth="3" fill="none" opacity="0.8" />
          <path d="M 32 20 Q 42 16 46 24" stroke={color} strokeWidth="3" fill="none" opacity="0.8" />
          {/* Spine tips */}
          <circle cx="18" cy="24" r="3" fill={color} />
          <circle cx="46" cy="24" r="3" fill={color} />
        </svg>
      );

    // ========== PROTOSS UNITS ==========
    case "protoss_probe":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floating probe body */}
          <ellipse cx="32" cy="32" rx="14" ry="16" fill={color} opacity="0.9" />
          {/* Crystal core */}
          <path d="M 32 22 L 38 28 L 32 34 L 26 28 Z" fill="#0cf" opacity="0.8" />
          {/* Hover field */}
          <ellipse cx="32" cy="48" rx="12" ry="4" fill={color} opacity="0.4" />
          {/* Energy arms */}
          <rect x="16" y="30" width="10" height="2" fill={color} opacity="0.6" />
          <rect x="38" y="30" width="10" height="2" fill={color} opacity="0.6" />
        </svg>
      );

    case "zealot":
    case "protoss_zealot":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Protoss warrior body */}
          <rect x="24" y="12" width="16" height="24" rx="2" fill={color} opacity="0.9" />
          <rect x="22" y="36" width="20" height="18" rx="2" fill={color} opacity="0.8" />
          {/* Helmet crest */}
          <path d="M 28 10 L 32 4 L 36 10 Z" fill={color} />
          {/* Psi blades */}
          <rect x="12" y="26" width="12" height="3" fill="#0cf" opacity="0.9" />
          <rect x="40" y="26" width="12" height="3" fill="#0cf" opacity="0.9" />
        </svg>
      );

    case "dragoon":
    case "protoss_dragoon":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Four-legged walker body */}
          <ellipse cx="32" cy="28" rx="16" ry="12" fill={color} opacity="0.9" />
          {/* Legs */}
          <rect x="18" y="40" width="4" height="14" fill={color} opacity="0.7" />
          <rect x="30" y="40" width="4" height="14" fill={color} opacity="0.7" />
          <rect x="42" y="40" width="4" height="14" fill={color} opacity="0.7" />
          {/* Head cannon */}
          <rect x="28" y="16" width="8" height="14" rx="2" fill={color} />
          <rect x="32" y="10" width="4" height="8" fill="#0cf" opacity="0.8" />
        </svg>
      );

    // ========== PROTOSS BUILDINGS ==========
    case "protoss_gateway":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Arch portal structure */}
          <rect x="16" y="20" width="8" height="32" rx="2" fill={color} opacity="0.9" />
          <rect x="40" y="20" width="8" height="32" rx="2" fill={color} opacity="0.9" />
          {/* Arch top */}
          <path d="M 16 20 Q 32 8 48 20" fill={color} />
          {/* Portal energy */}
          <rect x="24" y="28" width="16" height="20" fill="#0cf" opacity="0.3" />
          {/* Crystal accent */}
          <path d="M 32 18 L 36 22 L 32 26 L 28 22 Z" fill="#0cf" opacity="0.8" />
        </svg>
      );

    case "protoss_photon_cannon":
    case "protoss_cannon":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Orb cannon base */}
          <ellipse cx="32" cy="46" rx="18" ry="12" fill={color} opacity="0.8" />
          {/* Cannon orb */}
          <circle cx="32" cy="28" r="14" fill={color} opacity="0.9" />
          {/* Energy core */}
          <circle cx="32" cy="28" r="8" fill="#0cf" opacity="0.8" />
          {/* Emitters */}
          <rect x="20" y="26" width="6" height="4" fill="#0cf" opacity="0.7" />
          <rect x="38" y="26" width="6" height="4" fill="#0cf" opacity="0.7" />
        </svg>
      );

    case "protoss_nexus":
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Crystal temple base */}
          <ellipse cx="32" cy="50" rx="28" ry="12" fill={color} opacity="0.7" />
          {/* Main crystal structure */}
          <path d="M 32 10 L 48 38 L 16 38 Z" fill={color} opacity="0.9" />
          {/* Inner crystal core */}
          <path d="M 32 16 L 42 34 L 22 34 Z" fill="#0cf" opacity="0.6" />
          {/* Energy pylons */}
          <rect x="12" y="32" width="4" height="16" fill={color} opacity="0.7" />
          <rect x="48" y="32" width="4" height="16" fill={color} opacity="0.7" />
        </svg>
      );

    default:
      // Generic fallback icon
      return (
        <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="24" height="24" rx="4" fill="#888" opacity="0.7" />
          <circle cx="32" cy="32" r="8" fill="#aaa" />
        </svg>
      );
  }
}
