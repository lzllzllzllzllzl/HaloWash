# HaloWash 技术蓝图实验台（HaloWash-demo）

一个页面全部是 demo：中间 3D 交互，左侧模块目录、右侧系统面板——按照技术蓝图自上而下 ①-⑧ 的排版，展示 HaloWash 全自动洗护头盔八大模块的**构成**与**工作方式**。

> 与 `../HaloWash`（完整版网站）相互独立；本项目为单页纯 demo，架构与 rocket（喷气发动机实验台）一致。

## 运行

```bash
npm install
npm run dev      # 开发
npm run build    # 构建
npm run preview  # 预览构建产物
```

## 页面布局（对应技术蓝图）

| 区域 | 内容 |
| --- | --- |
| 中间 | 3D 整机：头盔外壳 + 八大模块垂直堆栈 + 中央能量光柱 + 蓝图网格地面 |
| 左列 | 模块目录 ①头皮检测 ②自动清洗 ③烘干 ④护发 ⑤香氛 ⑥音乐 ⑦按摩 ⑧自清洁 |
| 右列 | 图例（AI SENSOR / WATER FLOW / …）+ 运行状态进度 + 系统规格 |
| 左下 | 控制台：运行全套护理 / 爆炸滑块 / 视角 / 水压 / 音效 |
| 右下 | 选中模块详情：构成清单 + 工作方式 |

## 交互

- **运行全套护理**：自动组装后按 ①→⑧ 顺序播放完整服务流程（检测→清洗→烘干→护发→香氛→音乐按摩→自清洁），左侧目录与右侧图例同步点亮，每阶段有通告与提示音。
- **点击模块**（3D 或左列）：相机飞近、其余模块压暗、详情卡显示构成/工作方式，单模块演示其动效。
- **爆炸滑块**：模块垂直铺开（同蓝图爆炸图），中央光柱贯穿堆栈。
- **视角**：总览 / 正视 / 俯视 / 堆栈侧视 / 自由；水压滑块实时影响喷淋转速与水雾强度。

## 技术栈

Vite 5 + React 18 + TypeScript + Three.js + @react-three/fiber + drei + Zustand（与 rocket 相同，无其他依赖）。

## 代码结构

```
src/
  app/        store（zustand）/ events / productConfig / i18n / App（服务循环 sim loop）
  product/    partMetadata（8 模块元数据）/ buildProduct（程序化几何）/ HaloWash.tsx（模型）
  fx/         particlePool（统一粒子池）/ FXSystem（粒子 + 扫描环 + 声波环）
  scene/      BenchScene / CameraController / Lighting / BlueprintEnvironment
  audio/      HardwareAudio（程序化音效：点击/提示音/水流/风机）
  ui/         Overlay / ModuleIndex / SystemPanel / ControlDesk / PartInfo / PlaqueStack
  styles/     index.css（蓝图深蓝配色）
```

架构约定：逐帧状态走可变单例 `src/product/productState.ts` 的 `ps`，Zustand 只存目标值；相机预设与阶段计划集中在 `productConfig.ts`；模块空间元数据集中在 `partMetadata.ts`。
