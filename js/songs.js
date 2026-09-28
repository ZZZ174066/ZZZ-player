/**
 * 曲目特效注册表 — 新增歌曲只需在此追加一条配置
 *
 * panel: 面板 canvas/DOM 特效 id
 * viz: 频谱可视化模式 ecg | uno | hero
 * progress: 自定义进度条滑块 { bodyClass, wrapClass, thumbClass, src, thumbPx }
 * bg: 背景图候选路径（panel 特效用 BgEffect 时也可写在 panel 模块）
 * splitColor: 是否启用左右分色
 * badge: 是否显示封面折角星标（默认 true）
 */
(function () {
  const FX = "./特效/";
  const splitOnly = (keywords, lower) => ({ splitColor: true, keywords, ...(lower && { lower: true }) });

  const SONGS = [
    {
      id: "chaosBoogie",
      panel: "chaosBoogie",
      keywords: ["混沌ブギ", "混沌布吉"],
      lower: true,
    },
    {
      id: "moonBeautiful",
      panel: "moonBeautiful",
      bg: [
        `${FX}月が綺麗ねと言われたい！（对我说月色真美啊！）/月が綺麗ねと言われたい！（对我说月色真美啊！）.png`,
      ],
      keywords: ["月が綺麗ねと言われたい","对我说月色真美",],
    },
    {
      id: "telepathy",
      panel: "telepathy",
      bg: [`${FX}テレパシ（心灵感应）/テレパシ（心灵感应）.png`],
      keywords: ["テレパシ", "心灵感应"],
      lower: true,
    },
    {
      id: "bakaMitai",
      panel: "bakaMitai",
      bg: [`${FX}バカみたいに（像笨蛋一样）/バカみたいに（像笨蛋一样）.png`],
      keywords: ["バカみたいに", "像笨蛋一样"],
      lower: true,
    },
    {
      id: "cheohyung",
      panel: "cheohyung",
      bg: [`${FX}처형박수（处刑拍手）/처형박수（处刑拍手）.gif`],
      keywords: ["처형박수", "处刑拍手"],
    },
    {
      id: "characterT",
      panel: "characterT",
      keywords: ["Character T", "角色T"],
      lower: true,
    },
    {
      id: "signaling",
      viz: "ecg",
      keywords: ["Signaling", "次元通信"],
      lower: true,
      splitColor: true,
    },
    {
      id: "niceTry",
      viz: "uno",
      keywords: ["みむかｩわナイストライ","Nice Try"],
      lower: true,
    },
    {
      id: "superProtagonist",
      viz: "hero",
      keywords: ["超主人公"],
      lower: true,
    },
    {
      id: "discoNight",
      progress: {
        bodyClass: "disco-progress-active",
        wrapClass: "is-disco-progress",
        thumbClass: "disco-progress-thumb",
        src: `${FX}ディスコティックナイト（迪斯科之夜）/ディスコティックナイト（迪斯科之夜）.png`,
        thumbPx: 52,
      },
      keywords: ["ディスコティックナイト", "迪斯科之夜"],
    },
    {
      id: "asymmetry",
      progress: {
        bodyClass: "asymmetry-progress-active",
        wrapClass: "is-asymmetry-progress",
        thumbClass: "asymmetry-progress-thumb",
        src: `${FX}アシンメトリー（不对称性）/アシンメトリー（不对称性）.png`,
        thumbPx: 88,
      },
      keywords: ["アシンメトリー", "不对称性"],
      lower: true,
    },
    // 仅分色、无其它特效
    splitOnly(["メズマライザー", "催眠术"], true),
    splitOnly(["ダイダイダイダイダイキライ", "超级超级超级超级超级讨厌"]),
    splitOnly(["ダダダダダル", "烦烦烦烦烦死了"]),
    splitOnly(["Sell a Friend", "出卖朋友"], true),
    splitOnly(["T氏の話を信じるな", "不要相信T氏的话"]),
    splitOnly(["멜트 아이스크림", "融化的冰淇淋"]),
    splitOnly(["うるたーる", "ウルタール", "乌撒的猫"]),
    splitOnly(["キャンディークッキーチョコレート", "糖果饼干巧克力"]),
    splitOnly(["スプリットダンス", "劈叉舞"]),
    splitOnly(["フェイクダンス", "虚假舞蹈"]),
    splitOnly(["どりーむもーど", "梦之模式"]),
    splitOnly(["天天天国地獄国", "天天天国地狱国"]),
    splitOnly(["踊っチャイナ", "舞动吧中国"]),
    splitOnly(["Clone Clone", "克隆克隆"], true),
    splitOnly(["PPPP"]),
    splitOnly(["ねぇねぇねぇ", "呐呐呐"]),
    splitOnly(["ぴょん", "一蹦一跳"]),
  ];

  const VIZ_PRIORITY = ["ecg", "uno", "hero"];
  const PANEL_PRIORITY = [
    "chaosBoogie",
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

  function getSplitColorKeywords() {
    return SONGS.filter((s) => s.splitColor || s.progress).flatMap((s) => s.keywords);
  }

  function isSplitColorVideo(v) {
    if (!v) return false;
    const text = AppUtils.getVideoSearchText(v);
    const lower = text.toLowerCase();
    return getSplitColorKeywords().some(
      (kw) => text.includes(kw) || lower.includes(kw.toLowerCase()),
    );
  }

  window.SongRegistry = {
    SONGS,
    FX,
    matchSong,
    findSong,
    getSplitColorKeywords,
    isSplitColorVideo,
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
      if (v.coverIsGif) return true;
      const name = String(v.coverFileName || v.coverUrl || "").toLowerCase();
      if (name.includes(".gif")) return true;
      if (SONGS.some((s) => s.badge !== false && matchSong(v, s))) return true;
      if (window.SplitColor?.isSplitColorSwapVideo?.(v)) return true;
      return false;
    },
    getBgCandidates(panelId) {
      return SONGS.find((s) => s.panel === panelId)?.bg || [];
    },
    getSong(id) {
      return SONGS.find((s) => s.id === id);
    },
  };
})();
