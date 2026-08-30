/**
 * 统一粒子池：清洗水雾 / 热风 / 精华滴 / 香氛雾 / 自清洁旋流。
 * 与火箭 demo 的 particlePool.ts 同构，但发射器按模块垂直堆栈分布。
 */

import { MODULE_BY_ID, moduleYAt, type ModuleId } from '../product/partMetadata';
import type { Ps } from '../product/productState';

export const MAX_PARTICLES = 900;

type Kind = 'spray' | 'dry' | 'care' | 'aroma' | 'clean';

interface Particle {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  life: number; maxLife: number;
  kind: Kind;
}

const KIND_COLOR: Record<Kind, [number, number, number]> = {
  spray: [0.48, 0.7, 0.91],
  dry: [0.94, 0.64, 0.42],
  care: [0.94, 0.42, 0.42],
  aroma: [0.72, 0.61, 0.94],
  clean: [0.5, 0.91, 0.82],
};

/** 模块当前世界高度（与模型 useFrame 共用同一插值，避免特效与轮盘脱节） */
function moduleY(id: ModuleId, explode: number): number {
  return moduleYAt(MODULE_BY_ID[id], explode);
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export class ParticlePool {
  particles: Particle[] = [];
  positions = new Float32Array(MAX_PARTICLES * 3);
  colors = new Float32Array(MAX_PARTICLES * 3);

  private accum: Record<Kind, number> = { spray: 0, dry: 0, care: 0, aroma: 0, clean: 0 };

  constructor() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({ x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, kind: 'spray' });
      this.positions[i * 3 + 1] = -99;
    }
  }

  update(ps: Ps, explode: number, waterPressure: number, dt: number): void {
    // 发射：按特效强度控制每秒粒子数
    this.emit('spray', ps.fx.spray * (40 + waterPressure * 260), dt, explode);
    this.emit('dry', ps.fx.dry * 130, dt, explode);
    this.emit('care', ps.fx.care * 34, dt, explode);
    this.emit('aroma', ps.fx.aroma * 46, dt, explode);
    this.emit('clean', ps.fx.clean * 60, dt, explode);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      if (p.life <= 0) { this.positions[i * 3 + 1] = -99; continue; }
      p.life -= dt;
      this.integrate(p, dt);
      this.positions[i * 3] = p.x;
      this.positions[i * 3 + 1] = p.y;
      this.positions[i * 3 + 2] = p.z;
      const fade = Math.min(1, p.life / (p.maxLife * 0.4));
      const c = KIND_COLOR[p.kind];
      this.colors[i * 3] = c[0] * fade;
      this.colors[i * 3 + 1] = c[1] * fade;
      this.colors[i * 3 + 2] = c[2] * fade;
    }
  }

  private emit(kind: Kind, rate: number, dt: number, explode: number): void {
    if (rate <= 0.01) return;
    this.accum[kind] += rate * dt;
    while (this.accum[kind] >= 1) {
      this.accum[kind] -= 1;
      this.spawn(kind, explode);
    }
  }

  private findDead(): Particle | null {
    // 从随机起点线性探测，避免每次全表扫描
    const start = Math.floor(Math.random() * MAX_PARTICLES);
    for (let k = 0; k < MAX_PARTICLES; k++) {
      const p = this.particles[(start + k) % MAX_PARTICLES];
      if (p.life <= 0) return p;
    }
    return null;
  }

  private spawn(kind: Kind, explode: number): void {
    const p = this.findDead();
    if (!p) return;
    const y = moduleY(kind, explode);
    p.kind = kind;
    p.life = 0;
    const a = Math.random() * Math.PI * 2;
    switch (kind) {
      case 'spray': {
        const r = rand(0.35, 0.6);
        p.x = Math.cos(a) * r; p.y = y - 0.12; p.z = Math.sin(a) * r;
        p.vx = Math.cos(a) * rand(0.05, 0.2);
        p.vy = rand(-1.4, -0.9);
        p.vz = Math.sin(a) * rand(0.05, 0.2);
        p.maxLife = rand(0.7, 1.1);
        break;
      }
      case 'dry': {
        const r = rand(0.4, 0.62);
        p.x = Math.cos(a) * r; p.y = y - 0.05; p.z = Math.sin(a) * r;
        p.vx = Math.cos(a) * rand(0.5, 1.1);
        p.vy = rand(-0.8, -0.3);
        p.vz = Math.sin(a) * rand(0.5, 1.1);
        p.maxLife = rand(0.5, 0.9);
        break;
      }
      case 'care': {
        const r = rand(0, 0.15);
        p.x = Math.cos(a) * r; p.y = y - 0.05; p.z = Math.sin(a) * r;
        p.vx = rand(-0.06, 0.06);
        p.vy = rand(-0.5, -0.25);
        p.vz = rand(-0.06, 0.06);
        p.maxLife = rand(1.1, 1.6);
        break;
      }
      case 'aroma': {
        const r = rand(0.1, 0.4);
        p.x = Math.cos(a) * r; p.y = y + 0.2; p.z = Math.sin(a) * r;
        p.vx = rand(-0.08, 0.08);
        p.vy = rand(0.25, 0.55);
        p.vz = rand(-0.08, 0.08);
        p.maxLife = rand(1.4, 2.1);
        break;
      }
      case 'clean': {
        const r = rand(0.3, 0.48);
        p.x = Math.cos(a) * r; p.y = y + rand(0.05, 0.3); p.z = Math.sin(a) * r;
        p.vx = -Math.sin(a) * rand(0.6, 1.1);
        p.vy = rand(-0.12, 0.1);
        p.vz = Math.cos(a) * rand(0.6, 1.1);
        p.maxLife = rand(0.9, 1.5);
        break;
      }
    }
  }

  private integrate(p: Particle, dt: number): void {
    if (p.kind === 'clean') {
      // 旋流：速度绕 y 轴轻微旋转
      const a = dt * 2.2;
      const cos = Math.cos(a), sin = Math.sin(a);
      const vx = p.vx * cos - p.vz * sin;
      p.vz = p.vx * sin + p.vz * cos;
      p.vx = vx;
    }
    if (p.kind === 'spray' || p.kind === 'care') p.vy -= 0.6 * dt;
    if (p.kind === 'aroma') p.vy *= 1 - 0.4 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    p.life = Math.min(p.life, p.maxLife);
  }
}
