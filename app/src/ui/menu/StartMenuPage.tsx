/**
 * StartMenuPage - Main start menu container
 */

import { useState } from "react";
import StartMenuBackground from "./StartMenuBackground";
import StartMenuCard from "./StartMenuCard";
import StartMenuButton from "./StartMenuButton";
import { TerranIcon, ProtossIcon, ZergIcon } from "./FactionIcons";

type Faction = "terran" | "protoss" | "zerg";

interface StartMenuPageProps {
  onStart?: (faction: Faction) => void;
  version?: string;
}

export default function StartMenuPage({ onStart, version = "v0.4.0" }: StartMenuPageProps) {
  const [selectedFaction, setSelectedFaction] = useState<Faction>("terran");

  const handleStart = () => {
    if (onStart) {
      onStart(selectedFaction);
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden">
      {/* Background layer */}
      <StartMenuBackground />

      {/* Menu content */}
      <div className="relative z-10 flex items-center justify-center h-full p-4 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Logo and title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <span className="text-white text-2xl font-bold">SR</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-1 tracking-wider">
              Star Royale
            </h1>
            <p className="text-xs text-gray-400">{version} — Multi-Faction Tactical Arena</p>
          </div>

          {/* Faction selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white text-center mb-3">
              Choose Your Faction
            </h2>
            <div className="flex gap-3">
              <StartMenuCard
                faction="terran"
                label="Terran"
                description="Versatile"
                selected={selectedFaction === "terran"}
                onClick={() => setSelectedFaction("terran")}
                icon={<TerranIcon className="w-full h-full" />}
              />
              <StartMenuCard
                faction="protoss"
                label="Protoss"
                description="Shields"
                selected={selectedFaction === "protoss"}
                onClick={() => setSelectedFaction("protoss")}
                icon={<ProtossIcon className="w-full h-full" />}
              />
              <StartMenuCard
                faction="zerg"
                label="Zerg"
                description="Swarm"
                selected={selectedFaction === "zerg"}
                onClick={() => setSelectedFaction("zerg")}
                icon={<ZergIcon className="w-full h-full" />}
              />
            </div>
          </div>

          {/* Game objective */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-white font-semibold text-center mb-2">
              🎯 Objective
            </p>
            <p className="text-xs text-gray-300 text-center mb-1">
              Destroy your enemy's HQ or deal the most damage in 3 minutes to win!
            </p>
            <p className="text-xs text-gray-500 text-center italic">CPU faction is random</p>
          </div>

          {/* Start button */}
          <StartMenuButton onClick={handleStart}>
            Start Battle
          </StartMenuButton>
        </div>
      </div>
    </div>
  );
}
