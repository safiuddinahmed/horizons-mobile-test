import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

type TreeSeason = 'spring' | 'autumn' | 'winter' | 'quiet';

interface SeasonalTreesProps {
  season: TreeSeason;
  count?: number;
  spread?: number;
}

/**
 * SeasonalTrees - Renders appropriate trees for each garden season
 * Uses different GLB models based on the season
 */
export function SeasonalTrees({ 
  season, 
  count = 5,
  spread = 15 
}: SeasonalTreesProps) {
  const treePositions = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    
    for (let i = 0; i < count; i++) {
      // Random positions around the garden perimeter
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = spread + Math.random() * 3;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      positions.push([x, 0, z]);
    }
    
    return positions;
  }, [count, spread]);
  
  const rotations = useMemo(() => {
    return treePositions.map(() => Math.random() * Math.PI * 2);
  }, [treePositions]);
  
  return (
    <group>
      {treePositions.map((position, i) => (
        <SeasonalTree
          key={i}
          season={season}
          position={position}
          rotation={rotations[i]}
        />
      ))}
    </group>
  );
}

/**
 * Individual seasonal tree
 */
function SeasonalTree({ 
  season, 
  position, 
  rotation 
}: { 
  season: TreeSeason; 
  position: [number, number, number]; 
  rotation: number;
}) {
  // Select the appropriate tree model based on season
  const modelPath = useMemo(() => {
    switch (season) {
      case 'quiet':
        return '/models/environment/Tree.glb'; // Changed from Birch to regular Tree
      case 'spring':
        return '/models/environment/Tree.glb';
      case 'autumn':
        return '/models/environment/Fall Tree.glb';
      case 'winter':
        return '/models/environment/Dead Trees With Snow.glb';
      default:
        return '/models/environment/Tree.glb';
    }
  }, [season]);
  
  // Season-specific scaling
  const treeScale = useMemo(() => {
    switch (season) {
      case 'autumn':
        return 5.4; // 1.5x bigger than before (was 3.6)
      case 'winter':
        return 63.0; // 1.5x bigger than before (was 42.0)
      default:
        return 1.2; // Normal size for quiet and spring
    }
  }, [season]);
  
  const { scene } = useGLTF(modelPath);
  
  const clonedScene = useMemo(() => {
    // Clone the scene without any color modifications
    // Trees use their natural GLB colors
    return scene.clone();
  }, [scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={position} 
      rotation={[0, rotation, 0]}
      scale={treeScale}
      castShadow
      receiveShadow
    />
  );
}

// Preload all tree models
useGLTF.preload('/models/environment/Birch Trees.glb');
useGLTF.preload('/models/environment/Tree.glb');
useGLTF.preload('/models/environment/Fall Tree.glb');
useGLTF.preload('/models/environment/Dead Trees With Snow.glb');
