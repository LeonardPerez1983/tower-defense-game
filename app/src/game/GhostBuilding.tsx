/**
 * GhostBuilding - Preview of building during placement
 *
 * Shows semi-transparent building mesh at cursor position.
 * Green if valid placement, red if invalid.
 */

import { Building } from "../data/loadData";

interface Props {
  buildingStats: Building;
  position: [number, number, number];
  isValid: boolean;
}

export default function GhostBuilding({ buildingStats, position, isValid }: Props) {
  const color = isValid ? "#00ff00" : "#ff0000";
  const opacity = 0.5;

  // Lift building by half its height to sit on ground
  const liftedPosition: [number, number, number] = [
    position[0],
    buildingStats.height / 2,
    position[2],
  ];

  return (
    <mesh position={liftedPosition}>
      {buildingStats.shape === "box" && (
        <boxGeometry args={[buildingStats.width, buildingStats.height, buildingStats.depth]} />
      )}
      {buildingStats.shape === "sphere" && (
        <sphereGeometry args={[buildingStats.width / 2, 16, 16]} />
      )}
      {buildingStats.shape === "cylinder" && (
        <cylinderGeometry args={[buildingStats.width / 2, buildingStats.width / 2, buildingStats.height, 16]} />
      )}
      {buildingStats.shape === "cone" && (
        <coneGeometry args={[buildingStats.width / 2, buildingStats.height, 16]} />
      )}
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}
