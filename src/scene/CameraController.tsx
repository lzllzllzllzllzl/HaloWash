import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../app/store';
import { CAMERA_POSITIONS, CAMERA_TARGETS } from '../app/productConfig';
import { MODULES_META, MODULE_BY_ID, moduleYAt, stackBounds, type ModuleId } from '../product/partMetadata';

/**
 * 相机取景：预设视角 + 选中模块飞近。
 *
 * 关键修正（此前"点模块视角不聚焦"的三处根因）：
 *  1. 之前用 meta.y（【装配态】高度）当目标，但点击模块会同时把爆炸系数推到 0.85，
 *     模块实际飞到 explodedY 附近 —— 相机与模块高度完全错位。
 *     现在每帧按 store.explodeCurrent 实时求模块当前世界高度，爆炸动画全程持续跟拍。
 *  2. 之前距离写死 1.4，比模块自身直径还小，相机会怼进模型里。
 *     现在按模块半径 + 相机 fov + 画面宽高比反解取景距离，横竖屏都不会切边。
 *  3. 之前方位角写死，且低位模块会把相机放到地面以下。
 *     现在保留用户当前方位角（视角连续），俯仰固定 11°，并限制相机不入地。
 */

type Orbitish = {
  target: THREE.Vector3;
  update: () => void;
  addEventListener: (t: string, f: () => void) => void;
  removeEventListener: (t: string, f: () => void) => void;
};

/** 取景：让半径为 r 的包围球在竖直与水平方向都不出画，pad 为留白系数 */
function fitDistance(r: number, aspect: number, fovDeg: number, pad: number): number {
  const vFov = THREE.MathUtils.degToRad(fovDeg);
  const halfV = Math.tan(vFov / 2);
  const distV = r / halfV;
  const distH = r / (halfV * Math.max(aspect, 0.35));
  return Math.max(distV, distH) * pad;
}

const MAX_MODULE_RADIUS = MODULES_META.reduce((a, m) => Math.max(a, m.radius), 0);
const DEFAULT_AZ = 0.62;   // 默认方位角：右前方（避开 +x 水箱与 -z 立臂）
const FOCUS_EL = 0.2;      // 聚焦俯仰角 ≈ 11°
const MIN_CAM_Y = 0.75;    // 相机不入地

export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as Orbitish | null;

  const cameraMode = useStore((s) => s.cameraMode);
  const selectedModule = useStore((s) => s.selectedModule);
  const explodeTarget = useStore((s) => s.explodeTarget);

  const focusModule = useRef<ModuleId | null>(null);
  const active = useRef(true);

  const goalPos = useRef(new THREE.Vector3());
  const goalTgt = useRef(new THREE.Vector3());
  const tmpDir = useRef(new THREE.Vector3());
  const tmpOff = useRef(new THREE.Vector3());

  /* 预设切换 → 回到整机/整摞取景 */
  useEffect(() => {
    focusModule.current = null;
    active.current = true;
  }, [cameraMode]);

  /* 选中/取消选中模块 → 切到模块特写或整摞取景 */
  useEffect(() => {
    focusModule.current = selectedModule;
    active.current = true;
  }, [selectedModule]);

  /* 爆炸目标变化（滑块 / 自动炸开 / 收拢）→ 重新取景 */
  useEffect(() => {
    active.current = true;
  }, [explodeTarget]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => { active.current = false; };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, delta) => {
    if (!controls || !active.current) return;
    const dt = Math.min(delta, 0.05);
    const store = useStore.getState();
    const e = store.explodeCurrent;
    const aspect = camera.aspect || 1.78;
    const fov = camera.fov || 45;

    const id = focusModule.current;

    if (id) {
      /* ---------- 模块特写：跟拍模块当前真实高度 ---------- */
      const meta = MODULE_BY_ID[id];
      const y = moduleYAt(meta, e);
      const r = meta.radius * 1.35 + 0.18;               // 含穹顶/喷嘴等外扩细节
      const dist = fitDistance(r, aspect, fov, 1.02);

      // 保留用户当前方位角，避免视角突变；俯视过陡时回落到默认右前方
      tmpOff.current.copy(camera.position).sub(controls.target);
      const flat = Math.hypot(tmpOff.current.x, tmpOff.current.z);
      const az = flat > 0.5 ? Math.atan2(tmpOff.current.x, tmpOff.current.z) : DEFAULT_AZ;

      const ch = Math.cos(FOCUS_EL);
      tmpDir.current.set(Math.sin(az) * ch, Math.sin(FOCUS_EL), Math.cos(az) * ch);

      goalTgt.current.set(0, y, 0);
      goalPos.current.set(0, y, 0).addScaledVector(tmpDir.current, dist);
      if (goalPos.current.y < MIN_CAM_Y) goalPos.current.y = MIN_CAM_Y;
    } else {
      /* ---------- 整机 / 整摞取景：按当前柱体包围盒自适应 ---------- */
      const { bottom, top, center } = stackBounds(e);
      const r = (top - bottom) / 2 + MAX_MODULE_RADIUS + 0.25;
      const dist = fitDistance(r, aspect, fov, 1.08);

      const pos = CAMERA_POSITIONS[cameraMode] || CAMERA_POSITIONS.global;
      const tgt = CAMERA_TARGETS[cameraMode] || CAMERA_TARGETS.global;
      tmpDir.current.set(pos[0] - tgt[0], pos[1] - tgt[1], pos[2] - tgt[2]);
      if (tmpDir.current.lengthSq() < 1e-6) tmpDir.current.set(0.68, 0.11, 0.72);
      tmpDir.current.normalize();

      goalTgt.current.set(0, center, 0);
      goalPos.current.set(0, center, 0).addScaledVector(tmpDir.current, dist);
      if (goalPos.current.y < MIN_CAM_Y) goalPos.current.y = MIN_CAM_Y;
    }

    const k = 1 - Math.exp(-3.6 * dt);
    camera.position.lerp(goalPos.current, k);
    controls.target.lerp(goalTgt.current, k);
    controls.update();

    if (camera.position.distanceTo(goalPos.current) < 0.03) active.current = false;
  });

  return null;
}
