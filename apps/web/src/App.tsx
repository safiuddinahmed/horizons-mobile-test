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
  const [isDraggingFlower, setIsDraggingFlower] = useState(false);

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

      {/* Garden Info (Bottom Left - Simple) */}
      {!selectedFlower && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 100,
          background: 'rgba(30, 30, 30, 0.85)',
          padding: '15px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          maxWidth: '300px'
        }}>
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
        </div>
      )}

      {/* Detailed Flower Panel - Right Side Slide-in */}
      {selectedFlower && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '420px',
          height: '100vh',
          background: 'linear-gradient(to left, rgba(18,18,22,0.98), rgba(25,25,30,0.96))',
          backdropFilter: 'blur(30px)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.6)',
          zIndex: 200,
          borderLeft: `3px solid ${selectedFlower.definition.color}`,
          overflow: 'auto',
          animation: 'slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}>
          {/* Header Section */}
          <div style={{
            padding: '32px 32px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setSelectedFlower(null)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#FFFFFF',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
            >
              ✕
            </button>
            
            {/* Flower Icon */}
            <div style={{
              fontSize: '64px',
              textAlign: 'center',
              marginBottom: '16px',
              filter: `drop-shadow(0 4px 16px ${selectedFlower.definition.color}40)`
            }}>
              {selectedFlower.definition.id === 1 ? '🌼' : 
               selectedFlower.definition.id === 2 ? '🌹' : '🌻'}
            </div>
            
            {/* Flower Name */}
            <h2 style={{
              fontSize: '28px',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '8px',
              background: `linear-gradient(135deg, #FFFFFF, ${selectedFlower.definition.color})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px'
            }}>
              {selectedFlower.definition.name}
            </h2>
            
            {/* State & Date */}
            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#A0A0B0',
              marginBottom: '4px'
            }}>
              {selectedFlower.flower.state === 'BUD' ? (
                <>🌱 Bud · Waiting to bloom</>
              ) : (
                <>🌸 Bloomed</>
              )}
            </div>
            
            <div style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#70707D'
            }}>
              Planted {new Date(selectedFlower.flower.placedAt).toLocaleDateString()}
            </div>
          </div>
          
          {/* Content Section */}
          <div style={{ padding: '32px' }}>
            {/* Symbolism Card */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedFlower.definition.color}30`,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: selectedFlower.definition.color,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Symbolism
              </div>
              <div style={{
                fontSize: '14px',
                color: '#D0D0D8',
                fontStyle: 'italic',
                lineHeight: '1.6'
              }}>
                "{selectedFlower.definition.symbolism}"
              </div>
            </div>
            
            {/* Description Card */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              borderLeft: `3px solid ${selectedFlower.definition.color}`
            }}>
              <div style={{
                fontSize: '11px',
                color: '#A0A0B0',
                marginBottom: '10px',
                fontWeight: 500
              }}>
                ABOUT THIS FLOWER
              </div>
              <div style={{
                fontSize: '15px',
                color: '#E8E8F0',
                lineHeight: '1.7'
              }}>
                {selectedFlower.definition.description}
              </div>
            </div>
            
            {/* State Message */}
            {selectedFlower.flower.state === 'BUD' && (
              <div style={{
                textAlign: 'center',
                padding: '32px 20px',
                color: '#909099'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🌱</div>
                <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  This flower is waiting to bloom.<br/>
                  <span style={{ color: selectedFlower.definition.color, fontWeight: 600 }}>
                    Click the button below to reveal its beauty.
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Footer */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            padding: '20px 32px',
            background: 'rgba(18,18,22,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)'
          }}>
            <button
              onClick={() => {
                removeFlower(selectedFlower.flower.id);
                setSelectedFlower(null);
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(220, 20, 60, 0.15)',
                border: '1px solid rgba(220, 20, 60, 0.3)',
                borderRadius: '10px',
                color: '#FF6B6B',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(220, 20, 60, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(220, 20, 60, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(220, 20, 60, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(220, 20, 60, 0.3)';
              }}
            >
              Remove Flower
            </button>
          </div>
        </div>
      )}

      {/* External Bloom Button - Centered Bottom (only for buds) */}
      {selectedFlower && selectedFlower.flower.state === 'BUD' && (
        <button
          onClick={() => {
            updateFlower(selectedFlower.flower.id, { state: 'BLOOMED', bloomedAt: new Date() });
          }}
          style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 48px',
            fontSize: '17px',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            color: 'white',
            border: 'none',
            borderRadius: '32px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(76, 175, 80, 0.35)',
            fontWeight: 600,
            zIndex: 150,
            transition: 'all 0.3s',
            letterSpacing: '0.3px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(76, 175, 80, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(76, 175, 80, 0.35)';
          }}
        >
          🌱 Bloom this Flower
        </button>
      )}

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <OrbitControls 
          enabled={!isDraggingFlower}
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
                  console.log('🎯 Flower onClick triggered in App.tsx');
                  console.log('  - Flower:', clickedFlower);
                  console.log('  - Definition:', definition);
                  console.log('  - Setting selectedFlower...');
                  
                  setSelectedFlower({ flower: clickedFlower, definition });
                  setPlacingFlowerType(null);
                  
                  console.log('  ✅ selectedFlower set, panel should appear');
                }}
                onDragStart={() => setIsDraggingFlower(true)}
                onDragEnd={(draggedFlower, newPosition) => {
                  updateFlower(draggedFlower.id, { position: newPosition });
                  setIsDraggingFlower(false);
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
