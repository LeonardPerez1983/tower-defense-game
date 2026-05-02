/**
 * WorkerPips - Worker count display as stars/pips
 *
 * Shows worker count as filled/unfilled stars (★★☆☆☆)
 * Positioned near the player command structure.
 */

import { useGameState } from "../engine/GameState";

interface Props {
  variant?: "stars" | "dots";
}

export default function WorkerPips({ variant = "stars" }: Props) {
  const { state } = useGameState();

  const current = state.playerWorkerCount;
  const max = state.maxWorkers;

  const filledIcon = variant === "stars" ? "★" : "●";
  const emptyIcon = variant === "stars" ? "☆" : "○";

  // Determine color based on faction
  const getFactionColor = () => {
    switch (state.playerFaction) {
      case "terran":
        return "text-cyan-400";
      case "protoss":
        return "text-yellow-400";
      case "zerg":
        return "text-purple-400";
      default:
        return "text-cyan-400";
    }
  };

  return (
    <div className="flex items-center gap-0.5 text-lg">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`${i < current ? getFactionColor() : 'text-gray-600'} drop-shadow-lg`}
        >
          {i < current ? filledIcon : emptyIcon}
        </span>
      ))}
    </div>
  );
}
