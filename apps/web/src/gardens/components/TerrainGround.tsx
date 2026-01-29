import { useMemo } from 'react';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { generateHeightmap, applyEdgeFalloff } from '../utils/terrainUtils';

// Extend R3F with Three.js primitives
extend({ Mesh: THREE.Mesh, PlaneGeometry: THREE.PlaneGeometry, MeshStandardMaterial: THREE.MeshStandardMaterial });

interface TerrainGroundProps {
  size?: number;
  resolution?: number;
  seed?: number;
  amplitude?: number;
  grassColor?: string;
}

/**
 * TerrainGround - Beautiful garden terrain with visual richness
 * Features: Rolling hills, dirt patches, color variation, proper lighting
 */
export function TerrainGround({
  size = 40,
  resolution = 150,
  seed = 42,
  amplitude = 0.9,
  grassColor = '#5A8F67'
}: TerrainGroundProps) {
  
  const terrain = useMemo(() => {
    // Generate clean heightmap - BROAD, GENTLE rolling hills
    let heightmap = generateHeightmap(resolution, resolution, {
      seed,
      scale: 0.025,       // VERY broad hills (low frequency)
      octaves: 2,         // Minimal detail = smooth large hills
      persistence: 0.4,   // Low detail contribution
      lacunarity: 2.0,
      amplitude,          // Moderate elevation
      redistribution: 1.0 // No curve = natural gentle slopes
    });
    
    // Apply edge falloff
    heightmap = applyEdgeFalloff(heightmap, resolution, resolution, 0.2);
    
    // Generate dirt patch noise (for procedural mud/dirt areas)
    const dirtNoise = generateHeightmap(resolution, resolution, {
      seed: seed + 100,
      scale: 0.15,        // Medium frequency for patches
      octaves: 3,
      persistence: 0.5,
      lacunarity: 2.0,
      amplitude: 1.0,
      redistribution: 1.0
    });
    
    // Generate detail noise (for subtle variation)
    const detailNoise = generateHeightmap(resolution, resolution, {
      seed: seed + 200,
      scale: 0.08,        // Finer detail
      octaves: 2,
      persistence: 0.4,
      lacunarity: 2.0,
      amplitude: 1.0,
      redistribution: 1.0
    });
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    geometry.rotateX(-Math.PI / 2);
    
    // Get position attribute
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    
    // Calculate slopes for slope-based coloring
    const slopes = calculateSlopes(heightmap, resolution, resolution, size);
    
    // Define color palette - Garden colors
    const grassMain = new THREE.Color(grassColor);        // #5A8F67 - Main grass
    const grassDark = new THREE.Color('#3D5A45');          // Dark grass (valleys/shade)
    const grassBright = new THREE.Color('#7FB88D');        // Bright grass (hills/sun)
    const dirtBrown = new THREE.Color('#6B5744');          // Dirt/mud patches
    const grassRich = new THREE.Color('#4A7A59');          // Rich darker grass
    
    // Apply heights and calculate RICH but CLEAN color variation
    for (let i = 0; i < positions.count; i++) {
      const height = heightmap[i] || 0;
      const safeHeight = isNaN(height) ? 0 : height;
      positions.setY(i, safeHeight);
      
      // Normalize height (0 to 1)
      const normalizedHeight = (safeHeight + amplitude * 0.2) / (amplitude * 1.2);
      const clampedHeight = Math.max(0, Math.min(1, normalizedHeight));
      
      // Get slope at this vertex (0 = flat, 1 = steep)
      const slope = slopes[i] || 0;
      
      // Get noise values
      const dirt = dirtNoise[i] || 0;
      const detail = detailNoise[i] || 0;
      
      // Start with base color based on height
      let finalColor: THREE.Color;
      
      // Height-based base color (subtle gradient)
      if (clampedHeight < 0.35) {
        // Lower areas - darker grass
        const t = clampedHeight / 0.35;
        finalColor = grassDark.clone().lerp(grassMain, t);
      } else if (clampedHeight < 0.65) {
        // Middle areas - main grass color
        finalColor = grassMain.clone();
      } else {
        // Higher areas - brighter grass (sun-kissed)
        const t = (clampedHeight - 0.65) / 0.35;
        finalColor = grassMain.clone().lerp(grassBright, t * 0.6);
      }
      
      // Add dirt patches based on noise (organic placement)
      // More dirt in flat low areas (realistic - mud pools in valleys)
      const dirtThreshold = 0.65 + clampedHeight * 0.15; // Harder to get dirt on hills
      const flatFactor = 1.0 - slope; // More dirt on flat areas
      
      if (dirt > dirtThreshold && flatFactor > 0.3) {
        // Dirt patch! Blend towards brown
        const dirtStrength = ((dirt - dirtThreshold) / (1.0 - dirtThreshold)) * flatFactor;
        finalColor.lerp(dirtBrown, dirtStrength * 0.7);
      }
      
      // Slope-based lighting (sun exposure)
      // Slopes facing "sun" get slightly brighter
      if (slope > 0.15) {
        finalColor.lerp(grassBright, slope * 0.2);
      }
      
      // Add very subtle detail variation (not random!)
      const detailFactor = (detail - 0.5) * 0.05; // Very subtle
      finalColor.r = Math.max(0, Math.min(1, finalColor.r + detailFactor));
      finalColor.g = Math.max(0, Math.min(1, finalColor.g + detailFactor));
      finalColor.b = Math.max(0, Math.min(1, finalColor.b + detailFactor));
      
      // Add slight variation to avoid banding
      const richFactor = (detail > 0.6) ? 0.1 : 0;
      if (richFactor > 0 && clampedHeight < 0.5) {
        finalColor.lerp(grassRich, richFactor);
      }
      
      // Set vertex color
      colors[i * 3] = finalColor.r;
      colors[i * 3 + 1] = finalColor.g;
      colors[i * 3 + 2] = finalColor.b;
    }
    
    // Add vertex colors
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Recompute normals for smooth lighting
    geometry.computeVertexNormals();
    
    return { geometry, heightmap };
  }, [size, resolution, seed, amplitude, grassColor]);
  
  // Enhanced material with vertex colors
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      vertexColors: true,  // Use our calculated colors!
      roughness: 0.85,
      metalness: 0.0,
      flatShading: false,
      side: THREE.FrontSide,
      // Enhanced for better depth perception
      envMapIntensity: 0.2
    });
  }, []);
  
  return (
    <mesh 
      geometry={terrain.geometry} 
      material={material}
      receiveShadow
      castShadow
    />
  );
}

/**
 * Calculate slope at each vertex for slope-based coloring
 */
function calculateSlopes(
  heightmap: Float32Array,
  width: number,
  height: number,
  terrainSize: number
): Float32Array {
  const slopes = new Float32Array(width * height);
  const cellSize = terrainSize / width;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      
      // Get neighboring heights
      const h = heightmap[index];
      const hx = x < width - 1 ? heightmap[y * width + (x + 1)] : h;
      const hy = y < height - 1 ? heightmap[(y + 1) * width + x] : h;
      
      // Calculate gradients
      const dx = (hx - h) / cellSize;
      const dy = (hy - h) / cellSize;
      
      // Slope magnitude (normalized to 0-1 range)
      const slope = Math.sqrt(dx * dx + dy * dy);
      slopes[index] = Math.min(1, slope * 0.5);
    }
  }
  
  return slopes;
}

/**
 * Base ground layer - clean soil color
 */
export function BaseGroundLayer({
  size = 60,
  color = '#5C4033'  // Darker, richer soil
}: {
  size?: number;
  color?: string;
}) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
  );
}
