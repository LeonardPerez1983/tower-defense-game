/**
 * Building - Renders a placed building with health bar
 *
 * Buildings are static structures that unlock tech or provide bonuses.
 */

import { useRef } from "react";
import { Mesh } from "three";
import { Html } from "@react-three/drei";
import { PlacedBuilding } from "../engine/GameState";

interface Props {
  building: PlacedBuilding;
}

export default function Building({ building }: Props) {
  const meshRef = useRef<Mesh>(null);
  const stats = building.stats;

  const healthPercent = (building.health / stats.health) * 100;

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
        <meshStandardMaterial color={stats.color} />
      </mesh>

      {/* Health Bar (HTML overlay) */}
      <Html position={[0, stats.height + 0.5, 0]} center style={{ zIndex: 10 }}>
        <div className="bg-black/50 rounded px-2 py-1 text-xs text-white whitespace-nowrap">
          <div className="flex items-center gap-1">
            <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-[10px]">{Math.round(building.health)}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
