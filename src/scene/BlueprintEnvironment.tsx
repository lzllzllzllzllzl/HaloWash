import React from 'react';
import * as THREE from 'three';
import { COLORS } from '../app/productConfig';

/** 蓝图环境：网格地面 + 圆形工作台 + 雾 */
export function BlueprintEnvironment() {
  const gridMajor = useMemoColor(COLORS.gridMajor);
  const gridMinor = useMemoColor(COLORS.gridMinor);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color={COLORS.void} roughness={0.95} metalness={0.05} />
      </mesh>
      <gridHelper args={[30, 60, gridMajor, gridMinor]} position={[0, 0.002, 0]} />
      {/* 中央圆形工作台 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]} receiveShadow>
        <circleGeometry args={[1.9, 48]} />
        <meshStandardMaterial color="#0a1a2e" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[1.82, 1.9, 48]} />
        <meshBasicMaterial color={COLORS.accent} transparent opacity={0.35} />
      </mesh>
      <fog attach="fog" args={[COLORS.void, 12, 32]} />
    </>
  );
}

function useMemoColor(color: string): THREE.Color {
  return React.useMemo(() => new THREE.Color(color), [color]);
}
