import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface EnvironmentPropsProps {
  type: 'rocks' | 'stones' | 'fountain' | 'path' | 'springPathways';
  count?: number;
  spread?: number;
}

/**
 * EnvironmentProps - Decorative elements for the garden
 * Adds rocks, stones, fountains, and paths
 */
export function EnvironmentProps({ 
  type, 
  count = 5,
  spread = 12 
}: EnvironmentPropsProps) {
  const modelPath = useMemo(() => {
    switch (type) {
      case 'rocks':
        return '/models/environment/Rocks.glb';
      case 'stones':
        return '/models/environment/Stones.glb';
      case 'fountain':
        return '/models/environment/Fountain.glb';
      case 'path':
      case 'springPathways':
        return '/models/environment/Path Straight.glb';
      default:
        return '/models/environment/Rocks.glb';
    }
  }, [type]);
  
  const { scene } = useGLTF(modelPath);
  
  const positions = useMemo(() => {
    const pos: Array<[number, number, number]> = [];
    
    if (type === 'fountain') {
      // Single fountain in a specific location
      pos.push([8, 0, -8]);
    } else if (type === 'springPathways') {
      // Long pathways leading to the fountain at [0, 0, -5]
      // Create 4 pathways from cardinal directions
      const fountainZ = -5;
      const pathSpacing = 9; // Distance between path segments (8-10x original 2)
      
      // North pathway (from behind, positive Z)
      for (let i = 0; i < 3; i++) {
        pos.push([0, 0, fountainZ + (i + 1) * pathSpacing]);
      }
      
      // South pathway (from front, negative Z)
      for (let i = 0; i < 3; i++) {
        pos.push([0, 0, fountainZ - (i + 1) * pathSpacing]);
      }
      
      // East pathway (from right, positive X)
      for (let i = 0; i < 3; i++) {
        pos.push([(i + 1) * pathSpacing, 0, fountainZ]);
      }
      
      // West pathway (from left, negative X)
      for (let i = 0; i < 3; i++) {
        pos.push([-(i + 1) * pathSpacing, 0, fountainZ]);
      }
    } else if (type === 'path') {
      // Path pieces in a line
      for (let i = 0; i < count; i++) {
        pos.push([i * 2 - 4, 0, -5]);
      }
    } else {
      // Random scatter for rocks and stones
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * spread;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        pos.push([x, 0, z]);
      }
    }
    
    return pos;
  }, [type, count, spread]);
  
  const rotations = useMemo(() => {
    if (type === 'springPathways') {
      // Specific rotations for pathways to align them correctly
      const rots: number[] = [];
      const fountainZ = -5;
      
      // North pathway (Z-aligned, no rotation needed)
      for (let i = 0; i < 3; i++) {
        rots.push(0);
      }
      
      // South pathway (Z-aligned, no rotation needed)
      for (let i = 0; i < 3; i++) {
        rots.push(0);
      }
      
      // East pathway (X-aligned, rotated 90 degrees)
      for (let i = 0; i < 3; i++) {
        rots.push(Math.PI / 2);
      }
      
      // West pathway (X-aligned, rotated 90 degrees)
      for (let i = 0; i < 3; i++) {
        rots.push(Math.PI / 2);
      }
      
      return rots;
    }
    return positions.map(() => Math.random() * Math.PI * 2);
  }, [positions, type]);
  
  const scales = useMemo(() => {
    if (type === 'springPathways') {
      // Large scale for spring pathways (8-10x larger)
      return positions.map(() => 9);
    }
    // Random scale variation for natural look
    return positions.map(() => 0.8 + Math.random() * 0.4);
  }, [positions, type]);
  
  return (
    <group>
      {positions.map((position, i) => (
        <Prop
          key={i}
          scene={scene}
          position={position}
          rotation={rotations[i]}
          scale={scales[i]}
        />
      ))}
    </group>
  );
}

/**
 * Individual prop instance
 */
function Prop({ 
  scene, 
  position, 
  rotation, 
  scale 
}: { 
  scene: THREE.Group;
  position: [number, number, number]; 
  rotation: number;
  scale: number;
}) {
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={[0, rotation, 0]}
      scale={scale}
      castShadow
      receiveShadow
    />
  );
}

// Preload all environment props
useGLTF.preload('/models/environment/Rocks.glb');
useGLTF.preload('/models/environment/Stones.glb');
useGLTF.preload('/models/environment/Fountain.glb');
useGLTF.preload('/models/environment/Path Straight.glb');
