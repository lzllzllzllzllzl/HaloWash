import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HaloWash } from '../product/HaloWash';
import { FXSystem } from '../fx/FXSystem';
import { CameraController } from './CameraController';
import { Lighting } from './Lighting';
import { BlueprintEnvironment } from './BlueprintEnvironment';

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function DeskControls() {
  const isMobile = window.innerWidth < 600;
  return (
    <OrbitControls
      makeDefault
      enablePan={!isMobile}
      enableZoom
      enableRotate
      enableDamping
      dampingFactor={0.08}
      minDistance={1.2}
      maxDistance={16}
      target={[0, 2.35, 0]}
    />
  );
}

export function BenchScene() {
  if (!webglAvailable()) {
    return (
      <div className="webgl-fallback">
        <svg viewBox="0 0 400 200" fill="none" stroke="#5f7d9c" strokeWidth="1.5">
          <path d="M150,30 C120,30 105,60 105,95 C105,135 130,160 200,160 C270,160 295,135 295,95 C295,60 280,30 250,30 Z" />
          <ellipse cx="200" cy="120" rx="55" ry="35" />
          <path d="M200,30 L200,10" strokeDasharray="4,4" />
          <text x="200" y="188" fill="#5f7d9c" fontSize="12" textAnchor="middle" fontFamily="sans-serif">HaloWash HW-01A</text>
        </svg>
        <p>当前浏览器无法启动蓝图实验台，请开启硬件加速或使用支持 WebGL 的现代浏览器。</p>
      </div>
    );
  }

  const isMobile = window.innerWidth < 600;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      camera={{ position: [4.6, 3.1, 4.9], fov: 45, near: 0.1, far: 60 }}
      style={{ position: 'fixed', inset: 0, background: '#04101e' }}
      dpr={Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)}
    >
      <DeskControls />
      <CameraController />
      <Lighting />
      <BlueprintEnvironment />
      <Suspense fallback={null}>
        <HaloWash />
        <FXSystem />
      </Suspense>
    </Canvas>
  );
}
