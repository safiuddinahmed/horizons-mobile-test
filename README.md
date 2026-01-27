# 🌸 Horizons Memory Garden - Mobile & Web POC

A proof-of-concept for beautiful 3D garden environments with interactive flowers, built for both mobile (iOS/Android) and web.

## 🏗️ Project Structure

```
horizons-mobile-test/
├── apps/
│   ├── mobile/              # Expo app (iOS + Android) - Coming soon
│   └── web/                 # Vite React app ✅
│
├── packages/
│   ├── gardens/             # Garden scenes & themes - Coming soon
│   ├── flowers/             # Flower components - Coming soon
│   ├── interactions/        # Drag/drop, hover, click - Coming soon
│   └── ui/                  # Shared UI components - Coming soon
│
└── assets/
    └── models/              # GLB 3D models - To be added
        ├── flowers/
        └── environment/
```

## 🌳 Garden Themes

### 1. Quiet Garden (FREE)

- **Mood**: Peaceful sanctuary
- **Colors**: Soft sage greens, warm stone
- **Effect**: Gentle breeze

### 2. Spring Meadow (PREMIUM)

- **Mood**: Joyful awakening
- **Colors**: Fresh greens, sunshine yellow
- **Effect**: Falling petals

### 3. Autumn Grove (PREMIUM)

- **Mood**: Golden nostalgia
- **Colors**: Burnt orange, deep rose
- **Effect**: Falling leaves

### 4. Winter Wonderland (PREMIUM)

- **Mood**: Serene stillness
- **Colors**: Snow white, ice blue
- **Effect**: Gentle snowfall

## 🌸 Flowers (POC)

- **Simple Daisy** - Pure and innocent (#FFFFFF)
- **Classic Rose** - Timeless love (#FF0000)
- **Wildflower** - Unplanned moments (#FFD700)

## 🚀 Getting Started

### Install Dependencies

```bash
npm install
```

### Run Web App

```bash
cd apps/web
npm run dev
```

### Run Mobile App (Coming Soon)

```bash
cd apps/mobile
npx expo start
```

## 📦 Tech Stack

- **Monorepo**: Turborepo
- **Web**: Vite + React + TypeScript
- **Mobile**: Expo + React Native
- **3D**: Three.js + React Three Fiber
- **Animation**: @react-spring/three
- **3D Models**: GLB files from Poly Pizza

## 🎯 POC Features

- ✅ Multiple garden environments with unique atmospheres
- ✅ 3D flower models (GLB)
- ✅ Drag & drop flowers into garden
- ✅ Move/reposition flowers
- ✅ Hover to show flower info
- ✅ Click for detailed flower panel
- ✅ Weather particle effects (breeze, petals, leaves, snow)

## 📝 Next Steps

1. Install 3D dependencies (Three.js, R3F, Drei)
2. Create shared packages structure
3. Build garden system
4. Add GLB assets
5. Implement interactions
6. Set up Expo mobile app

---

Built with 🌻 for Horizons Memory Garden
