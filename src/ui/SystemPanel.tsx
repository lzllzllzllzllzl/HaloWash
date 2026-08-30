import React from 'react';
import { useStore } from '../app/store';
import { t, phaseKey, type Texts } from '../app/i18n';
import { MODULES_META } from '../product/partMetadata';
import { SPECS } from '../app/productConfig';

/** 图例小图标（对应蓝图右列图例，顺序一致） */
function LegendIcon({ id }: { id: string }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'diagnosis': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><circle cx="8" cy="8" r="5.5" {...common} /><circle cx="8" cy="8" r="2" {...common} /></svg>;
    case 'spray': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><path d="M8 2 C5.5 6 4.5 8 4.5 10 a3.5 3.5 0 0 0 7 0 C11.5 8 10.5 6 8 2 Z" {...common} /></svg>;
    case 'dry': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><path d="M2 6 h8 a2 2 0 1 0 -2 -2" {...common} /><path d="M2 9 h10 a2 2 0 1 1 -2 2" {...common} /><path d="M2 12 h5" {...common} /></svg>;
    case 'care': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><circle cx="8" cy="8" r="2.2" {...common} /><path d="M8 1.5 v2.5 M8 12 v2.5 M1.5 8 h2.5 M12 8 h2.5 M3.4 3.4 l1.8 1.8 M10.8 10.8 l1.8 1.8 M12.6 3.4 l-1.8 1.8 M5.2 10.8 l-1.8 1.8" {...common} /></svg>;
    case 'aroma': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><path d="M5 13 v-3 M8 13 V6 M11 13 V8" {...common} /><circle cx="5" cy="8.2" r="1" {...common} /><circle cx="8" cy="4.2" r="1" {...common} /><circle cx="11" cy="6.2" r="1" {...common} /></svg>;
    case 'music': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><path d="M4 2.5 v7 a2.2 2.2 0 1 1 -1.5 -2.1 M4 2.5 l8 -2 v7.5" {...common} /><path d="M12 8 a2.2 2.2 0 1 1 -1.5 -2.1" {...common} /></svg>;
    case 'massage': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><circle cx="4" cy="4" r="1.6" {...common} /><circle cx="12" cy="4" r="1.6" {...common} /><circle cx="4" cy="12" r="1.6" {...common} /><circle cx="12" cy="12" r="1.6" {...common} /><circle cx="8" cy="8" r="1.6" {...common} /></svg>;
    case 'clean': return <svg viewBox="0 0 16 16" {...{ width: 14, height: 14 }}><path d="M13.5 8 a5.5 5.5 0 1 1 -1.6 -3.9" {...common} /><path d="M13.5 1.5 v3 h-3" {...common} /></svg>;
    default: return null;
  }
}

/** 右侧系统面板：图例（带运行指示）+ 状态进度 + 系统规格（对应蓝图右列） */
export function SystemPanel() {
  const lang = useStore((s) => s.lang);
  const fxTarget = useStore((s) => s.fxTarget);
  const servicePhase = useStore((s) => s.servicePhase);
  const cycleRunning = useStore((s) => s.cycleRunning);
  const serviceProgress = useStore((s) => s.serviceProgress);

  const statusText = servicePhase === 'OFF'
    ? t('statusIdle', lang)
    : servicePhase === 'DONE'
      ? t('statusDone', lang)
      : t(phaseKey(servicePhase), lang);

  return (
    <div className="system-panel panel" role="region" aria-label={t('systemPanel', lang)}>
      <div className="panel-head">
        <span className="panel-title">{t('systemPanel', lang)}</span>
        <span className="panel-hint">HW-01A</span>
      </div>

      <div className="legend">
        {MODULES_META.map((meta) => (
          <div className="legend-row" key={meta.id} style={{ ['--mc' as string]: meta.color }}>
            <span className="legend-icon"><LegendIcon id={meta.id} /></span>
            <span className="legend-label">{meta.legendKey}</span>
            <span className={`legend-dot${fxTarget[meta.id] > 0 ? ' on' : ''}`} />
          </div>
        ))}
      </div>

      <div className="status-block">
        <div className="status-row">
          <span className="field-label">{t('status', lang)}</span>
          <span className={`status-value${cycleRunning ? ' running' : ''}`}>{statusText}</span>
        </div>
        {cycleRunning && (
          <>
            <div className="progress-track" role="progressbar" aria-valuenow={Math.round(serviceProgress * 100)} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-fill" style={{ width: `${Math.round(serviceProgress * 100)}%` }} />
            </div>
            <div className="field-label" style={{ marginTop: 3 }}>{t('phaseProgress', lang)} {Math.round(serviceProgress * 100)}%</div>
          </>
        )}
      </div>

      <div className="specs">
        <div className="specs-title">{t('specs', lang)}</div>
        {SPECS.map((s) => (
          <div className="spec-row" key={s.key}>
            <span>{t(s.key as keyof Texts, lang)}</span>
            <span className="spec-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
