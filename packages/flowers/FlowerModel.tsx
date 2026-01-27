import { useGLTF } from '@react-three/drei';
import { useMemo, useState, useRef } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { PlacedFlower, FlowerDefinition } from './types';

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
  const { scene } = useGLTF(definition.modelPath);
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  
  // Clone and configure the flower model
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Apply any material adjustments
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Enable emissive glow on hover
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material = child.material.clone();
          child.material.emissive = new THREE.Color(definition.color);
          child.material.emissiveIntensity = 0;
        }
      }
    });
    
    return clone;
  }, [scene, definition.color]);
  
  // Update emissive glow based on hover state
  useMemo(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissiveIntensity = hovered || dragging ? 0.4 : 0;
      }
    });
  }, [clonedScene, hovered, dragging]);
  
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover?.(true);
    if (draggable) {
      document.body.style.cursor = 'pointer';
    }
  };
  
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'default';
  };
  
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!dragging) {
      onClick?.(flower);
    }
  };
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (draggable) {
      e.stopPropagation();
      setDragging(true);
      onDragStart?.(flower);
      (e.target as any).setPointerCapture(e.pointerId);
    }
  };
  
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (dragging && draggable) {
      e.stopPropagation();
      
      // Calculate new position based on pointer
      const newPosition = {
        x: e.point.x,
        y: 0, // Keep on ground
        z: e.point.z
      };
      
      // Constrain to garden bounds
      const maxDistance = 18;
      const distance = Math.sqrt(newPosition.x ** 2 + newPosition.z ** 2);
      if (distance > maxDistance) {
        const scale = maxDistance / distance;
        newPosition.x *= scale;
        newPosition.z *= scale;
      }
      
      if (meshRef.current) {
        meshRef.current.position.set(newPosition.x, newPosition.y, newPosition.z);
      }
      
      onDrag?.(flower, newPosition);
    }
  };
  
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (dragging && draggable) {
      e.stopPropagation();
      setDragging(false);
      
      const finalPosition = {
        x: meshRef.current!.position.x,
        y: meshRef.current!.position.y,
        z: meshRef.current!.position.z
      };
      
      onDragEnd?.(flower, finalPosition);
      (e.target as any).releasePointerCapture(e.pointerId);
    }
  };
  
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
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Raise model above ground so it "sticks out" visually */}
      <primitive object={clonedScene} position={[0, 1, 0]} />
      
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
