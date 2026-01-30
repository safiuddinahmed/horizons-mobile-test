import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface EnvironmentPropsProps {
  type: 'rocks' | 'stones' | 'fountain' | 'path' | 'springPathways' | 'fence';
  count?: number;
  spread?: number;
  gardenSize?: number;
}

/**
 * EnvironmentProps - Decorative elements for the garden
 * Adds rocks, stones, fountains, and paths
 */
export function EnvironmentProps({ 
  type, 
  count = 5,
  spread = 12,
  gardenSize = 60 
}: EnvironmentPropsProps) {
  const modelPath = useMemo(() => {
    switch (type) {
      case 'rocks':
        return '/models/environment/Rocks.glb';
      case 'stones':
        return '/models/environment/Stones.glb';
      case 'fountain':
        return '/models/environment/Fountain.glb';
      case 'fence':
        return '/models/environment/Stone Wall.glb';
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
    } else if (type === 'fence') {
      // Programmatic wall sizing - scales with garden size
      // Use spacing-based calculation for connected walls
      const desiredSpacing = 3.5; // Tight spacing for connected look
      
      // Calculate walls per side based on desired spacing
      const wallsPerSide = Math.floor(gardenSize / desiredSpacing);
      
      // Fine-tune spacing to distribute evenly
      const actualSpacing = gardenSize / wallsPerSide;
      
      // Inset to prevent extending beyond edge
      const inset = -1.65;
      const gardenRadius = (gardenSize / 2) - inset;
      
      // North side (positive Z)
      for (let i = 0; i < wallsPerSide; i++) {
        const x = -(gardenSize / 2) + (i + 0.5) * actualSpacing;
        pos.push([x, 0, gardenRadius]);
      }
      
      // South side (negative Z)
      for (let i = 0; i < wallsPerSide; i++) {
        const x = -(gardenSize / 2) + (i + 0.5) * actualSpacing;
        pos.push([x, 0, -gardenRadius]);
      }
      
      // East side (positive X)
      for (let i = 0; i < wallsPerSide; i++) {
        const z = -(gardenSize / 2) + (i + 0.5) * actualSpacing;
        pos.push([gardenRadius, 0, z]);
      }
      
      // West side (negative X)
      for (let i = 0; i < wallsPerSide; i++) {
        const z = -(gardenSize / 2) + (i + 0.5) * actualSpacing;
        pos.push([-gardenRadius, 0, z]);
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
  }, [type, count, spread, gardenSize]);
  
  const rotations = useMemo(() => {
    if (type === 'fence') {
      // Programmatic rotations matching dynamic wall count
      const desiredSpacing = 3.5;
      const wallsPerSide = Math.floor(gardenSize / desiredSpacing);
      
      const rots: number[] = [];
      
      // North side - facing south (inward)
      for (let i = 0; i < wallsPerSide; i++) {
        rots.push(Math.PI); // 180 degrees
      }
      
      // South side - facing north (inward)
      for (let i = 0; i < wallsPerSide; i++) {
        rots.push(0); // 0 degrees
      }
      
      // East side - facing west (inward)
      for (let i = 0; i < wallsPerSide; i++) {
        rots.push(-Math.PI / 2); // -90 degrees
      }
      
      // West side - facing east (inward)
      for (let i = 0; i < wallsPerSide; i++) {
        rots.push(Math.PI / 2); // 90 degrees
      }
      
      return rots;
    } else if (type === 'springPathways') {
      // Specific rotations for pathways to align them correctly
      const rots: number[] = [];
      
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
    if (type === 'fence') {
      // Non-uniform scaling: [width, height, depth]
      // Height is 2x the base scale for taller walls
      return positions.map(() => [5.0, 10.0, 5.0] as [number, number, number]);
    } else if (type === 'springPathways') {
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
          type={type}
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
  scale,
  type
}: { 
  scene: THREE.Group;
  position: [number, number, number]; 
  rotation: number;
  scale: number | [number, number, number];
  type: string;
}) {
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // For fence, lighten ALL materials proportionally (60% brighter!)
    if (type === 'fence') {
      clone.traverse((child: any) => {
        if (child.isMesh && child.material) {
          // Handle both single materials and material arrays
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
          
          materials.forEach((mat: any) => {
            const material = mat.clone();
            // Brighten by 60% - even lighter than before
            material.color.multiplyScalar(1.6);
            child.material = material;
          });
        }
      });
    }
    
    return clone;
  }, [scene, type]);
  
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
useGLTF.preload('/models/environment/Stone Wall.glb');
useGLTF.preload('/models/environment/Path Straight.glb');
