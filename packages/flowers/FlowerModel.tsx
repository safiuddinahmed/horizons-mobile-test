import { useGLTF, Html } from '@react-three/drei';
import { useMemo, useState, useRef, useEffect } from 'react';
import { useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PlacedFlower, FlowerDefinition } from './types';
import { AnimatedFlowerBloom } from './AnimatedFlowerBloom';

interface FlowerModelProps {
  flower: PlacedFlower;
  definition: FlowerDefinition;
  onHover?: (hovered: boolean) => void;
  onClick?: (flower: PlacedFlower) => void;
  onDragStart?: (flower: PlacedFlower) => void;
  onDrag?: (flower: PlacedFlower, position: { x: number; y: number; z: number }) => void;
  onDragEnd?: (flower: PlacedFlower, position: { x: number; y: number; z: number }) => void;
  draggable?: boolean;
}

/**
 * FlowerModel - Renders a single flower in the 3D garden
 * Supports hover, click, and drag interactions
 */
export function FlowerModel({
  flower,
  definition,
  onHover,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = true
}: FlowerModelProps) {
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isBloom, setIsBloom] = useState(flower.state === 'BLOOMED' || flower.state === 'OPEN');
  const meshRef = useRef<THREE.Group>(null);
  const dragPlaneRef = useRef<THREE.Mesh>(null);
  const { camera, raycaster, gl } = useThree();
  const dragOffsetRef = useRef(new THREE.Vector3());
  const pointerDownTimeRef = useRef(0);
  const pointerDownPosRef = useRef({ x: 0, y: 0 });
  
  // React to flower state changes
  useEffect(() => {
    setIsBloom(flower.state === 'BLOOMED' || flower.state === 'OPEN');
  }, [flower.state]);
  
  // Create invisible drag plane at ground level
  const dragPlane = useMemo(() => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    return plane;
  }, []);
  
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
    if (draggable) {
      document.body.style.cursor = 'grab';
    }
  };
  
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
    if (!dragging) {
      document.body.style.cursor = 'default';
    }
  };
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // Calculate time and distance since pointer down
    const clickDuration = Date.now() - pointerDownTimeRef.current;
    const pointerMoveDist = Math.sqrt(
      Math.pow(e.clientX - pointerDownPosRef.current.x, 2) +
      Math.pow(e.clientY - pointerDownPosRef.current.y, 2)
    );
    
    // Only trigger click if it was quick and didn't move much (not a drag)
    if (clickDuration < 300 && pointerMoveDist < 10) {
      console.log(`🌸 Flower clicked: ${definition.name} (state: ${flower.state})`);
      onClick?.(flower);
    } else {
      console.log(`🚫 Click ignored (drag detected): duration=${clickDuration}ms, distance=${pointerMoveDist}px`);
    }
  };
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (draggable) {
      e.stopPropagation();
      
      // Track pointer down time and position for click detection
      pointerDownTimeRef.current = Date.now();
      pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
      
      setDragging(true);
      onDragStart?.(flower);
      document.body.style.cursor = 'grabbing';
      
      // Calculate offset from click point to flower center
      if (meshRef.current) {
        const flowerPos = meshRef.current.position;
        dragOffsetRef.current.set(
          e.point.x - flowerPos.x,
          0,
          e.point.z - flowerPos.z
        );
      }
    }
  };
  
  // Use global pointer move for smooth dragging
  useEffect(() => {
    if (!dragging || !draggable) return;
    
    const handleGlobalPointerMove = (event: PointerEvent) => {
      if (!meshRef.current) return;
      
      // Convert screen coordinates to normalized device coordinates
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast to drag plane
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersectPoint);
      
      if (intersectPoint) {
        // Apply offset and constrain to bounds
        let newX = intersectPoint.x - dragOffsetRef.current.x;
        let newZ = intersectPoint.z - dragOffsetRef.current.z;
        
        // Constrain to garden bounds
        const maxDistance = 18;
        const distance = Math.sqrt(newX ** 2 + newZ ** 2);
        if (distance > maxDistance) {
          const scale = maxDistance / distance;
          newX *= scale;
          newZ *= scale;
        }
        
        const newPosition = { x: newX, y: 0, z: newZ };
        meshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
        onDrag?.(flower, newPosition);
      }
    };
    
    const handleGlobalPointerUp = () => {
      setDragging(false);
      document.body.style.cursor = hovered ? 'grab' : 'default';
      
      if (meshRef.current) {
        const finalPosition = {
          x: meshRef.current.position.x,
          y: meshRef.current.position.y,
          z: meshRef.current.position.z
        };
        onDragEnd?.(flower, finalPosition);
      }
    };
    
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [dragging, draggable, camera, raycaster, gl, dragPlane, flower, onDrag, onDragEnd, hovered]);
  
  return (
    <group
      ref={meshRef}
      position={[flower.position.x, flower.position.y, flower.position.z]}
      rotation={[0, flower.rotation, 0]}
      scale={flower.scale}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      {/* Animated bloom transition */}
      <AnimatedFlowerBloom
        definition={definition}
        isBloom={isBloom}
        scale={1}
        onBloomComplete={() => {
          console.log(`${definition.name} bloomed!`);
        }}
      />
      
      {/* Beautiful hover card - calm & poetic - LARGER */}
      {hovered && !dragging && (
        <Html position={[0, 3, 0]} center distanceFactor={8}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(25,25,30,0.96), rgba(35,35,45,0.94))',
            backgroundImage: `
              linear-gradient(rgba(25,25,30,0.96), rgba(35,35,45,0.94)),
              linear-gradient(135deg, ${definition.color}60, ${definition.color}20)
            `,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box, border-box',
            backdropFilter: 'blur(24px)',
            padding: '24px 28px',
            borderRadius: '18px',
            boxShadow: `
              0 12px 40px rgba(0,0,0,0.5),
              0 0 0 1px rgba(255,255,255,0.08),
              0 0 30px ${definition.color}25
            `,
            border: '1.5px solid transparent',
            minWidth: '280px',
            maxWidth: '320px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}>
            {/* Flower Name - Calm & Poetic - LARGER */}
            <div style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#FFFFFF',
              marginBottom: '10px',
              letterSpacing: '0.3px',
              textShadow: `0 2px 8px ${definition.color}40`
            }}>
              {definition.name}
            </div>
            
            {/* Brief Symbolism - Italicized Quote Style - LARGER */}
            <div style={{
              fontSize: '15px',
              color: '#B8B8C0',
              fontStyle: 'italic',
              lineHeight: '1.6',
              marginBottom: '14px',
              borderLeft: `2px solid ${definition.color}40`,
              paddingLeft: '14px'
            }}>
              "{definition.symbolism}"
            </div>
            
            {/* State Badge - Soft & Meaningful - LARGER */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              background: flower.state === 'BUD' 
                ? `${definition.color}15` 
                : `${definition.color}20`,
              border: `1px solid ${definition.color}50`,
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 500,
              color: definition.color
            }}>
              {flower.state === 'BUD' ? (
                <>🌱 Waiting to bloom</>
              ) : (
                <>🌸 Bloomed</>
              )}
            </div>
            
            {/* Planted timestamp - Subtle - LARGER */}
            <div style={{
              marginTop: '12px',
              fontSize: '11px',
              color: '#808090',
              opacity: 0.7
            }}>
              Planted {new Date(flower.placedAt).toLocaleDateString()}
            </div>
            
            {/* Click hint */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#A0A0B0'
            }}>
              👆 Click to view details
            </div>
          </div>
        </Html>
      )}
      
      {/* Hover indicator - subtle circle on ground */}
      {hovered && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial 
            color={definition.color} 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
}

// Preload all flower models
useGLTF.preload('/models/flowers/Daisy.glb');
useGLTF.preload('/models/flowers/Rose.glb');
useGLTF.preload('/models/flowers/Sunflower.glb');
