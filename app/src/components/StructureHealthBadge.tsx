/**
 * StructureHealthBadge - In-world HP display for structures
 *
 * Shows HP bars for important structures with faction styling.
 * Supports Protoss shields and damage feedback.
 */

import { Faction } from "../game/visuals/starcraftVisualConfig";

interface Props {
  hp: number;
  maxHp: number;
  shield?: number;
  maxShield?: number;
  faction?: Faction;
  recentlyDamaged?: boolean;
  showNumber?: boolean;
}

export default function StructureHealthBadge({
  hp,
  maxHp,
  shield = 0,
  maxShield = 0,
  faction,
  recentlyDamaged = false,
  showNumber = true,
}: Props) {
  const healthPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const shieldPercent = maxShield > 0 ? Math.max(0, Math.min(100, (shield / maxShield) * 100)) : 0;
  const hasShields = maxShield > 0;

  // Faction-specific colors
  const getFactionColors = () => {
    switch (faction) {
      case "terran":
        return {
          shield: "#60a5fa",
          hp: "#22c55e",
          damaged: "#ef4444",
        };
      case "protoss":
        return {
          shield: "#fbbf24", // Yellow/gold for shields
          hp: "#3b82f6", // Blue for HP
          damaged: "#1e40af", // Darker blue when damaged
        };
      case "zerg":
        return {
          shield: "#a855f7",
          hp: "#84cc16",
          damaged: "#dc2626",
        };
      default:
        return {
          shield: "#60a5fa",
          hp: "#22c55e",
          damaged: "#ef4444",
        };
    }
  };

  const colors = getFactionColors();
  const hpColor = healthPercent < 30 ? colors.damaged : colors.hp;

  return (
    <div className="flex items-center gap-2 min-w-[60px]">
      {/* Bar container */}
      <div className="flex-1">
        {/* Shield bar (Protoss only) */}
        {hasShields && (
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${shieldPercent}%`,
                backgroundColor: colors.shield,
              }}
            />
          </div>
        )}

        {/* HP bar */}
        <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${healthPercent}%`,
              backgroundColor: hpColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
