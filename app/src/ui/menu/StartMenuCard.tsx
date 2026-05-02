/**
 * StartMenuCard - Faction selection card
 */

import { ReactNode } from "react";

type Faction = "terran" | "protoss" | "zerg";

interface StartMenuCardProps {
  faction: Faction;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
}

export default function StartMenuCard({
  faction,
  label,
  description,
  selected,
  onClick,
  icon,
}: StartMenuCardProps) {
  const getFactionColors = (faction: Faction) => {
    switch (faction) {
      case "terran":
        return {
          border: "border-cyan-500",
          glow: "shadow-cyan-500/50",
          bg: "bg-cyan-500/10",
          icon: "text-cyan-400",
        };
      case "protoss":
        return {
          border: "border-yellow-500",
          glow: "shadow-yellow-500/50",
          bg: "bg-yellow-500/10",
          icon: "text-yellow-400",
        };
      case "zerg":
        return {
          border: "border-purple-500",
          glow: "shadow-purple-500/50",
          bg: "bg-purple-500/10",
          icon: "text-purple-400",
        };
    }
  };

  const colors = getFactionColors(faction);

  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-3 rounded-lg border-2 transition-all duration-300
        ${selected
          ? `${colors.border} ${colors.bg} shadow-lg ${colors.glow} scale-105`
          : "border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50"
        }
      `}
    >
      <div className={`w-12 h-12 mx-auto mb-2 ${selected ? colors.icon : "text-gray-600"}`}>
        {icon}
      </div>
      <p className="text-sm font-bold text-white mb-0.5">{label}</p>
      <p className="text-xs text-gray-400">{description}</p>
    </button>
  );
}
