import { useState, useCallback } from 'react';
import { FlowerModel } from './FlowerModel';
import { PlacedFlower, FlowerDefinition, getFlowerDefinition, generateFlowerId, FLOWER_DEFINITIONS } from './types';

interface FlowerGardenProps {
  gardenId: string;
  onFlowerClick?: (flower: PlacedFlower, definition: FlowerDefinition) => void;
  initialFlowers?: PlacedFlower[];
}

/**
 * FlowerGarden - Manages a collection of placed flowers in the garden
 * Handles adding, removing, and repositioning flowers
 */
export function FlowerGarden({ 
  gardenId, 
  onFlowerClick,
  initialFlowers = []
}: FlowerGardenProps) {
  const [flowers, setFlowers] = useState<PlacedFlower[]>(initialFlowers);
  const [hoveredFlower, setHoveredFlower] = useState<string | null>(null);
  
  // Add a new flower to the garden
  const addFlower = useCallback((
    flowerDefinitionId: number,
    position: { x: number; y: number; z: number }
  ) => {
    const definition = getFlowerDefinition(flowerDefinitionId);
    if (!definition) return;
    
    const newFlower: PlacedFlower = {
      id: generateFlowerId(),
      flowerDefinitionId,
      gardenId,
      position,
      rotation: Math.random() * Math.PI * 2, // Random rotation
      scale: definition.defaultScale,
      placedAt: new Date()
    };
    
    setFlowers(prev => [...prev, newFlower]);
    return newFlower;
  }, [gardenId]);
  
  // Remove a flower from the garden
  const removeFlower = useCallback((flowerId: string) => {
    setFlowers(prev => prev.filter(f => f.id !== flowerId));
  }, []);
  
  // Update flower position (from drag)
  const updateFlowerPosition = useCallback((
    flowerId: string,
    position: { x: number; y: number; z: number }
  ) => {
    setFlowers(prev => prev.map(f => 
      f.id === flowerId ? { ...f, position } : f
    ));
  }, []);
  
  // Handle flower click
  const handleFlowerClick = useCallback((flower: PlacedFlower) => {
    const definition = getFlowerDefinition(flower.flowerDefinitionId);
    if (definition) {
      onFlowerClick?.(flower, definition);
    }
  }, [onFlowerClick]);
  
  // Handle drag end - update position
  const handleDragEnd = useCallback((
    flower: PlacedFlower,
    position: { x: number; y: number; z: number }
  ) => {
    updateFlowerPosition(flower.id, position);
  }, [updateFlowerPosition]);
  
  return (
    <group>
      {flowers.map(flower => {
        const definition = getFlowerDefinition(flower.flowerDefinitionId);
        if (!definition) return null;
        
        return (
          <FlowerModel
            key={flower.id}
            flower={flower}
            definition={definition}
            onClick={handleFlowerClick}
            onDragEnd={handleDragEnd}
            onHover={(hovered) => {
              setHoveredFlower(hovered ? flower.id : null);
            }}
            draggable={true}
          />
        );
      })}
    </group>
  );
}

/**
 * Hook to manage flower garden state
 * Can be used to expose add/remove functions to parent components
 */
export function useFlowerGarden(gardenId: string, initialFlowers: PlacedFlower[] = []) {
  const [flowers, setFlowers] = useState<PlacedFlower[]>(initialFlowers);
  
  const addFlower = useCallback((
    flowerDefinitionId: number,
    position: { x: number; y: number; z: number }
  ) => {
    const definition = getFlowerDefinition(flowerDefinitionId);
    if (!definition) return null;
    
    const newFlower: PlacedFlower = {
      id: generateFlowerId(),
      flowerDefinitionId,
      gardenId,
      position,
      rotation: Math.random() * Math.PI * 2,
      scale: definition.defaultScale,
      placedAt: new Date()
    };
    
    setFlowers(prev => [...prev, newFlower]);
    return newFlower;
  }, [gardenId]);
  
  const removeFlower = useCallback((flowerId: string) => {
    setFlowers(prev => prev.filter(f => f.id !== flowerId));
  }, []);
  
  const updateFlower = useCallback((flowerId: string, updates: Partial<PlacedFlower>) => {
    setFlowers(prev => prev.map(f => 
      f.id === flowerId ? { ...f, ...updates } : f
    ));
  }, []);
  
  const clearFlowers = useCallback(() => {
    setFlowers([]);
  }, []);
  
  return {
    flowers,
    addFlower,
    removeFlower,
    updateFlower,
    clearFlowers
  };
}

// Export flower definitions for use in UI
export { FLOWER_DEFINITIONS };
