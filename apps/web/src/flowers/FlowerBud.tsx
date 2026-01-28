import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

interface FlowerBudProps {
  position?: [number, number, number];
  scale?: number;
  color?: string;
}

/**
 * Generic flower bud (closed state) - works for all flower types
 * Features:
 * - Green closed bud sphere
 * - Stem
 * - Gentle swaying animation
 * - Optional color hint at top
 */
export function FlowerBud({ 
  position = [0, 0, 0], 
  scale = 1,
  color = '#FFD700'
}: FlowerBudProps) {
  const budRef = useRef<Mesh>(null);

  // Gentle swaying animation
  useFrame((state) => {
    if (budRef.current) {
      budRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Stem */}
      <mesh position={[0, 0.5 * scale, 0]}>
        <cylinderGeometry args={[0.05 * scale, 0.05 * scale, 1 * scale, 8]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      {/* Closed bud - green sphere with slight elongation */}
      <mesh 
        ref={budRef} 
        position={[0, 1.1 * scale, 0]} 
        scale={[0.3 * scale, 0.4 * scale, 0.3 * scale]}
      >
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial 
          color="#6B8E23" 
          roughness={0.8}
        />
      </mesh>

      {/* Tiny hint of flower color at the top (unopened petals peeking) */}
      <mesh position={[0, 1.25 * scale, 0]} scale={0.08 * scale}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.6}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  );
}
