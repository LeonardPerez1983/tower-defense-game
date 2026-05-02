/**
 * VictoryEffect - Victory celebration effects
 */

import CanvasParticles from "./CanvasParticles";

type Faction = "terran" | "protoss" | "zerg";

interface VictoryEffectProps {
  playerFaction?: Faction;
}

export default function VictoryEffect({ playerFaction = "terran" }: VictoryEffectProps) {
  const getFactionColor = (faction: Faction) => {
    switch (faction) {
      case "terran":
        return "from-cyan-500 to-blue-600";
      case "protoss":
        return "from-yellow-500 to-yellow-600";
      case "zerg":
        return "from-purple-500 to-purple-600";
    }
  };

  return (
    <>
      {/* Confetti particles */}
      <CanvasParticles type="confetti" />

      {/* Firework particles */}
      <CanvasParticles type="fireworks" />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial ${getFactionColor(playerFaction)} opacity-20 rounded-full blur-3xl animate-pulse`} />
      </div>
    </>
  );
}
