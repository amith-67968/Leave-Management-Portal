import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleSwarm = () => {
  const count = 250;
  const magnetRadius = 8;
  const ringRadius = 10;
  const waveSpeed = 0.3;
  const waveAmplitude = 0.8;
  const particleSize = 1.2;
  const lerpSpeed = 0.08;
  const color = '#644A40';

  const meshRef = useRef();
  
  // Track mouse position and idle state
  const mousePos = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const idleTime = useRef(0);
  
  // Setup particles initial state
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = ringRadius + (Math.random() * 0.8 - 0.4);
      temp.push({
        baseAngle: angle,
        baseRadius: radius,
        randomOffset: Math.random() * Math.PI * 2,
        currentPos: new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ),
        scale: 0.1
      });
    }
    return temp;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      idleTime.current = 0;
      // Convert screen coords to world coords roughly
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      
      // Map to approximate z=0 plane with camera at z=50, fov=35
      // Height at z=0 is 2 * 50 * tan(35/2 * PI/180) ≈ 31.5
      // Width is Height * aspect
      const aspect = window.innerWidth / window.innerHeight;
      const fovRad = (35 / 2) * (Math.PI / 180);
      const height = 2 * 50 * Math.tan(fovRad);
      const width = height * aspect;

      targetPos.current.set(x * width / 2, y * height / 2, 0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Auto-animate (Lissajous curve) if idle
    idleTime.current += state.clock.getDelta();
    if (idleTime.current > 2.0) {
      targetPos.current.x = Math.sin(time * 0.5) * 15;
      targetPos.current.y = Math.sin(time * 0.3) * 10;
    }

    // Smoothly follow target mouse/auto position
    mousePos.current.lerp(targetPos.current, 0.05);

    particles.forEach((p, i) => {
      // Calculate target position for this particle
      const angle = p.baseAngle + time * 0.2;
      
      // Add wave distortion
      const wave = Math.sin(angle * 5 + time * waveSpeed) * waveAmplitude;
      const currentRadius = p.baseRadius + wave;

      // Position relative to mouse focus
      const tx = mousePos.current.x + Math.cos(angle) * currentRadius;
      const ty = mousePos.current.y + Math.sin(angle) * currentRadius;
      const tz = Math.sin(p.randomOffset + time) * 2;

      // Lerp particle to target
      p.currentPos.lerp(new THREE.Vector3(tx, ty, tz), lerpSpeed);

      // Distance to focus point to calculate scale pulse
      const dist = p.currentPos.distanceTo(mousePos.current);
      const distRatio = Math.max(0, 1 - Math.abs(dist - ringRadius) / magnetRadius);
      const targetScale = particleSize * (0.5 + distRatio * 1.5);
      p.scale += (targetScale - p.scale) * 0.1;

      // Update dummy object for instanced mesh
      dummy.position.copy(p.currentPos);
      
      // Orient capsule towards movement or center
      dummy.lookAt(mousePos.current);
      dummy.rotateX(Math.PI / 2);
      
      dummy.scale.set(p.scale, p.scale, p.scale);
      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
      <meshPhysicalMaterial 
        color={color} 
        roughness={0.2}
        metalness={0.8}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </instancedMesh>
  );
};

export default function ParticleBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-40">
      <Canvas camera={{ position: [0, 0, 50], fov: 35 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[10, 10, 10]} intensity={3} />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#ffdfb5" />
        <ParticleSwarm />
      </Canvas>
    </div>
  );
}
