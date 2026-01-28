# 🌸 Horizons Memory Garden - Web Application

A beautiful 3D garden environment with interactive flowers, built with React, Three.js, and TypeScript.

## 🏗️ Project Structure

```
horizons-mobile-test/
├── apps/
│   └── web/                 # Vite React app
│       ├── src/
│       │   ├── flowers/     # Flower components & logic
│       │   ├── gardens/     # Garden scenes & themes
│       │   ├── interactions/ # Drag/drop, hover, click
│       │   ├── ui/          # Shared UI components
│       │   ├── App.tsx      # Main app
│       │   └── main.tsx     # Entry point
│       └── public/
│           └── models/      # GLB 3D models
│               ├── flowers/
│               └── environment/
└── package.json             # Root package
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

## 🌸 Flowers

- **Simple Daisy** - Pure and innocent (#FFFFFF)
- **Classic Rose** - Timeless love (#FF0000)
- **Bright Sunflower** - Radiant joy (#FFD700)

## 🚀 Getting Started

### Install Dependencies

```bash
npm run install-deps
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📦 Tech Stack

- **Frontend**: Vite + React + TypeScript
- **3D Rendering**: Three.js + React Three Fiber
- **3D Helpers**: @react-three/drei
- **Animation**: @react-spring/three
- **Gestures**: @use-gesture/react
- **3D Models**: GLB files

## 🎯 Features

- ✅ Multiple garden environments with unique atmospheres
- ✅ 3D flower models (GLB)
- ✅ Click to place flowers in the garden
- ✅ Drag & drop to reposition flowers
- ✅ Click flowers for detailed information panel
- ✅ Bud/Bloom state system
- ✅ Beautiful UI with romantic greeting card design
- ✅ Seasonal weather effects (customizable per garden)

## 🎮 How to Use

1. **Select a Garden**: Choose from the garden themes on the left panel
2. **Add Flowers**: Click a flower type from the right panel
3. **Place Flowers**: Click anywhere in the garden to place your selected flower
4. **Move Flowers**: Drag and drop flowers to reposition them
5. **View Details**: Click on a flower to see its details and symbolism
6. **Bloom Flowers**: Click the bloom button to transform buds into blooming flowers

---

Built with 🌻 for Horizons Memory Garden
