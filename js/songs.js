/**
 * 曲目特效注册表 — 新增歌曲主要改这里
 *
 * —— 字段 ——
 * keywords / lower: 曲名匹配
 * bg: 背景图路径数组（BgSync）
 * progress: 自定义进度滑块 { bodyClass, wrapClass, thumbClass, src, thumbPx }
 * filter / filterMute / filterWindows: 全局滤镜（chroma / neonDesat / bwDesat / voyeur）
 * viz: 频谱模式 fire | ecg | uno | hero | blocks
 * overlay: 背景叠加层 id（由对应 *-fx 注册到 EffectHub）
 *   arrows | clapMarch | fruitMarch | chaosBoogie | aboutYou | tinyMe | overwrite | exorcismText | idealFloat | poisonShow
 * badge: 是否显示星标（默认 true）
 *
 * —— 扩展 overlay ——
 * 1. 在本表加 overlay / keywords
 * 2. 新建 js/effects/xxx-fx.js，末尾 EffectHub.registerOverlay({...})
 * 3. 在 index.html 引入脚本（底部行进类优先用 BottomMarch.create）
 * 不必再改 main.js
 */
(function () {
  const FX = "./特效/";

  const SONGS = [
    // —— 全局滤镜 ——
    {
      id: "wonderland",
      filter: "chroma",
      filterMute: [{ start: 125, end: 150 }],
      keywords: ["奇境"],
    },
    {
      id: "neon",
      filter: "neonDesat",
      filterWindows: [
        { start: 0, end: 11 },
        { start: 22, end: 34 },
        { start: 55, end: 66 },
        { start: 76, end: 87 },
      ],
      keywords: ["霓虹"],
      lower: true,
    },
    {
      id: "instantLoop",
      filter: "bwDesat",
      filterWindows: [
        { start: 0, end: 0.7 },
        { start: 12.4, end: 52 },
        { start: 63.8, end: 97.5 },
        { start: 109.2, end: 120.3 },
      ],
      keywords: ["即刻轮回"],
    },
    {
      id: "voyeur",
      filter: "voyeur",
      keywords: ["视奸"],
    },
    // —— 背景叠加 overlay（EffectHub）——
    {
      id: "poisonShow",
      overlay: "poisonShow",
      keywords: ["展示中毒"],
    },
    {
      id: "chaosBoogie",
      overlay: "chaosBoogie",
      keywords: ["混沌布吉"],
      lower: true,
    },
    {
      id: "aboutYou",
      overlay: "aboutYou",
      keywords: ["说的就是你啊！"],
    },
    {
      id: "tinyMe",
      overlay: "tinyMe",
      keywords: ["小小的我"],
    },
    {
      id: "overwrite",
      overlay: "overwrite",
      keywords: ["覆写"],
    },
    {
      id: "relationGirl",
      overlay: "arrows",
      keywords: ["关系少女"],
      lower: true,
    },
    {
      id: "exorcism",
      overlay: "exorcismText",
      keywords: ["驱魔"],
      lower: true,
    },
    {
      id: "idealImage",
      overlay: "idealFloat",
      keywords: ["理想・形象"],
      lower: true,
    },
    // —— 背景替换 bg ——
    {
      id: "moonBeautiful",
      panel: "moonBeautiful",
      bg: [
        `${FX}想听你说月色真美！/想听你说月色真美！.png`,
      ],
      keywords: ["想听你说月色真美！"],
    },
    {
      id: "telepathy",
      panel: "telepathy",
      bg: [`${FX}心灵感应/心灵感应.png`],
      keywords: ["心灵感应"],
      lower: true,
    },
    {
      id: "bakaMitai",
      panel: "bakaMitai",
      bg: [`${FX}像笨蛋一样/像笨蛋一样.png`],
      keywords: ["像笨蛋一样"],
      lower: true,
    },
    {
      id: "burnout",
      bg: [`${FX}燃尽/燃尽.jpg`],
      keywords: ["燃尽"],
      lower: true,
    },
    {
      id: "cheohyung",
      panel: "cheohyung",
      overlay: "clapMarch",
      bg: [`${FX}处刑拍手/处刑拍手.gif`],
      keywords: ["处刑拍手"],
    },
    {
      id: "characterT",
      panel: "characterT",
      overlay: "fruitMarch",
      keywords: ["角色T"],
      lower: true,
    },
    // —— 频谱 viz ——
    {
      id: "fomo",
      viz: "fire",
      keywords: ["错失恐惧症"],
      lower: true,
    },
    {
      id: "signaling",
      viz: "ecg",
      keywords: ["次元通信"],
      lower: true,
    },
    {
      id: "niceTry",
      viz: "uno",
      keywords: ["Nice Try"],
      lower: true,
    },
    {
      id: "superProtagonist",
      viz: "hero",
      keywords: ["超主人公"],
      lower: true,
    },
    {
      id: "loveParaDance",
      viz: "blocks",
      keywords: ["恋爱帕拉舞"],
      lower: true,
    },
    {
      id: "fakeDance",
      viz: "blocks",
      keywords: ["虚假舞蹈"],
    },
    // —— 进度条滑块 ——
    {
      id: "discoNight",
      progress: {
        bodyClass: "disco-progress-active",
        wrapClass: "is-disco-progress",
        thumbClass: "disco-progress-thumb",
        src: `${FX}迪斯科之夜/迪斯科之夜.png`,
        thumbPx: 48,
      },
      keywords: ["迪斯科之夜"],
    },
    {
      id: "asymmetry",
      progress: {
        bodyClass: "asymmetry-progress-active",
        wrapClass: "is-asymmetry-progress",
        thumbClass: "asymmetry-progress-thumb",
        src: `${FX}不对称性/不对称性.png`,
        thumbPx: 88,
      },
      keywords: ["不对称性"],
      lower: true,
    },
    {
      id: "bigFailure",
      progress: {
        bodyClass: "big-failure-progress-active",
        wrapClass: "is-big-failure-progress",
        thumbClass: "big-failure-progress-thumb",
        src: `${FX}大失败！/大失败！.png`,
        thumbPx: 64,
      },
      keywords: ["大失败"],
      lower: true,
    },
    {
      id: "reallyDoomed",
      progress: {
        bodyClass: "really-doomed-progress-active",
        wrapClass: "is-really-doomed-progress",
        thumbClass: "really-doomed-progress-thumb",
        src: `${FX}真的真的完蛋了/真的真的完蛋了.png`,
        thumbPx: 56,
      },
      keywords: ["真的真的完蛋了"],
      lower: true,
    },
  ];

  const VIZ_PRIORITY = ["fire", "ecg", "uno", "hero", "blocks"];
  const PANEL_PRIORITY = [
    "moonBeautiful",
    "telepathy",
    "bakaMitai",
    "cheohyung",
    "characterT",
  ];

  function matchSong(v, song) {
    return AppUtils.matchVideo(v, song.keywords, { lower: !!song.lower });
  }

  function findSong(v, pred) {
    return SONGS.find((s) => pred(s) && matchSong(v, s)) || null;
  }

  window.SongRegistry = {
    SONGS,
    FX,
    matchSong,
    findSong,
    resolvePanelEffect(v) {
      for (const id of PANEL_PRIORITY) {
        const s = findSong(v, (x) => x.panel === id);
        if (s) return id;
      }
      return "sparkle";
    },
    resolveVisualizerMode(v) {
      for (const mode of VIZ_PRIORITY) {
        if (findSong(v, (s) => s.viz === mode)) return mode;
      }
      return "bars";
    },
    resolveProgressEffects(v) {
      if (!v) return [];
      return SONGS.filter((s) => s.progress && matchSong(v, s)).map((s) => s.progress);
    },
    hasSpecialBadge(v) {
      if (!v) return false;
      return SONGS.some((s) => s.badge !== false && matchSong(v, s));
    },
    getBgCandidates(panelId) {
      return SONGS.find((s) => s.panel === panelId)?.bg || [];
    },
    getSong(id) {
      return SONGS.find((s) => s.id === id);
    },
  };
})();
