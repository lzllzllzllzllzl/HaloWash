import React, { useEffect, useRef } from 'react';
import { BenchScene } from '../scene/BenchScene';
import { Overlay } from '../ui/Overlay';
import { ModuleIndex } from '../ui/ModuleIndex';
import { SystemPanel } from '../ui/SystemPanel';
import { ControlDesk } from '../ui/ControlDesk';
import { PartInfo } from '../ui/PartInfo';
import { PlaqueStack } from '../ui/PlaqueStack';
import { useStore } from './store';
import { PHASE_PLAN, type ServicePhase } from './productConfig';
import { phaseKey, t } from './i18n';
import { hwEvents } from './events';
import { hardwareAudio } from '../audio/HardwareAudio';
import { ps } from '../product/productState';
import { damp } from '../product/animations';

/**
 * 服务流程模拟主循环（等效火箭 demo 的 EngineSimLoop）：
 * rAF 驱动阶段推进 / 特效目标 / 音效，React 不参与逐帧渲染。
 */
function ServiceSimLoop() {
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let running = true;
    let frame = 0;
    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastTime.current) / 1000, 0.1);
      lastTime.current = now;

      const store = useStore.getState();
      if (store.cycleRunning) {
        const idx = PHASE_PLAN.findIndex((p) => p.phase === store.servicePhase);
        const plan = PHASE_PLAN[Math.max(idx, 0)];
        let progress = store.serviceProgress + dt / plan.duration;

        if (progress >= 1) {
          const next = PHASE_PLAN[idx + 1];
          if (next) {
            store.setServicePhase(next.phase);
            store.setServiceProgress(0);
            store.setFxTargets(next.fx);
            if (next.phase !== 'DONE') {
              store.addPlaque(t(phaseKey(next.phase), store.lang), 'info');
              hwEvents.emit('phaseChanged', next.phase);
            }
          }
          if (plan.phase === 'DONE') {
            store.setCycleRunning(false);
            store.setServicePhase('OFF');
            store.setServiceProgress(0);
            store.addPlaque(t('cycleDone', store.lang), 'success');
          }
        } else {
          store.setServiceProgress(progress);
        }
      }

      // 爆炸目标平滑趋近（解决 slider 拉不回、点击模块炸不开的问题）
      const cur = useStore.getState().explodeCurrent;
      const tgt = useStore.getState().explodeTarget;
      if (Math.abs(cur - tgt) > 0.001) {
        const next = damp(cur, tgt, 5, dt);
        useStore.getState().setExplodeCurrent(next);
      }

      hardwareAudio.update(useStore.getState().soundOn);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(frame); };
  }, []);

  return null;
}

export function App() {
  const lang = useStore((s) => s.lang);
  useEffect(() => { document.title = lang === 'zh' ? 'HaloWash 技术蓝图实验台' : 'HaloWash Blueprint Bench'; }, [lang]);
  // 调试钩子：浏览器 console 可直接检查/驱动状态（与 HaloWash 主项目约定一致）
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__hwStore = useStore;
  }, []);

  return (
    <>
      <ServiceSimLoop />
      <BenchScene />
      <Overlay />
      <ModuleIndex />
      <SystemPanel />
      <ControlDesk />
      <PartInfo />
      <PlaqueStack />
    </>
  );
}

export type { ServicePhase };
