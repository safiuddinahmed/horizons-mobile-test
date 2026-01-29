/**
 * Terrain Utilities
 * Heightmap generation and terrain-related utilities for RS3-inspired gardens
 */

/**
 * Simple Perlin/Simplex-like noise function
 * Based on improved noise algorithm for smooth, organic terrain
 */
export class TerrainNoise {
  private permutation: number[];
  
  constructor(seed: number = 0) {
    // Create permutation table based on seed
    this.permutation = [];
    for (let i = 0; i < 256; i++) {
      this.permutation[i] = i;
    }
    
    // Shuffle based on seed
    const random = this.seededRandom(seed);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
    }
    
    // Duplicate for wrapping
    this.permutation = [...this.permutation, ...this.permutation];
  }
  
  private seededRandom(seed: number): () => number {
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  /**
   * 2D Perlin noise - returns value between -1 and 1
   */
  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const a = this.permutation[X] + Y;
    const aa = this.permutation[a];
    const ab = this.permutation[a + 1];
    const b = this.permutation[X + 1] + Y;
    const ba = this.permutation[b];
    const bb = this.permutation[b + 1];
    
    return this.lerp(
      v,
      this.lerp(u, this.grad(this.permutation[aa], x, y), this.grad(this.permutation[ba], x - 1, y)),
      this.lerp(u, this.grad(this.permutation[ab], x, y - 1), this.grad(this.permutation[bb], x - 1, y - 1))
    );
  }
}

/**
 * Generate heightmap with multiple octaves for natural variation
 */
export function generateHeightmap(
  width: number,
  height: number,
  options: {
    seed?: number;
    scale?: number;
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
    amplitude?: number;
    redistribution?: number; // Power to apply for height redistribution
  } = {}
): Float32Array {
  const {
    seed = 42,
    scale = 0.1,
    octaves = 4,
    persistence = 0.5,
    lacunarity = 2.0,
    amplitude = 0.5,
    redistribution = 1.2
  } = options;
  
  const noise = new TerrainNoise(seed);
  const heightmap = new Float32Array(width * height);
  
  let maxHeight = 0;
  let minHeight = 0;
  
  // Generate noise with multiple octaves
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let noiseValue = 0;
      let amplitudeSum = 0;
      let currentAmplitude = 1;
      let currentFrequency = scale;
      
      // Combine multiple octaves
      for (let octave = 0; octave < octaves; octave++) {
        const sampleX = x * currentFrequency;
        const sampleY = y * currentFrequency;
        
        noiseValue += noise.noise2D(sampleX, sampleY) * currentAmplitude;
        amplitudeSum += currentAmplitude;
        
        currentAmplitude *= persistence;
        currentFrequency *= lacunarity;
      }
      
      // Normalize by sum of amplitudes
      noiseValue /= amplitudeSum;
      
      const index = y * width + x;
      heightmap[index] = noiseValue;
      
      maxHeight = Math.max(maxHeight, noiseValue);
      minHeight = Math.min(minHeight, noiseValue);
    }
  }
  
  // Normalize to 0-1 range, apply redistribution, then scale by amplitude
  for (let i = 0; i < heightmap.length; i++) {
    // Normalize to 0-1
    let normalized = (heightmap[i] - minHeight) / (maxHeight - minHeight);
    
    // Apply redistribution curve (makes valleys flatter, hills more pronounced)
    normalized = Math.pow(normalized, redistribution);
    
    // Scale by amplitude
    heightmap[i] = normalized * amplitude;
  }
  
  return heightmap;
}

/**
 * Sample height from heightmap at given x,z position
 * Uses bilinear interpolation for smooth values between grid points
 */
export function sampleHeight(
  heightmap: Float32Array,
  width: number,
  height: number,
  x: number,
  z: number,
  terrainSize: number
): number {
  // Convert world position to heightmap coordinates
  const halfSize = terrainSize / 2;
  const u = ((x + halfSize) / terrainSize) * (width - 1);
  const v = ((z + halfSize) / terrainSize) * (height - 1);
  
  // Clamp to valid range
  const clampedU = Math.max(0, Math.min(width - 1, u));
  const clampedV = Math.max(0, Math.min(height - 1, v));
  
  // Get integer coordinates
  const x0 = Math.floor(clampedU);
  const y0 = Math.floor(clampedV);
  const x1 = Math.min(x0 + 1, width - 1);
  const y1 = Math.min(y0 + 1, height - 1);
  
  // Get fractional parts
  const fx = clampedU - x0;
  const fy = clampedV - y0;
  
  // Sample four corners
  const h00 = heightmap[y0 * width + x0];
  const h10 = heightmap[y0 * width + x1];
  const h01 = heightmap[y1 * width + x0];
  const h11 = heightmap[y1 * width + x1];
  
  // Bilinear interpolation
  const h0 = h00 * (1 - fx) + h10 * fx;
  const h1 = h01 * (1 - fx) + h11 * fx;
  const finalHeight = h0 * (1 - fy) + h1 * fy;
  
  return finalHeight;
}

/**
 * Apply smooth edge falloff to create natural garden boundaries
 */
export function applyEdgeFalloff(
  heightmap: Float32Array,
  width: number,
  height: number,
  falloffDistance: number = 0.15 // 15% of terrain from edges
): Float32Array {
  const result = new Float32Array(heightmap);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate normalized distance from center (0 to 1)
      const nx = (x / (width - 1)) * 2 - 1; // -1 to 1
      const ny = (y / (height - 1)) * 2 - 1; // -1 to 1
      
      // Distance from edge (0 at edge, 1 at center)
      const distFromEdge = 1 - Math.max(Math.abs(nx), Math.abs(ny));
      
      // Calculate falloff multiplier
      let falloffMultiplier = 1;
      if (distFromEdge < falloffDistance) {
        // Smooth falloff using smoothstep
        const t = distFromEdge / falloffDistance;
        falloffMultiplier = t * t * (3 - 2 * t);
      }
      
      const index = y * width + x;
      result[index] *= falloffMultiplier;
    }
  }
  
  return result;
}
