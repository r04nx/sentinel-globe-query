import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree, extend } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { createStarfield } from "@/utils/starfield";
import { createGeometryFromGeoJSON, useGeoJsonData } from "@/utils/geoJson";

// Generate random disaster points
const generateDisasterPoints = (count: number) => {
  const points = [];
  for (let i = 0; i < count; i++) {
    const lat = (Math.random() - 0.5) * Math.PI;
    const lon = Math.random() * Math.PI * 2;
    const radius = 2.02;
    
    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);
    
    points.push({
      position: [x, y, z] as [number, number, number],
      severity: Math.random(),
      type: ['flood', 'earthquake', 'fire', 'storm'][Math.floor(Math.random() * 4)]
    });
  }
  return points;
};

const DisasterMarker = ({ position, severity, type }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.2);
    }
  });

  const color = useMemo(() => {
    if (severity > 0.7) return '#ff0000';
    if (severity > 0.4) return '#ff8800';
    return '#ffff00';
  }, [severity]);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
      {severity > 0.5 && (
        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
        </mesh>
      )}
    </mesh>
  );
};

// Convert lat/lon to sphere coordinates
function latLonToVec3(latDeg: number, lonDeg: number, radius: number) {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (-(lonDeg) * Math.PI) / 180;
  const x = radius * Math.cos(lat) * Math.cos(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.sin(lon);
  return new THREE.Vector3(x, y, z);
}

// Enhanced Starfield Component
const EnhancedStarfield = ({ numStars = 1000 }: { numStars?: number }) => {
  const starfieldRef = useRef<THREE.Points>(null);
  const { scene } = useThree();
  
  useEffect(() => {
    const starfield = createStarfield({ numStars, fog: false });
    scene.add(starfield);
    starfieldRef.current = starfield;
    
    return () => {
      scene.remove(starfield);
      starfield.geometry?.dispose();
      if (starfield.material instanceof THREE.Material) {
        starfield.material.dispose();
      }
    };
  }, [scene, numStars]);
  
  return null;
};

// GeoJSON Land Renderer
const GeoJsonLandRenderer = ({ config }: { config?: GlobeRuntimeConfig }) => {
  const { data: landData, loading, error } = useGeoJsonData('/geojson/ne_110m_land.json');
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useThree();
  
  useEffect(() => {
    if (!landData || !config?.showLandMasses) return;
    
    try {
      const geometries = createGeometryFromGeoJSON({
        json: landData,
        radius: 2.001,
        materialOptions: {
          color: '#80FF80',
          opacity: 0.8,
          transparent: true
        }
      });
      
      const group = new THREE.Group();
      
      geometries.forEach((geometry, index) => {
        // Create animated line material
        const material = new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(0.3 + Math.random() * 0.2, 1.0, 0.5),
          transparent: true,
          opacity: 0.7,
          linewidth: 1
        });
        
        const line = new THREE.Line(geometry, material);
        group.add(line);
      });
      
      // Rotate to match the original orientation
      group.rotation.x = -Math.PI * 0.5;
      scene.add(group);
      groupRef.current = group;
      
      return () => {
        if (groupRef.current) {
          scene.remove(groupRef.current);
          groupRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
              child.geometry?.dispose();
              if (child.material instanceof THREE.Material) {
                child.material.dispose();
              }
            }
          });
        }
      };
    } catch (error) {
      console.error('Error rendering GeoJSON land data:', error);
    }
  }, [landData, scene, config?.showLandMasses]);
  
  if (loading) {
    console.log('Loading land data...');
  }
  
  if (error) {
    console.error('Error loading land data:', error);
  }
  
  return null;
};

// Load world country outlines as vector lines (GeoJSON) and return line segments and raw features
const useWorldVectorOutlines = (radius: number) => {
  const [lineGeometries, setLineGeometries] = useState<THREE.BufferGeometry[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url, { cache: 'force-cache' });
        const gj = await res.json();

        const geoms: THREE.BufferGeometry[] = [];
        for (const feature of gj.features) {
          const geom = feature.geometry;
          if (!geom) continue;

          const pushLine = (coords: number[][]) => {
            const points: number[] = [];
            for (let i = 0; i < coords.length - 1; i++) {
              const [lonA, latA] = coords[i];
              const [lonB, latB] = coords[i + 1];
              const a = latLonToVec3(latA, lonA, radius + 0.002);
              const b = latLonToVec3(latB, lonB, radius + 0.002);
              points.push(a.x, a.y, a.z, b.x, b.y, b.z);
            }
            if (points.length > 0) {
              const buffer = new THREE.BufferGeometry();
              buffer.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
              geoms.push(buffer);
            }
          };

          if (geom.type === 'Polygon') {
            for (const ring of geom.coordinates as number[][][]) {
              pushLine(ring);
            }
          } else if (geom.type === 'MultiPolygon') {
            for (const poly of geom.coordinates as number[][][][]) {
              for (const ring of poly) pushLine(ring);
            }
          }
        }
        setLineGeometries(geoms);
        setFeatures(gj.features);
      } catch (e) {
        setError('Failed to load world outlines');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [radius]);

  return { lineGeometries, features, loading, error };
};

export type GlobeRuntimeConfig = {
  basemap?: 'none' | 'osm-dark' | 'osm-light' | 'nasa';
  showGrid?: boolean;
  showOutlines?: boolean;
  showLandMasses?: boolean;
  globeOpacity?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  starfieldDensity?: number;
};

const GlobeComponent = ({ config }: { config?: GlobeRuntimeConfig }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const disasterPoints = useMemo(() => generateDisasterPoints(50), []);
  const { lineGeometries, features } = useWorldVectorOutlines(2.0);
  const [hoverInfo, setHoverInfo] = useState<{ name: string; pos: [number, number, number] } | null>(null);
  const moveRaf = useRef<number | null>(null);

  useFrame(() => {
    if (globeRef.current && (config?.autoRotate ?? true)) {
      globeRef.current.rotation.y += config?.autoRotateSpeed ?? 0.001;
    }
  });

  const gridLines = useMemo(() => {
    const lines = [];
    const segments = 24;
    
    // Latitude lines
    for (let i = -4; i <= 4; i++) {
      const lat = (i / 4) * Math.PI / 2;
      const radius = 2.01;
      const points = [];
      
      for (let j = 0; j <= segments; j++) {
        const lon = (j / segments) * Math.PI * 2;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(points);
    }
    
    // Longitude lines
    for (let i = 0; i < segments; i += 2) {
      const lon = (i / segments) * Math.PI * 2;
      const points = [];
      
      for (let j = 0; j <= segments; j++) {
        const lat = ((j / segments) - 0.5) * Math.PI;
        const radius = 2.01;
        const x = radius * Math.cos(lat) * Math.cos(lon);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lon);
        points.push(new THREE.Vector3(x, y, z));
      }
      lines.push(points);
    }
    
    return lines;
  }, []);

  // Convert 3D point to lat/lon degrees
  const vecToLatLon = (v: THREE.Vector3) => {
    const r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    const lat = (Math.asin(v.y / r) * 180) / Math.PI;
    const lon = (-(Math.atan2(v.z, v.x) * 180) / Math.PI);
    return { lat, lon };
  };

  // Point-in-polygon helpers
  const pointInRing = (lon: number, lat: number, ring: number[][]) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      const intersect = (yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-12) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };
  
  const pointInPolygon = (lon: number, lat: number, polygon: number[][][]) => {
    if (!polygon || polygon.length === 0) return false;
    if (!pointInRing(lon, lat, polygon[0])) return false;
    for (let i = 1; i < polygon.length; i++) {
      if (pointInRing(lon, lat, polygon[i])) return false;
    }
    return true;
  };

  const handlePointerMove = (e: any) => {
    if (moveRaf.current) return;
    moveRaf.current = requestAnimationFrame(() => {
      moveRaf.current = null;
      if (!globeRef.current) return;
      const p = e.point as THREE.Vector3;
      const { lat, lon } = vecToLatLon(p);
      let matched: string | null = null;
      for (const f of features) {
        const g = f.geometry;
        if (!g) continue;
        if (g.type === 'Polygon') {
          if (pointInPolygon(lon, lat, g.coordinates)) { matched = f.properties?.name || 'Unknown'; break; }
        } else if (g.type === 'MultiPolygon') {
          for (const poly of g.coordinates) {
            if (pointInPolygon(lon, lat, poly)) { matched = f.properties?.name || 'Unknown'; break; }
          }
          if (matched) break;
        }
      }
      if (matched) {
        const dir = p.clone().normalize();
        const pos: [number, number, number] = [dir.x * 2.12, dir.y * 2.12, dir.z * 2.12];
        setHoverInfo({ name: matched, pos });
      } else {
        setHoverInfo(null);
      }
    });
  };

  return (
    <group>
      {/* Enhanced Starfield */}
      <EnhancedStarfield numStars={config?.starfieldDensity ?? 1000} />
      
      {/* Main globe */}
      <Sphere ref={globeRef} args={[2, 128, 64]} onPointerMove={handlePointerMove}>
        <meshPhongMaterial
          color="#0b1020"
          shininess={10}
          emissive="#001018"
          emissiveIntensity={0.08}
          transparent
          opacity={config?.globeOpacity ?? 0.7}
          depthWrite={false}
        />
      </Sphere>

      {/* Enhanced GeoJSON Land Rendering */}
      <GeoJsonLandRenderer config={config} />

      {/* Subtle 3D grid lines */}
      {(config?.showGrid ?? true) && gridLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#00ff9c"
          lineWidth={0.4}
          transparent
          opacity={0.2}
        />
      ))}

      {/* Vector world outlines (crisp at any zoom) */}
      {(config?.showOutlines ?? true) && lineGeometries.map((g, idx) => (
        <lineSegments key={idx} geometry={g}>
          <lineBasicMaterial color="#7fffd4" transparent opacity={0.55} linewidth={1} depthTest={false} />
        </lineSegments>
      ))}

      {hoverInfo && (
        <Html position={hoverInfo.pos} center>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: '#7fffd4',
            border: '1px solid #1de9b6',
            borderRadius: 6,
            padding: '6px 8px',
            fontSize: 12,
            whiteSpace: 'nowrap'
          }}>
            {hoverInfo.name}
          </div>
        </Html>
      )}

      {/* Disaster markers */}
      {disasterPoints.map((point, i) => (
        <DisasterMarker key={i} {...point} />
      ))}

      {/* Atmospheric glow */}
      <Sphere args={[2.05, 64, 32]}>
        <meshBasicMaterial
          color="#87CEEB"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Outer atmospheric layer */}
      <Sphere args={[2.1, 32, 16]}>
        <meshBasicMaterial
          color="#4169E1"
          transparent
          opacity={0.02}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};

export const Globe = ({ config }: { config?: GlobeRuntimeConfig }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.75]} gl={{ powerPreference: 'high-performance', antialias: true, alpha: true }}>
        <color attach="background" args={["#000011"]} />
        <ambientLight intensity={0.3} />
        <directionalLight 
          position={[5, 3, 5]} 
          intensity={1.2} 
          color="#ffffff"
        />
        <pointLight 
          position={[-5, -3, -5]} 
          intensity={0.5} 
          color="#4169E1" 
        />
        <GlobeComponent config={config} />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={2.5}
          maxDistance={10}
          autoRotate={config?.autoRotate ?? true}
          autoRotateSpeed={(config?.autoRotateSpeed ?? 0.001) * 300}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};
