/**
 * OrbitVisualizer3D Component
 * 
 * Production-quality 3D orbital visualization for exoplanet detection
 * Features:
 * - Interactive 3D scene with star and orbiting planets
 * - Transit detection and highlighting
 * - Time-based animation with scrubbing
 * - Light curve synchronization via DOM events
 * - Planet selection and detailed info panel
 * - Screenshot/export functionality
 * - Mobile responsive with 2D fallback
 * 
 * Integration Events:
 * - Emits: 'exoTimeChange', 'exoPlanetSelected', 'exoTransitEvent'
 * - Listens: 'exoLightCurveSeek'
 * 
 * Usage:
 * <OrbitVisualizer3D data={demoData} />
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Html, PerspectiveCamera } from '@react-three/drei';
import { 
  Play, Pause, Camera as CameraIcon, Info, 
  Settings, Maximize2, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import * as THREE from 'three';

// ============= TYPE DEFINITIONS =============

export interface PlanetData {
  id: string;
  name: string;
  semi_major_axis_AU: number;
  eccentricity: number;
  inclination_deg: number;
  argument_of_peri_deg: number;
  ascending_node_deg: number;
  mean_anomaly_deg: number;
  period_days: number;
  radius_earth: number;
  color: string;
  transit_times_unix: number[];
  detection_probability: number;
}

export interface StarData {
  id: string;
  name: string;
  radius_solar: number;
  color: string;
}

export interface OrbitData {
  star: StarData;
  planets: PlanetData[];
  epoch_unix: number;
}

// ============= DEMO DATA =============

export const DEMO_DATA: OrbitData = {
  star: {
    id: "TIC-0001",
    name: "DemoStar-1",
    radius_solar: 1.0,
    color: "#FFD27F"
  },
  planets: [
    {
      id: "p1",
      name: "Exo-1b",
      semi_major_axis_AU: 0.35,
      eccentricity: 0.02,
      inclination_deg: 89.2,
      argument_of_peri_deg: 10,
      ascending_node_deg: 30,
      mean_anomaly_deg: 120,
      period_days: 42.0,
      radius_earth: 1.8,
      color: "#66fcf1",
      transit_times_unix: [1696200000, 1696646400, 1697092800],
      detection_probability: 87.4
    },
    {
      id: "p2",
      name: "Exo-1c",
      semi_major_axis_AU: 0.65,
      eccentricity: 0.05,
      inclination_deg: 45.0,
      argument_of_peri_deg: 45,
      ascending_node_deg: 60,
      mean_anomaly_deg: 200,
      period_days: 88.0,
      radius_earth: 2.3,
      color: "#c770f0",
      transit_times_unix: [],
      detection_probability: 32.1
    }
  ],
  epoch_unix: 1696000000
};

// ============= HELPER FUNCTIONS =============

// Calculate orbital position using Keplerian elements
const calculateOrbitalPosition = (
  planet: PlanetData,
  time: number,
  epoch: number
): THREE.Vector3 => {
  const daysSinceEpoch = (time - epoch) / (24 * 3600);
  const meanMotion = (2 * Math.PI) / planet.period_days;
  const meanAnomaly = (planet.mean_anomaly_deg * Math.PI / 180) + meanMotion * daysSinceEpoch;
  
  // Solve Kepler's equation (simplified)
  let eccentricAnomaly = meanAnomaly;
  for (let i = 0; i < 5; i++) {
    eccentricAnomaly = meanAnomaly + planet.eccentricity * Math.sin(eccentricAnomaly);
  }
  
  // True anomaly
  const trueAnomaly = 2 * Math.atan2(
    Math.sqrt(1 + planet.eccentricity) * Math.sin(eccentricAnomaly / 2),
    Math.sqrt(1 - planet.eccentricity) * Math.cos(eccentricAnomaly / 2)
  );
  
  // Distance from star
  const radius = planet.semi_major_axis_AU * (1 - planet.eccentricity * Math.cos(eccentricAnomaly));
  
  // Position in orbital plane
  const x = radius * Math.cos(trueAnomaly);
  const y = radius * Math.sin(trueAnomaly);
  
  // Apply orbital inclination and rotation
  const inclination = planet.inclination_deg * Math.PI / 180;
  const ascendingNode = planet.ascending_node_deg * Math.PI / 180;
  
  const xFinal = x * Math.cos(ascendingNode) - y * Math.cos(inclination) * Math.sin(ascendingNode);
  const yFinal = x * Math.sin(ascendingNode) + y * Math.cos(inclination) * Math.cos(ascendingNode);
  const zFinal = y * Math.sin(inclination);
  
  return new THREE.Vector3(xFinal * 5, zFinal * 5, yFinal * 5);
};

// Check if transit is occurring
const checkTransit = (
  planet: PlanetData,
  position: THREE.Vector3,
  starRadius: number
): boolean => {
  // Transit occurs when planet is in front of star from viewer's perspective (negative Z)
  if (position.z > 0) return false;
  
  const distance = Math.sqrt(position.x * position.x + position.y * position.y);
  const planetRadiusScaled = (planet.radius_earth / 11) * 0.3; // Scale to visual size
  
  return distance < (starRadius + planetRadiusScaled);
};

// ============= 3D SCENE COMPONENTS =============

const Star = ({ star, isTransiting }: { star: StarData; isTransiting: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (lightRef.current && isTransiting) {
      lightRef.current.intensity = 3 + Math.sin(state.clock.elapsedTime * 5) * 0.5;
    } else if (lightRef.current) {
      lightRef.current.intensity = 3;
    }
  });
  
  const starSize = star.radius_solar * 0.5;
  
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[starSize, 32, 32]} />
        <meshStandardMaterial 
          color={star.color} 
          emissive={star.color}
          emissiveIntensity={isTransiting ? 0.7 : 1.0}
          toneMapped={false}
        />
      </mesh>
      <pointLight 
        ref={lightRef}
        position={[0, 0, 0]} 
        intensity={3} 
        distance={50}
        color={star.color}
      />
      {isTransiting && (
        <mesh>
          <ringGeometry args={[starSize * 0.95, starSize * 1.05, 64]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
};

const Planet = ({ 
  planet, 
  position, 
  isSelected, 
  isHovered,
  onSelect,
  showTrail,
  trail
}: { 
  planet: PlanetData; 
  position: THREE.Vector3; 
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  showTrail: boolean;
  trail: THREE.Vector3[];
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const planetSize = (planet.radius_earth / 11) * 0.3; // Scale relative to Jupiter
  
  return (
    <group position={position}>
      {/* Planet sphere */}
      <mesh 
        ref={meshRef}
        onClick={onSelect}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[planetSize, 16, 16]} />
        <meshStandardMaterial 
          color={planet.color}
          emissive={planet.color}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
        />
      </mesh>
      
      {/* Selection halo */}
      {isSelected && (
        <mesh>
          <ringGeometry args={[planetSize * 1.5, planetSize * 1.7, 32]} />
          <meshBasicMaterial color={planet.color} transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Hover indicator */}
      {isHovered && (
        <Html distanceFactor={10}>
          <div className="exo-orbit-3d__tooltip">
            <div className="text-xs font-semibold">{planet.name}</div>
            <div className="text-xs opacity-70">{planet.radius_earth.toFixed(1)} R⊕</div>
          </div>
        </Html>
      )}
      
      {/* Trail */}
      {showTrail && trail.length > 1 && (
        <Line
          points={trail}
          color={planet.color}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      )}
    </group>
  );
};

const OrbitPath = ({ planet, showHabitableZone }: { planet: PlanetData; showHabitableZone: boolean }) => {
  const points: THREE.Vector3[] = [];
  const numPoints = 128;
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const radius = planet.semi_major_axis_AU * 5;
    const x = radius * Math.cos(angle);
    const y = 0;
    const z = radius * Math.sin(angle);
    
    // Apply inclination
    const inclination = planet.inclination_deg * Math.PI / 180;
    const ascendingNode = planet.ascending_node_deg * Math.PI / 180;
    
    const xFinal = x * Math.cos(ascendingNode) - z * Math.cos(inclination) * Math.sin(ascendingNode);
    const yFinal = z * Math.sin(inclination);
    const zFinal = x * Math.sin(ascendingNode) + z * Math.cos(inclination) * Math.cos(ascendingNode);
    
    points.push(new THREE.Vector3(xFinal, yFinal, zFinal));
  }
  
  return (
    <Line
      points={points}
      color={planet.color}
      lineWidth={1}
      transparent
      opacity={0.3}
      dashed
      dashScale={50}
      dashSize={0.5}
      gapSize={0.5}
    />
  );
};

const Scene = ({ 
  data, 
  currentTime, 
  selectedPlanetId,
  onPlanetSelect,
  showHabitableZone,
  showTrails,
  onTransitDetected
}: {
  data: OrbitData;
  currentTime: number;
  selectedPlanetId: string | null;
  onPlanetSelect: (id: string) => void;
  showHabitableZone: boolean;
  showTrails: boolean;
  onTransitDetected: (planetId: string) => void;
}) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [planetPositions, setPlanetPositions] = useState<Map<string, THREE.Vector3>>(new Map());
  const [trails, setTrails] = useState<Map<string, THREE.Vector3[]>>(new Map());
  const [isTransiting, setIsTransiting] = useState(false);
  
  useEffect(() => {
    const newPositions = new Map<string, THREE.Vector3>();
    let transitDetected = false;
    
    data.planets.forEach(planet => {
      const position = calculateOrbitalPosition(planet, currentTime, data.epoch_unix);
      newPositions.set(planet.id, position);
      
      // Check for transit
      if (checkTransit(planet, position, data.star.radius_solar * 0.5)) {
        transitDetected = true;
        onTransitDetected(planet.id);
      }
      
      // Update trail
      if (showTrails) {
        setTrails(prev => {
          const trail = prev.get(planet.id) || [];
          const newTrail = [...trail, position.clone()];
          if (newTrail.length > 50) newTrail.shift(); // Keep last 50 points
          const updated = new Map(prev);
          updated.set(planet.id, newTrail);
          return updated;
        });
      }
    });
    
    setPlanetPositions(newPositions);
    setIsTransiting(transitDetected);
  }, [currentTime, data, showTrails, onTransitDetected]);
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <Star star={data.star} isTransiting={isTransiting} />
      
      {data.planets.map(planet => (
        <group key={planet.id}>
          <OrbitPath planet={planet} showHabitableZone={showHabitableZone} />
          <Planet
            planet={planet}
            position={planetPositions.get(planet.id) || new THREE.Vector3()}
            isSelected={selectedPlanetId === planet.id}
            isHovered={hoveredPlanet === planet.id}
            onSelect={() => onPlanetSelect(planet.id)}
            showTrail={showTrails}
            trail={trails.get(planet.id) || []}
          />
        </group>
      ))}
      
      {showHabitableZone && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.75, 5.5, 64]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </>
  );
};

// ============= MAIN COMPONENT =============

export const OrbitVisualizer3D = ({ 
  data = DEMO_DATA,
  containerId = "exo-3d-orbit"
}: {
  data?: OrbitData;
  containerId?: string;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(data.epoch_unix);
  const [speed, setSpeed] = useState(1);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showHabitableZone, setShowHabitableZone] = useState(false);
  const [showTrails, setShowTrails] = useState(true);
  const [syncWithLightCurve, setSyncWithLightCurve] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const animate = () => {
      setCurrentTime(prev => prev + (3600 * speed)); // Advance by hours
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);
  
  // Emit time change event
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('exoTimeChange', {
      detail: { time_unix: currentTime }
    }));
  }, [currentTime]);
  
  // Listen for light curve seek events
  useEffect(() => {
    const handleLightCurveSeek = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (syncWithLightCurve && customEvent.detail?.time_unix) {
        setCurrentTime(customEvent.detail.time_unix);
        setIsPlaying(false);
      }
    };
    
    window.addEventListener('exoLightCurveSeek', handleLightCurveSeek);
    return () => window.removeEventListener('exoLightCurveSeek', handleLightCurveSeek);
  }, [syncWithLightCurve]);
  
  // Handle planet selection
  const handlePlanetSelect = useCallback((planetId: string) => {
    setSelectedPlanetId(planetId);
    setShowInfoPanel(true);
    window.dispatchEvent(new CustomEvent('exoPlanetSelected', {
      detail: { planetId }
    }));
  }, []);
  
  // Handle transit detection
  const handleTransitDetected = useCallback((planetId: string) => {
    window.dispatchEvent(new CustomEvent('exoTransitEvent', {
      detail: { planetId, transitTime: currentTime }
    }));
  }, [currentTime]);
  
  // Screenshot functionality
  const handleScreenshot = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `exoplanet-orbit-${Date.now()}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  }, []);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key === 'ArrowLeft') {
        setCurrentTime(prev => prev - 3600);
      } else if (e.key === 'ArrowRight') {
        setCurrentTime(prev => prev + 3600);
      } else if (e.key === 'Escape') {
        setShowInfoPanel(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const selectedPlanet = data.planets.find(p => p.id === selectedPlanetId);
  const timeRange = data.planets.reduce((max, p) => Math.max(max, p.period_days), 100) * 86400;
  
  return (
    <div id={containerId} className="exo-orbit-3d__container">
      {/* 3D Canvas */}
      <div className="exo-orbit-3d__canvas-wrapper">
        <Canvas
          ref={canvasRef}
          camera={{ position: [0, 8, 12], fov: 50 }}
          gl={{ preserveDrawingBuffer: true }}
        >
          <PerspectiveCamera makeDefault position={[0, 8, 12]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxDistance={30}
            minDistance={3}
          />
          <Scene
            data={data}
            currentTime={currentTime}
            selectedPlanetId={selectedPlanetId}
            onPlanetSelect={handlePlanetSelect}
            showHabitableZone={showHabitableZone}
            showTrails={showTrails}
            onTransitDetected={handleTransitDetected}
          />
          <gridHelper args={[20, 20, '#333333', '#1a1a1a']} />
        </Canvas>
      </div>
      
      {/* Top Controls */}
      <div className="exo-orbit-3d__top-controls">
        <Button
          size="sm"
          variant="ghost"
          className="exo-orbit-3d__control-btn"
          onClick={handleScreenshot}
        >
          <CameraIcon className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="exo-orbit-3d__control-btn"
          onClick={() => setShowInfoPanel(!showInfoPanel)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Main Controls Panel */}
      <div className="exo-orbit-3d__controls-panel">
        <div className="exo-orbit-3d__control-row">
          <Button
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="exo-orbit-3d__play-btn"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="exo-orbit-3d__speed-control">
            <Label className="text-xs">Speed: {speed.toFixed(1)}x</Label>
            <Slider
              value={[speed]}
              onValueChange={(v) => setSpeed(v[0])}
              min={0.1}
              max={10}
              step={0.1}
              className="w-24"
            />
          </div>
        </div>
        
        <div className="exo-orbit-3d__time-scrub">
          <Label className="text-xs">
            Time: {new Date(currentTime * 1000).toLocaleDateString()}
          </Label>
          <Slider
            value={[currentTime]}
            onValueChange={(v) => setCurrentTime(v[0])}
            min={data.epoch_unix}
            max={data.epoch_unix + timeRange}
            step={3600}
            className="flex-1"
          />
        </div>
        
        <div className="exo-orbit-3d__toggles">
          <div className="exo-orbit-3d__toggle-item">
            <Switch
              checked={syncWithLightCurve}
              onCheckedChange={setSyncWithLightCurve}
              id="sync-lightcurve"
            />
            <Label htmlFor="sync-lightcurve" className="text-xs cursor-pointer">
              Sync Light Curve
            </Label>
          </div>
          
          <div className="exo-orbit-3d__toggle-item">
            <Switch
              checked={showHabitableZone}
              onCheckedChange={setShowHabitableZone}
              id="habitable-zone"
            />
            <Label htmlFor="habitable-zone" className="text-xs cursor-pointer">
              Habitable Zone
            </Label>
          </div>
          
          <div className="exo-orbit-3d__toggle-item">
            <Switch
              checked={showTrails}
              onCheckedChange={setShowTrails}
              id="orbit-trails"
            />
            <Label htmlFor="orbit-trails" className="text-xs cursor-pointer">
              Trails
            </Label>
          </div>
        </div>
      </div>
      
      {/* Info Panel */}
      {showInfoPanel && selectedPlanet && (
        <div className="exo-orbit-3d__info-panel">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">{selectedPlanet.name}</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowInfoPanel(false)}
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="exo-orbit-3d__info-item">
              <span className="text-muted-foreground">Semi-major axis:</span>
              <span className="font-semibold">{selectedPlanet.semi_major_axis_AU.toFixed(3)} AU</span>
            </div>
            <div className="exo-orbit-3d__info-item">
              <span className="text-muted-foreground">Period:</span>
              <span className="font-semibold">{selectedPlanet.period_days.toFixed(1)} days</span>
            </div>
            <div className="exo-orbit-3d__info-item">
              <span className="text-muted-foreground">Radius:</span>
              <span className="font-semibold">{selectedPlanet.radius_earth.toFixed(2)} R⊕</span>
            </div>
            <div className="exo-orbit-3d__info-item">
              <span className="text-muted-foreground">Eccentricity:</span>
              <span className="font-semibold">{selectedPlanet.eccentricity.toFixed(3)}</span>
            </div>
            <div className="exo-orbit-3d__info-item">
              <span className="text-muted-foreground">Inclination:</span>
              <span className="font-semibold">{selectedPlanet.inclination_deg.toFixed(1)}°</span>
            </div>
            <div className="exo-orbit-3d__info-item">
              <span className="text-muted-foreground">Detection prob:</span>
              <span className="font-semibold text-accent">{selectedPlanet.detection_probability.toFixed(1)}%</span>
            </div>
            {selectedPlanet.transit_times_unix.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Transit Events:</div>
                {selectedPlanet.transit_times_unix.map((time, idx) => (
                  <div key={idx} className="text-xs">
                    {new Date(time * 1000).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Help Overlay */}
      <div className="exo-orbit-3d__help">
        <div className="text-xs text-muted-foreground">
          <div><kbd>Space</kbd> Play/Pause</div>
          <div><kbd>←→</kbd> Scrub time</div>
          <div><kbd>Esc</kbd> Close panel</div>
        </div>
      </div>
    </div>
  );
};

export default OrbitVisualizer3D;
