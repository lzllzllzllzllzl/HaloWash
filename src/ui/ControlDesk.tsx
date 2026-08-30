import React, { useCallback } from 'react';
import { useStore } from '../app/store';
import { t, I18N } from '../app/i18n';
import { ensureAudio } from '../audio/audioBus';
import { hardwareAudio } from '../audio/HardwareAudio';

function clickSfx(): void {
  ensureAudio();
  hardwareAudio.click();
}

/** 左下控制台：运行全套护理 / 爆炸滑块 / 视角 / 水压 / 音效 */
export function ControlDesk() {
  const lang = useStore((s) => s.lang);
  const cycleRunning = useStore((s) => s.cycleRunning);
  const explodeCurrent = useStore((s) => s.explodeCurrent);
  const cameraMode = useStore((s) => s.cameraMode);
  const waterPressure = useStore((s) => s.waterPressure);
  const soundOn = useStore((s) => s.soundOn);
  const selectedModule = useStore((s) => s.selectedModule);

  const startCycle = useStore((s) => s.startCycle);
  const stopCycle = useStore((s) => s.stopCycle);
  const setExplodeTarget = useStore((s) => s.setExplodeTarget);
  const setExplodeCurrent = useStore((s) => s.setExplodeCurrent);
  const setCameraMode = useStore((s) => s.setCameraMode);
  const setWaterPressure = useStore((s) => s.setWaterPressure);
  const setSoundOn = useStore((s) => s.setSoundOn);
  const demoModule = useStore((s) => s.demoModule);
  const addPlaque = useStore((s) => s.addPlaque);

  const handleRun = useCallback(() => {
    clickSfx();
    if (selectedModule) demoModule(null);
    startCycle();
    addPlaque(t('phaseScan', lang), 'info');
  }, [lang, selectedModule, demoModule, startCycle, addPlaque]);

  const handleStop = useCallback(() => {
    clickSfx();
    stopCycle();
    addPlaque(t('cycleStopped', lang), 'info');
  }, [lang, stopCycle, addPlaque]);

  const handleExplode = useCallback((v: number) => {
    clickSfx();
    setExplodeTarget(v);
  }, [setExplodeTarget]);

  const handleCamera = useCallback((m: typeof cameraMode) => {
    clickSfx();
    setCameraMode(m);
  }, [setCameraMode]);

  const camBtn = (mode: typeof cameraMode, label: string) => (
    <button
      onClick={() => handleCamera(mode)}
      aria-pressed={cameraMode === mode}
      style={{ flex: 1, fontSize: 11 }}
    >
      {label}
    </button>
  );

  return (
    <div className="control-desk panel" role="region" aria-label={t('control', lang)}>
      <details open>
        <summary>{t('control', lang)}</summary>
        <div className="section">
          <div className="row">
            {!cycleRunning ? (
              <button className="primary" onClick={handleRun} style={{ flex: 1 }}>
                ▶ {t('runCycle', lang)}
              </button>
            ) : (
              <button className="danger" onClick={handleStop} style={{ flex: 1 }}>
                ■ {t('stopCycle', lang)}
              </button>
            )}
          </div>
          <div className="row">
            <label>{t('explode', lang)}</label>
            <input
              type="range" min={0} max={100} value={Math.round(explodeCurrent * 100)}
              onChange={(e) => setExplodeTarget(Number(e.target.value) / 100)}
              aria-label={t('explode', lang)}
              style={{ flex: 1 }}
            />
            <span className="value">{Math.round(explodeCurrent * 100)}%</span>
          </div>
          <div className="row">
            <button onClick={() => handleExplode(0)} style={{ flex: 1 }}>
              {t('assemble', lang)}
            </button>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('cameraView', lang)}</summary>
        <div className="section">
          <div className="row">
            {camBtn('global', t('camGlobal', lang))}
            {camBtn('front', t('camFront', lang))}
          </div>
          <div className="row">
            {camBtn('top', t('camTop', lang))}
            {camBtn('stack', t('camStack', lang))}
          </div>
          <div className="row">
            {camBtn('free', t('camFree', lang))}
            <button
              onClick={() => { clickSfx(); setSoundOn(!soundOn); }}
              aria-pressed={soundOn}
              style={{ flex: 1, fontSize: 11 }}
            >
              {t('sound', lang)} {soundOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('waterPressure', lang)}</summary>
        <div className="section">
          <div className="row">
            <input
              type="range" min={0.2} max={0.4} step={0.01} value={waterPressure}
              onChange={(e) => setWaterPressure(Number(e.target.value))}
              aria-label={t('waterPressure', lang)}
              style={{ flex: 1 }}
            />
            <span className="value">{waterPressure.toFixed(2)} MPa</span>
          </div>
        </div>
      </details>

      {selectedModule && I18N[lang].modules[selectedModule] && (
        <div className="demo-hint">{t('demoOn', lang)}</div>
      )}
    </div>
  );
}
