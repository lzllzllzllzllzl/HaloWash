/**
 * HaloWash 整机模型（等效火箭 demo 的 Turbojet.tsx）：
 * 8 大模块垂直堆栈 + 前后外壳 + 支架水箱 + 中央光柱。
 * 逐帧：爆炸插值 / 特效趋近 / 模块动画 / 压暗，全部走可变单例 ps。
 */

import React, { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../app/store';
import { SHELL } from '../app/productConfig';
import { MODULES_META, MODULE_BY_ID, SHELL_PARTS, moduleYAt, type ModuleId } from './partMetadata';
import { ps } from './productState';
import { damp } from './animations';
import { applyDim } from './moduleGeometry';
import {
  createMaterials, buildDiagnosis, buildSpray, buildDry, buildCare, buildAroma,
  buildMusic, buildMassage, buildClean, buildShellBack, buildShellFrontParts,
  buildStand, buildTanks, buildBeam, type Mats, type ModuleParts,
} from './buildProduct';

const BUILDERS: Record<ModuleId, (m: Mats) => ModuleParts> = {
  diagnosis: buildDiagnosis,
  spray: buildSpray,
  dry: buildDry,
  care: buildCare,
  aroma: buildAroma,
  music: buildMusic,
  massage: buildMassage,
  clean: buildClean,
};

export function HaloWash() {
  const mats = useMemo(() => createMaterials(), []);
  const modules = useMemo(() => {
    const out = {} as Record<ModuleId, ModuleParts>;
    for (const meta of MODULES_META) out[meta.id] = BUILDERS[meta.id](mats);
    return out;
  }, [mats]);

  const shellBack = useMemo(() => buildShellBack(mats), [mats]);
  const shellFront = useMemo(() => buildShellFrontParts(mats), [mats]);
  const stand = useMemo(() => buildStand(mats), [mats]);
  const tanks = useMemo(() => buildTanks(mats), [mats]);
  const beam = useMemo(() => buildBeam(), []);
  const shellRefs = useRef<Array<THREE.Group | null>>([null, null]);
  const beamRef = useRef<THREE.Mesh>(null);
  const downPos = useRef<[number, number]>([0, 0]);

  const demoModule = useStore((s) => s.demoModule);
  const setHoverModule = useStore((s) => s.setHoverModule);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const store = useStore.getState();
    const t = state.clock.elapsedTime;
    const e = store.explodeCurrent;
    const sel = store.selectedModule;

    // 特效强度向目标趋近
    for (const id of MODULES_META) {
      ps.fx[id.id] = damp(ps.fx[id.id], store.fxTarget[id.id], 6, dt);
    }
    ps.cyclePulse = damp(ps.cyclePulse, store.cycleRunning ? 1 : 0, 3, dt);

    // 模块堆栈：装配 y ↔ 爆炸 y
    // 注意：这里的 group.position.y 就是【世界高度】，外层包装 group 不再叠加 meta.y，
    // 否则会出现双重偏移，导致装配态整摞轮盘悬在外壳上方而非收回壳内。
    for (const meta of MODULES_META) {
      const g = modules[meta.id].group;
      g.position.y = moduleYAt(meta, e);
      const dim = sel === null ? 1 : sel === meta.id ? 1 : 0.18;
      applyDim(g, dim);
      const target = ps.hover === meta.id ? 1.045 : 1;
      const s = damp(g.scale.x, target, 10, dt);
      g.scale.setScalar(s);
    }

    // ① 检测：镜头环旋转 + 呼吸
    const diag = modules.diagnosis;
    if (diag.spin) diag.spin.rotation.y += ps.fx.diagnosis * 0.8 * dt;
    if (diag.leds) diag.leds.emissiveIntensity = 0.25 + ps.fx.diagnosis * (1 + Math.sin(t * 3) * 0.4);

    // ② 喷淋：喷嘴环旋转（速度受水压影响）
    const spray = modules.spray;
    if (spray.spin) spray.spin.rotation.y += ps.fx.spray * (2 + store.waterPressure * 14) * dt;

    // ③ 烘干：风机 + 加热丝
    const dry = modules.dry;
    if (dry.fan) dry.fan.rotation.y += ps.fx.dry * 9 * dt;
    if (dry.coil) dry.coil.emissiveIntensity = 0.1 + ps.fx.dry * 1.8;

    // ④ 护发：红光脉冲
    if (modules.care.leds) {
      modules.care.leds.emissiveIntensity = 0.25 + ps.fx.care * (1.1 + Math.sin(t * 4) * 0.7);
    }

    // ⑤ 香氛：胶囊仓旋转
    const aroma = modules.aroma;
    if (aroma.carousel) aroma.carousel.rotation.y += ps.fx.aroma * 1.1 * dt;

    // ⑥ 音乐：格栅随节拍呼吸
    if (modules.music.grille) {
      modules.music.grille.emissiveIntensity = 0.05 + ps.fx.music * (0.25 + Math.abs(Math.sin(t * 4.5)) * 0.5);
    }

    // ⑦ 按摩：海浪波逐点伸缩
    const massage = modules.massage;
    if (massage.pistons) {
      massage.pistons.forEach((p, i) => {
        p.position.y = (p.userData.baseY as number) - ps.fx.massage * 0.055 * (0.5 + 0.5 * Math.sin(t * 5 - i * 0.65));
      });
    }

    // ⑧ 自清洁：UV 灯脉动
    const clean = modules.clean;
    if (clean.uv) clean.uv.emissiveIntensity = 0.2 + ps.fx.clean * (1.2 + Math.sin(t * 2.2) * 0.4);

    // 外壳爆炸（前后分离）：爆炸沿 dir 大幅展开，装配时合拢覆盖所有模块
    SHELL_PARTS.forEach((part, i) => {
      const g = shellRefs.current[i];
      if (!g) return;
      // 装配态：外壳居中，把 8 层轮盘整个罩住；爆炸态：前后半壳向外且向下大幅让开
      g.position.set(
        part.dir[0] * e * part.dist,
        SHELL.centerY + part.dir[1] * e * part.dist,
        part.dir[2] * e * part.dist,
      );
      const dim = sel === null ? 1 : 0.12;
      applyDim(g, dim);
    });
    applyDim(stand, 1);
    applyDim(tanks, 1);

    // 中央光柱：装配时隐藏在壳内，爆炸时展开覆盖全模块高度（-2.70~6.40）
    const beamMesh = beamRef.current;
    if (beamMesh) {
      const topY = THREE.MathUtils.lerp(3.20, 6.40, e);
      const botY = THREE.MathUtils.lerp(1.90, -2.70, e);
      beamMesh.scale.set(1, topY - botY, 1);
      beamMesh.position.y = (topY + botY) / 2;
      const activity = Math.max(ps.fx.diagnosis, ps.fx.spray, ps.fx.dry, ps.fx.care, ps.fx.aroma, ps.fx.music, ps.fx.massage, ps.fx.clean);
      beam.mat.opacity = Math.min(0.5, e * 0.42 + ps.cyclePulse * 0.1 + activity * 0.16 + Math.sin(t * 2.4) * 0.03);
    }
  });

  const over = (id: ModuleId) => (ev: ThreeEvent<PointerEvent>) => {
    ev.stopPropagation();
    ps.hover = id;
    setHoverModule(id);
    document.body.style.cursor = 'pointer';
  };
  const out = (id: ModuleId) => () => {
    if (ps.hover === id) ps.hover = null;
    setHoverModule(null);
    document.body.style.cursor = '';
  };

  return (
    <group>
      {MODULES_META.map((meta) => (
        <group
          key={meta.id}
          onPointerOver={over(meta.id)}
          onPointerOut={out(meta.id)}
          onPointerDown={(ev) => {
            downPos.current = [ev.clientX, ev.clientY];
          }}
          onClick={(ev) => {
            ev.stopPropagation();
            const dx = ev.clientX - downPos.current[0];
            const dy = ev.clientY - downPos.current[1];
            if (dx * dx + dy * dy < 36) {
              const store = useStore.getState();
              demoModule(store.selectedModule === meta.id ? null : meta.id);
            }
          }}
        >
          <primitive object={modules[meta.id].group} />
        </group>
      ))}

      <group ref={(r) => { shellRefs.current[0] = r; }}>
        <primitive object={shellFront} />
      </group>
      <group ref={(r) => { shellRefs.current[1] = r; }}>
        <primitive object={shellBack} />
      </group>

      <primitive object={stand} />
      <primitive object={tanks} />
      <mesh ref={beamRef} geometry={beam.mesh.geometry} material={beam.mat} />
    </group>
  );
}
