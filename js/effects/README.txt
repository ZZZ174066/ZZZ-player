特效目录（js/effects/）
========================

加载顺序见 index.html：
  utils → songs → base → hub → bottom-march → *-sync → *-viz → *-fx → main

核心
  hub.js           EffectHub：overlay 注册 / syncAll / 频谱分发 / 星标
  base.js          BgEffect、ProgressThumbEffect

同步 *-sync.js
  bg-sync          特殊背景图
  progress-sync    进度条滑块图
  filter-sync      chroma / neonDesat / bwDesat / voyeur

频谱 *-viz.js
  viz-sample       公共采样
  fire / blocks / uno / ecg / hero

叠加 *-fx.js（末尾 EffectHub.registerOverlay）
  arrow / clap / fruit / chaos / about-you / tiny-me / overwrite / exorcism / ideal / poison
  clap、fruit 用 BottomMarch.create

新增叠加特效
  1. songs.js 加 overlay + keywords
  2. 写 xxx-fx.js 并 registerOverlay
  3. index.html 引入脚本
  一般不用改 main.js
