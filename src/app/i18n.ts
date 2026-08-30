import type { ModuleId } from '../product/partMetadata';

export type Lang = 'zh' | 'en';

export interface ModuleText {
  name: string;
  en: string;
  tagline: string;
  /** 组成（对应蓝图左侧注记） */
  parts: string[];
  /** 工作方式 */
  how: string;
}

export interface Texts {
  title: string;
  subtitle: string;
  plaqueEn: string;
  blueprintLabel: string;
  projectLabel: string;
  projectValue: string;
  modelLabel: string;
  versionLabel: string;

  moduleIndex: string;
  moduleIndexHint: string;
  systemPanel: string;
  legend: string;
  specs: string;
  status: string;
  statusIdle: string;
  statusDone: string;
  phaseProgress: string;
  specVoltage: string;
  specFreq: string;
  specPower: string;
  specPressure: string;
  specWeight: string;
  specDims: string;

  control: string;
  runCycle: string;
  stopCycle: string;
  explode: string;
  assemble: string;
  cameraView: string;
  camGlobal: string;
  camFront: string;
  camTop: string;
  camStack: string;
  camFree: string;
  waterPressure: string;
  sound: string;
  langToggle: string;

  partInfo: string;
  composition: string;
  howItWorks: string;
  close: string;
  demoOn: string;
  demoOff: string;
  click3dHint: string;

  phaseScan: string;
  phaseWash: string;
  phaseDry: string;
  phaseCare: string;
  phaseAroma: string;
  phaseRelax: string;
  phaseClean: string;
  phaseDone: string;
  phaseOff: string;
  cycleDone: string;
  cycleStopped: string;
  demoStarted: string;

  modules: Record<ModuleId, ModuleText>;
}

const zh: Texts = {
  title: 'HaloWash 全自动洗护头盔',
  subtitle: '技术蓝图实验台 · 八大模块拆解',
  plaqueEn: 'TECHNICAL BLUEPRINT · SMART HAIR WASHING MACHINE · HW-01A · V1.0.0',
  blueprintLabel: '技术蓝图',
  projectLabel: '项目',
  projectValue: '智能洗护头盔',
  modelLabel: '型号',
  versionLabel: '版本',

  moduleIndex: '模块目录',
  moduleIndexHint: '自上而下 · 点击查看构成与工作方式',
  systemPanel: '系统面板',
  legend: '图例',
  specs: '系统规格',
  status: '运行状态',
  statusIdle: '待机',
  statusDone: '护理完成',
  phaseProgress: '阶段进度',
  specVoltage: '电压 VOLTAGE',
  specFreq: '频率 FREQ.',
  specPower: '功率 POWER',
  specPressure: '水压 W.PRESSURE',
  specWeight: '重量 WEIGHT',
  specDims: '尺寸 DIMENSIONS',

  control: '控制台',
  runCycle: '运行全套护理',
  stopCycle: '停止',
  explode: '模块爆炸',
  assemble: '组装整机',
  cameraView: '视角',
  camGlobal: '总览',
  camFront: '正视',
  camTop: '俯视',
  camStack: '堆栈侧视',
  camFree: '自由',
  waterPressure: '水压',
  sound: '音效',
  langToggle: 'EN',

  partInfo: '模块详情',
  composition: '构成',
  howItWorks: '工作方式',
  close: '关闭',
  demoOn: '单模块演示中',
  demoOff: '停止演示',
  click3dHint: '可直接点击 3D 模块',

  phaseScan: '① 头皮检测',
  phaseWash: '② 自动清洗',
  phaseDry: '③ 温风烘干',
  phaseCare: '④ 红光养护',
  phaseAroma: '⑤ 香氛疗愈',
  phaseRelax: '⑥+⑦ 音乐按摩',
  phaseClean: '⑧ 自清洁',
  phaseDone: '完成',
  phaseOff: '待机',
  cycleDone: '全套护理完成 — 共 8 个模块协同工作',
  cycleStopped: '已停止',
  demoStarted: '单模块演示 — 再次点击关闭',

  modules: {
    diagnosis: {
      name: '头皮检测模块', en: 'SCALP DIAGNOSIS MODULE',
      tagline: 'AI 摄像传感 · 头皮分析',
      parts: ['环形 6 高清微距镜头', '红外湿度传感器', 'AI 头皮分析芯片'],
      how: '镜头环绕头皮拍摄高清图像，红外传感器测量油脂与水分；AI 芯片在 3 秒内生成头皮报告，自动匹配洗护参数（水温、水量、药剂剂量）。',
    },
    spray: {
      name: '自动清洗模块', en: 'AUTO WASH MODULE',
      tagline: '旋转喷淋 · 水射流',
      parts: ['8 组旋转喷嘴', '环形水道', '恒温加热阀'],
      how: '水泵按检测报告恒压供水，喷嘴环绕头皮 360° 旋转喷射温水；水压 0.2–0.4 MPa 可调，配合按摩节点实现边冲边揉。',
    },
    dry: {
      name: '烘干模块', en: 'HAIR DRYING MODULE',
      tagline: '温风风道 · 加热丝',
      parts: ['环形出风口', 'PTC 加热丝', '无刷涡轮风机'],
      how: '风机送出 40–55 °C 恒温热风，沿环形风道均匀吹向发丝；湿度传感器实时反馈，发根至发梢梯度降温，避免过热损伤。',
    },
    care: {
      name: '护发模块', en: 'HAIR CARE MODULE',
      tagline: '红光 LED · 精华投放',
      parts: ['12 颗 660nm 红光 LED', '精华仓（4 味）', '微量泵'],
      how: '红光照射头皮促进循环，微量泵按检测报告剂量将精华均匀涂抹于发根；LED 与按摩波同步脉冲，提升吸收率。',
    },
    aroma: {
      name: '香氛模块', en: 'AROMA THERAPY MODULE',
      tagline: '精油胶囊仓 · 香氛扩散',
      parts: ['5 色精油胶囊', '旋转胶囊仓', '超声雾化片'],
      how: '胶囊仓旋转选中所选香型，超声雾化片将精油打散为微米级雾粒，随烘干气流布满头盔内腔，护理同时完成香氛疗愈。',
    },
    music: {
      name: '音乐模块', en: 'MUSIC MODULE',
      tagline: '扬声器格栅 · 蓝牙指示',
      parts: ['双定向扬声器', '蓝牙 5.0 模组', '状态指示灯'],
      how: '蓝牙 5.0 连接手机，扬声器在头盔内形成定向声场；护理节奏与按摩波同步，洗护过程变成一段放松体验。',
    },
    massage: {
      name: '按摩模块', en: 'MASSAGE MODULE',
      tagline: '机械按摩节点 · 头皮刺激',
      parts: ['12 组伸缩按摩头', '独立微型舵机', '压力传感层'],
      how: '12 组按摩头由独立舵机驱动，以海浪波形逐点伸缩揉捏；压力传感层实时限力，模拟人手指压手法。',
    },
    clean: {
      name: '自清洁模块', en: 'SELF-CLEANING MODULE',
      tagline: '水过滤 · 自消毒系统',
      parts: ['双层滤芯', 'UV-C 紫外消毒灯', '自循净水路'],
      how: '护理结束后废水经双层滤芯过滤回收，UV-C 紫外灯对内腔与管路消毒；全程免拆洗，每次护理都是无菌环境。',
    },
  },
};

const en: Texts = {
  title: 'HaloWash Smart Hair-Wash Helmet',
  subtitle: 'Technical Blueprint Bench · 8 Modules',
  plaqueEn: 'TECHNICAL BLUEPRINT · SMART HAIR WASHING MACHINE · HW-01A · V1.0.0',
  blueprintLabel: 'Technical Blueprint',
  projectLabel: 'Project',
  projectValue: 'Smart Hair Washing Machine',
  modelLabel: 'Model',
  versionLabel: 'Version',

  moduleIndex: 'Module Index',
  moduleIndexHint: 'Top to bottom · click for composition & method',
  systemPanel: 'System',
  legend: 'Legend',
  specs: 'System Specifications',
  status: 'Status',
  statusIdle: 'Standby',
  statusDone: 'Cycle Complete',
  phaseProgress: 'Phase Progress',
  specVoltage: 'Voltage',
  specFreq: 'Frequency',
  specPower: 'Power',
  specPressure: 'Water Pressure',
  specWeight: 'Weight',
  specDims: 'Dimensions',

  control: 'Control Desk',
  runCycle: 'Run Full Care Cycle',
  stopCycle: 'Stop',
  explode: 'Explode',
  assemble: 'Assemble',
  cameraView: 'Camera',
  camGlobal: 'Global',
  camFront: 'Front',
  camTop: 'Top',
  camStack: 'Stack Side',
  camFree: 'Free',
  waterPressure: 'Pressure',
  sound: 'Sound',
  langToggle: '中',

  partInfo: 'Module Detail',
  composition: 'Composition',
  howItWorks: 'How It Works',
  close: 'Close',
  demoOn: 'Demo running',
  demoOff: 'Stop demo',
  click3dHint: 'Or click a module in 3D',

  phaseScan: '① Scalp Diagnosis',
  phaseWash: '② Auto Wash',
  phaseDry: '③ Warm Drying',
  phaseCare: '④ Red-Light Care',
  phaseAroma: '⑤ Aroma Therapy',
  phaseRelax: '⑥+⑦ Music & Massage',
  phaseClean: '⑧ Self-Cleaning',
  phaseDone: 'Done',
  phaseOff: 'Standby',
  cycleDone: 'Full care cycle complete — all 8 modules worked in sequence',
  cycleStopped: 'Stopped',
  demoStarted: 'Module demo — click again to stop',

  modules: {
    diagnosis: {
      name: 'Scalp Diagnosis', en: 'SCALP DIAGNOSIS MODULE',
      tagline: 'AI camera sensors for scalp analysis',
      parts: ['6 macro cameras in ring', 'Infrared moisture sensor', 'AI scalp-analysis chip'],
      how: 'The camera ring captures HD images while the IR sensor measures oil and moisture. The AI chip builds a scalp report in 3s and auto-matches water temperature, volume and dosage.',
    },
    spray: {
      name: 'Auto Wash', en: 'AUTO WASH MODULE',
      tagline: 'Rotating spray nozzles and water jets',
      parts: ['8 rotating nozzles', 'Annular water gallery', 'Thermostatic valve'],
      how: 'The pump supplies constant pressure per the diagnosis report while nozzles sweep 360° around the scalp. Pressure is adjustable from 0.2–0.4 MPa, synchronized with massage nodes.',
    },
    dry: {
      name: 'Hair Drying', en: 'HAIR DRYING MODULE',
      tagline: 'Warm air vents and heating elements',
      parts: ['Annular air vents', 'PTC heating element', 'Brushless turbine fan'],
      how: 'The fan delivers 40–55 °C thermostatic air through the annular vent. A humidity sensor feeds back in real time, cooling from roots to tips to avoid heat damage.',
    },
    care: {
      name: 'Hair Care', en: 'HAIR CARE MODULE',
      tagline: 'Red light therapy LEDs and essence dispenser',
      parts: ['12 × 660nm red LEDs', 'Essence bay (4 flavors)', 'Micro pump'],
      how: 'Red light stimulates the scalp while the micro pump applies essence to the roots at the diagnosed dosage. LED pulses sync with massage waves to boost absorption.',
    },
    aroma: {
      name: 'Aroma Therapy', en: 'AROMA THERAPY MODULE',
      tagline: 'Essential oil capsule compartment and fragrance diffusion',
      parts: ['5 essence capsules', 'Rotating capsule bay', 'Ultrasonic atomizer'],
      how: 'The bay rotates to the chosen capsule and the ultrasonic atomizer breaks the oil into micron mist, spreading through the helmet cavity with the warm airflow.',
    },
    music: {
      name: 'Music', en: 'MUSIC MODULE',
      tagline: 'Speaker grille and Bluetooth indicator',
      parts: ['Dual directional speakers', 'Bluetooth 5.0 module', 'Status LED'],
      how: 'Bluetooth 5.0 streams to directional speakers inside the helmet. The rhythm syncs with massage waves, turning the wash into a relaxing session.',
    },
    massage: {
      name: 'Massage', en: 'MASSAGE MODULE',
      tagline: 'Mechanical massage nodes for scalp stimulation',
      parts: ['12 telescoping nodes', 'Individual micro servos', 'Pressure sensing layer'],
      how: 'Twelve nodes driven by independent servos knead in a wave pattern. A pressure layer caps force in real time, imitating human fingertip pressure.',
    },
    clean: {
      name: 'Self-Cleaning', en: 'SELF-CLEANING MODULE',
      tagline: 'Water filtration and self-sterilization system',
      parts: ['Dual-layer filter', 'UV-C sterilizing lamp', 'Self-circulating water loop'],
      how: 'After care, waste water is filtered and recovered; the UV-C lamp sterilizes the cavity and piping. No disassembly needed — every session starts sterile.',
    },
  },
};

export const I18N: Record<Lang, Texts> = { zh, en };

export function t(key: keyof Texts, lang: Lang): string {
  return String(I18N[lang][key]);
}

export function phaseKey(p: string): keyof Texts {
  const map: Record<string, keyof Texts> = {
    SCAN: 'phaseScan', WASH: 'phaseWash', DRY: 'phaseDry', CARE: 'phaseCare',
    AROMA: 'phaseAroma', RELAX: 'phaseRelax', CLEAN: 'phaseClean',
    DONE: 'phaseDone', OFF: 'phaseOff',
  };
  return map[p] ?? 'phaseOff';
}
