import * as THREE from 'three';

/**
 * Generate procedural textures for PLA-style terrain
 */

/**
 * Create grass texture with painted brushstroke effect
 */
export function createGrassTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // PLA grass colors - muted olive-green palette (slightly darker)
  const grassBase = '#7A8A4F';
  const grassDark = '#5A6A3C';
  const grassLight = '#8A9A5C';
  
  // Fill base color
  ctx.fillStyle = grassBase;
  ctx.fillRect(0, 0, size, size);
  
  // Add painted brushstroke variation
  const numStrokes = 800;
  for (let i = 0; i < numStrokes; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 8 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    const width = 1 + Math.random() * 3;
    
    // Random color variation
    const colorChoice = Math.random();
    let color;
    if (colorChoice < 0.3) {
      color = grassDark;
    } else if (colorChoice < 0.7) {
      color = grassBase;
    } else {
      color = grassLight;
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = 0.15 + Math.random() * 0.15;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }
  
  // Add fine noise for organic feel
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 12;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Add 2D grass tuft texture overlay (PLA-style clumped grass)
  const numTufts = 1000;
  const tuftColor = grassLight; // Use lighter color for tuft definition
  
  for (let i = 0; i < numTufts; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const tuftSize = 2 + Math.random() * 4;
    const rotation = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = tuftColor;
    ctx.lineWidth = 1.5 + Math.random() * 1;
    ctx.globalAlpha = 0.3 + Math.random() * 0.2;
    
    // Draw grass tuft with 2-3 diverging leaves
    const numLeaves = 2 + Math.floor(Math.random() * 2); // 2 or 3 leaves
    
    for (let j = 0; j < numLeaves; j++) {
      const leafAngle = rotation + (j / numLeaves) * Math.PI - Math.PI / 2;
      const spread = 0.4 + Math.random() * 0.3; // How wide leaves spread
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(leafAngle) * tuftSize * spread,
        y + Math.sin(leafAngle) * tuftSize
      );
      ctx.stroke();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  
  return texture;
}

/**
 * Create dirt texture with natural earth variation
 */
export function createDirtTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  // PLA dirt colors - reddish-brown palette
  const dirtBase = '#9B6B5A';
  const dirtDark = '#8B5A4A';
  const dirtLight = '#B89968';
  
  // Fill base color
  ctx.fillStyle = dirtBase;
  ctx.fillRect(0, 0, size, size);
  
  // Add natural earth variation with organic patches
  const numPatches = 300;
  for (let i = 0; i < numPatches; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = 5 + Math.random() * 25;
    
    // Random color variation
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
  
  // Add fine granular noise
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
  texture.repeat.set(4, 4);
  
  return texture;
}
