import React from 'react';
import { useStore } from '../app/store';
import { t, I18N } from '../app/i18n';
import { MODULES_META, type ModuleId } from '../product/partMetadata';
import { PHASE_PLAN } from '../app/productConfig';
import { ensureAudio } from '../audio/audioBus';
import { hardwareAudio } from '../audio/HardwareAudio';

/**
 * 左侧模块目录：对应蓝图左列 ①-⑧ 自上而下。
 * 点击 = 选中模块（相机飞近 + 详情卡 + 单模块演示）。
 */
export function ModuleIndex() {
  const lang = useStore((s) => s.lang);
  const selected = useStore((s) => s.selectedModule);
  const hover = useStore((s) => s.hoverModule);
  const servicePhase = useStore((s) => s.servicePhase);
  const cycleRunning = useStore((s) => s.cycleRunning);
  const demoModule = useStore((s) => s.demoModule);

  // 当前服务阶段激活的模块（循环运行时目录同步点亮）
  const phaseIds = new Set<ModuleId>();
  if (cycleRunning) {
    const plan = PHASE_PLAN.find((p) => p.phase === servicePhase);
    if (plan) for (const k of Object.keys(plan.fx)) phaseIds.add(k as ModuleId);
  }

  const pick = (id: ModuleId) => {
    ensureAudio();
    hardwareAudio.click();
    // 读取当前实时值，避免闭包陷阱
    const current = useStore.getState().selectedModule;
    demoModule(current === id ? null : id);
  };

  return (
    <div className="module-index panel" role="region" aria-label={t('moduleIndex', lang)}>
      <div className="panel-head">
        <span className="panel-title">{t('moduleIndex', lang)}</span>
        <span className="panel-hint">{t('moduleIndexHint', lang)}</span>
      </div>
      <ol className="module-list">
        {MODULES_META.map((meta) => (
          <li key={meta.id}>
            <button
              className={`module-row${selected === meta.id ? ' selected' : ''}${phaseIds.has(meta.id) ? ' running' : ''}${hover === meta.id ? ' hover' : ''}`}
              style={{ ['--mc' as string]: meta.color }}
              onClick={() => pick(meta.id)}
              onMouseEnter={() => useStore.getState().setHoverModule(meta.id)}
              onMouseLeave={() => useStore.getState().setHoverModule(null)}
              aria-pressed={selected === meta.id}
            >
              <span className="module-num">{meta.num}</span>
              <span className="module-text">
                <span className="module-name">{I18N[lang].modules[meta.id].name}</span>
                <span className="module-en">{I18N[lang].modules[meta.id].en}</span>
              </span>
              <span className={`module-dot${phaseIds.has(meta.id) ? ' on' : ''}`} />
            </button>
          </li>
        ))}
      </ol>
      <div className="panel-foot">{t('click3dHint', lang)}</div>
    </div>
  );
}
