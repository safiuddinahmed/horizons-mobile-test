/**
 * Preset sky configurations for different moods and seasons
 */
export const SkyPresets = {
  clearDay: {
    topColor: '#87CEEB',
    bottomColor: '#E0F6FF',
    cloudCount: 18, // Increased from 12
    cloudSpeed: 0.3,
    style: 'runescape' as const
  },
  peacefulMorning: {
    topColor: '#B4D7E8',
    bottomColor: '#FFF8F0',
    cloudCount: 12, // Increased from 8
    cloudSpeed: 0.2,
    style: 'peaceful' as const
  },
  brightNoon: {
    topColor: '#4A90D9',
    bottomColor: '#D4E8F7',
    cloudCount: 15, // Increased from 10
    cloudSpeed: 0.4,
    style: 'modern' as const
  },
  softEvening: {
    topColor: '#6B8FB8',
    bottomColor: '#FFE4CC',
    cloudCount: 20, // Increased from 15
    cloudSpeed: 0.15,
    style: 'peaceful' as const
  },
  winterDay: {
    topColor: '#A8C5D9',
    bottomColor: '#E8F0F5',
    cloudCount: 25, // Increased from 18
    cloudSpeed: 0.5,
    style: 'modern' as const
  }
};
