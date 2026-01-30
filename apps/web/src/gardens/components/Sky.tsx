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
      <CuteSun />
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
      const height = 15 + Math.random() * 15; // 15-30 units high (lowered closer to horizon)
      
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
    <sprite position={position} scale={[20 * scale, 10 * scale, 1]}>
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
 * Create procedural cloud texture with cute kawaii face
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
  
  // Add cute kawaii face!
  drawKawaiiFace(ctx, 128, 64);
  
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

/**
 * Draw cute kawaii face on cloud
 */
function drawKawaiiFace(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number
) {
  ctx.globalAlpha = 1.0;
  
  // Eyes - kawaii style with highlights
  const eyeY = centerY - 5;
  const eyeSpacing = 20;
  
  // Left eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX - eyeSpacing, eyeY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Left eye highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX - eyeSpacing + 3, eyeY - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(centerX + eyeSpacing, eyeY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Right eye highlight
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(centerX + eyeSpacing + 3, eyeY - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Blush - pink cheeks
  ctx.fillStyle = '#FFB6C1';
  ctx.globalAlpha = 0.6;
  
  // Left blush
  ctx.beginPath();
  ctx.ellipse(centerX - 35, centerY + 5, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Right blush
  ctx.beginPath();
  ctx.ellipse(centerX + 35, centerY + 5, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth - cute smile
  ctx.globalAlpha = 1.0;
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 8, 12, 0.2, Math.PI - 0.2);
  ctx.stroke();
}

/**
 * Cute Sun - Kawaii sun character with face and rays
 */
function CuteSun() {
  const texture = useMemo(() => createSunTexture(), []);
  
  return (
    <sprite position={[60, 35, 60]} scale={[25, 25, 1]}>
      <spriteMaterial
        map={texture}
        transparent
        depthWrite={false}
        fog={false}
      />
    </sprite>
  );
}

/**
 * Create cute sun texture with kawaii face and rays
 */
function createSunTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  
  const centerX = 128;
  const centerY = 128;
  const sunRadius = 60;
  
  // Clear canvas
  ctx.clearRect(0, 0, 256, 256);
  
  // Draw sun rays (triangular)
  ctx.fillStyle = '#FFA500'; // Orange rays
  const rayCount = 12;
  const rayLength = 35;
  const rayWidth = 15;
  
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const x1 = centerX + Math.cos(angle) * sunRadius;
    const y1 = centerY + Math.sin(angle) * sunRadius;
    const x2 = centerX + Math.cos(angle) * (sunRadius + rayLength);
    const y2 = centerY + Math.sin(angle) * (sunRadius + rayLength);
    
    const perpAngle = angle + Math.PI / 2;
    const dx = Math.cos(perpAngle) * rayWidth;
    const dy = Math.sin(perpAngle) * rayWidth;
    
    ctx.beginPath();
    ctx.moveTo(x1 + dx, y1 + dy);
    ctx.lineTo(x1 - dx, y1 - dy);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
  }
  
  // Draw sun body (bright yellow circle)
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
  gradient.addColorStop(0, '#FFEB3B'); // Bright yellow center
  gradient.addColorStop(1, '#FFD700'); // Golden edge
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
  ctx.fill();
  
  // Add cute kawaii face to sun!
  drawKawaiiFace(ctx, centerX, centerY);
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  
  return texture;
}

