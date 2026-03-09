import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { useTexture, OrbitControls, Float, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { CARD_IMAGES } from '@/data/cardImages';
import { cards } from '@/data/cards';

/* ====== SINGLE 3D CARD ====== */
function Card3D({ 
  imageUrl, 
  position, 
  scale = 1, 
  rotation = [0, 0, 0],
  onClick
}: { 
  imageUrl: string; 
  position: [number, number, number]; 
  scale?: number;
  rotation?: [number, number, number];
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Load texture
  const texture = useTexture(imageUrl);
  
  // Animate on hover
  useFrame((state) => {
    if (!meshRef.current) return;
    if (hovered) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh
        ref={meshRef}
        position={position}
        rotation={rotation}
        scale={hovered ? scale * 1.1 : scale}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Card front */}
        <planeGeometry args={[2.5, 3.5]} />
        <meshStandardMaterial 
          map={texture} 
          metalness={0.3} 
          roughness={0.4}
          emissive={hovered ? new THREE.Color(0xffaa00) : new THREE.Color(0x000000)}
          emissiveIntensity={hovered ? 0.15 : 0}
        />
        
        {/* Card glow when hovered */}
        {hovered && (
          <pointLight 
            position={[0, 0, 1]} 
            intensity={1.5} 
            color="#EAB308" 
            distance={5}
          />
        )}
      </mesh>
    </Float>
  );
}

/* ====== ROTATING CAROUSEL OF CARDS ====== */
function CardCarousel() {
  const groupRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  
  // Featured mythic + legendary cards
  const featuredCardIds = [18, 19, 20, 17, 13, 14];
  const radius = 6;
  
  useFrame((state, delta) => {
    if (!groupRef.current || !autoRotate) return;
    groupRef.current.rotation.y += delta * 0.3;
  });

  return (
    <group 
      ref={groupRef} 
      onPointerDown={() => setAutoRotate(false)}
      onPointerUp={() => setAutoRotate(true)}
    >
      {featuredCardIds.map((cardId, i) => {
        const angle = (i / featuredCardIds.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rotationY = -angle + Math.PI / 2;
        
        return (
          <Card3D
            key={cardId}
            imageUrl={CARD_IMAGES[cardId]}
            position={[x, 0, z]}
            rotation={[0, rotationY, 0]}
            scale={1.2}
          />
        );
      })}
    </group>
  );
}

/* ====== SCENE SETUP ====== */
function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#EAB308" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#3B82F6" />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#EAB308" />
      
      {/* Environment for reflections */}
      <Environment preset="night" />
      
      {/* Cards */}
      <Suspense fallback={null}>
        <CardCarousel />
      </Suspense>
      
      {/* Controls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        autoRotate={false}
      />
      
      {/* Fog */}
      <fog attach="fog" args={['#0a0b0f', 8, 25]} />
    </>
  );
}

/* ====== MAIN COMPONENT ====== */
export default function Card3DShowcase() {
  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-border/30"
      style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--card)) 100%)' }}
    >
      {/* Scan lines overlay */}
      <div className="absolute inset-0 scan-lines opacity-10 pointer-events-none z-10" />
      
      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
      
      {/* UI Overlays */}
      <div className="absolute bottom-6 left-6 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 px-4 py-2 rounded-lg bg-background/80 backdrop-blur-md border border-border/50"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-display text-xs text-muted-foreground uppercase tracking-wider">
            Drag to rotate • Hover to interact
          </span>
        </motion.div>
      </div>
      
      <div className="absolute top-6 right-6 z-20">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="px-4 py-2 rounded-lg bg-primary/10 backdrop-blur-md border border-primary/30"
        >
          <span className="font-display text-xs text-primary uppercase tracking-wider font-bold">
            🔥 Interactive 3D
          </span>
        </motion.div>
      </div>
    </div>
  );
}
