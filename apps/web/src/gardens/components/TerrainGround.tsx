import { useMemo } from 'react';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';
import { generateHeightmap, applyEdgeFalloff } from '../utils/terrainUtils';
import { createGrassTexture, createGrassStrokeTexture, createDirtTexture } from '../utils/terrainTextures';

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
 * TerrainGround - Pokemon Legends: Arceus authentic terrain
 * Features: Procedural textures, muted olive grass, realistic dirt paths
 */
export function TerrainGround({
  size = 40,
  resolution = 150,
  seed = 42,
  amplitude = 0.9,
  grassColor = '#8B9B5C'  // PLA muted olive-green
}: TerrainGroundProps) {
  
  const terrain = useMemo(() => {
    // Generate smooth heightmap
    let heightmap = generateHeightmap(resolution, resolution, {
      seed,
      scale: 0.025,
      octaves: 2,
      persistence: 0.4,
      lacunarity: 2.0,
      amplitude,
      redistribution: 1.0
    });
    
    // Apply edge falloff
    heightmap = applyEdgeFalloff(heightmap, resolution, resolution, 0.2);
    
    // Generate blend map for grass/dirt mixing
    const blendNoise = generateHeightmap(resolution, resolution, {
      seed: seed + 100,
      scale: 0.1,
      octaves: 2,
      persistence: 0.45,
      lacunarity: 2.0,
      amplitude: 1.0,
      redistribution: 1.0
    });
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(size, size, resolution - 1, resolution - 1);
    geometry.rotateX(-Math.PI / 2);
    
    // Apply heights
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const height = heightmap[i] || 0;
      const safeHeight = isNaN(height) ? 0 : height;
      positions.setY(i, safeHeight);
    }
    
    // Create blend weights (0 = grass, 1 = dirt)
    const blendWeights = new Float32Array(positions.count);
    
    for (let i = 0; i < positions.count; i++) {
      const height = heightmap[i] || 0;
      const normalizedHeight = (height + amplitude * 0.2) / (amplitude * 1.2);
      const clampedHeight = Math.max(0, Math.min(1, normalizedHeight));
      
      const blend = blendNoise[i] || 0;
      
      // Garden-appropriate dirt - subtle accent paths, not fields
      const dirtThreshold = 0.88 + (clampedHeight * 0.08);
      
      if (blend > dirtThreshold) {
        // Dirt area - smooth transition
        const strength = (blend - dirtThreshold) / (1.0 - dirtThreshold);
        blendWeights[i] = Math.min(1, strength * 1.2);
      } else {
        // Grass area
        blendWeights[i] = 0;
      }
    }
    
    // Add blend weights as vertex attribute
    geometry.setAttribute('blendWeight', new THREE.BufferAttribute(blendWeights, 1));
    
    // Recompute normals
    geometry.computeVertexNormals();
    
    return { geometry, heightmap };
  }, [size, resolution, seed, amplitude, grassColor]);
  
  // Create textures - TWO LAYER SYSTEM
  const textures = useMemo(() => {
    return {
      grass: createGrassTexture(512),
      grassStrokes: createGrassStrokeTexture(256), // NEW: Stroke overlay!
      dirt: createDirtTexture(512)
    };
  }, []);
  
  // Custom material with texture blending
  const material = useMemo(() => {
    // Create custom shader material that blends textures
    return new THREE.ShaderMaterial({
      uniforms: {
        grassTexture: { value: textures.grass },
        grassStrokeTexture: { value: textures.grassStrokes }, // NEW!
        dirtTexture: { value: textures.dirt },
        lightDirection: { value: new THREE.Vector3(0.5, 1, 0.5).normalize() },
        ambientColor: { value: new THREE.Color('#F5F0E8') },
        ambientIntensity: { value: 0.5 },
      },
      vertexShader: `
        attribute float blendWeight;
        varying vec2 vUv;
        varying float vBlend;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPos;
        
        void main() {
          vUv = uv;
          vBlend = blendWeight;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz; // World position!
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D grassTexture;
        uniform sampler2D grassStrokeTexture;
        uniform sampler2D dirtTexture;
        uniform vec3 lightDirection;
        uniform vec3 ambientColor;
        uniform float ambientIntensity;
        
        varying vec2 vUv;
        varying float vBlend;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPos;
        
        void main() {
          // Sample base textures (UV space)
          vec4 grassColor = texture2D(grassTexture, vUv);
          vec4 dirtColor = texture2D(dirtTexture, vUv);
          
          // Blend between grass and dirt
          vec4 baseColor = mix(grassColor, dirtColor, vBlend);
          
          // Sample grass strokes in WORLD SPACE (key!)
          vec2 worldUV = vWorldPos.xz * 0.15; // World-aligned tiling
          vec4 stroke = texture2D(grassStrokeTexture, worldUV);
          
          // Tint strokes toward yellow-green
          stroke.rgb = mix(stroke.rgb, vec3(0.75, 0.78, 0.45), 0.6);
          stroke.a *= 0.35; // Reduce opacity
          
          // Apply strokes ADDITIVELY to base (only on grass areas)
          vec3 color = baseColor.rgb;
          color = mix(color, color + stroke.rgb, stroke.a * (1.0 - vBlend));
          
          // Simple diffuse lighting
          float diffuse = max(dot(vNormal, lightDirection), 0.0);
          diffuse = diffuse * 0.6 + 0.4;
          
          // Ambient light
          vec3 ambient = ambientColor * ambientIntensity;
          
          // Apply lighting
          vec3 litColor = color * (diffuse + ambient);
          
          // Reduce lighting influence on final result (strokes stay flat!)
          vec3 finalColor = mix(color, litColor, 0.85);
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.FrontSide,
    });
  }, [textures]);
  
  return (
    <mesh 
      name="terrain"
      geometry={terrain.geometry} 
      material={material}
      receiveShadow
      castShadow
    />
  );
}

/**
 * Base ground layer - PLA-style warm soil
 */
export function BaseGroundLayer({
  size = 60,
  color = '#8B6F47'
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
