import type { ModuleId } from '../product/partMetadata';

/* ---------------- 全局常量：整机尺寸 / 相机 / 服务流程 ---------------- */

export const SHELL = {
  centerY: 2.35,          // 球心降低，让人脸（y≈1.5-2.2）在底部开口处
  radius: 1.38,           // 增大半径 y=1.0~3.7，头部空间更充裕
  thetaLength: Math.PI * 0.88, // 球面段极角（覆盖上半球，底部预留大开口）
  gapHalf: 0.85,          // 正面面罩开口半角（增大开口，露出人脸）
  scaleY: 1.0,
};

/** 底座支架与外挂水箱（同产品渲染图） */
export const STAND = {
  baseY: 0.05,
  baseRadius: 0.62,
  armTop: [0, 2.86, -0.62] as [number, number, number],
};

export const TANK = {
  x: 1.28,
  y: 2.62,
  z: -0.18,
  radius: 0.17,
  length: 0.52,
  gap: 0.46, // 净水/废水两罐间距
};

/* ---------------- 服务流程（等效发动机 START→RUN） ---------------- */

export type ServicePhase =
  | 'OFF' | 'SCAN' | 'WASH' | 'DRY' | 'CARE'
  | 'AROMA' | 'RELAX' | 'CLEAN' | 'DONE';

/** 每个阶段：时长(秒)、激活模块及其特效强度 */
export const PHASE_PLAN: Array<{
  phase: ServicePhase;
  duration: number;
  fx: Partial<Record<ModuleId, number>>;
}> = [
  { phase: 'SCAN',  duration: 7,  fx: { diagnosis: 1 } },
  { phase: 'WASH',  duration: 10, fx: { spray: 1, diagnosis: 0.25 } },
  { phase: 'DRY',   duration: 8,  fx: { dry: 1 } },
  { phase: 'CARE',  duration: 8,  fx: { care: 1 } },
  { phase: 'AROMA', duration: 7,  fx: { aroma: 1 } },
  { phase: 'RELAX', duration: 11, fx: { music: 1, massage: 1 } },
  { phase: 'CLEAN', duration: 7,  fx: { clean: 1 } },
  { phase: 'DONE',  duration: 3,  fx: {} },
];

/** 手动演示单个模块时的默认强度 */
export const DEMO_FX: Record<ModuleId, number> = {
  diagnosis: 1, spray: 1, dry: 1, care: 1,
  aroma: 1, music: 1, massage: 1, clean: 1,
};

/* ---------------- 相机预设 ---------------- */

export const CAMERA_POSITIONS: Record<string, [number, number, number]> = {
  global: [4.6, 3.1, 4.9],
  front:  [0.2, 2.5, 6.4],
  top:    [0.4, 7.2, 1.2],
  stack:  [7.2, 3.9, 0.9],   // 侧视爆炸堆栈（对应蓝图视角）
  free:   [4.6, 3.1, 4.9],
};

export const CAMERA_TARGETS: Record<string, [number, number, number]> = {
  global: [0, 2.35, 0],
  front:  [0, 2.35, 0],
  top:    [0, 2.5, 0],
  stack:  [0, 2.9, 0],
  free:   [0, 2.35, 0],
};

/* ---------------- 系统规格（对应蓝图右下角 SYSTEM SPECIFICATIONS） ---------------- */

export const SPECS: Array<{ key: string; value: string }> = [
  { key: 'specVoltage', value: '220 V' },
  { key: 'specFreq', value: '50 Hz' },
  { key: 'specPower', value: '1800 W' },
  { key: 'specPressure', value: '0.2 – 0.4 MPa' },
  { key: 'specWeight', value: '18.4 kg' },
  { key: 'specDims', value: '420×380×520 mm' },
];

/* ---------------- 调色板（3D 内使用；UI 见 index.css 变量） ---------------- */

export const COLORS = {
  void: '#04101e',
  gridMajor: '#16304f',
  gridMinor: '#0b1c30',
  accent: '#4da3ff',
  beam: '#3f9bff',
};
