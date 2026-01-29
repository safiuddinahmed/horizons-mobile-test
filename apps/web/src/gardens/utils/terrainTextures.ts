import * as THREE from 'three';

/**
 * Pokemon Legends: Arceus Terrain Textures
 * Two-layer system: Simple base + Grass stroke overlay
 */

/**
 * Layer 1: Simple base ground texture
 * Just soft color variation - no detail needed here
 */
export function createGrassTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // PLA base colors
  const baseColor = '#7a8a60'; // Muted olive-green
  const darkColor = '#6a7a50';
  const lightColor = '#8a9a70';
  
  // Base color
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, size, size);
  
  // Soft color patches (large, simple)
  const numPatches = 25;
  for (let i = 0; i < numPatches; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 100 + Math.random() * 150;
    
    const patchColor = Math.random() < 0.5 ? darkColor : lightColor;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, patchColor);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
  
  // Subtle noise
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 6;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  
  return texture;
}

/**
 * Layer 2: Grass stroke overlay texture
 * TINY diagonal strokes (1-4px) - this is the KEY layer!
 * Will be sampled in WORLD SPACE in shader
 */
export function createGrassStrokeTexture(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // Start with transparency
  ctx.clearRect(0, 0, size, size);
  
  // Stroke colors - yellow-green
  const strokeColors = [
    '#b8c850', // Bright yellow-green
    '#a8b840', // Medium
    '#98a850', // Olive-green
  ];
  
  // Diagonal stroke pattern
  const mainAngle = Math.PI * 0.35; // ~63 degrees
  const numStrokes = 8000; // DENSE for tileable pattern
  
  ctx.lineCap = 'round';
  
  for (let i = 0; i < numStrokes; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    
    // TINY strokes (10% of previous size!)
    const length = 1 + Math.random() * 3; // 1-4px (was 10-40px!)
    
    // Consistent direction
    const angle = mainAngle + (Math.random() - 0.5) * 0.25;
    
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    // Pick color
    const strokeColor = strokeColors[Math.floor(Math.random() * strokeColors.length)];
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.5 + Math.random() * 0.5; // Very thin (0.5-1px)
    ctx.globalAlpha = 0.4 + Math.random() * 0.3; // Semi-transparent
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;
  
  // Secondary cross-directional strokes
  const secondaryAngle = mainAngle + Math.PI / 5;
  const numSecondary = 4000;
  
  for (let i = 0; i < numSecondary; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 1 + Math.random() * 2.5;
    const angle = secondaryAngle + (Math.random() - 0.5) * 0.3;
    
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    const strokeColor = strokeColors[Math.floor(Math.random() * strokeColors.length)];
    
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.5 + Math.random() * 0.4;
    ctx.globalAlpha = 0.3 + Math.random() * 0.25;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  
  // Very slight blur
  ctx.filter = 'blur(0.2px)';
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // NO repeat here - will be handled in shader with world UVs
  
  return texture;
}

/**
 * Create PLA dirt texture
 */
export function createDirtTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // PLA dirt colors
  const dirtBase = '#9B6B5A';
  const dirtDark = '#8B5A4A';
  const dirtLight = '#B89968';
  
  ctx.fillStyle = dirtBase;
  ctx.fillRect(0, 0, size, size);
  
  // Organic patches
  const numPatches = 300;
  for (let i = 0; i < numPatches; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 5 + Math.random() * 25;
    
    const colorChoice = Math.random();
    let color;
    if (colorChoice < 0.35) {
      color = dirtDark;
    } else if (colorChoice < 0.7) {
      color = dirtBase;
    } else {
      color = dirtLight;
    }
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = 0.2 + Math.random() * 0.2;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  
  // Granular noise
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 15;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.5, 2.5);
  
  return texture;
}
