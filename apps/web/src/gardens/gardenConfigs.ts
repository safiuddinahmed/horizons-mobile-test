/**
 * Garden Configuration System
 * Defines visual themes, colors, lighting, and atmosphere for each garden environment
 */

export interface GardenConfig {
  key: string;
  displayName: string;
  description: string;
  tierAccess: 'FREE' | 'PRO' | 'PREMIUM';
  
  colors: {
    primary: string;
    secondary: string;
    sky: [string, string]; // Gradient [top, bottom]
    ground: string;
    ambient: string;
  };
  
  lighting: {
    ambient: {
      color: string;
      intensity: number;
    };
    directional: {
      color: string;
      intensity: number;
      position: [number, number, number];
    };
  };
  
  environment: {
    ground: 'moss_grass' | 'lush_grass' | 'fallen_leaves' | 'snow';
    trees: {
      type: 'birch' | 'maple' | 'pine' | 'mixed';
      count: number;
      spacing: 'sparse' | 'medium' | 'dense';
    };
    details: string[]; // pebbles, stones, bushes, etc.
  };
  
  particles: {
    type: 'breeze' | 'petals' | 'leaves' | 'snow' | 'none';
    density: 'minimal' | 'light' | 'medium' | 'heavy';
    speed: number;
  };
  
  fog?: {
    color: string;
    near: number;
    far: number;
  };
}

/**
 * Test Garden - Experimental garden for testing new features
 * FREE tier - RS3-inspired with rolling terrain
 */
export const testGarden: GardenConfig = {
  key: 'test_garden',
  displayName: 'Test Garden',
  description: 'An experimental garden showcasing rolling hills and RS3-inspired aesthetics',
  tierAccess: 'FREE',
  
  colors: {
    primary: '#5A8F67',      // Rich forest green (main grass)
    secondary: '#7FB88D',    // Lighter highlight green
    sky: ['#87CEEB', '#B0D4E8'], // Clear blue sky gradient
    ground: '#6B5744',       // Warm earth/soil
    ambient: '#F5F0E8'       // Warm natural light
  },
  
  lighting: {
    ambient: {
      color: '#F5F0E8',
      intensity: 0.65
    },
    directional: {
      color: '#FFF5E6',
      intensity: 0.85,
      position: [10, 18, 8]
    }
  },
  
  environment: {
    ground: 'lush_grass',
    trees: {
      type: 'mixed',
      count: 6,
      spacing: 'medium'
    },
    details: ['rocks', 'stones', 'grass_tufts', 'flower_patches']
  },
  
  particles: {
    type: 'breeze',
    density: 'light',
    speed: 0.4
  }
};

/**
 * Quiet Garden - Peaceful sanctuary for contemplation
 * FREE tier - Warm, inviting, gentle atmosphere
 */
export const quietGarden: GardenConfig = {
  key: 'quiet_garden',
  displayName: 'Quiet Garden',
  description: 'A peaceful, timeless garden space for quiet reflection',
  tierAccess: 'FREE',
  
  colors: {
    primary: '#A8B89F',      // Soft sage green
    secondary: '#D4C5B9',    // Warm stone
    sky: ['#E8D4C8', '#F5E8DD'], // Warm peachy cream gradient
    ground: '#C8D4B8',       // Moss green
    ambient: '#FFF4E0'       // Warm cream glow
  },
  
  lighting: {
    ambient: {
      color: '#FFF4E0',
      intensity: 0.6
    },
    directional: {
      color: '#FFFAF0',
      intensity: 0.7,
      position: [10, 15, 5]
    }
  },
  
  environment: {
    ground: 'moss_grass',
    trees: {
      type: 'birch',
      count: 4,
      spacing: 'sparse'
    },
    details: ['pebbles', 'stone_path', 'bench', 'grass_tufts']
  },
  
  particles: {
    type: 'breeze',
    density: 'minimal',
    speed: 0.3
  }
};

/**
 * Spring Meadow - Joyful awakening with vibrant life
 * PREMIUM tier - Fresh, hopeful, energetic atmosphere
 */
export const springMeadow: GardenConfig = {
  key: 'spring_meadow',
  displayName: 'Spring Meadow',
  description: 'A vibrant garden shaped by renewal and fresh beginnings',
  tierAccess: 'PREMIUM',
  
  colors: {
    primary: '#4A7C59',      // Darker, richer green (not too bright)
    secondary: '#FFE66D',    // Sunshine yellow
    sky: ['#87CEEB', '#E0F7FA'], // Clear blue sky
    ground: '#5A8F67',       // Deep natural green
    ambient: '#FFFACD'       // Bright warm light
  },
  
  lighting: {
    ambient: {
      color: '#FFFACD',
      intensity: 0.7
    },
    directional: {
      color: '#FFFFFF',
      intensity: 0.9,
      position: [5, 20, 5]
    }
  },
  
  environment: {
    ground: 'lush_grass',
    trees: {
      type: 'maple',
      count: 6,
      spacing: 'medium'
    },
    details: ['flower_patches', 'bushes', 'stone_path', 'grass_tufts']
  },
  
  particles: {
    type: 'petals',
    density: 'light',
    speed: 0.5
  }
};

/**
 * Autumn Grove - Golden nostalgia and cherished memories
 * PREMIUM tier - Cozy, nostalgic, bittersweet atmosphere
 */
export const autumnGrove: GardenConfig = {
  key: 'autumn_grove',
  displayName: 'Autumn Grove',
  description: 'A warm, golden garden made for cherished memories',
  tierAccess: 'PREMIUM',
  
  colors: {
    primary: '#A67C52',      // Muted autumn brown (fall colors, not too orange)
    secondary: '#C1666B',    // Deep rose
    sky: ['#D4A574', '#F5DEB3'], // Warm wheat to cream (less orange)
    ground: '#8B7355',       // Natural earth brown
    ambient: '#E8C4A0'       // Soft warm glow
  },
  
  lighting: {
    ambient: {
      color: '#FFAA70',
      intensity: 0.65
    },
    directional: {
      color: '#FFA500',
      intensity: 0.75,
      position: [15, 10, 8]
    }
  },
  
  environment: {
    ground: 'fallen_leaves',
    trees: {
      type: 'maple',
      count: 6,
      spacing: 'medium'
    },
    details: ['leaf_piles', 'bare_branches', 'fence', 'pumpkins']
  },
  
  particles: {
    type: 'leaves',
    density: 'medium',
    speed: 0.4
  }
};

/**
 * Winter Wonderland - Serene stillness and peaceful rest
 * PREMIUM tier - Pure, contemplative, quiet atmosphere
 */
export const winterWonderland: GardenConfig = {
  key: 'winter_wonderland',
  displayName: 'Winter Wonderland',
  description: 'A serene, frost-touched garden of peaceful stillness',
  tierAccess: 'PREMIUM',
  
  colors: {
    primary: '#E8F4F8',      // Snow white
    secondary: '#B8C5D6',    // Ice blue
    sky: ['#D6E4F0', '#F0F8FF'], // Soft gray to white
    ground: '#F0F8FF',       // Fresh snow
    ambient: '#E8F4F8'       // Cool white
  },
  
  lighting: {
    ambient: {
      color: '#E8F4F8',
      intensity: 0.8
    },
    directional: {
      color: '#FFFFFF',
      intensity: 0.6,
      position: [10, 20, 10]
    }
  },
  
  environment: {
    ground: 'snow',
    trees: {
      type: 'pine',
      count: 5,
      spacing: 'medium'
    },
    details: ['icicles', 'snow_drifts', 'frosted_bushes', 'tracks']
  },
  
  particles: {
    type: 'snow',
    density: 'light',
    speed: 0.2
  },
  
  fog: {
    color: '#E0F0FF',
    near: 10,
    far: 50
  }
};

/**
 * All available gardens mapped by key
 */
export const GARDEN_CONFIGS: Record<string, GardenConfig> = {
  test_garden: testGarden,
  quiet_garden: quietGarden,
  spring_meadow: springMeadow,
  autumn_grove: autumnGrove,
  winter_wonderland: winterWonderland
};

/**
 * Get gardens available for a specific tier
 */
export function getGardensForTier(tier: 'FREE' | 'PRO' | 'PREMIUM'): GardenConfig[] {
  const tierHierarchy = { FREE: 0, PRO: 1, PREMIUM: 2 };
  const userTierLevel = tierHierarchy[tier];
  
  return Object.values(GARDEN_CONFIGS).filter(
    garden => tierHierarchy[garden.tierAccess] <= userTierLevel
  );
}
