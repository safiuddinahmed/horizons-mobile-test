import { Canvas, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useState } from 'react';
import { GardenScene } from '../../../packages/gardens/GardenScene';
import { GARDEN_CONFIGS, GardenConfig } from '../../../packages/gardens/gardenConfigs';
import { useFlowerGarden, FLOWER_DEFINITIONS } from '../../../packages/flowers';
import { FlowerModel } from '../../../packages/flowers/FlowerModel';
import { getFlowerDefinition } from '../../../packages/flowers/types';
import type { PlacedFlower, FlowerDefinition } from '../../../packages/flowers/types';
import './App.css';

function App() {
  const [currentGarden, setCurrentGarden] = useState<GardenConfig>(
    GARDEN_CONFIGS.quiet_garden
  );
  
  // Flower garden management
  const { flowers, addFlower, removeFlower, updateFlower } = useFlowerGarden(
    currentGarden.key,
    [] // Start with no flowers
  );
  
  const [selectedFlower, setSelectedFlower] = useState<{ flower: PlacedFlower; definition: FlowerDefinition } | null>(null);
  const [placingFlowerType, setPlacingFlowerType] = useState<number | null>(null);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* Garden Selector UI */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 100,
        background: 'rgba(30, 30, 30, 0.85)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#FFFFFF'
        }}>
          🌸 Select Garden
        </h2>
        {Object.values(GARDEN_CONFIGS).map((garden) => {
          const isSelected = currentGarden.key === garden.key;
          const gardenColors: Record<string, string> = {
            quiet_garden: '#A8B89F',
            spring_meadow: '#4A7C59',
            autumn_grove: '#D4A574',
            winter_wonderland: '#B8C5D6'
          };
          const accentColor = gardenColors[garden.key] || '#4A90A4';
          
          return (
            <button
              key={garden.key}
              onClick={() => setCurrentGarden(garden)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                margin: '8px 0',
                border: isSelected 
                  ? `2px solid ${accentColor}` 
                  : '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                background: isSelected 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: isSelected 
                  ? `0 0 15px ${accentColor}40` 
                  : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
            >
              <div style={{ 
                fontWeight: 600, 
                marginBottom: '4px',
                color: '#FFFFFF'
              }}>
                {garden.displayName}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#A0A0A0'
              }}>
                {garden.tierAccess}
              </div>
            </button>
          );
        })}
      </div>

      {/* Flower Palette */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 100,
        background: 'rgba(30, 30, 30, 0.85)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        minWidth: '200px'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '18px', 
          fontWeight: 600,
          color: '#FFFFFF'
        }}>
          🌺 Add Flowers
        </h2>
        
        {Object.values(FLOWER_DEFINITIONS).map((flowerDef) => (
          <button
            key={flowerDef.id}
            onClick={() => setPlacingFlowerType(flowerDef.id)}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              border: placingFlowerType === flowerDef.id 
                ? `2px solid ${flowerDef.color}` 
                : '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              background: placingFlowerType === flowerDef.id 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              boxShadow: placingFlowerType === flowerDef.id 
                ? `0 0 15px ${flowerDef.color}40` 
                : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = `${flowerDef.color}80`;
            }}
            onMouseLeave={(e) => {
              if (placingFlowerType !== flowerDef.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }
            }}
          >
            <div style={{ 
              fontWeight: 600, 
              marginBottom: '4px',
              color: '#FFFFFF'
            }}>
              {flowerDef.name}
            </div>
            <div style={{ 
              fontSize: '11px', 
              color: '#A0A0A0',
              fontStyle: 'italic'
            }}>
              {flowerDef.symbolism}
            </div>
          </button>
        ))}
        
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#B0B0B0',
          lineHeight: '1.4'
        }}>
          {placingFlowerType 
            ? '👆 Click garden to place flower' 
            : 'Click a flower to place it'}
        </div>
      </div>

      {/* Info Panel / Selected Flower */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 100,
        background: 'rgba(30, 30, 30, 0.85)',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(10px)',
        maxWidth: '300px'
      }}>
        {selectedFlower ? (
          <>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '16px',
              color: '#FFFFFF'
            }}>
              {selectedFlower.definition.name}
            </h3>
            <p style={{ 
              margin: '0 0 10px 0', 
              fontSize: '14px', 
              color: '#E0E0E0', 
              lineHeight: '1.4' 
            }}>
              {selectedFlower.definition.description}
            </p>
            <button
              onClick={() => {
                removeFlower(selectedFlower.flower.id);
                setSelectedFlower(null);
              }}
              style={{
                padding: '8px 12px',
                background: '#DC143C',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              🗑️ Remove Flower
            </button>
          </>
        ) : (
          <>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '16px',
              color: '#FFFFFF'
            }}>
              {currentGarden.displayName}
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: '#E0E0E0', 
              lineHeight: '1.4' 
            }}>
              {currentGarden.description}
            </p>
            <p style={{ 
              margin: '10px 0 0 0', 
              fontSize: '12px', 
              color: '#A0A0A0', 
              lineHeight: '1.4' 
            }}>
              {flowers.length} flower{flowers.length !== 1 ? 's' : ''} planted
            </p>
          </>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.2}
        />
        
        <GardenScene config={currentGarden}>
          {/* Ground plane for clicking to place flowers */}
          <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0.01, 0]}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (placingFlowerType) {
                e.stopPropagation();
                const { x, z } = e.point;
                addFlower(placingFlowerType, { x, y: 0, z });
                setPlacingFlowerType(null);
              }
            }}
            visible={false}
          >
            <planeGeometry args={[40, 40]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          
          {/* Render all placed flowers */}
          {flowers.map(flower => {
            const definition = getFlowerDefinition(flower.flowerDefinitionId);
            if (!definition) return null;
            
            return (
              <FlowerModel
                key={flower.id}
                flower={flower}
                definition={definition}
                onClick={(clickedFlower) => {
                  setSelectedFlower({ flower: clickedFlower, definition });
                  setPlacingFlowerType(null);
                }}
                onDragEnd={(draggedFlower, newPosition) => {
                  updateFlower(draggedFlower.id, { position: newPosition });
                }}
                draggable={!placingFlowerType}
              />
            );
          })}
        </GardenScene>
      </Canvas>
    </div>
  );
}

export default App;
