"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA_EVENT } from "../SpatialCanvas";

const FRAGMENT_COUNT = 300; 
const MAX_SCROLL = 2000; // Determines how many scroll pixels it takes to reach 100%

// Generates points from a text mask to form the wordmark
function getWordmarkPoints(text: string, count: number, width: number, height: number): THREE.Vector3[] {
  if (typeof document === 'undefined') return new Array(count).fill(new THREE.Vector3(0,0,0));
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return new Array(count).fill(new THREE.Vector3(0,0,0));
  
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = 'white';
  ctx.font = 'bold 160px sans-serif'; 
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);
  
  const imgData = ctx.getImageData(0, 0, width, height).data;
  const validPixels: {x: number, y: number}[] = [];
  
  for (let y = 0; y < height; y += 3) {
    for (let x = 0; x < width; x += 3) {
      const idx = (y * width + x) * 4;
      if (imgData[idx] > 128) {
        validPixels.push({ x, y });
      }
    }
  }
  
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    if (validPixels.length === 0) break;
    const px = validPixels[i % validPixels.length];
    
    // Jitter to make it look constructed from fragments rather than perfect pixels
    const jitterX = (Math.random() - 0.5) * 2.0;
    const jitterY = (Math.random() - 0.5) * 2.0;
    
    const scale = 0.05; 
    const vx = (px.x + jitterX - width / 2) * scale;
    const vy = -(px.y + jitterY - height / 2) * scale;
    points.push(new THREE.Vector3(vx, vy, -2));
  }
  
  return points.sort(() => Math.random() - 0.5);
}

const TAGLINE = "Make what you imagined.";
const TAGLINE_LETTERS = TAGLINE.split("");

function WebGLScene({ progressRef, isReducedMotion }: { progressRef: React.MutableRefObject<number>, isReducedMotion: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const fragmentsData = useMemo(() => {
    const wordmarkPoints = getWordmarkPoints("vichith", FRAGMENT_COUNT, 800, 300);
    const data = [];
    
    for (let i = 0; i < FRAGMENT_COUNT; i++) {
      const chaosPos = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40 - 5
      );
      
      const chaosRot = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const targetPos = wordmarkPoints[i];
      const targetRot = new THREE.Euler(0, 0, 0);
      
      data.push({
        chaosPos,
        chaosRot,
        finalPos: targetPos,
        finalRot: targetRot,
        speed: 0.5 + Math.random() * 1.5,
        type: Math.random() > 0.5 ? 0 : 1
      });
    }
    return data;
  }, []);

  useFrame((state) => {
    const p = isReducedMotion ? 1 : progressRef.current;
    
    if (p >= 1) return;

    let mouseX = state.pointer.x * 2;
    let mouseY = state.pointer.y * 2;

    if (meshRef.current) {
      for (let i = 0; i < FRAGMENT_COUNT; i++) {
        const d = fragmentsData[i];
        
        const t = state.clock.elapsedTime * d.speed;
        const jitter = new THREE.Vector3(
          Math.sin(t + i) * 0.2,
          Math.cos(t * 1.1 + i) * 0.2,
          Math.sin(t * 0.9 + i) * 0.2
        );

        const parallaxFactor = Math.max(0, 1 - (p / 0.2));
        const parallax = new THREE.Vector3(mouseX * parallaxFactor, mouseY * parallaxFactor, 0);

        let lerpFactor = 0;
        if (p > 0.2) {
          lerpFactor = Math.min(1, (p - 0.2) / 0.6); 
          lerpFactor = lerpFactor * lerpFactor * (3 - 2 * lerpFactor);
        }
        
        if (isReducedMotion) lerpFactor = 1;

        dummy.position.copy(d.chaosPos).add(jitter).add(parallax);
        dummy.position.lerp(d.finalPos, lerpFactor);
        
        dummy.rotation.x = THREE.MathUtils.lerp(d.chaosRot.x + t * 0.5, d.finalRot.x, lerpFactor);
        dummy.rotation.y = THREE.MathUtils.lerp(d.chaosRot.y + t * 0.3, d.finalRot.y, lerpFactor);
        dummy.rotation.z = THREE.MathUtils.lerp(d.chaosRot.z + t * 0.2, d.finalRot.z, lerpFactor);
        
        const scaleTarget = 0.3;
        const currentScale = THREE.MathUtils.lerp(1, scaleTarget, lerpFactor);
        
        if (d.type === 0) {
            dummy.scale.set(currentScale, currentScale, currentScale * 0.1);
        } else {
            dummy.scale.setScalar(currentScale);
        }
        
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
    
    const camTargetZ = 6;
    const camStartZ = 25;
    let camZ = camStartZ;
    if (p > 0.2) {
      const camLerp = Math.min(1, (p - 0.2) / 0.8);
      const easeCam = 1 - Math.pow(1 - camLerp, 3);
      camZ = THREE.MathUtils.lerp(camStartZ, camTargetZ, easeCam);
    }
    if (isReducedMotion) camZ = camTargetZ;
    
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, camZ, 0.05);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 20]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, -2]} intensity={2} color="#00ffcc" distance={15} decay={2} />
      
      <instancedMesh ref={meshRef} args={[undefined, undefined, FRAGMENT_COUNT]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.2} />
      </instancedMesh>
    </>
  )
}

const HEADLINE_WORDS = ["Where", "your", "ideas", "become", "visuals."];

export function SceneConvergence() {
  const progressRef = useRef(0);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  const wordsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleMedia = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleMedia);

    const handleCamera = (e: any) => {
      let p = e.detail.cameraZ / MAX_SCROLL;
      p = Math.max(0, Math.min(1, p));
      progressRef.current = p;
      
      // Update DOM nodes manually for the 3D circular wheel text effect
      wordsRef.current.forEach((el, i) => {
        if (!el) return;
        
        // Staggered start times so they chase each other
        const delay = i * 0.12; 
        const wordStart = 0.05 + delay;
        const wordEnd = wordStart + 0.35; // Each word takes 0.35 of the scroll to complete its arc
        
        let opacity = 0;
        let yOffset = 0;
        let zOffset = 0;
        let rotateX = 0;
        
        if (p >= wordStart && p <= wordEnd) {
           const localP = (p - wordStart) / (wordEnd - wordStart);
           
           // Fade in quickly, stay, fade out quickly
           if (localP < 0.2) opacity = localP / 0.2;
           else if (localP > 0.8) opacity = 1 - ((localP - 0.8) / 0.2);
           else opacity = 1;
           
           // Map local progress to an angle from -90deg (bottom) to +90deg (top)
           const angle = (localP - 0.5) * Math.PI; 
           
           const radius = 300; 
           
           yOffset = -Math.sin(angle) * radius; 
           zOffset = Math.cos(angle) * radius - radius; 
           rotateX = angle * (180 / Math.PI); 
           
           el.style.opacity = opacity.toString();
           el.style.transform = `translate3d(0, ${yOffset}px, ${zOffset}px) rotateX(${rotateX}deg)`;
        } else {
           el.style.opacity = "0";
        }
      });
    };
    window.addEventListener(CAMERA_EVENT, handleCamera);

    return () => {
      mediaQuery.removeEventListener('change', handleMedia);
      window.removeEventListener(CAMERA_EVENT, handleCamera);
    };
  }, []);

  return (
    <div
      className="scene absolute inset-0 preserve-3d"
      style={{ transform: "translateZ(0px)" }} 
      data-z="0"
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Canvas gl={{ antialias: true, alpha: true }} camera={{ fov: 45 }}>
          <WebGLScene progressRef={progressRef} isReducedMotion={isReducedMotion} />
        </Canvas>
      </div>

      <div 
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
        style={{ perspective: "1000px" }}
      >
        <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {HEADLINE_WORDS.map((word, i) => (
              <span 
                key={i} 
                ref={el => { wordsRef.current[i] = el; }}
                className={`absolute text-6xl md:text-8xl font-light tracking-tight transition-none opacity-0 drop-shadow-2xl ${i === 4 ? "serif-accent text-accent" : "text-white"}`}
                style={{ willChange: "transform, opacity" }}
              >
                {word}
              </span>
          ))}
        </div>
      </div>
    </div>
  );
}
