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

  // Render shape based on stats (75% scale)
  const renderGeometry = () => {
    switch (stats.shape) {
      case "box":
        return <boxGeometry args={[0.75, 0.75, 0.75]} />;
      case "sphere":
        return <sphereGeometry args={[0.375, 16, 16]} />;
      case "cylinder":
        return <cylinderGeometry args={[0.3, 0.3, 1.125, 16]} />;
      case "cone":
        return <coneGeometry args={[0.3, 0.75, 16]} />;
      default:
        return <boxGeometry args={[0.75, 0.75, 0.75]} />;
    }
  };

  const healthPercent = (unit.health / stats.health) * 100;
  const shieldPercent = stats.max_shields > 0
    ? (unit.shields / stats.max_shields) * 100
    : 0;
  const hasShields = stats.max_shields > 0;

  // Get unit height based on shape (75% scale)
  const getUnitHeight = () => {
    switch (stats.shape) {
      case "box":
        return 0.75;
      case "sphere":
        return 0.75; // diameter
      case "cylinder":
        return 1.125;
      case "cone":
        return 0.75;
      default:
        return 0.75;
    }
  };

  const unitHeight = getUnitHeight();

  return (
    <group position={unit.position}>
      {/* 3D Mesh - lifted to sit on ground */}
      <mesh ref={meshRef} castShadow position={[0, unitHeight / 2, 0]}>
        {renderGeometry()}
        <meshStandardMaterial color={stats.color} />
      </mesh>

      {/* Health/Shield bars above unit */}
      <Html position={[0, unitHeight + 0.5, 0]} center style={{ pointerEvents: "none", zIndex: 10 }}>
        <div className="bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs min-w-16">
          {hasShields && (
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-0.5">
              <div
                className="h-full transition-all bg-blue-400"
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          )}
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
