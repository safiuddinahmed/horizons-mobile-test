# Garden Expansion & Sizing Design Document

**Date:** January 29, 2026  
**Status:** Design Proposal - Not Yet Implemented  
**Purpose:** Define how gardens grow and maintain visual beauty as users plant more flowers

---

## 🎯 Core Design Goals

1. **Start small, grow naturally** - Gardens feel cozy at first, expansive later
2. **Always beautiful** - Uniform asset distribution at any size
3. **Rewarding progression** - Expansion feels like an achievement
4. **No micromanagement** - System handles complexity automatically

---

## 📏 Garden Sizing Strategy

### Current State

- **Fixed size:** 40x40 units (terrain) with 60x60 base layer
- **No expansion:** Gardens don't grow with flower count
- **Static assets:** Trees, rocks placed once

### Proposed System: **Tiered Growth**

| Flower Count   | Garden Size | Tier Name   | Description           |
| -------------- | ----------- | ----------- | --------------------- |
| 0-10 flowers   | **20x20**   | Starter     | Cozy, intimate garden |
| 11-25 flowers  | **30x30**   | Growing     | Expanding space       |
| 26-50 flowers  | **40x40**   | Established | Well-developed garden |
| 51-100 flowers | **50x50**   | Thriving    | Flourishing landscape |
| 100+ flowers   | **60x60**   | Maximum     | Grand estate          |

**Why this progression?**

- ✅ Early gardens feel achievable and full
- ✅ Growth is rewarding (visible milestone)
- ✅ Natural pacing (not too fast, not too slow)
- ✅ Maximum size prevents performance issues

---

## 🔄 Expansion Mechanisms

### Option A: **Automatic Expansion** ⭐ RECOMMENDED

```typescript
// Triggered automatically when flower threshold reached
function checkExpansion(flowerCount: number, currentSize: number) {
  if (flowerCount >= 10 && currentSize < 30) return expandTo(30);
  if (flowerCount >= 25 && currentSize < 40) return expandTo(40);
  if (flowerCount >= 50 && currentSize < 50) return expandTo(50);
  if (flowerCount >= 100 && currentSize < 60) return expandTo(60);
}
```

**Pros:**

- No user decisions needed
- Seamless experience
- Always optimal size
- Feels natural and rewarding

**Cons:**

- Less user agency
- No monetization opportunity

### Option B: **Manual Expansion with Constraints**

```typescript
// User must click "Expand Garden" button
interface ExpansionUnlock {
  fromSize: number;
  toSize: number;
  requiredFlowers: number;
  cost?: {
    type: "achievement" | "premium" | "special_flower";
    amount: number;
  };
}
```

**Pros:**

- User feels in control
- Can be premium feature
- Feels like achievement

**Cons:**

- Requires UI
- Could frustrate if flowers overflow
- Extra implementation

### Recommended: **Hybrid Approach**

```
Auto-expand: 20→30→40 (free, automatic)
Manual-expand: 40→50→60 (optional, user choice, could be premium)
```

Benefits of both worlds:

- New users get automatic growth
- Advanced users can expand further
- Monetization opportunity for 50x50 and 60x60

---

## 🌳 Uniform Asset Distribution System

### The Challenge

**Problem:** When garden expands from 20x20 → 60x60, how do we keep it looking beautiful and balanced?

**Bad approach:** Random placement → clustering, empty spots, unbalanced appearance

**Good approach:** Density-based zones with constraints

### Solution: **Density Zones System**

Each asset type has defined rules:

```typescript
interface AssetDensityRule {
  minSpacing: number; // Minimum distance between same asset type
  edgeBias: number; // 0-1: Preference for edge (1) vs center (0)
  densityPerArea: number; // Assets per square unit
  maxPerGarden: number; // Hard cap
}

const ASSET_RULES: Record<string, AssetDensityRule> = {
  trees: {
    minSpacing: 8,
    edgeBias: 0.7, // Prefer edges (frame the garden)
    densityPerArea: 1 / 150, // 1 tree per 150 sq units
    maxPerGarden: 12,
  },

  rocks: {
    minSpacing: 4,
    edgeBias: 0.5, // Neutral (anywhere)
    densityPerArea: 1 / 80, // 1 rock per 80 sq units
    maxPerGarden: 25,
  },

  stones: {
    minSpacing: 3,
    edgeBias: 0.4, // Slightly prefer center
    densityPerArea: 1 / 60,
    maxPerGarden: 30,
  },

  grassTufts: {
    minSpacing: 2,
    edgeBias: 0.3, // Prefer center (fill middle)
    densityPerArea: 1 / 30, // Dense coverage
    maxPerGarden: 50,
  },
};
```

### Asset Count by Garden Size

Based on density rules:

| Garden Size               | Trees | Rocks | Stones | Grass Tufts | Total Assets  |
| ------------------------- | ----- | ----- | ------ | ----------- | ------------- |
| **20x20** (400 sq units)  | 2-3   | 4-5   | 6-7    | 12-13       | ~27           |
| **30x30** (900 sq units)  | 4-6   | 8-11  | 12-15  | 25-30       | ~60           |
| **40x40** (1600 sq units) | 6-10  | 12-20 | 20-26  | 40-53       | ~110          |
| **50x50** (2500 sq units) | 8-12  | 16-31 | 30-41  | 60-83       | ~170          |
| **60x60** (3600 sq units) | 10-12 | 20-25 | 35-30  | 50-50       | ~135 (capped) |

**Note:** At maximum size, we cap total assets to prevent performance issues.

---

## 📍 Placement Algorithm

### Grid-Based Poisson Disk Sampling

**Why not random?**

- ❌ Random creates clusters and empty spots
- ❌ Hard to enforce minimum spacing
- ❌ Unnatural looking

**Why Poisson Disk?**

- ✅ Guarantees minimum spacing
- ✅ Uniform coverage
- ✅ Natural, organic appearance
- ✅ Fast to compute

### Implementation Strategy

```typescript
function placeAssets(gardenSize: number, assetType: string) {
  const rule = ASSET_RULES[assetType];
  const targetCount = Math.floor(gardenSize * gardenSize * rule.densityPerArea);
  const actualCount = Math.min(targetCount, rule.maxPerGarden);

  // 1. Divide garden into grid cells
  const cellSize = rule.minSpacing;
  const grid = createGrid(gardenSize, cellSize);

  // 2. Place assets using Poisson disk sampling
  const placed: Vector3[] = [];
  const candidates = generateCandidates(gardenSize, actualCount);

  for (const candidate of candidates) {
    // Check minimum spacing
    if (!hasNearbyAsset(candidate, placed, rule.minSpacing)) {
      // Apply edge bias
      const edgeScore = calculateEdgeScore(candidate, gardenSize);
      const roll = Math.random();

      if (roll < mixEdgeBias(edgeScore, rule.edgeBias)) {
        placed.push(candidate);
        grid.add(candidate);
      }
    }

    if (placed.length >= actualCount) break;
  }

  return placed;
}

function calculateEdgeScore(pos: Vector3, size: number): number {
  // 0 = center, 1 = edge
  const distFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
  const maxDist = size / 2;
  return distFromCenter / maxDist;
}

function mixEdgeBias(edgeScore: number, bias: number): number {
  // bias = 0.7 means 70% weight to edge positions
  // bias = 0.3 means 70% weight to center positions
  return edgeScore * bias + (1 - edgeScore) * (1 - bias);
}
```

---

## 🎬 Expansion Animation & Experience

### User Experience Flow

**When expansion is triggered:**

1. **Notification** (subtle, celebratory)

   ```
   🌸 "Your garden is growing!"
   "You've planted 10 flowers - your garden is expanding!"
   ```

2. **Visual Animation** (1-2 seconds)
   - Terrain smoothly scales from current → new size
   - Camera zooms out slightly to show new bounds
   - Sparkle/bloom particles at expansion boundary
   - Soft "whoosh" sound effect

3. **Asset Spawning** (staggered, natural)
   - New trees/rocks fade in over 0.5s
   - Appear in sequence (not all at once)
   - Slight "pop" animation (scale from 0.8 → 1.0)

4. **Completion** (satisfying closure)
   - Brief pause to admire new space
   - Optional: "Place your next flower!" prompt

### Animation Pseudocode

```typescript
async function expandGarden(fromSize: number, toSize: number) {
  // 1. Show notification
  showNotification({
    title: "Garden Expanding!",
    message: `Your garden is growing to ${toSize}x${toSize}`,
    icon: "🌸",
    duration: 2000,
  });

  // 2. Animate terrain expansion
  await animateTerrainScale({
    from: fromSize,
    to: toSize,
    duration: 1500,
    easing: "easeOutCubic",
  });

  // 3. Zoom camera out
  await animateCameraZoom({
    targetDistance: calculateCameraDistance(toSize),
    duration: 1000,
  });

  // 4. Calculate new asset positions
  const currentAssets = getPlacedAssets();
  const newAssets = calculateNewAssets(fromSize, toSize, currentAssets);

  // 5. Spawn new assets with stagger
  for (let i = 0; i < newAssets.length; i++) {
    spawnAsset(newAssets[i], {
      delay: i * 100, // 100ms between each
      fadeIn: true,
      popScale: true,
    });
  }

  // 6. Play celebration effect
  spawnParticles({
    type: "sparkle",
    position: getBoundaryPositions(toSize),
    count: 20,
    duration: 2000,
  });

  // 7. Update garden state
  updateGardenState({ size: toSize });
}
```

---

## 🛠️ Implementation Checklist

### Phase 1: Core Infrastructure

- [ ] Create `GardenState` interface with size, flowerCount, expansionTier
- [ ] Create `AssetDensityRule` interface and ASSET_RULES config
- [ ] Implement Poisson disk sampling utility
- [ ] Implement edge bias calculation functions
- [ ] Add garden size to gardenConfigs.ts

### Phase 2: Expansion Logic

- [ ] Create `checkExpansion()` function
- [ ] Implement `expandTo()` function with state updates
- [ ] Add expansion event system (listeners for UI updates)
- [ ] Implement asset rebalancing on expansion
- [ ] Add expansion history tracking (analytics)

### Phase 3: Asset Placement

- [ ] Implement `placeAssets()` with Poisson disk sampling
- [ ] Create `calculateEdgeScore()` utility
- [ ] Implement `mixEdgeBias()` utility
- [ ] Add collision detection with existing assets
- [ ] Create asset spawning/despawning system

### Phase 4: Animation & Polish

- [ ] Create terrain scale animation (Three.js tween)
- [ ] Implement camera zoom animation
- [ ] Add particle effects for expansion boundary
- [ ] Create asset fade-in/pop animations
- [ ] Add sound effects (expansion whoosh, asset pop)

### Phase 5: UI/UX

- [ ] Create expansion notification component
- [ ] Add garden size indicator to UI
- [ ] Show "Next expansion at X flowers" progress
- [ ] Add manual expansion button (if hybrid approach)
- [ ] Create expansion confirmation dialog (manual expansion)

### Phase 6: Testing & Balancing

- [ ] Test all expansion thresholds (10, 25, 50, 100)
- [ ] Verify asset density at each tier
- [ ] Test performance with maximum assets
- [ ] Ensure no asset overlaps or invalid placements
- [ ] Test camera behavior at all garden sizes

### Phase 7: Premium Features (Optional)

- [ ] Implement manual expansion unlock system
- [ ] Add expansion cost calculation
- [ ] Create premium expansion UI
- [ ] Add analytics tracking for expansion events

---

## 📊 State Management

### Garden State Interface

```typescript
interface GardenState {
  id: string;
  userId: string;
  size: number; // Current size (20, 30, 40, 50, 60)
  expansionTier: number; // 0-4 (starter, growing, established, thriving, maximum)
  flowerCount: number;
  placedAssets: PlacedAsset[];
  expansionHistory: ExpansionEvent[];
  createdAt: Date;
  lastExpandedAt?: Date;
}

interface PlacedAsset {
  id: string;
  type: "tree" | "rock" | "stone" | "grassTuft";
  position: { x: number; y: number; z: number };
  rotation: number;
  scale: number;
  placedAt: Date;
}

interface ExpansionEvent {
  fromSize: number;
  toSize: number;
  triggerType: "automatic" | "manual";
  flowerCountAtExpansion: number;
  timestamp: Date;
}
```

### Persistence

```typescript
// Save garden state to database
async function saveGardenState(state: GardenState) {
  await db.gardens.upsert({
    where: { id: state.id },
    update: {
      size: state.size,
      expansionTier: state.expansionTier,
      flowerCount: state.flowerCount,
      placedAssets: JSON.stringify(state.placedAssets),
      lastExpandedAt: new Date(),
    },
    create: state,
  });
}

// Load garden state from database
async function loadGardenState(gardenId: string): Promise<GardenState> {
  const garden = await db.gardens.findUnique({
    where: { id: gardenId },
  });

  return {
    ...garden,
    placedAssets: JSON.parse(garden.placedAssets),
  };
}
```

---

## 🎯 Success Metrics

Track these metrics to evaluate the expansion system:

1. **User Engagement**
   - Average flowers planted before first expansion
   - Retention rate after each expansion tier
   - Time between expansions

2. **Technical Performance**
   - Frame rate at each garden size
   - Asset spawn time
   - Memory usage by tier

3. **User Satisfaction**
   - Manual expansion conversion rate (if hybrid)
   - Garden abandonment rate by size
   - User feedback on expansion feel

---

## 📝 Notes & Considerations

### Edge Cases

1. **What if user deletes flowers?**
   - Don't shrink garden (would be disorienting)
   - Keep expanded size as permanent progress

2. **What if user has 100 flowers in 20x20 garden?**
   - Trigger all expansions in sequence (20→30→40→50→60)
   - Show cumulative celebration

3. **Performance on mobile?**
   - May need lower asset caps for mobile
   - Consider device-specific density rules

### Future Enhancements

- **Custom garden shapes** (circular, hexagonal)
- **Multi-zone gardens** (different biomes within one garden)
- **Vertical expansion** (terraced levels, elevated platforms)
- **Seasonal redecorating** (swap asset themes automatically)

---

## 🏁 Summary

**Current State:** Fixed 40x40 gardens with static assets

**Target State:** Dynamic 20x20 → 60x60 gardens with:

- Automatic expansion at flower milestones
- Uniform, beautiful asset distribution
- Smooth animations and celebrations
- Optimal performance at all sizes

**Recommended Approach:** Hybrid expansion (auto 20→40, manual 40→60)

**Key Technology:** Poisson disk sampling with edge bias for natural placement

**Timeline:** ~2-3 weeks for full implementation

---

**Document Version:** 1.0  
**Last Updated:** January 29, 2026  
**Status:** Awaiting approval for implementation
