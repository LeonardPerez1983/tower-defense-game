import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type ZergCreepFieldProps = {
  position?: [number, number, number]
  radius?: number
  opacity?: number
  pulseSpeed?: number
  variant?: 'small' | 'medium' | 'large'
}

/**
 * Generates an organic blob-shaped alpha texture for Zerg creep
 */
function generateCreepTexture(size: number = 512, complexity: number = 8): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Fill with transparent
  ctx.clearRect(0, 0, size, size)

  const centerX = size / 2
  const centerY = size / 2
  const baseRadius = size * 0.4

  // Create organic blob using multiple overlapping circles with noise
  const points: Array<{ x: number; y: number; r: number }> = []

  // Main center blob
  points.push({ x: centerX, y: centerY, r: baseRadius })

  // Add irregular outer blobs for organic edge
  const numBlobs = complexity
  for (let i = 0; i < numBlobs; i++) {
    const angle = (i / numBlobs) * Math.PI * 2
    const distance = baseRadius * (0.5 + Math.random() * 0.3)
    const blobRadius = baseRadius * (0.3 + Math.random() * 0.4)

    points.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      r: blobRadius
    })
  }

  // Add smaller detail blobs
  const numDetailBlobs = complexity * 2
  for (let i = 0; i < numDetailBlobs; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = baseRadius * (0.3 + Math.random() * 0.6)
    const blobRadius = baseRadius * (0.15 + Math.random() * 0.25)

    points.push({
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance,
      r: blobRadius
    })
  }

  // Render all blobs with soft gradients
  points.forEach(({ x, y, r }) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  })

  // Apply blur effect for smoother edges
  ctx.filter = 'blur(8px)'
  ctx.drawImage(canvas, 0, 0)
  ctx.filter = 'none'

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  return texture
}

/**
 * Zerg creep ground effect - organic spreading ground texture
 */
export function ZergCreepField({
  position = [0, 0.02, 0],
  radius = 1.6,
  opacity = 0.75,
  pulseSpeed = 1.0,
  variant = 'medium'
}: ZergCreepFieldProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Adjust radius based on variant
  const effectiveRadius = useMemo(() => {
    switch (variant) {
      case 'small':
        return radius * 0.875
      case 'large':
        return radius * 1.375
      default:
        return radius
    }
  }, [radius, variant])

  // Generate organic alpha texture
  const alphaTexture = useMemo(() => {
    const complexity = variant === 'large' ? 10 : variant === 'small' ? 6 : 8
    return generateCreepTexture(512, complexity)
  }, [variant])

  // Pulse animation
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      const time = clock.getElapsedTime() * pulseSpeed

      // Gentle pulse between 0.85 and 1.0
      const pulseScale = 0.85 + Math.sin(time * 0.7) * 0.075
      material.opacity = opacity * pulseScale

      // Subtle emissive pulse
      const emissiveIntensity = 0.15 + Math.sin(time * 0.5) * 0.1
      material.emissiveIntensity = emissiveIntensity
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[effectiveRadius * 2, effectiveRadius * 2]} />
      <meshStandardMaterial
        color="#4a1a4a"
        emissive="#6b2f6b"
        emissiveIntensity={0.15}
        transparent
        opacity={opacity}
        alphaMap={alphaTexture}
        alphaTest={0.01}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

// Preset helper components for common sizes
export function SmallCreep(props: Omit<ZergCreepFieldProps, 'variant'>) {
  return <ZergCreepField {...props} variant="small" radius={1.4} />
}

export function MediumCreep(props: Omit<ZergCreepFieldProps, 'variant'>) {
  return <ZergCreepField {...props} variant="medium" radius={1.6} />
}

export function LargeCreep(props: Omit<ZergCreepFieldProps, 'variant'>) {
  return <ZergCreepField {...props} variant="large" radius={2.2} />
}

// ============================================================================
// PROTOSS FACTION EFFECTS
// ============================================================================

type ProtossShieldShimmerProps = {
  radius: number
  height: number
  shieldPercent: number
  position?: [number, number, number]
}

/**
 * Protoss Shield Shimmer - Subtle golden glow around shielded units/buildings
 */
export function ProtossShieldShimmer({
  radius,
  height,
  shieldPercent,
  position = [0, 0, 0]
}: ProtossShieldShimmerProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Animate shimmer pulse
  useFrame(({ clock }) => {
    if (!meshRef.current) return

    const time = clock.getElapsedTime()
    const pulse = 0.6 + Math.sin(time * 3) * 0.2 // Faster, more visible pulse

    // Fade out as shields deplete
    const baseOpacity = Math.max(0.1, shieldPercent / 100 * 0.3)

    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = baseOpacity * pulse
      meshRef.current.material.emissiveIntensity = 0.6 + pulse * 0.4
    }
  })

  // Only render if shields exist
  if (shieldPercent <= 0) return null

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[radius * 1.05, 16, 16]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fcd34d"
        emissiveIntensity={0.6}
        transparent
        opacity={0.2}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ============================================================================
// TERRAN FACTION EFFECTS
// ============================================================================

type TerranIndustrialLightsProps = {
  buildingType: string
  radius: number
  height: number
  position?: [number, number, number]
}

/**
 * Terran Industrial Lights - Small status lights and exhaust accents
 */
export function TerranIndustrialLights({
  buildingType,
  radius,
  height,
  position = [0, 0, 0]
}: TerranIndustrialLightsProps) {
  const lightsRef = useRef<THREE.Group>(null)

  // Animate lights with subtle shimmer
  useFrame(({ clock }) => {
    if (!lightsRef.current) return

    const time = clock.getElapsedTime()

    // Very subtle shimmer for each light
    lightsRef.current.children.forEach((child, index) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        const offset = index * 1.2 // Stagger each light slightly
        const shimmer = 0.3 + Math.sin(time * 2 + offset) * 0.15 // Gentle sine wave
        child.material.emissiveIntensity = shimmer
      }
    })
  })

  // Different light configurations per building type
  const lightPositions: Array<[number, number, number]> = []

  if (buildingType === "command_center" || buildingType === "terran_command_center") {
    // Corner lights on command center - smaller and fewer
    lightPositions.push(
      [radius * 0.7, height * 0.8, radius * 0.7],
      [-radius * 0.7, height * 0.8, radius * 0.7]
    )
  } else if (buildingType === "barracks" || buildingType === "terran_barracks") {
    // Single front light
    lightPositions.push([0, height * 0.6, radius * 0.9])
  } else if (buildingType === "bunker" || buildingType === "terran_bunker") {
    // Two firing port lights
    lightPositions.push(
      [radius * 0.5, height * 0.5, radius * 0.8],
      [-radius * 0.5, height * 0.5, radius * 0.8]
    )
  }

  return (
    <group ref={lightsRef} position={position}>
      {lightPositions.map((pos, index) => (
        <mesh key={index} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color="#ff4400"
            emissive="#ff4400"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

// ============================================================================
// WORKER VISUALIZATION
// ============================================================================

type WorkerPipsProps = {
  workerCount: number
  maxWorkers: number
  faction: "terran" | "zerg" | "protoss"
  radius: number
  height: number
  team?: "player" | "cpu"
}

/**
 * Worker Pips - Visual indicator of worker count near main buildings
 */
export function WorkerPips({
  workerCount,
  maxWorkers,
  faction,
  radius,
  height,
  team = "player"
}: WorkerPipsProps) {
  const pipsRef = useRef<THREE.Group>(null)

  // Gentle floating animation
  useFrame(({ clock }) => {
    if (!pipsRef.current) return

    const time = clock.getElapsedTime()
    // Player pips well above ground for visibility, CPU pips above health bar
    const baseY = team === "player" ? 0.5 : height + 1.0
    pipsRef.current.position.y = baseY + Math.sin(time * 1.5) * 0.1
  })

  // Faction colors
  const colors = {
    terran: "#60a5fa",
    protoss: "#fbbf24",
    zerg: "#a855f7"
  }

  const pipColor = colors[faction]

  // Arrange pips in a horizontal line
  const pipPositions: Array<[number, number, number]> = []
  const spacing = 0.25
  const totalWidth = (maxWorkers - 1) * spacing
  const startX = -totalWidth / 2

  for (let i = 0; i < maxWorkers; i++) {
    pipPositions.push([startX + i * spacing, 0, 0])
  }

  return (
    <group ref={pipsRef}>
      {pipPositions.map((pos, index) => {
        const isActive = index < workerCount

        return (
          <mesh key={index} position={pos}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={isActive ? pipColor : "#333333"}
              emissive={isActive ? pipColor : "#000000"}
              emissiveIntensity={isActive ? 0.8 : 0}
              transparent
              opacity={isActive ? 1.0 : 0.3}
            />
          </mesh>
        )
      })}
    </group>
  )
}
