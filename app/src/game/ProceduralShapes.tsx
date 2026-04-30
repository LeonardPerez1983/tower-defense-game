/**
 * Procedural Shapes Library
 *
 * Reusable 3D primitive shapes for units, towers, and effects.
 * Each shape accepts color and position props.
 */

import { Mesh } from 'three';
import { useRef } from 'react';

interface ShapeProps {
  color?: string;
  position?: [number, number, number];
}

export function Box({ color = "#ff6b6b", position = [0, 0, 0] }: ShapeProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Sphere({ color = "#4ecdc4", position = [0, 0, 0] }: ShapeProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Cylinder({ color = "#95e1d3", position = [0, 0, 0] }: ShapeProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function Cone({ color = "#ffd93d", position = [0, 0, 0] }: ShapeProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[0.4, 1, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
