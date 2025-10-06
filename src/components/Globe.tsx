import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Stars } from "@react-three/drei";
import * as THREE from "three";
import earthMapUrl from "@/assets/earth-map.png";

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

const GlobeComponent = () => {
  const globeRef = useRef<THREE.Mesh>(null);
  const disasterPoints = useMemo(() => generateDisasterPoints(50), []);
  const [earthTexture, setEarthTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(earthMapUrl, (texture) => {
      setEarthTexture(texture);
    });
  }, []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  const gridLines = useMemo(() => {
    const lines = [];
    const segments = 36;
    
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

  return (
    <group>
      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Main globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        {earthTexture ? (
          <meshPhongMaterial
            map={earthTexture}
            emissive="#001100"
            emissiveIntensity={0.2}
            shininess={100}
          />
        ) : (
          <meshPhongMaterial
            color="#0a1929"
            emissive="#001100"
            shininess={100}
          />
        )}
      </Sphere>

      {/* Grid lines */}
      {gridLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="#00ff41"
          lineWidth={0.5}
          transparent
          opacity={0.15}
        />
      ))}

      {/* Disaster markers */}
      {disasterPoints.map((point, i) => (
        <DisasterMarker key={i} {...point} />
      ))}

      {/* Glow effect */}
      <Sphere args={[2.1, 64, 64]}>
        <meshBasicMaterial
          color="#00ff41"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};

export const Globe = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00ff41" />
        <GlobeComponent />
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={2.5}
          maxDistance={10}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
};
