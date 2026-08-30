import React from 'react';
import { useStore } from '../app/store';
import { t } from '../app/i18n';
import { ensureAudio } from '../audio/audioBus';
import { hardwareAudio } from '../audio/HardwareAudio';

/** 左上标题块（对应蓝图标题栏）+ 右上语言切换 */
export function Overlay() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);

  return (
    <>
      <div className="overlay-title">
        <h1>{t('title', lang)}</h1>
        <div className="subtitle">{t('subtitle', lang)}</div>
        <div className="plaque-en">{t('plaqueEn', lang)}</div>
      </div>
      <button
        className="lang-btn"
        onClick={() => { ensureAudio(); hardwareAudio.click(); setLang(lang === 'zh' ? 'en' : 'zh'); }}
        aria-label="Toggle language"
      >
        {t('langToggle', lang)}
      </button>
    </>
  );
}
