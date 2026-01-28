import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

interface GrassFieldProps {
  color?: string;
  density?: 'sparse' | 'medium' | 'dense';
  areaSize?: number;
}

/**
 * GrassField - Fills the entire garden area with grass patches
 * Tiles grass patch models across a grid to cover the ground completely
 */
export function GrassField({ 
  color = '#90D890', 
  density = 'dense',
  areaSize = 40 
}: GrassFieldProps) {
  const { scene } = useGLTF('/models/environment/Grass patch.glb');
  
  // Calculate grid based on density
  const gridConfig = useMemo(() => {
    const configs = {
      sparse: { spacing: 4, count: Math.floor(areaSize / 4) },
      medium: { spacing: 2.5, count: Math.floor(areaSize / 2.5) },
      dense: { spacing: 2, count: Math.floor(areaSize / 2) }
    };
    return configs[density];
  }, [density, areaSize]);
  
  // Generate grass patch positions in a grid
  const positions = useMemo(() => {
    const pos: Array<[number, number, number]> = [];
    const { spacing, count } = gridConfig;
    const offset = (count * spacing) / 2;
    
    for (let x = 0; x < count; x++) {
      for (let z = 0; z < count; z++) {
        const posX = x * spacing - offset;
        const posZ = z * spacing - offset;
        // Small random offset for natural look
        const randomX = (Math.random() - 0.5) * 0.3;
        const randomZ = (Math.random() - 0.5) * 0.3;
        pos.push([posX + randomX, 0, posZ + randomZ]);
      }
    }
    return pos;
  }, [gridConfig]);
  
  // Random rotations for variety
  const rotations = useMemo(() => {
    return positions.map(() => Math.random() * Math.PI * 2);
  }, [positions]);
  
  return (
    <group>
      {positions.map((position, i) => (
        <GrassPatch
          key={i}
          position={position}
          rotation={rotations[i]}
          color={color}
          scene={scene}
        />
      ))}
    </group>
  );
}

/**
 * Individual grass patch instance
 */
function GrassPatch({ 
  position, 
  rotation, 
  color, 
  scene 
}: { 
  position: [number, number, number]; 
  rotation: number; 
  color: string;
  scene: THREE.Group;
}) {
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    // Apply color to all meshes in the grass patch
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.MeshStandardMaterial;
        if (material.color) {
          material.color.set(color);
        }
      }
    });
    return clone;
  }, [scene, color]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={[0, rotation, 0]}
      scale={1}
    />
  );
}

// Preload the grass model
useGLTF.preload('/models/environment/Grass patch.glb');
