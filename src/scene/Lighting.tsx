import React from 'react';

export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} color={0x9ab4cc} />
      <hemisphereLight args={[0x3d5a78, 0x060d18, 0.6]} />
      <directionalLight
        position={[3, 6, -2.5]}
        intensity={1.3}
        color={0xeaf2fa}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
      />
      <directionalLight position={[-3.5, 2.5, 4]} intensity={0.4} color={0x8fb4d8} />
      <pointLight position={[-1.6, 3.6, -2.4]} intensity={14} color={0x4da3ff} distance={8} decay={2} />
      <pointLight position={[1.8, 1.2, 2.8]} intensity={10} color={0xffa26b} distance={7} decay={2} />
    </>
  );
}
