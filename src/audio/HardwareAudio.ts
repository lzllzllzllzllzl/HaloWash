/**
 * 程序化音效（WebAudio，无外部资源）：
 * UI 点击音 / 阶段提示音 / 清洗水流噪声 / 烘干风机哼鸣。
 * 增益逐帧跟随 ps.fx，与火箭 demo 的 EngineAudio.update 同构。
 */

import { ps } from '../product/productState';

class HardwareAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private waterGain: GainNode | null = null;
  private airGain: GainNode | null = null;
  private inited = false;

  init(): void {
    if (this.inited) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);

      // 水流：白噪声 + 带通
      const len = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 900;
      bp.Q.value = 0.8;
      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.value = 0;
      noise.connect(bp).connect(this.waterGain).connect(this.master);
      noise.start();

      // 风机：锯齿波 + 低通
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 88;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 240;
      this.airGain = this.ctx.createGain();
      this.airGain.gain.value = 0;
      osc.connect(lp).connect(this.airGain).connect(this.master);
      osc.start();

      this.inited = true;
    } catch {
      this.inited = false;
    }
  }

  click(): void {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1250, t);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  chime(): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    [660, 880].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      const t0 = t + i * 0.09;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.connect(g).connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.32);
    });
  }

  /** 每帧：环路增益跟随特效强度 */
  update(soundOn: boolean): void {
    if (!this.ctx || !this.waterGain || !this.airGain) return;
    const vol = soundOn ? 1 : 0;
    const k = 0.08;
    this.waterGain.gain.value += (ps.fx.spray * 0.16 * vol - this.waterGain.gain.value) * k;
    this.airGain.gain.value += (ps.fx.dry * 0.1 * vol - this.airGain.gain.value) * k;
  }
}

export const hardwareAudio = new HardwareAudio();
