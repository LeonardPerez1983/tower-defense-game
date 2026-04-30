/**
 * Unit - Individual 3D unit component
 *
 * Renders a unit based on its stats (shape, color).
 * Phase 2: Static units (no movement yet)
 * Phase 3: Will add movement and combat
 */

import { useRef } from "react";
import { Mesh } from "three";
import { Unit as UnitData } from "../engine/GameState";
import { Html } from "@react-three/drei";

interface Props {
  unit: UnitData;
}

export default function Unit({ unit }: Props) {
  const meshRef = useRef<Mesh>(null);
  const { stats } = unit;

  // Render shape based on stats
  const renderGeometry = () => {
    switch (stats.shape) {
      case "box":
        return <boxGeometry args={[1, 1, 1]} />;
      case "sphere":
        return <sphereGeometry args={[0.5, 16, 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />;
      case "cone":
        return <coneGeometry args={[0.4, 1, 16]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const healthPercent = (unit.health / stats.health) * 100;

  return (
    <group position={unit.position}>
      {/* 3D Mesh */}
      <mesh ref={meshRef} castShadow>
        {renderGeometry()}
        <meshStandardMaterial color={stats.color} />
      </mesh>

      {/* Health bar above unit */}
      <Html position={[0, 1.5, 0]} center style={{ pointerEvents: "none", zIndex: 10 }}>
        <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs min-w-16">
          <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                unit.team === "player" ? "bg-green-400" : "bg-red-400"
              }`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
