/**
 * 程序化几何构建：8 大模块 + 头盔外壳 + 底座支架 + 水箱 + 中央光柱。
 * 与火箭 demo 的 engineParts.ts 同一风格：纯 three 对象 + 命名构建函数。
 */

import * as THREE from 'three';
import { SHELL, TANK } from '../app/productConfig';
import { MODULE_BY_ID, type ModuleId } from './partMetadata';

export interface Mats {
  shell: THREE.MeshPhysicalMaterial;
  struct: THREE.MeshStandardMaterial;
  dark: THREE.MeshStandardMaterial;
  metal: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  water: THREE.MeshStandardMaterial;
  waste: THREE.MeshStandardMaterial;
}

export function createMaterials(): Mats {
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#BFD9F2', transparent: true, opacity: 0.28, roughness: 0.12, metalness: 0,
  });
  glass.userData.keepAlpha = true;
  return {
    shell: new THREE.MeshPhysicalMaterial({ color: '#F4F6F8', roughness: 0.3, clearcoat: 0.65, clearcoatRoughness: 0.3 }),
    struct: new THREE.MeshStandardMaterial({ color: '#E3E6EA', roughness: 0.45, metalness: 0.12 }),
    dark: new THREE.MeshStandardMaterial({ color: '#39424E', roughness: 0.55, metalness: 0.2 }),
    metal: new THREE.MeshStandardMaterial({ color: '#C7CDD4', roughness: 0.28, metalness: 0.75 }),
    glass,
    water: new THREE.MeshStandardMaterial({ color: '#7AB3E8', transparent: true, opacity: 0.55, roughness: 0.15 }),
    waste: new THREE.MeshStandardMaterial({ color: '#5A6B7D', transparent: true, opacity: 0.5, roughness: 0.3 }),
  };
}

/** 模块主题色发光材质（每个模块独立） */
export function accentMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.35 });
}

/** 添加外框轮廓线（蓝图风格） */
function addOutlineRing(parent: THREE.Group, radius: number, color: string): void {
  // 外发光轮廓
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.02, 0.008, 8, 64),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7 })
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 0.01;
  parent.add(outerRing);
  
  // 内虚线标记
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.85, 0.004, 8, 32, Math.PI * 1.5),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.005;
  parent.add(innerRing);
}

function discMesh(radius: number, mats: Mats): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.04, 0.09, 40), mats.shell);
  return m;
}

function ringPlace(count: number, radius: number, place: (x: number, z: number, angle: number) => void): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    place(Math.cos(a) * radius, Math.sin(a) * radius, a);
  }
}

/* ---------------------------------- ① 头皮检测 ---------------------------------- */

export interface ModuleParts {
  group: THREE.Group;
  /** 需要逐帧驱动的子对象（喷嘴环/风扇/活塞等） */
  spin?: THREE.Object3D;
  fan?: THREE.Object3D;
  coil?: THREE.MeshStandardMaterial;
  leds?: THREE.MeshStandardMaterial;
  carousel?: THREE.Object3D;
  uv?: THREE.MeshStandardMaterial;
  pistons?: THREE.Object3D[];
  grille?: THREE.MeshStandardMaterial;
}

export function buildDiagnosis(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), mats.shell);
  dome.scale.y = 0.85;
  g.add(dome);
  // 装饰环带：移到壳体内部，避免与半圆球开口边缘重叠形成亮线
  const band1 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.018, 8, 48), accentMaterial('#7AB3E8'));
  band1.rotation.x = Math.PI / 2;
  band1.position.y = -0.05;
  g.add(band1);
  const band2 = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.012, 8, 48), mats.metal);
  band2.rotation.x = Math.PI / 2;
  band2.position.y = -0.18;
  g.add(band2);
  addOutlineRing(g, 0.7, '#7AB3E8');

  const ring = new THREE.Group();
  const lensGeo = new THREE.CylinderGeometry(0.06, 0.075, 0.09, 16);
  const lensMat = accentMaterial('#8FD0FF');
  ringPlace(6, 0.42, (x, z, a) => {
    const lens = new THREE.Mesh(lensGeo, mats.dark);
    lens.position.set(x, 0.1, z);
    lens.lookAt(0, 0.28, 0);
    ring.add(lens);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), lensMat);
    eye.position.set(x * 1.05, 0.12, z * 1.05);
    ring.add(eye);
    // 镜头连接线
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 6), mats.metal);
    wire.position.set(x * 0.85, 0.1, z * 0.85);
    wire.rotation.z = a;
    ring.add(wire);
  });
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.12, 20), mats.metal);
  ring.add(hub);
  const ir = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), lensMat);
  ir.position.y = 0.08;
  ring.add(ir);
  g.add(ring);
  return { group: g, spin: ring, leds: lensMat };
}

/* ---------------------------------- ② 自动清洗 ---------------------------------- */

export function buildSpray(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  g.add(discMesh(MODULE_BY_ID.spray.radius, mats));
  addOutlineRing(g, MODULE_BY_ID.spray.radius, '#4A90D9');
  const ring = new THREE.Group();
  const nozzleGeo = new THREE.ConeGeometry(0.05, 0.14, 12);
  ringPlace(8, 0.55, (x, z) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 10), mats.metal);
    pipe.position.set(x, 0.1, z);
    ring.add(pipe);
    const noz = new THREE.Mesh(nozzleGeo, mats.metal);
    noz.position.set(x, -0.08, z);
    noz.rotation.x = Math.PI;
    ring.add(noz);
    // 进水管
    const hose = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 6, 8, Math.PI * 0.5), accentMaterial('#4A90D9'));
    hose.position.set(x * 0.5, 0.05, z * 0.5);
    hose.lookAt(0, 0, 0);
    ring.add(hose);
  });
  const gallery = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.045, 10, 36), mats.water);
  gallery.rotation.x = Math.PI / 2;
  gallery.position.y = 0.14;
  ring.add(gallery);
  // 中心水压表
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), accentMaterial('#4A90D9'));
  gauge.position.y = 0.18;
  ring.add(gauge);
  g.add(ring);
  return { group: g, spin: ring };
}

/* ---------------------------------- ③ 烘干 ---------------------------------- */

export function buildDry(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  g.add(discMesh(MODULE_BY_ID.dry.radius, mats));
  addOutlineRing(g, MODULE_BY_ID.dry.radius, '#FFA26B');
  // 环形出风口：一圈散热鳍片
  const finGeo = new THREE.BoxGeometry(0.16, 0.06, 0.03);
  ringPlace(22, 0.68, (x, z, a) => {
    const fin = new THREE.Mesh(finGeo, mats.struct);
    fin.position.set(x, -0.05, z);
    fin.rotation.y = -a;
    g.add(fin);
  });
  // 加热丝（激活时橙色发光）
  const coilMat = new THREE.MeshStandardMaterial({ color: '#FFA26B', emissive: '#FF7A2E', emissiveIntensity: 0.1, roughness: 0.5 });
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.035, 10, 40), coilMat);
  coil.rotation.x = Math.PI / 2;
  coil.position.y = -0.06;
  g.add(coil);
  // 中心涡轮风机
  const fan = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.015, 0.09), mats.metal);
    blade.rotation.y = (i / 6) * Math.PI * 2;
    blade.rotation.z = 0.5;
    fan.add(blade);
  }
  fan.position.y = 0.1;
  g.add(fan);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), mats.dark);
  fan.add(hub);
  // 顶部出风指示锥
  const ventCone = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.12, 12), accentMaterial('#FFA26B'));
  ventCone.position.y = 0.22;
  g.add(ventCone);
  return { group: g, fan, coil: coilMat };
}

/* ---------------------------------- ④ 护发 ---------------------------------- */

export function buildCare(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  g.add(discMesh(MODULE_BY_ID.care.radius, mats));
  addOutlineRing(g, MODULE_BY_ID.care.radius, '#FF6B6B');
  const ledMat = new THREE.MeshStandardMaterial({ color: '#FF6B6B', emissive: '#FF2E2E', emissiveIntensity: 0.25, roughness: 0.4 });
  const ledGeo = new THREE.SphereGeometry(0.035, 10, 10);
  ringPlace(12, 0.62, (x, z) => {
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(x, -0.07, z);
    g.add(led);
    // LED 导管
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 6), mats.metal);
    tube.position.set(x, 0.04, z);
    g.add(tube);
  });
  // 中央精华仓（粉色液体 + 金属泵）
  const bay = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 20), mats.glass);
  bay.position.y = 0.16;
  g.add(bay);
  const essence = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.12, 20), accentMaterial('#FF8FA3'));
  essence.position.y = 0.12;
  g.add(essence);
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.1, 12), mats.metal);
  pump.position.y = 0.3;
  g.add(pump);
  // 精华液滴指示
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), accentMaterial('#FF8FA3'));
  drop.position.y = 0.38;
  g.add(drop);
  return { group: g, leds: ledMat };
}

/* ---------------------------------- ⑤ 香氛 ---------------------------------- */

const AROMA_COLORS = ['#E8C34A', '#7ACB6C', '#5AB4E8', '#B69CFF', '#F08AB4'];

export function buildAroma(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  g.add(discMesh(MODULE_BY_ID.aroma.radius, mats));
  addOutlineRing(g, MODULE_BY_ID.aroma.radius, '#B69CFF');
  const carousel = new THREE.Group();
  const tubeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.22, 14);
  AROMA_COLORS.forEach((color, i) => {
    const a = (i / AROMA_COLORS.length) * Math.PI * 2;
    const x = Math.cos(a) * 0.34, z = Math.sin(a) * 0.34;
    const tube = new THREE.Mesh(tubeGeo, mats.glass);
    tube.position.set(x, 0.16, z);
    carousel.add(tube);
    const oil = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.14, 12), accentMaterial(color));
    oil.position.set(x, 0.13, z);
    carousel.add(oil);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 10), mats.metal);
    cap.position.set(x, 0.3, z);
    carousel.add(cap);
  });
  g.add(carousel);
  const atomizer = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 18), mats.metal);
  atomizer.position.y = 0.09;
  g.add(atomizer);
  // 雾化指示灯
  const atomizerLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), accentMaterial('#B69CFF'));
  atomizerLed.position.y = 0.14;
  g.add(atomizerLed);
  return { group: g, carousel };
}

/* ---------------------------------- ⑥ 音乐 ---------------------------------- */

export function buildMusic(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  g.add(discMesh(MODULE_BY_ID.music.radius, mats));
  addOutlineRing(g, MODULE_BY_ID.music.radius, '#6C87A5');
  // 扬声器格栅：暗色圆盘 + 同心凹槽
  const grilleGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.03, 32);
  const grilleMat = new THREE.MeshStandardMaterial({ color: '#4A5560', roughness: 0.6, metalness: 0.3, emissive: '#4A90D9', emissiveIntensity: 0.05 });
  const grille = new THREE.Mesh(grilleGeo, grilleMat);
  grille.position.y = 0.06;
  g.add(grille);
  for (const r of [0.12, 0.22, 0.32]) {
    const groove = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 32), mats.dark);
    groove.rotation.x = Math.PI / 2;
    groove.position.y = 0.078;
    g.add(groove);
  }
  // 蓝牙指示灯
  const btMat = new THREE.MeshStandardMaterial({ color: '#6FB9FF', emissive: '#3F9BFF', emissiveIntensity: 0.6, roughness: 0.4 });
  for (const sx of [-0.52, 0.52]) {
    const bt = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), btMat);
    bt.position.set(sx, 0.05, 0);
    g.add(bt);
    // BT 天线
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.08, 4), mats.metal);
    antenna.position.set(sx, 0.11, 0);
    g.add(antenna);
  }
  // 音浪装饰
  for (let i = 0; i < 3; i++) {
    const wave = new THREE.Mesh(
      new THREE.TorusGeometry(0.48 + i * 0.04, 0.006, 6, 32, Math.PI),
      new THREE.MeshBasicMaterial({ color: '#4A90D9', transparent: true, opacity: 0.3 - i * 0.08 })
    );
    wave.rotation.z = Math.PI / 2;
    wave.position.y = 0.02 + i * 0.015;
    g.add(wave);
  }
  return { group: g, grille: grilleMat };
}

/* ---------------------------------- ⑦ 按摩 ---------------------------------- */

export function buildMassage(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  g.add(discMesh(MODULE_BY_ID.massage.radius, mats));
  addOutlineRing(g, MODULE_BY_ID.massage.radius, '#FF8FA3');
  const pistons: THREE.Object3D[] = [];
  const shaftGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.16, 10);
  const tipGeo = new THREE.SphereGeometry(0.05, 12, 12);
  const tipMat = accentMaterial('#FF8FA3');
  const addPiston = (x: number, z: number) => {
    const p = new THREE.Group();
    const shaft = new THREE.Mesh(shaftGeo, mats.metal);
    shaft.position.y = 0.02;
    p.add(shaft);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = -0.09;
    p.add(tip);
    // 按摩头发光环
    const tipRing = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 16), tipMat);
    tipRing.rotation.x = Math.PI / 2;
    tipRing.position.y = -0.09;
    p.add(tipRing);
    p.position.set(x, -0.02, z);
    p.userData.baseY = -0.02;
    g.add(p);
    pistons.push(p);
  };
  ringPlace(8, 0.55, addPiston);
  ringPlace(4, 0.26, addPiston);
  // 底部连接板
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.03, 24), mats.struct);
  base.position.y = -0.05;
  g.add(base);
  return { group: g, pistons };
}

/* ---------------------------------- ⑧ 自清洁 ---------------------------------- */

export function buildClean(mats: Mats): ModuleParts {
  const g = new THREE.Group();
  const r = MODULE_BY_ID.clean.radius;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, 0.12, 40), mats.shell);
  g.add(base);
  addOutlineRing(g, r, '#34C77B');
  // 透明滚筒
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r * 0.82, 0.34, 32), mats.glass);
  drum.position.y = 0.22;
  g.add(drum);
  // 双层滤芯
  const filterMat = new THREE.MeshStandardMaterial({ color: '#9FB4C8', roughness: 0.5, metalness: 0.3 });
  for (const [fy, fr] of [[0.14, 0.5], [0.26, 0.38]] as Array<[number, number]>) {
    const filter = new THREE.Mesh(new THREE.TorusGeometry(fr, 0.05, 10, 32), filterMat);
    filter.rotation.x = Math.PI / 2;
    filter.position.y = fy;
    g.add(filter);
  }
  // UV-C 消毒灯
  const uvMat = new THREE.MeshStandardMaterial({ color: '#7FE8D0', emissive: '#34E0C0', emissiveIntensity: 0.2, roughness: 0.4 });
  const uv = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 10), uvMat);
  uv.position.y = 0.24;
  g.add(uv);
  // UV 灯罩
  const uvCap = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), accentMaterial('#34C77B'));
  uvCap.position.y = 0.4;
  g.add(uvCap);
  // 循环泵
  const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.1, 16), mats.metal);
  pump.position.y = 0.42;
  g.add(pump);
  const pipe = new THREE.Mesh(new THREE.TorusGeometry(r * 0.82, 0.02, 8, 32, Math.PI), mats.water);
  pipe.position.y = 0.42;
  g.add(pipe);
  // 排污指示灯
  const drainLed = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), accentMaterial('#34C77B'));
  drainLed.position.y = -0.06;
  g.add(drainLed);
  return { group: g, uv: uvMat };
}

/* ---------------------------------- 外壳 ---------------------------------- */

/**
 * 头盔球面段。phi 以 +z 为正面中心（three.js 球坐标中 phi=π/2 朝 +z）。
 * frontGap: 面罩开口区（玻璃窗覆盖）；frontPanels: 开口两侧的前壳窄条。
 */
const PANEL_W = 0.5;

export function buildShellBack(mats: Mats): THREE.Mesh {
  const phiStart = Math.PI / 2 + SHELL.gapHalf + PANEL_W;
  const phiLength = Math.PI * 2 - 2 * (SHELL.gapHalf + PANEL_W);
  const geo = new THREE.SphereGeometry(SHELL.radius, 48, 32, phiStart, phiLength, 0, SHELL.thetaLength);
  const m = new THREE.Mesh(geo, mats.shell);
  m.scale.set(1, SHELL.scaleY, 1.04);
  return m;
}

function frontPanel(startPhi: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(SHELL.radius, 24, 32, startPhi, PANEL_W, 0, SHELL.thetaLength);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#F4F6F8', roughness: 0.3, metalness: 0.05, side: THREE.DoubleSide }));
  m.scale.set(1, SHELL.scaleY, 1.04);
  return m;
}

export function buildShellFrontParts(mats: Mats): THREE.Group {
  const g = new THREE.Group();
  g.add(frontPanel(Math.PI / 2 - SHELL.gapHalf - PANEL_W));
  g.add(frontPanel(Math.PI / 2 + SHELL.gapHalf));
  // 面罩透明窗（覆盖开口，位置随外壳球心）
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(SHELL.radius * 0.995, 32, 24, Math.PI / 2 - SHELL.gapHalf, SHELL.gapHalf * 2, Math.PI * 0.3, Math.PI * 0.42),
    mats.glass,
  );
  visor.scale.set(1, SHELL.scaleY, 1.04);
  g.add(visor);
  // 触控面板（头盔前上方，同产品图）
  const panel = new THREE.Group();
  panel.position.set(0, 0.68, 0.72);
  panel.rotation.x = -0.62;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.05), mats.shell);
  panel.add(body);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.2),
    new THREE.MeshStandardMaterial({ color: '#DCEBFA', emissive: '#4A90D9', emissiveIntensity: 0.9 }),
  );
  screen.position.z = 0.028;
  panel.add(screen);
  const line = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.02), new THREE.MeshStandardMaterial({ color: '#4A90D9', emissive: '#4A90D9', emissiveIntensity: 0.6 }));
  line.position.set(0, 0.06, 0.03);
  panel.add(line);
  const dotA = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshStandardMaterial({ color: '#7AB3E8', emissive: '#7AB3E8', emissiveIntensity: 0.5 }));
  dotA.position.set(-0.06, -0.03, 0.03);
  panel.add(dotA);
  const dotB = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.05), new THREE.MeshStandardMaterial({ color: '#FF6B35', emissive: '#FF6B35', emissiveIntensity: 0.4 }));
  dotB.position.set(0.05, -0.03, 0.03);
  panel.add(dotB);
  g.add(panel);
  // 语音指示灯环（面罩下缘弧形）
  const voice = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.018, 8, 40, Math.PI * 0.9),
    new THREE.MeshStandardMaterial({ color: '#8FC3F2', emissive: '#4A90D9', emissiveIntensity: 0.8 }),
  );
  voice.position.set(0, 0.12, 0.86);
  voice.rotation.set(Math.PI / 2 - 0.35, 0, Math.PI * 1.05);
  g.add(voice);
  return g;
}

/* ---------------------------------- 支架与水箱 ---------------------------------- */

export function buildStand(mats: Mats): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.1, 40), mats.struct);
  base.position.y = 0.05;
  g.add(base);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.05, 32), mats.dark);
  foot.position.y = 0.12;
  g.add(foot);
  // 曲线立臂（从底座后方弯到头盔背面）
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.1, -0.35),
    new THREE.Vector3(0, 0.4, -1.02),
    new THREE.Vector3(0, 1.7, -1.18),
    new THREE.Vector3(0, 2.62, -0.95),
    new THREE.Vector3(0, 2.88, -0.62),
  ]);
  const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.055, 12), mats.struct);
  g.add(arm);
  // 臂与头盔的连接颈
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.3, 14), mats.struct);
  neck.position.set(0, 2.88, -0.5);
  neck.rotation.x = 0.7;
  g.add(neck);
  return g;
}

export function buildTanks(mats: Mats): THREE.Group {
  const g = new THREE.Group();
  // 立柱
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 3.3, 14), mats.struct);
  pole.position.set(TANK.x, 1.65, TANK.z);
  g.add(pole);
  const poleBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.08, 24), mats.dark);
  poleBase.position.set(TANK.x, 0.06, TANK.z);
  g.add(poleBase);
  // 连接横臂
  const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, TANK.x - 0.2, 12), mats.struct);
  cross.rotation.z = Math.PI / 2;
  cross.position.set(TANK.x / 2 + 0.1, 2.6, TANK.z + 0.1);
  g.add(cross);
  // 净水罐（上）与废水罐（下）
  const mkTank = (y: number, inner: THREE.Material) => {
    const t = new THREE.Group();
    t.position.set(TANK.x, y, TANK.z);
    const shellT = new THREE.Mesh(new THREE.CapsuleGeometry(TANK.radius, TANK.length, 8, 24), mats.glass);
    t.add(shellT);
    const liquid = new THREE.Mesh(new THREE.CapsuleGeometry(TANK.radius * 0.8, TANK.length * 0.86, 8, 20), inner);
    t.add(liquid);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.06, 14), mats.metal);
    cap.position.y = TANK.radius + TANK.length / 2 + 0.03;
    t.add(cap);
    g.add(t);
  };
  mkTank(TANK.y + TANK.gap / 2 + 0.05, mats.water);
  mkTank(TANK.y - TANK.gap / 2 - 0.05, mats.waste);
  return g;
}

/** 中央能量光柱（爆炸时如蓝图般贯穿堆栈） */
export function buildBeam(): { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial } {
  const mat = new THREE.MeshBasicMaterial({
    color: '#3F9BFF', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1, 12, 1, true), mat);
  return { mesh, mat };
}
