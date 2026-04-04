import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from '@mui/material';

const ParticleConnections = ({ positions, count, maxDiff = 1.5 }) => {
  const lineRef = useRef();
  
  const lineGeometry = useMemo(() => new THREE.BufferGeometry(), []);
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
    color: '#00f0ff',
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
  }), []);

  useFrame(() => {
    if (!lineRef.current) return;
    
    const connections = [];
    const step = 1; 
    for (let i = 0; i < count; i += step) {
      for (let j = i + 1; j < count; j += step) {
        const i3 = i * 3;
        const j3 = j * 3;
        const dx = positions[i3] - positions[j3];
        const dy = positions[i3 + 1] - positions[j3 + 1];
        const dz = positions[i3 + 2] - positions[j3 + 2];
        const distSq = dx * dx + dy * dy + dz * dz;
        
        if (distSq < maxDiff * maxDiff) {
          connections.push(
            positions[i3], positions[i3 + 1], positions[i3 + 2],
            positions[j3], positions[j3 + 1], positions[j3 + 2]
          );
        }
      }
    }
    
    const attr = new THREE.Float32BufferAttribute(connections, 3);
    lineRef.current.geometry.setAttribute('position', attr);
  });

  return <lineSegments ref={lineRef} geometry={lineGeometry} material={lineMaterial} />;
};

const NeuralParticles = ({ count = 80 }) => {
  const pointsRef = useRef();
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return { positions: pos, velocities: vel };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      if (Math.abs(positions[i3]) > 6) velocities[i3] *= -1;
      if (Math.abs(positions[i3 + 1]) > 4) velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2]) > 3) velocities[i3 + 2] *= -1;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0005;
  });

  return (
    <group>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          color="#00f0ff"
          transparent
          opacity={0.4}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <ParticleConnections positions={positions} count={count} />
    </group>
  );
};

const MouseParallax = () => {
  const groupRef = useRef();
  useFrame((state) => {
    if (!groupRef.current) return;
    const { x, y } = state.mouse;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.2, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.2, 0.05);
  });
  return <group ref={groupRef}><NeuralParticles /></group>;
};

const HeroBackground3D = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleContextLost = (e) => {
      e.preventDefault();
      setHasError(true);
    };
    window.addEventListener('webglcontextlost', handleContextLost);
    return () => window.removeEventListener('webglcontextlost', handleContextLost);
  }, []);

  if (hasError) return <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#0a0a0f' }} />;

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: '#0a0a0f' }}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }} 
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color('#0a0a0f'), 1);
        }}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
        <MouseParallax />
      </Canvas>
    </Box>
  );
};

export default HeroBackground3D;
