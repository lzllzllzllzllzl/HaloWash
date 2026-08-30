/**
 * 特效系统：统一粒子 Points + 非粒子模块特效（检测扫描环 / 音乐声波环）。
 * 逐帧读 ps.fx，不触发 React 渲染。
 */

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../app/store';
import { ps } from '../product/productState';
import { MODULE_BY_ID, moduleYAt } from '../product/partMetadata';
import { ParticlePool, MAX_PARTICLES } from './particlePool';

const geo = new THREE.BufferGeometry();
const posArr = new Float32Array(MAX_PARTICLES * 3);
const colArr = new Float32Array(MAX_PARTICLES * 3);
geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));

const mat = new THREE.PointsMaterial({
  size: 0.035, vertexColors: true, transparent: true, opacity: 0.85,
  blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
});

function currentModuleY(id: keyof typeof MODULE_BY_ID, explode: number): number {
  return moduleYAt(MODULE_BY_ID[id], explode);
}

export function FXSystem() {
  const pointsRef = useRef<THREE.Points>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const ringRefs = useRef<Array<THREE.Mesh | null>>([null, null]);
  const pool = useMemo(() => new ParticlePool(), []);
  const scanCycle = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const store = useStore.getState();
    const t = state.clock.elapsedTime;
    const e = store.explodeCurrent;

    pool.update(ps, e, store.waterPressure, dt);
    const points = pointsRef.current;
    if (points) {
      const attr = points.geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = points.geometry.attributes.color as THREE.BufferAttribute;
      (attr.array as Float32Array).set(pool.positions);
      (colAttr.array as Float32Array).set(pool.colors);
      attr.needsUpdate = true;
      colAttr.needsUpdate = true;
      points.visible =
        ps.fx.spray > 0.02 || ps.fx.dry > 0.02 || ps.fx.care > 0.02 ||
        ps.fx.aroma > 0.02 || ps.fx.clean > 0.02;
    }

    // ① 检测扫描环：在检测模块下方往复下扫
    const scan = scanRef.current;
    if (scan) {
      const f = ps.fx.diagnosis;
      scan.visible = f > 0.02;
      if (scan.visible) {
        scanCycle.current = (scanCycle.current + dt * 0.55) % 1;
        const y0 = currentModuleY('diagnosis', e);
        scan.position.y = y0 - 0.25 - scanCycle.current * 1.5;
        scan.scale.setScalar(1 - scanCycle.current * 0.25);
        const sm = scan.material as THREE.MeshBasicMaterial;
        sm.opacity = f * 0.65 * (1 - scanCycle.current * 0.5);
      }
    }

    // ⑥ 音乐声波环：两道相位错开的扩张环
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      const f = ps.fx.music;
      ring.visible = f > 0.02;
      if (ring.visible) {
        const phase = ((t * 0.7 + i * 0.5) % 1);
        ring.scale.setScalar(0.4 + phase * 1.6);
        ring.position.y = currentModuleY('music', e) + 0.05 + phase * 0.22;
        const rm = ring.material as THREE.MeshBasicMaterial;
        rm.opacity = f * 0.5 * (1 - phase);
      }
    });
  });

  return (
    <>
      <points ref={pointsRef} geometry={geo} material={mat} frustumCulled={false} />
      <mesh ref={scanRef} visible={false}>
        <torusGeometry args={[0.55, 0.012, 8, 40]} />
        <meshBasicMaterial color="#7AB3E8" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {ringRefs.current.map((_, i) => (
        <mesh key={i} ref={(r) => { ringRefs.current[i] = r; }} visible={false} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.008, 8, 48]} />
          <meshBasicMaterial color="#6FB9FF" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}
