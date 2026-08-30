/**
 * 布局自检：装配态轮盘是否完全收进球壳 / 爆炸态是否与外壳、支架、地面冲突。
 * 仅开发期校验用，不参与打包。运行：npm run check:layout
 */
import { MODULES_META, SHELL_PARTS, moduleYAt, stackBounds } from '../src/product/partMetadata';
import { SHELL } from '../src/app/productConfig';
import { CAMERA_POSITIONS, CAMERA_TARGETS } from '../src/app/productConfig';

const shellTop = SHELL.centerY + SHELL.radius;
const shellBottom = SHELL.centerY + SHELL.radius * Math.cos(SHELL.thetaLength);
const DISC_HALF = 0.05;

let fail = 0;
const say = (ok: boolean, msg: string) => {
  if (!ok) fail++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${msg}`);
};

console.log(`球壳竖直覆盖 y ${shellBottom.toFixed(3)} ~ ${shellTop.toFixed(3)}（半径 ${SHELL.radius}）\n`);

/* ---------- 装配态：每个轮盘的外缘必须落在球壳内 ---------- */
console.log('— 装配态 e=0 —');
for (const m of MODULES_META) {
  const y = moduleYAt(m, 0);
  const rel = Math.abs(y - SHELL.centerY) + DISC_HALF;
  const limit = Math.sqrt(SHELL.radius ** 2 - m.radius ** 2);
  say(rel <= limit, `${m.id.padEnd(10)} y=${y.toFixed(2)} r=${m.radius}  需 ${rel.toFixed(3)} ≤ 球内允许 ${limit.toFixed(3)}`);
}
// 顶部 diagnosis 穹顶（0.7 半径球冠 × scaleY 0.85）
const diag = MODULES_META[0];
const domeTop = moduleYAt(diag, 0) + 0.7 * 0.85;
say(domeTop < shellTop, `diagnosis 穹顶顶点 ${domeTop.toFixed(3)} < 壳顶 ${shellTop.toFixed(3)}`);

/* ---------- 爆炸态：与外壳半壳、立臂、地面 ---------- */
console.log('\n— 爆炸态 e=1 —');
const arm: Array<[number, number]> = [[0.1, -0.35], [0.4, -1.02], [1.7, -1.18], [2.62, -0.95], [2.88, -0.62]];
const armZ = (y: number): number => {
  if (y <= arm[0][0] || y >= arm[arm.length - 1][0]) return 0;
  for (let i = 0; i < arm.length - 1; i++) {
    const [y0, z0] = arm[i];
    const [y1, z1] = arm[i + 1];
    if (y >= y0 && y <= y1) return z0 + ((y - y0) / (y1 - y0)) * (z1 - z0);
  }
  return 0;
};

for (const m of MODULES_META) {
  const y = moduleYAt(m, 1);
  say(y - DISC_HALF > 0.15, `${m.id.padEnd(10)} 底面 ${(y - DISC_HALF).toFixed(2)} 高于底座顶面 0.15`);
  // 半壳位置（含半径 1.15 的外廓）
  for (const p of SHELL_PARTS) {
    const sx = p.dir[0] * p.dist;
    const sy = SHELL.centerY + p.dir[1] * p.dist;
    const sz = p.dir[2] * p.dist;
    const d = Math.hypot(sx, sz) - SHELL.radius;
    say(d > m.radius, `${m.id.padEnd(10)} 与 ${p.id.padEnd(10)} 水平净距 ${(d - m.radius).toFixed(2)}（半壳 y=${sy.toFixed(2)}）`);
  }
  const z = armZ(y);
  if (z !== 0) {
    say(Math.abs(z) > m.radius + 0.06, `${m.id.padEnd(10)} 与立臂 |z|=${Math.abs(z).toFixed(2)} > r+0.06=${(m.radius + 0.06).toFixed(2)}`);
  }
}

/* ---------- 层间距 ---------- */
console.log('\n— 层间距 —');
for (let i = 0; i < MODULES_META.length - 1; i++) {
  const a = MODULES_META[i];
  const b = MODULES_META[i + 1];
  const gapA = (moduleYAt(a, 1) - moduleYAt(b, 1)) - 0.1;
  const gap0 = (moduleYAt(a, 0) - moduleYAt(b, 0)) - 0.1;
  say(gapA > 0.5, `${a.id}↔${b.id} 爆炸净距 ${gapA.toFixed(2)}（装配 ${gap0.toFixed(2)}）`);
}

/* ---------- 相机取景距离 ---------- */
console.log('\n— 相机取景距离（fov 45 / 16:9）—');
const fit = (r: number, aspect: number, fov: number, pad: number) => {
  const halfV = Math.tan((fov * Math.PI) / 360);
  return Math.max(r / halfV, r / (halfV * aspect)) * pad;
};
for (const e of [0, 1]) {
  const { bottom, top, center } = stackBounds(e);
  const r = (top - bottom) / 2 + 0.86 + 0.25;
  console.log(`  e=${e} 柱体 ${bottom.toFixed(2)}~${top.toFixed(2)} 中心 ${center.toFixed(2)} → 整机取景距离 ${fit(r, 1.78, 45, 1.08).toFixed(2)}`);
}
for (const m of MODULES_META) {
  const r = m.radius * 1.35 + 0.18;
  const d = fit(r, 1.78, 45, 1.15);
  const y = moduleYAt(m, 1);
  console.log(`  ${m.id.padEnd(10)} 特写距离 ${d.toFixed(2)}  相机 y≈${(y + Math.sin(0.2) * d).toFixed(2)}（模块 y=${y.toFixed(2)}）`);
}

/* ---------- 预设方向 ---------- */
console.log('\n— 预设视角方向 —');
for (const k of Object.keys(CAMERA_POSITIONS)) {
  const p = CAMERA_POSITIONS[k];
  const t = CAMERA_TARGETS[k];
  const v = [p[0] - t[0], p[1] - t[1], p[2] - t[2]];
  const len = Math.hypot(...v);
  console.log(`  ${k.padEnd(7)} 方位 ${(Math.atan2(v[0], v[2]) * 57.3).toFixed(0)}°  俯仰 ${(Math.asin(v[1] / len) * 57.3).toFixed(0)}°`);
}

console.log(fail === 0 ? '\n全部通过 ✅' : `\n${fail} 项不通过 ❌`);
process.exit(fail === 0 ? 0 : 1);
