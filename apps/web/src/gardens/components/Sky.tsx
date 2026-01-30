import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkyProps {
  topColor?: string;
  bottomColor?: string;
  cloudCount?: number;
  cloudSpeed?: number;
  style?: 'runescape' | 'modern' | 'peaceful';
}

/**
 * Sky component - Runescape-inspired sky with gradient and drifting clouds
 */
export function Sky({
  topColor = '#87CEEB',
  bottomColor = '#E0F6FF',
  cloudCount = 12,
  cloudSpeed = 0.3,
  style = 'runescape'
}: SkyProps) {
  return (
    <>
      <SkyDome topColor={topColor} bottomColor={bottomColor} />
      <Clouds count={cloudCount} speed={cloudSpeed} style={style} />
    </>
  );
}

/**
 * Sky dome - gradient background hemisphere
 */
function SkyDome({ topColor, bottomColor }: { topColor: string; bottomColor: string }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(topColor) },
        bottomColor: { value: new THREE.Color(bottomColor) },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        varying vec3 vWorldPosition;
        
        void main() {
          // Gradient based on height (Y position)
          float h = normalize(vWorldPosition).y;
          
          // Smooth transition from bottom to top
          float mixAmount = smoothstep(-0.2, 0.8, h);
          vec3 color = mix(bottomColor, topColor, mixAmount);
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [topColor, bottomColor]);

  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[500, 32, 32]} />
    </mesh>
  );
}

/**
 * Clouds - Procedurally generated billboard clouds
 */
function Clouds({ 
  count, 
  speed,
  style
}: { 
  count: number; 
  speed: number;
  style: 'runescape' | 'modern' | 'peaceful';
}) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate cloud positions and properties
  const clouds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 80 + Math.random() * 60; // 80-140 units from center
      const height = 25 + Math.random() * 20; // 25-45 units high
      
      return {
        position: [
          Math.cos(angle) * distance,
          height,
          Math.sin(angle) * distance
        ] as [number, number, number],
        scale: 0.8 + Math.random() * 0.6, // 0.8-1.4
        rotation: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4, // 0.8-1.2 speed multiplier
      };
    });
  }, [count]);
  
  // Gentle cloud drift animation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed * 0.01;
    }
  });
  
  return (
    <group ref={groupRef}>
      {clouds.map((cloud, i) => (
        <Cloud
          key={i}
          position={cloud.position}
          scale={cloud.scale}
          rotation={cloud.rotation}
          style={style}
        />
      ))}
    </group>
  );
}

/**
 * Individual cloud billboard
 */
function Cloud({
  position,
  scale,
  rotation,
  style
}: {
  position: [number, number, number];
  scale: number;
  rotation: number;
  style: 'runescape' | 'modern' | 'peaceful';
}) {
  const texture = useMemo(() => createCloudTexture(style), [style]);
  
  return (
    <sprite position={position} scale={[15 * scale, 8 * scale, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={0.7}
        depthWrite={false}
        fog={false}
      />
    </sprite>
  );
}

/**
 * Create procedural cloud texture
 */
function createCloudTexture(style: 'runescape' | 'modern' | 'peaceful'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  
  // Cloud colors based on style
  const cloudColors = {
    runescape: { main: '#FFFFFF', shadow: '#E8E8E8' },
    modern: { main: '#F5F5F5', shadow: '#D8D8D8' },
    peaceful: { main: '#FFF8F0', shadow: '#F0E8DC' }
  };
  
  const colors = cloudColors[style];
  
  // Clear canvas
  ctx.clearRect(0, 0, 256, 128);
  
  // Create cloud shape with overlapping circles
  ctx.fillStyle = colors.shadow;
  
  // Bottom layer (shadow)
  drawCloudLayer(ctx, 128, 74, 0.9, colors.shadow);
  
  // Top layer (main)
  drawCloudLayer(ctx, 128, 64, 1.0, colors.main);
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

/**
 * Draw a layer of cloud with organic shape
 */
function drawCloudLayer(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  alphaMult: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alphaMult;
  
  // Create organic cloud shape with multiple circles
  const circles = [
    { x: 0, y: 0, r: 35 },
    { x: -25, y: 5, r: 28 },
    { x: 25, y: 5, r: 30 },
    { x: -12, y: -8, r: 25 },
    { x: 15, y: -5, r: 27 },
    { x: 40, y: 8, r: 22 },
    { x: -40, y: 10, r: 20 },
  ];
  
  circles.forEach(circle => {
    ctx.beginPath();
    ctx.arc(
      centerX + circle.x,
      centerY + circle.y,
      circle.r,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
  
  ctx.globalAlpha = 1.0;
}

