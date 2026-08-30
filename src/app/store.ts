import { create } from 'zustand';
import type { Lang } from './i18n';
import { PHASE_PLAN, DEMO_FX, type ServicePhase } from './productConfig';
import type { ModuleId } from '../product/partMetadata';

export interface Plaque {
  id: number;
  text: string;
  type: 'info' | 'success';
}

export type CameraMode = 'global' | 'front' | 'top' | 'stack' | 'free';

export interface StoreState {
  lang: Lang;
  setLang: (l: Lang) => void;

  servicePhase: ServicePhase;
  serviceProgress: number; // 当前阶段内进度 0-1
  cycleRunning: boolean;

  explodeTarget: number;
  explodeCurrent: number;

  selectedModule: ModuleId | null;
  hoverModule: ModuleId | null;

  /** 各模块特效目标强度（sim loop / FXSystem 逐帧趋近） */
  fxTarget: Record<ModuleId, number>;

  cameraMode: CameraMode;
  waterPressure: number; // 0.2 - 0.4 MPa
  soundOn: boolean;

  plaques: Plaque[];

  setServicePhase: (p: ServicePhase) => void;
  setServiceProgress: (p: number) => void;
  setCycleRunning: (r: boolean) => void;
  setExplodeTarget: (e: number) => void;
  setExplodeCurrent: (e: number) => void;
  selectModule: (id: ModuleId | null) => void;
  setHoverModule: (id: ModuleId | null) => void;
  setFxTargets: (fx: Partial<Record<ModuleId, number>>) => void;
  setCameraMode: (m: CameraMode) => void;
  setWaterPressure: (p: number) => void;
  setSoundOn: (s: boolean) => void;
  addPlaque: (text: string, type?: Plaque['type']) => void;

  startCycle: () => void;
  stopCycle: () => void;
  demoModule: (id: ModuleId | null) => void;
}

let plaqueId = 0;

const zeroFx = (): Record<ModuleId, number> => ({
  diagnosis: 0, spray: 0, dry: 0, care: 0,
  aroma: 0, music: 0, massage: 0, clean: 0,
});

export const useStore = create<StoreState>((set, get) => ({
  lang: (localStorage.getItem('halowash-lang') as Lang) || 'zh',
  setLang: (l) => { localStorage.setItem('halowash-lang', l); set({ lang: l }); },

  servicePhase: 'OFF',
  serviceProgress: 0,
  cycleRunning: false,

  explodeTarget: 0,
  explodeCurrent: 0,

  selectedModule: null,
  hoverModule: null,

  fxTarget: zeroFx(),

  cameraMode: 'global',
  waterPressure: 0.3,
  soundOn: true,

  plaques: [],

  setServicePhase: (p) => set({ servicePhase: p }),
  setServiceProgress: (p) => set({ serviceProgress: p }),
  setCycleRunning: (r) => set({ cycleRunning: r }),
  setExplodeTarget: (e) => set({ explodeTarget: Math.max(0, Math.min(1, e)) }),
  setExplodeCurrent: (e) => set({ explodeCurrent: Math.max(0, Math.min(1, e)) }),
  selectModule: (id) => set({ selectedModule: id }),
  setHoverModule: (id) => set({ hoverModule: id }),
  setFxTargets: (fx) => set((s) => ({ fxTarget: { ...zeroFx(), ...fx } })),
  setCameraMode: (m) => set({ cameraMode: m }),
  setWaterPressure: (p) => set({ waterPressure: Math.max(0.2, Math.min(0.4, p)) }),
  setSoundOn: (s) => set({ soundOn: s }),
  addPlaque: (text, type = 'info') => {
    const id = ++plaqueId;
    set((s) => ({ plaques: [...s.plaques, { id, text, type }] }));
    setTimeout(() => {
      set((s) => ({ plaques: s.plaques.filter((p) => p.id !== id) }));
    }, 3200);
  },

  startCycle: () => {
    const s = get();
    if (s.cycleRunning) return;
    // 全套护理需要整机装配；若处于爆炸态则自动回收
    if (s.explodeTarget > 0.15) {
      s.setExplodeTarget(0);
      s.demoModule(null);
    }
    const first = PHASE_PLAN[0];
    set({
      cycleRunning: true,
      servicePhase: first.phase,
      serviceProgress: 0,
      fxTarget: { ...zeroFx(), ...first.fx },
    });
  },

  stopCycle: () => {
    set({ cycleRunning: false, servicePhase: 'OFF', serviceProgress: 0 });
    get().setFxTargets({});
  },

  demoModule: (id) => {
    const s = get();
    if (s.cycleRunning) {
      // 全套护理运行中：仅选中查看，不改变当前特效
      set({ selectedModule: id });
      return;
    }
    set({ selectedModule: id });
    if (id) {
      // 选中模块：自动炸到 1.0（层间完全分离），让用户看清模块细节；相机同步跟拍该模块
      set({ explodeTarget: 1 });
      set({ fxTarget: { ...zeroFx(), [id]: DEMO_FX[id] } });
    } else {
      s.setFxTargets({});
      // 取消选中：拉回装配态
      set({ explodeTarget: 0 });
    }
  },
}));
