/**
 * 逐帧可变单例（等效火箭 demo 的 engineState 思路）：
 * 每帧变化的值放这里，避免 setState 触发 React 重渲染。
 * Zustand store 只放驱动 UI 的目标值。
 */

import type { ModuleId } from './partMetadata';

export const ps = {
  /** 各模块特效当前强度 0-1（向 store.fxTarget 平滑趋近） */
  fx: {
    diagnosis: 0, spray: 0, dry: 0, care: 0,
    aroma: 0, music: 0, massage: 0, clean: 0,
  } as Record<ModuleId, number>,
  hover: null as ModuleId | null,
  /** 服务循环运行中（供光柱/粒子共享） */
  cyclePulse: 0,
};

export type Ps = typeof ps;
