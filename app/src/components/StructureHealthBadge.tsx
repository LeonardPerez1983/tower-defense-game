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
  workerCount?: number;
  maxWorkers?: number;
}

export default function StructureHealthBadge({
  hp,
  maxHp,
  shield = 0,
  maxShield = 0,
  faction,
  recentlyDamaged = false,
  showNumber = true,
  workerCount,
  maxWorkers = 5,
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
          shield: "#60a5fa", // Blue for shields
          hp: "#22c55e", // Green for HP (same as other factions)
          damaged: "#ef4444", // Red when damaged
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

  // Pip color based on faction
  const pipColor = faction === "terran" ? "#60a5fa" : faction === "protoss" ? "#fbbf24" : "#a855f7";

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[50px]">
      {/* Bar container - smaller and thinner */}
      <div className="w-full">
        {/* HP bar (rendered first, appears below) */}
        <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden mb-0.5">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${healthPercent}%`,
              backgroundColor: hpColor,
            }}
          />
        </div>

        {/* Shield bar (Protoss only, rendered second, appears above) */}
        {hasShields && (
          <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${shieldPercent}%`,
                backgroundColor: colors.shield,
              }}
            />
          </div>
        )}
      </div>

      {/* Worker pips (for main buildings only) */}
      {workerCount !== undefined && maxWorkers > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: maxWorkers }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: i < workerCount ? pipColor : "#444",
                opacity: i < workerCount ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
