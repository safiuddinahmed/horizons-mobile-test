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

      {/* Romantic Greeting Card Panel - Right Side */}
      {selectedFlower && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '440px',
          height: '100vh',
          background: '#FFF8F0',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          zIndex: 200,
          overflow: 'auto',
          animation: 'slideInRight 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255, 182, 193, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 228, 225, 0.12) 0%, transparent 50%)
          `
        }}>
          {/* Close Button - FIXED - Romantic Style */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              console.log('✕ Close button clicked');
              setSelectedFlower(null);
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#FFFFFF',
              border: '2px solid #FFE4E1',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#8B6F47',
              transition: 'all 0.2s',
              zIndex: 1000,
              pointerEvents: 'auto',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFE4E1';
              e.currentTarget.style.color = '#5C4033';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.color = '#8B6F47';
            }}
          >
            ✕
          </button>
          
          {/* Decorative Header */}
          <div style={{
            padding: '40px 32px 32px',
            borderBottom: '2px solid #FFE4E1',
            position: 'relative'
          }}>
            {/* Decorative elements */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              fontSize: '24px',
              opacity: 0.6
            }}>
              🌸
            </div>
            <div style={{
              position: 'absolute',
              top: '20px',
              right: '60px',
              fontSize: '24px',
              opacity: 0.6
            }}>
              🌸
            </div>
            
            {/* "For You" Header */}
            <div style={{
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 600,
              color: '#C73866',
              marginBottom: '16px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontFamily: 'Georgia, serif'
            }}>
              💝 For You
            </div>
            
            {/* Flower Icon - Large */}
            <div style={{
              fontSize: '72px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              {selectedFlower.definition.id === 1 ? '🌼' : 
               selectedFlower.definition.id === 2 ? '🌹' : '🌻'}
            </div>
            
            {/* Flower Name - Romantic Style */}
            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '12px',
              color: '#5C4033',
              letterSpacing: '0.5px',
              fontFamily: 'Georgia, serif'
            }}>
              {selectedFlower.definition.name}
            </h2>
            
            {/* State Badge - Cute */}
            <div style={{
              textAlign: 'center',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: selectedFlower.flower.state === 'BUD' ? '#FFF4E0' : '#FFE4E9',
                border: `2px solid ${selectedFlower.flower.state === 'BUD' ? '#FFD700' : selectedFlower.definition.color}`,
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#5C4033'
              }}>
                {selectedFlower.flower.state === 'BUD' ? (
                  <>🌱 A surprise waiting to bloom</>
                ) : (
                  <>🌸 In full bloom</>
                )}
              </div>
            </div>
            
            {/* Planted Date - Subtle */}
            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#A0826D',
              fontStyle: 'italic'
            }}>
              Planted with love on {new Date(selectedFlower.flower.placedAt).toLocaleDateString()}
            </div>
          </div>
          
          {/* Content Section - Romantic Card Body */}
          <div style={{ padding: '32px' }}>
            {/* Symbolism Quote - Like a love letter */}
            <div style={{
              background: '#FFFFFF',
              border: `3px solid ${selectedFlower.definition.color}40`,
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              position: 'relative'
            }}>
              {/* Decorative quotation marks */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '16px',
                fontSize: '32px',
                color: selectedFlower.definition.color,
                opacity: 0.3,
                lineHeight: '0',
                fontFamily: 'Georgia, serif'
              }}>
                "
              </div>
              
              <div style={{
                fontSize: '16px',
                color: '#5C4033',
                fontStyle: 'italic',
                lineHeight: '1.7',
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
                paddingTop: '8px'
              }}>
                {selectedFlower.definition.symbolism}
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '16px',
                fontSize: '32px',
                color: selectedFlower.definition.color,
                opacity: 0.3,
                lineHeight: '0',
                fontFamily: 'Georgia, serif'
              }}>
                "
              </div>
            </div>
            
            {/* Description - Letter style */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF9F0, #FFFCF7)',
              border: '2px dashed #FFB6C1',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '16px',
                color: '#6B5744',
                lineHeight: '1.8',
                fontFamily: 'Georgia, serif'
              }}>
                {selectedFlower.definition.description}
              </div>
            </div>
            
            {/* State Message - Cute prompt */}
            {selectedFlower.flower.state === 'BUD' && (
              <div style={{
                textAlign: 'center',
                padding: '28px 20px',
                background: 'linear-gradient(135deg, #FFF4E0, #FFEBE6)',
                borderRadius: '16px',
                border: '2px solid #FFD700'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌱</div>
                <div style={{ 
                  fontSize: '15px', 
                  lineHeight: '1.7',
                  color: '#5C4033',
                  fontFamily: 'Georgia, serif'
                }}>
                  Your surprise is waiting to bloom!<br/>
                  <span style={{ 
                    color: '#C73866', 
                    fontWeight: 700,
                    fontSize: '16px'
                  }}>
                    Tap below to see the magic ✨
                  </span>
                </div>
              </div>
            )}
            
            {/* Bloomed state message */}
            {selectedFlower.flower.state === 'BLOOMED' && (
              <div style={{
                textAlign: 'center',
                padding: '28px 20px',
                background: 'linear-gradient(135deg, #FFE4E9, #FFF0F5)',
                borderRadius: '16px',
                border: `2px solid ${selectedFlower.definition.color}`
              }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌸</div>
                <div style={{ 
                  fontSize: '15px', 
                  lineHeight: '1.7',
                  color: '#5C4033',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic'
                }}>
                  This beautiful flower has bloomed,<br/>
                  just for you 💝
                </div>
              </div>
            )}
          </div>
          
          {/* Action Footer - Softer styling */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            padding: '20px 32px',
            background: '#FFF8F0',
            borderTop: '2px solid #FFE4E1'
          }}>
            <button
              onClick={() => {
                removeFlower(selectedFlower.flower.id);
                setSelectedFlower(null);
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#FFFFFF',
                border: '2px solid #E8B4B8',
                borderRadius: '12px',
                color: '#C73866',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'all 0.2s',
                fontFamily: 'Georgia, serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FFE4E9';
                e.currentTarget.style.borderColor = '#C73866';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E8B4B8';
              }}
            >
              Remove Flower
            </button>
          </div>
        </div>
      )}

      {/* Romantic Bloom Button - Centered Bottom (only for buds) */}
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
            padding: '18px 56px',
            fontSize: '18px',
            background: 'linear-gradient(135deg, #FFB6C1, #FF69B4)',
            color: '#FFFFFF',
            border: '3px solid #FFFFFF',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 105, 180, 0.4), 0 0 0 4px rgba(255, 182, 193, 0.3)',
            fontWeight: 700,
            zIndex: 150,
            transition: 'all 0.3s',
            letterSpacing: '0.5px',
            fontFamily: 'Georgia, serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%) translateY(-4px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 12px 36px rgba(255, 105, 180, 0.5), 0 0 0 4px rgba(255, 182, 193, 0.5)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #FF69B4, #FFB6C1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(-50%)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 105, 180, 0.4), 0 0 0 4px rgba(255, 182, 193, 0.3)';
            e.currentTarget.style.background = 'linear-gradient(135deg, #FFB6C1, #FF69B4)';
          }}
        >
          ✨ Bloom this Flower ✨
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
