/**
 * Building - Renders a placed building with health bar
 *
 * Buildings are static structures that unlock tech or provide bonuses.
 */

import { useRef, useState } from "react";
import { Mesh } from "three";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { PlacedBuilding } from "../engine/GameState";

interface Props {
  building: PlacedBuilding;
}

export default function Building({ building }: Props) {
  const meshRef = useRef<Mesh>(null);
  const stats = building.stats;

  // Initialize progress to 0 if under construction, 1 if complete
  const [constructionProgress, setConstructionProgress] = useState(
    building.constructionStartTime !== undefined ? 0.0 : 1.0
  );

  const healthPercent = (building.health / stats.health) * 100;
  const shieldPercent = stats.max_shields > 0
    ? (building.shields / stats.max_shields) * 100
    : 0;
  const hasShields = stats.max_shields > 0;

  // Calculate construction progress every frame
  useFrame(() => {
    if (building.constructionStartTime !== undefined && building.constructionDuration !== undefined) {
      const elapsed = performance.now() - building.constructionStartTime;
      const progress = Math.min(1.0, elapsed / building.constructionDuration);
      setConstructionProgress(progress);
    } else {
      setConstructionProgress(1.0); // Fully constructed
    }
  });

  // Opacity based on construction progress (30% → 100%)
  const opacity = 0.3 + (constructionProgress * 0.7);
  const isConstructing = building.constructionStartTime !== undefined;

  const renderGeometry = () => {
    switch (stats.shape) {
      case "box":
        return <boxGeometry args={[stats.width, stats.height, stats.depth]} />;
      case "sphere":
        return <sphereGeometry args={[stats.width / 2, 16, 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[stats.width / 2, stats.width / 2, stats.height, 16]} />;
      case "cone":
        return <coneGeometry args={[stats.width / 2, stats.height, 16]} />;
      default:
        return <boxGeometry args={[stats.width, stats.height, stats.depth]} />;
    }
  };

  return (
    <group position={building.position}>
      {/* 3D Building Mesh */}
      <mesh ref={meshRef} castShadow position={[0, stats.height / 2, 0]}>
        {renderGeometry()}
        <meshStandardMaterial
          color={stats.color}
          transparent={isConstructing}
          opacity={opacity}
        />
      </mesh>

      {/* Health Bar or Construction Progress (HTML overlay) */}
      <Html position={[0, stats.height + 0.5, 0]} center style={{ zIndex: 10 }}>
        {isConstructing ? (
          // Construction Progress
          <div className="bg-black/70 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
            <div className="flex items-center gap-1">
              <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${constructionProgress * 100}%` }}
                />
              </div>
              <span className="text-[10px]">{Math.round(constructionProgress * 100)}%</span>
            </div>
          </div>
        ) : (
          // Health/Shield Bars
          <div className="bg-black/50 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
            <div className="flex items-center gap-1">
              <div className="w-16">
                {hasShields && (
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-0.5">
                    <div
                      className="h-full bg-blue-400 transition-all"
                      style={{ width: `${shieldPercent}%` }}
                    />
                  </div>
                )}
                <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px]">{Math.round(building.health)}</span>
            </div>
          </div>
        )}
      </Html>
    </group>
  );
}
