/**
 * Flower System Types
 * Matches backend schema for flowers and garden content
 */

export interface FlowerDefinition {
  id: number;
  name: string;
  description: string;
  color: string;
  modelPath: string;
  symbolism: string;
  defaultScale: number;
}

export type FlowerState = 'BUD' | 'BLOOMED' | 'OPEN';

export interface PlacedFlower {
  id: string;
  flowerDefinitionId: number;
  gardenId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  scale: number;
  placedAt: Date;
  state: FlowerState;  // Current bloom state
  bloomAt?: Date;  // Optional scheduled bloom time
  bloomedAt?: Date;  // When the flower actually bloomed
}

/**
 * Available flower definitions
 */
export const FLOWER_DEFINITIONS: Record<string, FlowerDefinition> = {
  daisy: {
    id: 1,
    name: 'Simple Daisy',
    description: 'A pure white daisy representing innocence and simplicity',
    color: '#FFFFFF',
    modelPath: '/models/flowers/Daisy.glb',
    symbolism: 'Innocence, purity, and new beginnings',
    defaultScale: 1.5  // 2x smaller than previous (3.0 / 2)
  },
  rose: {
    id: 2,
    name: 'Classic Rose',
    description: 'A timeless red rose symbolizing deep love',
    color: '#DC143C',
    modelPath: '/models/flowers/Rose.glb',
    symbolism: 'Timeless love and cherished memories',
    defaultScale: 0.0144  // 6x larger than previous (0.0024 * 6)
  },
  sunflower: {
    id: 3,
    name: 'Sunflower',
    description: 'A bright sunflower for unplanned moments of joy',
    color: '#FFD700',
    modelPath: '/models/flowers/Sunflower.glb',
    symbolism: 'Unplanned moments and spontaneous happiness',
    defaultScale: 1.35  // 1.5x larger than previous (0.9 * 1.5)
  }
};

/**
 * Get flower definition by ID
 */
export function getFlowerDefinition(id: number): FlowerDefinition | undefined {
  return Object.values(FLOWER_DEFINITIONS).find(def => def.id === id);
}

/**
 * Generate unique flower ID
 */
export function generateFlowerId(): string {
  return `flower_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
