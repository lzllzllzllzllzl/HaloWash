/**
 * 8 大功能模块元数据：装配高度 / 爆炸高度 / 半径 / 主题色。
 * 同时驱动 3D 堆栈、左侧模块目录、右侧图例与相机预设（对应蓝图自上而下 1-8）。
 */

export type ModuleId =
  | 'diagnosis' | 'spray' | 'dry' | 'care'
  | 'aroma' | 'music' | 'massage' | 'clean';

export interface ModuleMeta {
  id: ModuleId;
  /** 蓝图编号 1-8 */
  num: number;
  /** 装配状态圆盘中心 y */
  y: number;
  /** 爆炸状态圆盘中心 y（自上而下铺开，同蓝图） */
  explodedY: number;
  /** 模块圆盘半径 */
  radius: number;
  /** 模块主题色 */
  color: string;
  /** 图例键（右侧 SYSTEM 面板） */
  legendKey: string;
}

/**
 * 装配 y：8 层盘围绕人头（y≈1.2~2.2）堆叠，全部收进外壳球体（球心2.35/半径1.38）。
 * 球壳覆盖 y 0.97~3.73，开口朝下露出人脸；
 * 模块 y 1.88~3.20 紧密压在壳内上半球，头顶最高点 diagnosis(3.20+0.60)=3.80 < 3.73 ✓
 * 爆炸 explodedY：间距 ~1.3/层，顶部 diagnosis 拉到 6.40，底部 clean 沉到 -2.70。
 */
export const MODULES_META: ModuleMeta[] = [
  { id: 'diagnosis', num: 1, y: 3.20, explodedY: 6.40, radius: 0.72, color: '#7AB3E8', legendKey: 'AI SENSOR' },
  { id: 'spray',     num: 2, y: 3.00, explodedY: 5.10, radius: 0.8,  color: '#4A90D9', legendKey: 'WATER FLOW' },
  { id: 'dry',       num: 3, y: 2.80, explodedY: 3.80, radius: 0.8,  color: '#FFA26B', legendKey: 'AIR FLOW' },
  { id: 'care',      num: 4, y: 2.60, explodedY: 2.50, radius: 0.8,  color: '#FF6B6B', legendKey: 'LED THERAPY' },
  { id: 'aroma',     num: 5, y: 2.42, explodedY: 1.20, radius: 0.76, color: '#B69CFF', legendKey: 'AROMA DIFFUSION' },
  { id: 'music',     num: 6, y: 2.25, explodedY: -0.10, radius: 0.7,  color: '#6C87A5', legendKey: 'BLUETOOTH 5.0' },
  { id: 'massage',   num: 7, y: 2.08, explodedY: -1.40, radius: 0.76, color: '#FF8FA3', legendKey: 'MASSAGE NODES' },
  { id: 'clean',     num: 8, y: 1.90, explodedY: -2.70, radius: 0.86, color: '#34C77B', legendKey: 'SELF-CLEANING' },
];

export const MODULE_ORDER: ModuleId[] = MODULES_META.map((m) => m.id);

export const MODULE_BY_ID: Record<ModuleId, ModuleMeta> = MODULES_META.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<ModuleId, ModuleMeta>,
);

/** 模块在给定爆炸系数下的世界 y —— 唯一真源，3D / 特效 / 相机共用 */
export function moduleYAt(meta: ModuleMeta, explode: number): number {
  return meta.y + (meta.explodedY - meta.y) * explode;
}

/** 当前爆炸系数下整摞轮盘的竖直包围区间 */
export function stackBounds(explode: number): { bottom: number; top: number; center: number } {
  let bottom = Infinity;
  let top = -Infinity;
  for (const m of MODULES_META) {
    const y = moduleYAt(m, explode);
    if (y < bottom) bottom = y;
    if (y > top) top = y;
  }
  return { bottom, top, center: (bottom + top) / 2 };
}

/**
 * 外壳件（前后球面段）爆炸方向。
 * 前后半壳向 ±z 大幅推开并下沉（dist 3.5），
 * 让轮盘柱体从壳内升起时，整个壳体彻底退出垂直堆栈所在的中央通道。
 */
export interface ShellPartMeta {
  id: 'shellFront' | 'shellBack';
  dir: [number, number, number];
  dist: number;
}

export const SHELL_PARTS: ShellPartMeta[] = [
  { id: 'shellFront', dir: [0.15, -0.25, 1], dist: 3.5 },
  { id: 'shellBack', dir: [-0.15, -0.20, -1], dist: 3.5 },
];
