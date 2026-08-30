import React from 'react';
import { useStore } from '../app/store';
import { t, I18N } from '../app/i18n';
import { MODULE_BY_ID } from '../product/partMetadata';
import { ensureAudio } from '../audio/audioBus';
import { hardwareAudio } from '../audio/HardwareAudio';

/** 右下模块详情卡：构成 + 工作方式 */
export function PartInfo() {
  const lang = useStore((s) => s.lang);
  const selected = useStore((s) => s.selectedModule);
  const cycleRunning = useStore((s) => s.cycleRunning);
  const demoModule = useStore((s) => s.demoModule);

  if (!selected) return null;
  const meta = MODULE_BY_ID[selected];
  const mod = I18N[lang].modules[selected];

  return (
    <div className="part-info panel" role="dialog" aria-label={`${t('partInfo', lang)} — ${mod.name}`}>
      <button
        className="close-btn"
        onClick={() => { ensureAudio(); hardwareAudio.click(); demoModule(null); }}
        aria-label={t('close', lang)}
      >
        ×
      </button>
      <div className="part-num" style={{ ['--mc' as string]: meta.color }}>
        <span>{meta.num}</span>
      </div>
      <h3>{mod.name}</h3>
      <div className="system-tag">{mod.en}</div>

      <div className="field">
        <div className="field-label">{t('composition', lang)}</div>
        <ul className="parts-list">
          {mod.parts.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </div>

      <div className="field">
        <div className="field-label">{t('howItWorks', lang)}</div>
        <p className="how-text">{mod.how}</p>
      </div>

      {!cycleRunning && (
        <button
          onClick={() => { ensureAudio(); hardwareAudio.click(); demoModule(null); }}
          style={{ width: '100%', marginTop: 8 }}
        >
          {t('demoOff', lang)}
        </button>
      )}
    </div>
  );
}
