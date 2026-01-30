import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import type { GardenConfig } from './gardenConfigs';
import { GrassField } from './components/GrassField';
import { SeasonalTrees } from './components/SeasonalTrees';
import { EnvironmentProps } from './components/EnvironmentProps';
import { TerrainGround, BaseGroundLayer } from './components/TerrainGround';

interface GardenSceneProps {
  config: GardenConfig;
  children?: React.ReactNode;
}

/**
 * Main garden scene component
 * Renders the 3D environment based on garden configuration
 */
export function GardenScene({ config, children }: GardenSceneProps) {
  // Parse sky gradient colors
  const [_skyTop, skyBottom] = config.colors.sky;
  
  // Check if this garden uses the new terrain system
  const usesTerrain = config.key === 'test_garden';
  
  // Determine season for tree selection
  const season = useMemo(() => {
    if (config.key === 'quiet_garden') return 'quiet';
    if (config.key === 'spring_meadow') return 'spring';
    if (config.key === 'autumn_grove') return 'autumn';
    if (config.key === 'winter_wonderland') return 'winter';
    return 'quiet';
  }, [config.key]);
  
  // Grass density based on garden type
  const grassDensity = useMemo(() => {
    if (config.key === 'spring_meadow') return 'dense';
    if (config.key === 'winter_wonderland') return 'sparse';
    return 'medium';
  }, [config.key]);
  
  return (
    <group>
      {/* Sky - gradient background */}
      <color attach="background" args={[skyBottom]} />
      
      {/* PLA-style lighting - natural, soft atmosphere */}
      {usesTerrain ? (
        <>
          {/* Soft ambient - natural atmosphere */}
          <ambientLight
            color="#E8E4DC"
            intensity={0.55}
          />
          
          {/* Hemisphere for sky/ground color */}
          <hemisphereLight
            args={["#D4E4F0", "#C8B89A", 0.3]}
          />
          
          {/* Natural daylight - soft, warm */}
          <directionalLight
            color="#FFF8F0"
            intensity={1.0}
            position={[30, 40, 25]}
            castShadow
            shadow-mapSize-width={4096}
            shadow-mapSize-height={4096}
            shadow-camera-far={70}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-bias={-0.0005}
            shadow-normalBias={0.02}
          />
          
        </>
      ) : (
        <>
          {/* Standard lighting */}
          <ambientLight 
            color={config.lighting.ambient.color}
            intensity={config.lighting.ambient.intensity}
          />
          
          <directionalLight
            color={config.lighting.directional.color}
            intensity={config.lighting.directional.intensity}
            position={config.lighting.directional.position}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
        </>
      )}
      
      {/* Render terrain or traditional ground based on garden */}
      {usesTerrain ? (
        <>
          {/* New terrain system with rolling hills */}
          <BaseGroundLayer size={70} color={config.colors.ground} />
          <TerrainGround
            size={70}
            resolution={150}
            seed={42}
            amplitude={0.9}
            grassColor={config.colors.primary}
          />
        </>
      ) : (
        <>
          {/* Traditional flat ground */}
          <Ground color={config.colors.ground} size={70} />
          <GrassField 
            color={config.colors.primary} 
            density={grassDensity}
            areaSize={40}
          />
        </>
      )}
      
      {/* Seasonal trees - vary spread based on garden */}
      {!usesTerrain && (
        <SeasonalTrees 
          season={season}
          count={config.environment.trees.count}
          spread={config.key === 'quiet_garden' ? 12 : 16} // Closer for quiet garden
        />
      )}
      
      {/* Garden-specific decorations */}
      {config.key === 'test_garden' && (
        <>
          {/* Fence around the test garden */}
          <EnvironmentProps type="fence" gardenSize={70} />
        </>
      )}
      
      {config.key === 'quiet_garden' && (
        <>
          <EnvironmentProps type="stones" count={8} spread={10} />
          {/* Fountain removed from quiet garden */}
        </>
      )}
      
      {config.key === 'spring_meadow' && (
        <>
          <EnvironmentProps type="springPathways" />
          <EnvironmentProps type="rocks" count={4} spread={12} />
          {/* Large fountain added to spring garden */}
          <LargeFountain />
        </>
      )}
      
      {config.key === 'autumn_grove' && (
        <>
          <EnvironmentProps type="rocks" count={10} spread={14} />
          <EnvironmentProps type="stones" count={6} spread={8} />
        </>
      )}
      
      {config.key === 'winter_wonderland' && (
        <>
          <EnvironmentProps type="stones" count={12} spread={15} />
        </>
      )}
      
      {/* Optional fog */}
      {config.fog && (
        <fog 
          attach="fog" 
          args={[config.fog.color, config.fog.near, config.fog.far]} 
        />
      )}
      
      {/* Children (flowers, etc.) */}
      {children}
    </group>
  );
}

/**
 * Simple ground plane - base layer under grass
 */
function Ground({ color, size }: { color: string; size: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

/**
 * Large fountain for Spring Garden - scaled up significantly
 */
function LargeFountain() {
  const { scene } = useGLTF('/models/environment/Fountain.glb');
  
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  return (
    <primitive 
      object={clonedScene} 
      position={[0, 0, -5]} 
      rotation={[0, 0, 0]}
      scale={4} // Much larger fountain
      castShadow
      receiveShadow
    />
  );
}
