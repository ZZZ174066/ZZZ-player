/**
 * 本地视频分类播放器 — 主入口
 */

const U = AppUtils;

const theme = {
  themeColor: "#ffffff",
  componentColor: "#000000",
};

/** @type {{ videos: object[]; currentIndex: number; playbackRate: number; playMode: "shuffle"|"list"|"single"; shuffleOrder: number[]; shuffleFingerprint: string }} */
const state = {
  videos: [],
  currentIndex: -1,
  root: null,
  translateMode: false,
  specialEffectsEnabled: true,
  playbackRate: 1,
  playMode: "shuffle",
  shuffleOrder: [],
  shuffleFingerprint: "",
};

const filterSelection = {
  category: new Set(),
  author: new Set(),
  role: new Set(),
  level: new Set(),
};

const FILTER_PANELS = [
  {
    kind: "category",
    btnId: "filterCategoryBtn",
    panelId: "filterCategoryPanel",
    defaultLabel: "筛选分类",
  },
  {
    kind: "author",
    btnId: "filterAuthorBtn",
    panelId: "filterAuthorPanel",
    defaultLabel: "筛选作者",
  },
  {
    kind: "role",
    btnId: "filterRoleBtn",
    panelId: "filterRolePanel",
    defaultLabel: "筛选歌手",
  },
  {
    kind: "level",
    btnId: "filterLevelBtn",
    panelId: "filterLevelPanel",
    defaultLabel: "喜爱等级",
  },
];

const filterUi = {
  openKind: null,
};

const infoUi = {
  editing: false,
  /** @type {"cover"|"light"|"dark"} */
  coverViewMode: "cover",
  pickTarget: "theme",
  /** 进入编辑时的原始快照，取消时用于还原 */
  editSnapshot: null,
  /** 编辑中的工作副本（等级、主题色等），仅确定时写入视频 */
  editWork: null,
};

const dom = {
  root: document.documentElement,
  toast: document.getElementById("toast"),
  searchInput: document.getElementById("searchInput"),
  infoPanelRoot: document.getElementById("infoPanelRoot"),
  infoTitleBtn: document.getElementById("infoTitleBtn"),
  infoView: document.getElementById("infoView"),
  infoCoverBox: document.getElementById("infoCoverBox"),
  infoCoverPlaceholder: document.getElementById("infoCoverPlaceholder"),
  infoCoverImg: document.getElementById("infoCoverImg"),
  infoColorWheel: document.getElementById("infoColorWheel"),
  infoCoverPickCanvas: document.getElementById("infoCoverPickCanvas"),
  infoNameDisplay: document.getElementById("infoNameDisplay"),
  infoCategoryChips: document.getElementById("infoCategoryChips"),
  infoCategoryInput: document.getElementById("infoCategoryInput"),
  infoAuthorChips: document.getElementById("infoAuthorChips"),
  infoAuthorInput: document.getElementById("infoAuthorInput"),
  infoRoleChips: document.getElementById("infoRoleChips"),
  infoRoleInput: document.getElementById("infoRoleInput"),
  infoCoverMode: document.getElementById("infoCoverMode"),
  infoThemePreview: document.getElementById("infoThemePreview"),
  infoComponentPreview: document.getElementById("infoComponentPreview"),
  infoLevel: document.getElementById("infoLevel"),
  infoConfirmBtn: document.getElementById("infoConfirmBtn"),
  videoEl: document.getElementById("videoElement"),
  videoBackdrop: document.getElementById("videoBackdrop"),
  playerZoneVideo: document.querySelector(".player-zone-video"),
  playerProgressTrack: document.getElementById("playerProgressTrack"),
  playerProgressWrap: document.getElementById("playerProgressWrap"),
  visualizerCanvas: document.getElementById("visualizerCanvas"),
  btnImport: document.getElementById("btnImport"),
  btnExportJson: document.getElementById("btnExportJson"),
  btnTranslate: document.getElementById("btnTranslate"),
  btnSpecialFx: document.getElementById("btnSpecialFx"),
  btnVolume: document.getElementById("btnVolume"),
  volumePopover: document.getElementById("volumePopover"),
  volumeTrack: document.getElementById("volumeTrack"),
  volumeSlider: document.getElementById("volumeSlider"),
  volumeControl: document.getElementById("volumeControl"),
  btnPrev: document.getElementById("btnPrev"),
  btnPlayPause: document.getElementById("btnPlayPause"),
  btnNext: document.getElementById("btnNext"),
  btnSpeed: document.getElementById("btnSpeed"),
  btnPlayMode: document.getElementById("btnPlayMode"),
  btnPip: document.getElementById("btnPip"),
  btnFullscreen: document.getElementById("btnFullscreen"),
  btnLocate: document.getElementById("btnLocate"),
  playlistGrid: document.getElementById("playlistGrid"),
  appMain: document.getElementById("appMain"),
  playlistTitleBtn: document.getElementById("playlistTitleBtn"),
};

const playlistUi = {
  expanded: false,
};

const PLAY_ICON_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M893.035 463.821679C839.00765 429.699141 210.584253 28.759328 179.305261 8.854514 139.495634-16.737389 99.686007 17.385148 99.686007 57.194775v909.934329c0 45.496716 42.653172 68.245075 76.775709 48.340262 45.496716-28.435448 676.763657-429.375262 716.573284-454.967165 34.122537-22.748358 34.122537-76.775709 0-96.680522z"/></svg>`;
const PAUSE_ICON_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M128 0h253.155556v1024H128V0z m512 0h256v1024h-256V0z"/></svg>`;
const SPEED_ICON_SVG = `<svg viewBox="0 0 1260 1024" aria-hidden="true"><path fill="currentColor" d="M77.738464 1011.260664l536.872038-462.255925a50.350711 50.350711 0 0 0 0-72.796208L77.738464 12.739336A46.104265 46.104265 0 0 0 0.089175 48.530806v926.331753a46.104265 46.104265 0 0 0 77.649289 36.398105z m629.687204 0l536.872038-462.255925a49.744076 49.744076 0 0 0 0-72.796208L707.425668 12.739336a46.104265 46.104265 0 0 0-77.649289 36.398105v925.725118a46.104265 46.104265 0 0 0 77.649289 36.398105z"/></svg>`;
const PLAY_MODE_SHUFFLE_SVG = `<svg viewBox="0 0 1170 1024" aria-hidden="true"><path fill="currentColor" d="M950.616094 1023.999269a73.124315 73.124315 0 0 1-51.918264-21.206052 73.124315 73.124315 0 0 1 0-103.836527l21.937295-21.206051H731.243149a73.124315 73.124315 0 0 1-62.155668-34.368428L325.403201 292.75612H73.124315a73.124315 73.124315 0 0 1 0-146.24863h292.49726a73.124315 73.124315 0 0 1 62.155667 34.368428l121.386363 193.779434 119.923876-193.779434A73.124315 73.124315 0 0 1 731.243149 146.50749h189.391976l-21.937295-21.206051A73.124315 73.124315 0 0 1 1002.534357 21.464911l146.24863 146.24863a73.124315 73.124315 0 0 1 0 103.836527l-146.24863 146.24863a73.124315 73.124315 0 0 1-103.836527-103.836527l21.937295-21.206051h-146.24863l-138.936198 219.372944 136.011225 219.372945h146.24863l-21.937294-21.206051a73.124315 73.124315 0 0 1 103.836527-103.836527l146.24863 146.248629a73.124315 73.124315 0 0 1 0 103.836528l-146.24863 146.248629A73.124315 73.124315 0 0 1 950.616094 1023.999269z m-584.994519-146.24863H73.124315a73.124315 73.124315 0 0 1 0-146.24863h253.010129l25.593511-40.218373a73.124315 73.124315 0 0 1 122.848849 79.705503l-47.530805 73.124315A73.124315 73.124315 0 0 1 365.621575 877.750639z"/></svg>`;
const PLAY_MODE_LIST_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M569.6 448H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c-6.4-25.6-25.6-44.8-51.2-44.8z m0 332.8H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c-6.4-25.6-25.6-44.8-51.2-44.8zM44.8 243.2H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c0-25.6-19.2-44.8-44.8-44.8H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8z m684.8-134.4c-25.6 0-44.8 19.2-38.4 44.8v716.8c0 25.6 19.2 44.8 44.8 44.8h32c12.8 0 32-6.4 38.4-25.6l217.6-236.8c0-25.6-19.2-44.8-44.8-44.8h-166.4V153.6c0-25.6-19.2-44.8-44.8-44.8h-38.4z"/></svg>`;
const PLAY_MODE_SINGLE_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M449.024 832.512h-52.736c-152.064-25.088-268.288-157.184-268.288-315.904 0-53.248 13.824-102.912 36.864-146.944l39.424 54.272c28.672 39.424 90.112 28.672 103.424-18.432l31.232-112.64 43.008-155.136c10.24-37.376-17.408-73.728-56.32-73.728h-267.264c-47.616 0-74.752 53.76-47.104 92.16l72.192 100.352c-52.224 73.216-83.456 162.816-83.456 260.096 0 224.256 164.352 409.6 378.88 442.88 5.632 1.024 11.776 0.512 16.896 0v1.024h52.736c34.816 0 62.976-28.16 62.976-62.976v-1.536c0.512-35.328-27.648-63.488-62.464-63.488zM1012.736 867.328l-72.192-100.352C992.768 693.76 1024 604.16 1024 507.392c0-224.256-164.352-409.6-378.88-442.88-5.632-1.024-11.776-0.512-16.896 0v-1.024h-52.736c-34.816 0-62.976 28.16-62.976 62.976v1.536c0 34.816 28.16 62.976 62.976 62.976h52.736C779.776 216.064 896 348.672 896 507.392c0 53.248-13.824 102.912-36.864 146.944l-39.424-54.272c-28.672-39.424-90.112-28.672-103.424 18.432l-31.232 112.64-43.008 155.136c-10.24 37.376 17.408 73.728 56.32 73.728h267.264c47.616-0.512 74.752-54.272 47.104-92.672z"/><path fill="currentColor" d="M554.496 349.184v263.168h-43.008v-211.456c-15.872 14.336-35.84 25.088-59.904 32.256v-43.008c11.776-3.072 24.576-8.192 37.376-15.36 13.312-8.192 24.576-16.384 33.28-25.6h32.256z"/><path fill="currentColor" d="M590.336 648.192h-114.688v-185.344l-13.824 4.608-46.08 13.824v-118.784l26.624-7.168c9.216-2.56 18.944-6.144 28.16-11.776 11.776-7.168 19.968-13.312 25.6-19.456l10.752-11.264h83.456v335.36z"/></svg>`;
const PLAY_MODE_LABELS = {
  shuffle: "随机播放",
  list: "顺序播放",
  single: "单曲循环",
};
const LEVEL_HEART_SVG = `<svg class="info-level-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const LEVEL_FILTER_HEART_SVG = `<svg class="level-filter-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const LEVEL_SLOT_COUNT = 6;
const LEVEL_MAX = 5;
const INFO_DEFAULT_NAME = "歌曲名称";
/** 筛选「暂无」：作者/歌手/分类为空 */
const FILTER_NONE = "__filter_none__";
const FILTER_CATEGORY_LEGACY_UNCATEGORIZED = "未分类";

/** 切歌时主题/封面渐变时长（与旧版一致） */
const MEDIA_TRANSITION_MS = 1200;
const THEME_RAPID_WINDOW_MS = 450;
const DEFAULT_THEME = { bgHex: "#ffffff", fgHex: "#000000" };

let themeAnimFrame = 0;
let themeApplyToken = 0;
let themeSwitchTimes = [];
let coverTransitionToken = 0;
let lastCoverSrc = null;

const RGB_WHITE = { r: 255, g: 255, b: 255 };
const RGB_BLACK = { r: 0, g: 0, b: 0 };

/* ---------- 主题 ---------- */

function invertHex(hex) {
  const clean = String(hex || "").replace("#", "");
  if (clean.length !== 6) return "#ffffff";
  const num = parseInt(clean, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  let ir = 255 - r;
  let ig = 255 - g;
  let ib = 255 - b;
  const lumSrc = 0.299 * r + 0.587 * g + 0.114 * b;
  const lumInv = 0.299 * ir + 0.587 * ig + 0.114 * ib;
  const minDiff = 60;
  if (Math.abs(lumSrc - lumInv) < minDiff) {
    const needMoreBright = lumSrc < 128;
    const mixFactor = 0.25;
    if (needMoreBright) {
      ir = Math.round(ir * (1 - mixFactor) + 255 * mixFactor);
      ig = Math.round(ig * (1 - mixFactor) + 255 * mixFactor);
      ib = Math.round(ib * (1 - mixFactor) + 255 * mixFactor);
    } else {
      ir = Math.round(ir * (1 - mixFactor));
      ig = Math.round(ig * (1 - mixFactor));
      ib = Math.round(ib * (1 - mixFactor));
    }
  }
  return U.rgbToHex(ir, ig, ib);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function cancelThemeAnimation() {
  if (themeAnimFrame) {
    cancelAnimationFrame(themeAnimFrame);
    themeAnimFrame = 0;
  }
}

function noteThemeSongSwitch() {
  const now = performance.now();
  themeApplyToken += 1;
  themeSwitchTimes.push(now);
  themeSwitchTimes = themeSwitchTimes.filter((t) => now - t < THEME_RAPID_WINDOW_MS);
  cancelThemeAnimation();
  return themeApplyToken;
}

function isRapidSongSwitching() {
  return themeSwitchTimes.length >= 2;
}

function isCurrentVideo(v) {
  if (!v || state.currentIndex < 0) return false;
  const cur = state.videos[state.currentIndex];
  return !!cur && cur.id === v.id;
}

function themeColorsEqual(bgHex, fgHex) {
  return theme.themeColor === bgHex && theme.componentColor === fgHex;
}

function applyThemeImmediate(themeColor, componentColor) {
  theme.themeColor = themeColor;
  theme.componentColor = componentColor;
  dom.root.style.setProperty("--theme-color", themeColor);
  dom.root.style.setProperty("--component-color", componentColor);
  updateColorPreviews();
  if (state.specialEffectsEnabled) {
    window.Special?.onThemeChanged?.();
    window.SplitColor?.onThemeChanged?.();
  }
}

function animateThemeTransition(toBgHex, toFgHex, duration = MEDIA_TRANSITION_MS) {
  cancelThemeAnimation();
  const fromBg = U.parseHexColor(theme.themeColor, RGB_WHITE);
  const fromFg = U.parseHexColor(theme.componentColor, RGB_BLACK);
  const toBg = U.parseHexColor(toBgHex, RGB_WHITE);
  const toFg = U.parseHexColor(toFgHex, RGB_BLACK);
  if (
    fromBg.r === toBg.r &&
    fromBg.g === toBg.g &&
    fromBg.b === toBg.b &&
    fromFg.r === toFg.r &&
    fromFg.g === toFg.g &&
    fromFg.b === toFg.b
  ) {
    applyThemeImmediate(toBgHex, toFgHex);
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const e = easeInOutCubic(t);
    const bg = U.rgbToHex(
      Math.round(fromBg.r + (toBg.r - fromBg.r) * e),
      Math.round(fromBg.g + (toBg.g - fromBg.g) * e),
      Math.round(fromBg.b + (toBg.b - fromBg.b) * e),
    );
    const fg = U.rgbToHex(
      Math.round(fromFg.r + (toFg.r - fromFg.r) * e),
      Math.round(fromFg.g + (toFg.g - fromFg.g) * e),
      Math.round(fromFg.b + (toFg.b - fromFg.b) * e),
    );
    applyThemeImmediate(bg, fg);
    if (t < 1) {
      themeAnimFrame = requestAnimationFrame(step);
    } else {
      themeAnimFrame = 0;
    }
  };
  themeAnimFrame = requestAnimationFrame(step);
}

function applyTheme(themeColor, componentColor, options = {}) {
  const { animate = false, duration = MEDIA_TRANSITION_MS } = options;
  if (!animate) {
    applyThemeImmediate(themeColor, componentColor);
    return;
  }
  animateThemeTransition(themeColor, componentColor, duration);
}

function getDominantThemeFromImage(img) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const quantizeLevel = 16;
    const colorMap = new Map();
    let opaqueCount = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      opaqueCount++;
      const qR = Math.floor(data[i] / quantizeLevel) * quantizeLevel;
      const qG = Math.floor(data[i + 1] / quantizeLevel) * quantizeLevel;
      const qB = Math.floor(data[i + 2] / quantizeLevel) * quantizeLevel;
      const key = `${qR},${qG},${qB}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
    if (opaqueCount === 0) return { ...DEFAULT_THEME };
    let maxCount = 0;
    let dominantColor = null;
    colorMap.forEach((count, key) => {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = key;
      }
    });
    if (dominantColor) {
      const [r, g, b] = dominantColor.split(",").map(Number);
      const bgHex = U.rgbToHex(r, g, b);
      return { bgHex, fgHex: invertHex(bgHex) };
    }
    return { ...DEFAULT_THEME };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

function getThemeForVideo(v, img, hasCover) {
  const bg = U.normalizeHexColor(v?.themeBg);
  const fg = U.normalizeHexColor(v?.themeFg);
  if (bg && fg) return { bgHex: bg, fgHex: fg };
  if (hasCover && img) return getDominantThemeFromImage(img);
  return { bgHex: theme.themeColor, fgHex: theme.componentColor };
}

function applyThemeForVideo(v, img, hasCover, options = {}) {
  const { themeToken, animate = true, duration = MEDIA_TRANSITION_MS } = options;
  if (themeToken != null && themeToken !== themeApplyToken) return;
  if (v != null && !isCurrentVideo(v)) return;
  const t = getThemeForVideo(v, img, hasCover);
  const same = themeColorsEqual(t.bgHex, t.fgHex);
  const useAnimate = animate && !isRapidSongSwitching() && !same;
  applyTheme(t.bgHex, t.fgHex, { animate: useAnimate, duration });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawImageCover(ctx, img, destW, destH) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const destRatio = destW / destH;
  const srcRatio = iw / ih;
  let sx;
  let sy;
  let sw;
  let sh;
  if (srcRatio > destRatio) {
    sh = ih;
    sw = ih * destRatio;
    sx = (iw - sw) / 2;
    sy = 0;
  } else {
    sw = iw;
    sh = iw / destRatio;
    sx = 0;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
}

function drawCoverPixelateFrame(ctx, oldImg, newImg, w, h, t) {
  ctx.clearRect(0, 0, w, h);
  drawImageCover(ctx, newImg, w, h);
  const peak = 0.55;
  const blurT = t < peak ? t / peak : 1 - (t - peak) / (1 - peak);
  const block = Math.max(2, Math.round(4 + blurT * 28));
  const smallW = Math.max(1, Math.ceil(w / block));
  const smallH = Math.max(1, Math.ceil(h / block));
  const snap = document.createElement("canvas");
  snap.width = w;
  snap.height = h;
  const snapCtx = snap.getContext("2d");
  drawImageCover(snapCtx, oldImg, w, h);
  const off = document.createElement("canvas");
  off.width = smallW;
  off.height = smallH;
  const offCtx = off.getContext("2d");
  offCtx.drawImage(snap, 0, 0, smallW, smallH);
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - t);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, smallW, smallH, 0, 0, w, h);
  ctx.restore();
}

function runCoverTransition(oldImg, newImg, token, duration, onDone) {
  const box = dom.infoCoverBox;
  if (!box) return;
  const w = Math.max(1, box.clientWidth);
  const h = Math.max(1, box.clientHeight);
  box.querySelector(".cover-transition-canvas")?.remove();

  const canvas = document.createElement("canvas");
  canvas.className = "cover-transition-canvas";
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  box.appendChild(canvas);

  const start = performance.now();
  const frame = (now) => {
    if (token !== coverTransitionToken) {
      canvas.remove();
      return;
    }
    const t = Math.min(1, (now - start) / duration);
    drawCoverPixelateFrame(ctx, oldImg, newImg, w, h, easeInOutCubic(t));
    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
      if (token === coverTransitionToken && onDone) onDone();
    }
  };
  requestAnimationFrame(frame);
}

function mountCoverImageToBox(imgEl, src) {
  const box = dom.infoCoverBox;
  if (!box || !imgEl) return;
  imgEl.src = src;
  imgEl.alt = "";
  imgEl.hidden = false;
  if (!box.contains(imgEl)) {
    box.appendChild(imgEl);
  }
  if (dom.infoCoverPlaceholder) dom.infoCoverPlaceholder.hidden = true;
}

function setCoverImage(src, options = {}) {
  const { animate = true, video = null, themeToken } = options;
  const box = dom.infoCoverBox;
  const imgEl = dom.infoCoverImg;
  if (!box || !imgEl) return;

  const targetSrc = src || "";
  const existingImg =
    imgEl.parentElement === box && imgEl.complete && imgEl.naturalWidth > 0
      ? imgEl
      : box.querySelector("img.info-cover-img");
  const canAnimate =
    animate &&
    existingImg &&
    existingImg.complete &&
    existingImg.naturalWidth > 0 &&
    lastCoverSrc &&
    lastCoverSrc !== targetSrc &&
    targetSrc;

  const markCover = () => {
    lastCoverSrc = targetSrc || null;
  };

  const finishTheme = (img, hasCover) => {
    applyThemeForVideo(video, img, hasCover, {
      themeToken,
      animate: true,
      duration: MEDIA_TRANSITION_MS,
    });
  };

  if (!targetSrc) {
    coverTransitionToken++;
    lastCoverSrc = null;
    imgEl.removeAttribute("src");
    imgEl.hidden = true;
    if (dom.infoCoverPlaceholder) dom.infoCoverPlaceholder.hidden = false;
    finishTheme(null, false);
    return;
  }

  if (!canAnimate) {
    if (existingImg && lastCoverSrc === targetSrc) {
      finishTheme(existingImg, true);
      mountCoverImageToBox(imgEl, targetSrc);
      return;
    }
    coverTransitionToken++;
    mountCoverImageToBox(imgEl, targetSrc);
    const done = () => {
      markCover();
      finishTheme(imgEl, true);
    };
    if (imgEl.complete) done();
    else {
      imgEl.onload = done;
      imgEl.onerror = done;
    }
    return;
  }

  const token = ++coverTransitionToken;
  const duration = MEDIA_TRANSITION_MS;
  const oldSrc = existingImg.currentSrc || existingImg.src;
  Promise.all([loadImageElement(oldSrc), loadImageElement(targetSrc)])
    .then(([oldLoaded, newLoaded]) => {
      if (token !== coverTransitionToken) return;
      applyThemeForVideo(video, newLoaded, true, {
        themeToken,
        animate: true,
        duration,
      });
      runCoverTransition(oldLoaded, newLoaded, token, duration, () => {
        if (token !== coverTransitionToken) return;
        mountCoverImageToBox(imgEl, targetSrc);
        markCover();
      });
    })
    .catch(() => {
      if (token !== coverTransitionToken) return;
      mountCoverImageToBox(imgEl, targetSrc);
      markCover();
      finishTheme(imgEl, true);
    });
}

function updateColorPreviews() {
  if (dom.infoThemePreview) {
    dom.infoThemePreview.style.background = theme.themeColor;
  }
  if (dom.infoComponentPreview) {
    dom.infoComponentPreview.style.background = theme.componentColor;
  }
}

/* ---------- 工具 ---------- */

function showToast(msg) {
  if (!dom.toast) return;
  dom.toast.textContent = msg;
  dom.toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => dom.toast.classList.remove("show"), 2000);
}

function parseBilingual(text) {
  const s = String(text ?? "").trim();
  const fw = s.match(/^(.+?)（([^）]+)）$/);
  if (fw) {
    return { foreign: fw[1].trim(), chinese: fw[2].trim(), hasPair: true };
  }
  const aw = s.match(/^(.+?)\(([^)]+)\)$/);
  if (aw) {
    return { foreign: aw[1].trim(), chinese: aw[2].trim(), hasPair: true };
  }
  return { foreign: s, chinese: s, hasPair: false };
}

function displayLabel(text, preferChinese) {
  const p = parseBilingual(text);
  if (!p.hasPair) return p.foreign;
  const useChinese =
    preferChinese !== undefined ? preferChinese : state.translateMode;
  return useChinese ? p.chinese : p.foreign;
}

/** 展示用文案：编辑模式显示原文；非编辑时随翻译模式切换中/外文 */
function formatUserFacingText(text) {
  if (infoUi.editing) return String(text ?? "");
  return displayLabel(text);
}

function getInfoNameCopyText(v = getCurrentVideo()) {
  if (!v) return "";
  const raw = String(v.title || v.titleDisplay || "").trim();
  if (!raw) return "";
  if (infoUi.editing) return raw;
  const p = parseBilingual(raw);
  if (!p.hasPair) return p.foreign;
  return state.translateMode ? p.chinese : p.foreign;
}

async function copyInfoNameToClipboard() {
  const text = getInfoNameCopyText();
  if (!text) {
    showToast("无可复制内容");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      ta.remove();
    }
  }
  showToast("已复制");
}

function applyTranslateModeUi() {
  dom.btnTranslate?.setAttribute(
    "aria-pressed",
    state.translateMode ? "true" : "false",
  );
}

function refreshTranslateDisplay() {
  renderInfoView();
  renderPlaylist();
}

function toggleTranslateMode() {
  state.translateMode = !state.translateMode;
  applyTranslateModeUi();
  refreshTranslateDisplay();
  showToast(state.translateMode ? "已进入翻译模式" : "已退出翻译模式");
}

const playerHooks = {
  getAnalyser() {
    return analyser;
  },
  getFrequencyData() {
    if (!analyser || !analyserDataArray) return null;
    analyser.getByteFrequencyData(analyserDataArray);
    return analyserDataArray;
  },
  getVideo() {
    return dom.videoEl;
  },
  getCurrentVideo() {
    return getCurrentVideo();
  },
  getTheme() {
    return {
      themeColor: theme.themeColor,
      componentColor: theme.componentColor,
    };
  },
  getVisualizerCanvas() {
    return dom.visualizerCanvas;
  },
};

function applySpecialEffectsUi() {
  dom.btnSpecialFx?.setAttribute(
    "aria-pressed",
    state.specialEffectsEnabled ? "true" : "false",
  );
}

function syncSplitColor() {
  const v = state.specialEffectsEnabled ? getCurrentVideo() : null;
  window.SplitColor?.applyForVideo?.(v);
  buildAllFilterPanels();
}

function refreshMediaEffects({ includeSpecial = true } = {}) {
  const v = state.specialEffectsEnabled ? getCurrentVideo() : null;
  if (includeSpecial && state.specialEffectsEnabled) window.Special?.onVideoChanged?.(v);
  syncSplitColor();
  window.Special?.syncVisualizer?.(v, { analyser, resizeVisualizerCanvas });
  window.Special?.syncProgressEffect?.(v);
}

function syncSpecialEffects() {
  window.Special?.onVideoChanged?.(getCurrentVideo());
}

function syncVisualizerMode() {
  const v = state.specialEffectsEnabled ? getCurrentVideo() : null;
  window.Special?.syncVisualizer?.(v, { analyser, resizeVisualizerCanvas });
}

function syncProgressSpecialEffects() {
  window.Special?.syncProgressEffect?.(
    state.specialEffectsEnabled ? getCurrentVideo() : null,
  );
}

function toggleSpecialEffects() {
  state.specialEffectsEnabled = !state.specialEffectsEnabled;
  applySpecialEffectsUi();
  window.Special?.setEnabled?.(state.specialEffectsEnabled);
  refreshMediaEffects();
  syncPlayPauseButton();
  showToast(state.specialEffectsEnabled ? "已开启特殊效果" : "已关闭特殊效果");
}

function splitByComma(val) {
  return String(val ?? "")
    .split("，")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinByComma(arr) {
  return [...arr].join("，");
}

const MEDIA_EXTS = [".mp4", ".mp3", ".flac"];
const COVER_EXTS = [".jpg", ".jpeg", ".png", ".gif"];
const LRC_EXT = ".lrc";

function splitMetaTokens(val) {
  const s = String(val ?? "");
  if (s.includes("，")) {
    return s
      .split("，")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (/\s+/.test(s)) {
    return s
      .split(/\s+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  const one = s.trim();
  return one ? [one] : [];
}

function normAndSort(arr) {
  return Array.from(new Set(arr))
    .filter(Boolean)
    .sort((a, b) =>
      String(a).localeCompare(String(b), "zh-CN", {
        numeric: true,
        sensitivity: "base",
      }),
    );
}

function baseNameOf(name) {
  return String(name).replace(/\.[^.]+$/, "");
}

function extOf(name) {
  const m = String(name).toLowerCase().match(/(\.[^./\\]+)$/);
  return m ? m[1] : "";
}

function revokeVideoObjectUrls(videos) {
  (videos || []).forEach((v) => {
    if (v.url?.startsWith("blob:")) URL.revokeObjectURL(v.url);
    if (v.coverUrl?.startsWith("blob:")) URL.revokeObjectURL(v.coverUrl);
    if (v.lrcUrl?.startsWith("blob:")) URL.revokeObjectURL(v.lrcUrl);
  });
}

async function pickRootFolder() {
  if (!window.showDirectoryPicker) {
    showToast("当前浏览器不支持文件夹选择，请使用 Edge / Chrome。");
    return null;
  }
  try {
    let handle;
    try {
      handle = await window.showDirectoryPicker({ startIn: "videos" });
    } catch (e) {
      if (e?.name === "AbortError" || e?.name === "NotAllowedError") return null;
      handle = await window.showDirectoryPicker();
    }
    return handle;
  } catch (e) {
    if (!(e?.name === "AbortError" || e?.name === "NotAllowedError")) {
      console.error(e);
    }
    return null;
  }
}

async function walkDir(dirHandle, prefix = "") {
  const results = [];
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "directory") {
      const nextPrefix = prefix ? `${prefix}/${name}` : name;
      results.push(...(await walkDir(handle, nextPrefix)));
    } else if (handle.kind === "file") {
      const relPath = prefix ? `${prefix}/${name}` : name;
      results.push({ name, handle, relPath, relDir: prefix });
    }
  }
  return results;
}

function pickBestCover(list) {
  if (!list?.length) return null;
  const order = { ".png": 0, ".jpg": 1, ".jpeg": 2, ".gif": 3 };
  return [...list].sort((a, b) => {
    const oa = order[extOf(a.name)] ?? 99;
    const ob = order[extOf(b.name)] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.name.localeCompare(b.name, "zh-CN", { numeric: true, sensitivity: "base" });
  })[0];
}

function pickBestMedia(list) {
  if (!list?.length) return null;
  const order = { ".mp4": 0, ".flac": 1, ".mp3": 2 };
  return [...list].sort((a, b) => {
    const oa = order[extOf(a.name)] ?? 99;
    const ob = order[extOf(b.name)] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.relPath.localeCompare(b.relPath, "zh-CN", { numeric: true, sensitivity: "base" });
  })[0];
}

function applyDuplicateTitleLabels(videos) {
  const groups = new Map();
  videos.forEach((v) => {
    const label = String(v.title || "").trim();
    const key = label.toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(v);
  });

  groups.forEach((list) => {
    if (list.length <= 1) return;
    list.forEach((v) => {
      const label = String(v.title || "").trim();
      const dir =
        v.relPath && v.relPath.includes("/")
          ? v.relPath.replace(/\/[^/]+$/, "")
          : v.relDir || v.relPath || v.fileName || "";
      v.titleDisplay = dir ? `${label}（${dir}）` : label;
    });
  });

  videos.forEach((v) => {
    if (!v.titleDisplay) v.titleDisplay = v.title;
  });
}

function readCategoriesFromMeta(saved) {
  if (Array.isArray(saved.categories)) return normAndSort(saved.categories);
  if (typeof saved.categories === "string") return normAndSort(splitMetaTokens(saved.categories));
  if (saved.category) return normAndSort(splitMetaTokens(saved.category));
  return [];
}

function readStringListFromMeta(saved, ...keys) {
  for (const key of keys) {
    const val = saved[key];
    if (Array.isArray(val)) return normAndSort(val);
    if (typeof val === "string") return normAndSort(splitMetaTokens(val));
  }
  return [];
}

async function scanAllFromRoot() {
  if (!state.root) {
    showToast("请先选择文件夹。");
    return;
  }

  const allFiles = await walkDir(state.root);
  const mediaFiles = [];
  const coverFiles = [];
  const lrcFiles = [];
  const videoJsonFiles = [];

  allFiles.forEach((f) => {
    const lower = f.name.toLowerCase();
    if (MEDIA_EXTS.some((ext) => lower.endsWith(ext))) {
      mediaFiles.push(f);
    } else if (COVER_EXTS.some((ext) => lower.endsWith(ext))) {
      coverFiles.push(f);
    } else if (lower.endsWith(LRC_EXT)) {
      lrcFiles.push(f);
    } else if (lower === "video.json") {
      videoJsonFiles.push(f);
    }
  });

  const savedMetaGlobal = new Map();
  const savedMetaScoped = new Map();
  for (const jsonFile of videoJsonFiles) {
    const scopeDir = jsonFile.relDir || "";
    const isRoot = !scopeDir;
    try {
      const file = await jsonFile.handle.getFile();
      const arr = JSON.parse(await file.text());
      if (!Array.isArray(arr)) continue;
      const put = (k, item) => {
        if (!k) return;
        const key = String(k);
        if (isRoot) savedMetaGlobal.set(key, item);
        else savedMetaScoped.set(`${scopeDir}::${key}`, item);
      };
      arr.forEach((item) => {
        put(item?.title, item);
        put(item?.fileName, item);
        put(item?.relPath, item);
        if (item?.fileName) put(baseNameOf(item.fileName), item);
        if (item?.title) put(baseNameOf(item.title), item);
      });
    } catch (e) {
      console.error(`解析 video.json 失败 (${jsonFile.relPath || jsonFile.name})：`, e);
    }
  }

  const coverMapScoped = new Map();
  const coverMapGlobal = new Map();
  coverFiles.forEach((f) => {
    const baseLower = baseNameOf(f.name).toLowerCase();
    const scopedKey = `${f.relDir || ""}::${baseLower}`;
    if (!coverMapScoped.has(scopedKey)) coverMapScoped.set(scopedKey, []);
    coverMapScoped.get(scopedKey).push(f);
    if (!coverMapGlobal.has(baseLower)) coverMapGlobal.set(baseLower, []);
    coverMapGlobal.get(baseLower).push(f);
  });

  const lrcMapScoped = new Map();
  const lrcMapGlobal = new Map();
  lrcFiles.forEach((f) => {
    const baseLower = baseNameOf(f.name).toLowerCase();
    const scopedKey = `${f.relDir || ""}::${baseLower}`;
    if (!lrcMapScoped.has(scopedKey)) lrcMapScoped.set(scopedKey, f);
    if (!lrcMapGlobal.has(baseLower)) lrcMapGlobal.set(baseLower, f);
  });

  const mediaByScope = new Map();
  mediaFiles.forEach((f) => {
    const baseLower = baseNameOf(f.name).toLowerCase();
    const key = `${f.relDir || ""}::${baseLower}`;
    if (!mediaByScope.has(key)) mediaByScope.set(key, []);
    mediaByScope.get(key).push(f);
  });

  const videos = [];

  for (const [, group] of [...mediaByScope.entries()].sort((a, b) =>
    a[0].localeCompare(b[0], "zh-CN", { numeric: true, sensitivity: "base" }),
  )) {
    const fileItem = pickBestMedia(group);
    if (!fileItem) continue;

    const base = baseNameOf(fileItem.name);
    const baseLower = base.toLowerCase();
    const relDir = fileItem.relDir || "";
    const relPath = fileItem.relPath || fileItem.name;

    const file = await fileItem.handle.getFile();
    const url = URL.createObjectURL(file);

    let coverUrl = null;
    let coverFileName = null;
    const scopedCovers =
      coverMapScoped.get(`${relDir}::${baseLower}`) || coverMapGlobal.get(baseLower) || [];
    const bestCover = pickBestCover(scopedCovers);
    if (bestCover) {
      const coverFile = await bestCover.handle.getFile();
      coverUrl = URL.createObjectURL(coverFile);
      coverFileName = bestCover.name;
    }

    let lrcUrl = null;
    let lrcFileName = null;
    const lrcItem =
      lrcMapScoped.get(`${relDir}::${baseLower}`) || lrcMapGlobal.get(baseLower) || null;
    if (lrcItem) {
      const lrcFile = await lrcItem.handle.getFile();
      lrcUrl = URL.createObjectURL(lrcFile);
      lrcFileName = lrcItem.name;
    }

    const scopedGet = (k) => savedMetaScoped.get(`${relDir}::${String(k)}`);
    const saved =
      scopedGet(base) ||
      scopedGet(fileItem.name) ||
      scopedGet(relPath) ||
      savedMetaGlobal.get(base) ||
      savedMetaGlobal.get(fileItem.name) ||
      savedMetaGlobal.get(relPath) ||
      {};

    const themeBg = U.normalizeHexColor(saved.themeBg) || theme.themeColor;
    const themeFg = U.normalizeHexColor(saved.themeFg) || theme.componentColor;

    videos.push({
      id: videos.length,
      title: saved.title || base,
      titleDisplay: saved.title || base,
      fileName: fileItem.name,
      relPath,
      url,
      categories: readCategoriesFromMeta(saved),
      authors: readStringListFromMeta(saved, "authors", "author"),
      roles: readStringListFromMeta(saved, "roles", "role"),
      tags: readStringListFromMeta(saved, "tags", "labels"),
      level: normalizeLevel(saved.level),
      themeBg,
      themeFg,
      coverUrl,
      coverFileName,
      lrcUrl,
      lrcFileName,
    });
  }

  videos.sort((a, b) =>
    a.title.localeCompare(b.title, "zh-CN", { numeric: true, sensitivity: "base" }) ||
    a.relPath.localeCompare(b.relPath, "zh-CN", { numeric: true, sensitivity: "base" }),
  );
  applyDuplicateTitleLabels(videos);
  videos.forEach((v, index) => {
    v.id = index;
  });

  revokeVideoObjectUrls(state.videos);
  state.videos = videos;
  state.currentIndex = videos.length ? 0 : -1;
  if (state.playMode === "shuffle") regenerateShuffleOrder();

  if (state.currentIndex >= 0) {
    const v = state.videos[state.currentIndex];
    if (v?.url) setVideoSource(v.url);
  } else {
    setVideoSource("");
  }

  renderInfoView({ bumpTheme: false, refreshCover: true });
  renderPlaylist();
  buildAllFilterPanels();

  let msg = `已导入 ${videos.length} 首歌曲`;
  showToast(msg);
}

async function openImportFolderPicker() {
  const rootHandle = await pickRootFolder();
  if (!rootHandle) return;
  state.root = rootHandle;
  await scanAllFromRoot();
}

function buildVideoJsonPayload() {
  return state.videos.map((v) => {
    const item = {
      title: v.title,
      fileName: v.fileName,
      relPath: v.relPath,
      categories: v.categories || [],
      authors: v.authors || [],
      roles: v.roles || [],
      tags: v.tags || [],
      level: normalizeLevel(v.level),
      themeBg: v.themeBg,
      themeFg: v.themeFg,
    };
    if (v.coverFileName) item.coverFileName = v.coverFileName;
    if (v.lrcFileName) item.lrcFileName = v.lrcFileName;
    return item;
  });
}

async function exportVideoJson() {
  if (!state.videos.length) {
    showToast("当前没有可导出的数据。");
    return;
  }

  const dataStr = JSON.stringify(buildVideoJsonPayload(), null, 2);

  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        startIn: "videos",
        suggestedName: "video.json",
        types: [
          {
            description: "JSON 文件",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(dataStr);
      await writable.close();
      showToast("已导出 video.json 文件。");
      return;
    } catch (e) {
      if (e?.name === "AbortError" || e?.name === "NotAllowedError") {
        showToast("已取消导出");
        return;
      }
      console.error(e);
    }
  }

  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "video.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("已下载 video.json 文件。");
}

function normalizeLevel(n) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return 1;
  return Math.min(LEVEL_MAX, Math.max(1, x));
}

function getCurrentVideo() {
  const i = state.currentIndex;
  if (i < 0 || i >= state.videos.length) return null;
  return state.videos[i];
}

function isVideoPlaying(index) {
  return (
    state.currentIndex === index &&
    dom.videoEl &&
    !dom.videoEl.paused &&
    !dom.videoEl.ended
  );
}

function getPlayIconSvg(index) {
  return isVideoPlaying(index) ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
}

function isMainVideoPlaying() {
  return (
    !!dom.videoEl &&
    !!dom.videoEl.src &&
    !dom.videoEl.paused &&
    !dom.videoEl.ended
  );
}

function wrapPlayPauseIconForSplit(svgMarkup) {
  const m = svgMarkup.match(/<svg([^>]*)>([\s\S]*)<\/svg>/i);
  if (!m) return svgMarkup;
  const attrs = m[1];
  const inner = m[2];
  return `<span class="player-ctrl-split-icon" aria-hidden="true"><svg class="player-ctrl-split-icon__layer player-ctrl-split-icon__layer--left"${attrs}>${inner}</svg><svg class="player-ctrl-split-icon__layer player-ctrl-split-icon__layer--right"${attrs}>${inner}</svg></span>`;
}

function syncPlayPauseButton() {
  if (!dom.btnPlayPause) return;
  const playing = isMainVideoPlaying();
  const iconSvg = playing ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
  dom.btnPlayPause.innerHTML = window.SplitColor?.isActive?.()
    ? wrapPlayPauseIconForSplit(iconSvg)
    : iconSvg;
  const label = playing ? "暂停" : "播放";
  dom.btnPlayPause.title = label;
  dom.btnPlayPause.setAttribute("aria-label", label);
  if (window.SplitColor?.isActive?.()) window.SplitColor.refresh();
}

function playPreviousTrack() {
  playAdjacentTrack(-1);
}

function playNextTrack() {
  playAdjacentTrack(1);
}

function getShuffleFingerprint() {
  return getFilteredIndices().join(",");
}

function shuffleIndices(indices) {
  const list = indices.slice();
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function regenerateShuffleOrder() {
  state.shuffleFingerprint = getShuffleFingerprint();
  const indices = getFilteredIndices();
  state.shuffleOrder = indices.length ? shuffleIndices(indices) : [];
}

function syncShuffleOrder() {
  if (state.playMode !== "shuffle") return;
  if (state.shuffleFingerprint !== getShuffleFingerprint()) {
    regenerateShuffleOrder();
  }
}

function resolveManualTrackIndex(direction) {
  const list = getFilteredIndices();
  if (!list.length) return null;
  const cur = state.currentIndex;

  if (state.playMode === "list") {
    if (cur < 0) return list[0];
    const pos = list.indexOf(cur);
    if (pos === -1) return list[0];
    if (direction < 0) return list[pos <= 0 ? list.length - 1 : pos - 1];
    return list[pos >= list.length - 1 ? 0 : pos + 1];
  }

  syncShuffleOrder();
  const order = state.shuffleOrder;
  if (!order.length) return list[0];
  const pos = order.indexOf(cur);
  if (pos === -1) return order[0];
  if (direction < 0) {
    return pos <= 0 ? order[order.length - 1] : order[pos - 1];
  }
  if (pos >= order.length - 1) {
    regenerateShuffleOrder();
    return state.shuffleOrder[0] ?? list[0];
  }
  return order[pos + 1];
}

function resolveAutoNextIndex() {
  const list = getFilteredIndices();
  if (!list.length) return null;
  const cur = state.currentIndex;

  if (state.playMode === "list") {
    if (cur < 0) return list[0];
    const pos = list.indexOf(cur);
    if (pos === -1) return list[0];
    return list[pos >= list.length - 1 ? 0 : pos + 1];
  }

  syncShuffleOrder();
  const order = state.shuffleOrder;
  if (!order.length) return list[0];
  const pos = order.indexOf(cur);
  if (pos === -1) return order[0];
  if (pos >= order.length - 1) {
    regenerateShuffleOrder();
    return state.shuffleOrder[0] ?? list[0];
  }
  return order[pos + 1];
}

function replayCurrentInSingleMode() {
  if (!state.videos.length) {
    showToast("列表为空");
    return;
  }
  if (state.currentIndex < 0) {
    setCurrentIndex(0);
    return;
  }
  if (!dom.videoEl) return;
  resumeAudioContext();
  try {
    dom.videoEl.currentTime = 0;
  } catch {
    /* ignore */
  }
  dom.videoEl.play().catch(() => {});
  syncPlayPauseButton();
  renderPlaylist();
}

function playAdjacentTrack(direction) {
  const filtered = getFilteredIndices();
  if (!filtered.length) {
    showToast(state.videos.length ? "当前筛选结果为空" : "列表为空");
    return;
  }
  if (state.playMode === "single") {
    replayCurrentInSingleMode();
    return;
  }
  const idx = resolveManualTrackIndex(direction);
  if (idx === null) return;
  setCurrentIndex(idx);
}

function applyPlaybackRate() {
  if (!dom.videoEl) return;
  dom.videoEl.playbackRate = state.playbackRate;
  if (dom.videoBackdrop) dom.videoBackdrop.playbackRate = state.playbackRate;
}

function cyclePlaybackSpeed() {
  let rate = state.playbackRate;
  if (rate < 2) {
    rate = Math.min(2, Math.round((rate + 0.25) * 100) / 100);
  } else {
    rate = 1;
  }
  state.playbackRate = rate;
  applyPlaybackRate();
  showToast(`播放速度：${rate.toFixed(2)}x`);
}

function applyPlayModeUi() {
  if (!dom.btnPlayMode) return;
  const iconByMode = {
    shuffle: PLAY_MODE_SHUFFLE_SVG,
    list: PLAY_MODE_LIST_SVG,
    single: PLAY_MODE_SINGLE_SVG,
  };
  const label = PLAY_MODE_LABELS[state.playMode] || PLAY_MODE_LABELS.shuffle;
  dom.btnPlayMode.innerHTML = iconByMode[state.playMode] || PLAY_MODE_SHUFFLE_SVG;
  dom.btnPlayMode.title = label;
  dom.btnPlayMode.setAttribute("aria-label", label);
}

function togglePlayMode() {
  const modes = ["shuffle", "list", "single"];
  const curIndex = modes.indexOf(state.playMode);
  state.playMode = modes[(curIndex + 1) % modes.length];
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  applyPlayModeUi();
  showToast(PLAY_MODE_LABELS[state.playMode]);
}

async function togglePictureInPicture() {
  const video = dom.videoEl;
  if (!video?.src) {
    showToast("暂无正在播放的视频");
    return;
  }
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }
    if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
      await video.requestPictureInPicture();
      return;
    }
    showToast("当前浏览器不支持小窗播放");
  } catch (err) {
    console.error(err);
    showToast("小窗播放失败");
  }
}

async function toggleFullscreen() {
  const video = dom.videoEl;
  const target = dom.playerZoneVideo || video;
  if (!target) return;

  const doc = document;
  const fsEl = doc.fullscreenElement || doc.webkitFullscreenElement;

  try {
    if (fsEl) {
      if (doc.exitFullscreen) await doc.exitFullscreen();
      else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
      return;
    }
    if (target.requestFullscreen) await target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else showToast("当前浏览器不支持全屏");
  } catch (err) {
    console.error(err);
    showToast("全屏失败");
  }
}

function locateCurrentInPlaylist() {
  if (state.currentIndex < 0) {
    showToast("暂无正在播放的视频");
    return;
  }
  if (!getFilteredIndices().includes(state.currentIndex)) {
    showToast("当前视频不在筛选结果中，请清空或调整筛选");
    return;
  }
  requestAnimationFrame(() => {
    const card = dom.playlistGrid?.querySelector(
      `[data-video-index="${state.currentIndex}"]`,
    );
    if (!card) {
      showToast("未在列表中找到当前视频");
      return;
    }
    const scrollBox = dom.playlistGrid;
    if (!scrollBox) return;
    const boxRect = scrollBox.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const targetTop =
      scrollBox.scrollTop +
      (cardRect.top - boxRect.top) -
      (scrollBox.clientHeight - cardRect.height) / 2;
    scrollBox.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  });
}

function handleVideoEnded() {
  if (!state.videos.length) {
    syncPlayPauseButton();
    renderPlaylist();
    return;
  }
  if (state.playMode === "single") {
    if (!dom.videoEl) return;
    try {
      dom.videoEl.currentTime = 0;
    } catch {
      /* ignore */
    }
    dom.videoEl.play().catch(() => {});
    syncPlayPauseButton();
    renderPlaylist();
    return;
  }
  const nextIdx = resolveAutoNextIndex();
  if (nextIdx !== null) setCurrentIndex(nextIdx);
  else {
    syncPlayPauseButton();
    renderPlaylist();
  }
}

function togglePlayPause() {
  const filtered = getFilteredIndices();
  if (!filtered.length) {
    showToast(state.videos.length ? "当前筛选结果为空" : "列表为空");
    return;
  }
  if (state.currentIndex < 0 || !filtered.includes(state.currentIndex)) {
    setCurrentIndex(filtered[0]);
    return;
  }
  if (!dom.videoEl) return;
  resumeAudioContext();
  if (dom.videoEl.paused || dom.videoEl.ended) {
    if (dom.videoEl.ended) {
      try {
        dom.videoEl.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    dom.videoEl.play().catch(() => {});
  } else {
    dom.videoEl.pause();
  }
  syncPlayPauseButton();
  renderPlaylist();
}

function setVideoSource(url) {
  const main = dom.videoEl;
  const bg = dom.videoBackdrop;
  if (!main) return;

  dom.playerZoneVideo?.classList.remove("is-backdrop-ready");

  if (url) {
    main.src = url;
    main.load();
    if (bg) {
      bg.src = url;
      bg.load();
    }
  } else {
    main.removeAttribute("src");
    main.load();
    if (bg) {
      bg.removeAttribute("src");
      bg.load();
    }
  }
}

function syncVideoBackdropTime() {
  const main = dom.videoEl;
  const bg = dom.videoBackdrop;
  if (!main || !bg || !main.src || bg.readyState < 1) return;
  if (Math.abs(bg.currentTime - main.currentTime) > 0.2) {
    try {
      bg.currentTime = main.currentTime;
    } catch {
      /* ignore */
    }
  }
}

function syncVideoBackdropPlayback() {
  const main = dom.videoEl;
  const bg = dom.videoBackdrop;
  if (!main || !bg || !main.src) return;
  syncVideoBackdropTime();
  if (main.paused || main.ended) {
    bg.pause();
    return;
  }
  if (bg.paused) {
    bg.play().catch(() => {});
  }
}

function onMainVideoBackdropReady() {
  if (!dom.videoEl?.src) return;
  dom.playerZoneVideo?.classList.add("is-backdrop-ready");
  syncVideoBackdropPlayback();
}

function bindVideoBackdropSync() {
  const main = dom.videoEl;
  const bg = dom.videoBackdrop;
  if (!main || !bg || main.dataset.backdropBound) return;
  main.dataset.backdropBound = "1";

  const sync = () => syncVideoBackdropPlayback();
  main.addEventListener("loadeddata", onMainVideoBackdropReady);
  main.addEventListener("play", sync);
  main.addEventListener("pause", sync);
  main.addEventListener("seeking", syncVideoBackdropTime);
  main.addEventListener("seeked", sync);
  main.addEventListener("timeupdate", syncVideoBackdropTime);
  main.addEventListener("ratechange", () => {
    bg.playbackRate = main.playbackRate;
  });
  bg.addEventListener("loadeddata", onMainVideoBackdropReady);
}

function cloneVideoMeta(v) {
  return {
    categories: [...(v.categories || [])],
    authors: [...(v.authors || [])],
    roles: [...(v.roles || [])],
    level: normalizeLevel(v?.level),
    themeBg: v.themeBg,
    themeFg: v.themeFg,
  };
}

function getInfoEditMeta() {
  const v = getCurrentVideo();
  if (!v) return null;
  if (infoUi.editing && infoUi.editWork) return infoUi.editWork;
  return v;
}

function applyVideoMetaToVideo(v, meta) {
  if (!v || !meta) return;
  v.categories = [...meta.categories];
  v.authors = [...meta.authors];
  v.roles = [...meta.roles];
  v.level = normalizeLevel(meta.level);
  v.themeBg = meta.themeBg;
  v.themeFg = meta.themeFg;
}

function revertInfoEditDraft() {
  const v = getCurrentVideo();
  const snap = infoUi.editSnapshot;
  if (!v || !snap) return;
  applyVideoMetaToVideo(v, snap);
  if (v.themeBg && v.themeFg) {
    applyTheme(v.themeBg, v.themeFg);
  }
}

function clearInfoEditSession() {
  infoUi.editSnapshot = null;
  infoUi.editWork = null;
}

/** 编辑模式中切歌：丢弃上一首未保存草稿，载入当前曲目的元数据 */
function syncInfoEditSessionToCurrentVideo() {
  if (!infoUi.editing) return;
  const v = getCurrentVideo();
  if (!v) {
    clearInfoEditSession();
    return;
  }
  const meta = cloneVideoMeta(v);
  infoUi.editSnapshot = meta;
  infoUi.editWork = cloneVideoMeta(v);
}

/* ---------- 搜索与筛选 ---------- */

function sanitizeCategoryFilterSelection() {
  filterSelection.category.delete(FILTER_CATEGORY_LEGACY_UNCATEGORIZED);
}

function getAllFilterValuesInLibrary(kind) {
  const values = new Set();
  if (kind === "level") {
    for (let i = 1; i <= LEVEL_MAX; i++) values.add(String(i));
    return values;
  }
  state.videos.forEach((v) => {
    filterFieldValues(v, kind).forEach((x) => {
      if (kind === "category" && isExcludedFilterCategory(x)) return;
      values.add(String(x).trim());
    });
  });
  if (countEmptyField(kind) > 0) values.add(FILTER_NONE);
  return values;
}

/** 移除库中已不存在的筛选项；保留仍有效但当前计数为 0 的已选项供取消 */
function sanitizeFilterSelection() {
  sanitizeCategoryFilterSelection();
  for (const kind of ["category", "author", "role", "level"]) {
    const set = getFilterSet(kind);
    if (!set?.size) continue;
    const valid = getAllFilterValuesInLibrary(kind);
    for (const key of [...set]) {
      if (!valid.has(key)) set.delete(key);
    }
  }
}

function mergeSelectedFilterOptions(kind, options, countFn) {
  const set = getFilterSet(kind);
  if (!set?.size) return options;
  const existing = new Set(options.map((o) => o.value));
  const extras = [];
  for (const value of set) {
    const key = String(value);
    if (existing.has(key)) continue;
    extras.push({
      value: key,
      count: countFn(key),
      label:
        key === FILTER_NONE
          ? "暂无"
          : kind === "level"
            ? levelFilterLabel(key)
            : formatUserFacingText(key),
    });
  }
  if (!extras.length) return options;
  return [...extras, ...options];
}

function isExcludedFilterCategory(value) {
  return String(value).trim() === FILTER_CATEGORY_LEGACY_UNCATEGORIZED;
}

function getFilterSet(kind) {
  return filterSelection[kind] || null;
}

function filterFieldValues(v, kind) {
  if (kind === "category") {
    return (v.categories || []).map((s) => String(s).trim()).filter(Boolean);
  }
  if (kind === "author") {
    return (v.authors || []).map((s) => String(s).trim()).filter(Boolean);
  }
  if (kind === "role") {
    return (v.roles || []).map((s) => String(s).trim()).filter(Boolean);
  }
  return [];
}

function matchesSetWithNone(set, values, displayValues = null) {
  if (!set?.size) return true;
  const wantsEmpty = set.has(FILTER_NONE);
  const wantsValues = [...set].filter((k) => k !== FILTER_NONE);
  const matchEmpty = wantsEmpty && values.length === 0;
  const matchValues =
    wantsValues.length > 0 &&
    (displayValues || values).some((x) => wantsValues.includes(String(x)));
  if (wantsEmpty && wantsValues.length === 0) return values.length === 0;
  if (!wantsEmpty && wantsValues.length > 0) return matchValues;
  if (wantsEmpty && wantsValues.length > 0) return matchEmpty || matchValues;
  return true;
}

function videoMatchesMetaFilter(v, kind) {
  const set = getFilterSet(kind);
  if (!set?.size) return true;
  return matchesSetWithNone(set, filterFieldValues(v, kind));
}

function videoMatchesCategoryFilter(v) {
  return videoMatchesMetaFilter(v, "category");
}

function videoMatchesAuthorFilter(v) {
  return videoMatchesMetaFilter(v, "author");
}

function videoMatchesRoleFilter(v) {
  return videoMatchesMetaFilter(v, "role");
}

function countEmptyField(kind) {
  if (kind === "level") return 0;
  return state.videos.filter((v) => filterFieldValues(v, kind).length === 0).length;
}

function filterDisplayLabel(key, kind) {
  if (key === FILTER_NONE) return "暂无";
  if (kind === "level") return levelFilterLabel(key);
  return formatUserFacingText(key);
}

function matchesFilterLevel(set, level) {
  if (!set?.size) return true;
  return set.has(String(normalizeLevel(level)));
}

function levelFilterLabel(level) {
  const n = normalizeLevel(level);
  return `${"♥".repeat(n)}${"♡".repeat(LEVEL_MAX - n)}`;
}

function createLevelHeartsEl(level) {
  const n = normalizeLevel(level);
  const wrap = document.createElement("span");
  wrap.className = "level-filter-hearts";
  for (let i = 1; i <= LEVEL_MAX; i++) {
    const slot = document.createElement("span");
    slot.className = "level-filter-heart-slot";
    if (i <= n) slot.classList.add("is-on");
    slot.innerHTML = LEVEL_FILTER_HEART_SVG;
    wrap.appendChild(slot);
  }
  return wrap;
}

function setLevelFilterLabelEl(el, level, suffix = "") {
  if (!el) return;
  el.textContent = "";
  el.classList.add("level-filter-label-wrap");
  el.appendChild(createLevelHeartsEl(level));
  if (suffix) {
    const extra = document.createElement("span");
    extra.className = "level-filter-label-suffix";
    extra.textContent = suffix;
    el.appendChild(extra);
  }
}

function searchKeyword() {
  return dom.searchInput?.value.trim() || "";
}

function videoMatchesSearchKeyword(v, keyword) {
  if (!keyword) return true;
  const title = String(v.title || v.titleDisplay || "");
  if (title.includes(keyword) || formatUserFacingText(title).includes(keyword)) {
    return true;
  }
  const lv = normalizeLevel(v.level ?? 1);
  if (String(lv).includes(keyword) || levelFilterLabel(lv).includes(keyword)) {
    return true;
  }
  const hit = (arr) =>
    Array.isArray(arr) &&
    arr.some((x) => {
      const raw = String(x ?? "");
      return raw.includes(keyword) || formatUserFacingText(raw).includes(keyword);
    });
  return (
    hit(filterFieldValues(v, "category")) ||
    hit(v.authors) ||
    hit(v.roles) ||
    hit(v.tags)
  );
}

function videoPassesFilters(v, keyword = searchKeyword()) {
  if (keyword && !videoMatchesSearchKeyword(v, keyword)) return false;
  if (!videoMatchesCategoryFilter(v)) return false;
  if (!videoMatchesAuthorFilter(v)) return false;
  if (!videoMatchesRoleFilter(v)) return false;
  if (!matchesFilterLevel(filterSelection.level, v.level)) return false;
  return true;
}

function getFilteredIndices() {
  const keyword = searchKeyword();
  const indices = [];
  state.videos.forEach((v, index) => {
    if (videoPassesFilters(v, keyword)) indices.push(index);
  });
  return indices;
}

function buildFilterPools() {
  const baseVideos = state.videos.filter((v) => videoMatchesCategoryFilter(v));

  const videosForAuthors = baseVideos.filter((v) => {
    if (filterSelection.role.size && !videoMatchesRoleFilter(v)) return false;
    if (
      filterSelection.level.size &&
      !filterSelection.level.has(String(normalizeLevel(v.level)))
    ) {
      return false;
    }
    return true;
  });

  const videosForRoles = baseVideos.filter((v) => {
    if (filterSelection.author.size && !videoMatchesAuthorFilter(v)) return false;
    if (
      filterSelection.level.size &&
      !filterSelection.level.has(String(normalizeLevel(v.level)))
    ) {
      return false;
    }
    return true;
  });

  const videosForLevels = baseVideos.filter((v) => {
    if (filterSelection.author.size && !videoMatchesAuthorFilter(v)) return false;
    if (filterSelection.role.size && !videoMatchesRoleFilter(v)) return false;
    return true;
  });

  const categories = new Set();
  state.videos.forEach((v) => {
    filterFieldValues(v, "category").forEach((c) => {
      if (!isExcludedFilterCategory(c)) categories.add(c);
    });
  });

  const authors = new Set();
  videosForAuthors.forEach((v) => {
    (v.authors || []).forEach((a) => authors.add(a));
  });

  const roles = new Set();
  videosForRoles.forEach((v) => {
    (v.roles || []).forEach((r) => roles.add(r));
  });

  const levels = new Set();
  for (let i = 1; i <= LEVEL_MAX; i++) levels.add(String(i));

  const countCategory = (cat) =>
    state.videos.filter((v) => filterFieldValues(v, "category").includes(cat)).length;
  const countAuthor = (author) =>
    author === FILTER_NONE
      ? countEmptyField("author")
      : videosForAuthors.filter((v) => (v.authors || []).includes(author)).length;
  const countRole = (role) =>
    role === FILTER_NONE
      ? countEmptyField("role")
      : videosForRoles.filter((v) => (v.roles || []).includes(role)).length;
  const countLevel = (level) =>
    videosForLevels.filter((v) => String(normalizeLevel(v.level)) === String(level)).length;

  return {
    categories,
    authors,
    roles,
    levels,
    countCategory,
    countAuthor,
    countRole,
    countLevel,
    countEmptyCategory: countEmptyField("category"),
    countEmptyAuthor: countEmptyField("author"),
    countEmptyRole: countEmptyField("role"),
  };
}

function appendEmptyFilterOption(kind, options, pools) {
  if (kind === "level") return options;
  const countByKind = {
    category: pools.countEmptyCategory,
    author: pools.countEmptyAuthor,
    role: pools.countEmptyRole,
  };
  const count = countByKind[kind] ?? 0;
  if (count <= 0) return options;
  return [{ value: FILTER_NONE, count, label: "暂无" }, ...options];
}

function sortFilterOptions(items, countFn, fixedNumeric = false) {
  return [...items]
    .map((value) => ({ value, count: countFn(value) }))
    .filter((item) => item.count > 0)
    .sort((a, b) => {
      if (fixedNumeric) return Number(a.value) - Number(b.value);
      if (b.count !== a.count) return b.count - a.count;
      return String(a.value).localeCompare(String(b.value), "zh-CN", {
        numeric: true,
        sensitivity: "base",
      });
    });
}

function getFilterPanelDef(kind) {
  return FILTER_PANELS.find((item) => item.kind === kind) || null;
}

function getFilterPanelElements(kind) {
  const def = getFilterPanelDef(kind);
  if (!def) return null;
  return {
    def,
    btn: document.getElementById(def.btnId),
    panel: document.getElementById(def.panelId),
    labelEl: document.getElementById(def.btnId)?.querySelector(".toolbar-filter-label"),
  };
}

function collectFilterOptions(kind) {
  const pools = buildFilterPools();
  if (kind === "level") {
    return mergeSelectedFilterOptions(
      kind,
      sortFilterOptions(pools.levels, pools.countLevel, true).map((item) => ({
        value: String(item.value),
        count: item.count,
        label: levelFilterLabel(item.value),
      })),
      pools.countLevel,
    );
  }
  const poolMap = {
    category: [pools.categories, pools.countCategory],
    author: [pools.authors, pools.countAuthor],
    role: [pools.roles, pools.countRole],
  };
  const [values, countFn] = poolMap[kind] || [];
  if (!values) return [];
  return mergeSelectedFilterOptions(
    kind,
    appendEmptyFilterOption(
      kind,
      sortFilterOptions(values, countFn).map((item) => ({
        value: String(item.value),
        count: item.count,
        label: formatUserFacingText(item.value),
      })),
      pools,
    ),
    countFn,
  );
}

function updateFilterButtonLabels() {
  FILTER_PANELS.forEach(({ kind, defaultLabel }) => {
    const { labelEl } = getFilterPanelElements(kind) || {};
    if (!labelEl) return;
    const set = getFilterSet(kind);
    if (!set?.size) {
      labelEl.textContent = defaultLabel;
      labelEl.classList.remove("level-filter-label-wrap");
      return;
    }
    if (set.size === 1) {
      const only = [...set][0];
      if (kind === "level") {
        setLevelFilterLabelEl(labelEl, only);
      } else {
        labelEl.textContent = filterDisplayLabel(only, kind);
        labelEl.classList.remove("level-filter-label-wrap");
      }
      return;
    }
    labelEl.textContent = `${defaultLabel} (${set.size})`;
    labelEl.classList.remove("level-filter-label-wrap");
  });
}

function setFilterOptionLabel(btn, text) {
  btn.textContent = "";
  btn.removeAttribute("data-split-label");
  if (!window.SplitColor?.isActive?.()) {
    btn.textContent = text;
    return;
  }
  btn.setAttribute("data-split-label", text);
  const wrap = document.createElement("span");
  wrap.className = "toolbar-filter-split-wrap";
  const left = document.createElement("span");
  left.className = "toolbar-filter-split-text toolbar-filter-split-text--left";
  const right = document.createElement("span");
  right.className = "toolbar-filter-split-text toolbar-filter-split-text--right";
  left.textContent = text;
  right.textContent = text;
  wrap.append(left, right);
  btn.append(wrap);
}

function buildFilterPanel(kind, panelOptions = {}) {
  const { panel } = getFilterPanelElements(kind) || {};
  if (!panel) return;
  sanitizeFilterSelection();
  const set = getFilterSet(kind);
  panel.innerHTML = "";
  const options = collectFilterOptions(kind);
  if (!options.length) {
    const empty = document.createElement("div");
    empty.className = "toolbar-filter-option";
    empty.setAttribute("aria-disabled", "true");
    setFilterOptionLabel(empty, "暂无可选项");
    panel.appendChild(empty);
    return;
  }
  options.forEach(({ value, count, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "toolbar-filter-option";
    btn.setAttribute("role", "option");
    const selected = set?.has(value);
    btn.setAttribute("aria-selected", selected ? "true" : "false");
    btn.dataset.filterValue = value;
    if (kind === "level") {
      setLevelFilterLabelEl(btn, value, ` (${count})`);
    } else {
      setFilterOptionLabel(btn, `${label} (${count})`);
    }
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFilterValue(kind, value);
    });
    panel.appendChild(btn);
  });
  if (!panelOptions.skipSplitRefresh) window.SplitColor?.refresh?.();
}

function buildAllFilterPanels() {
  sanitizeFilterSelection();
  FILTER_PANELS.forEach(({ kind }) => buildFilterPanel(kind));
  updateFilterButtonLabels();
}

function refreshFilterPanelSelection(kind) {
  const { panel } = getFilterPanelElements(kind) || {};
  if (!panel) return;
  const set = getFilterSet(kind);
  panel.querySelectorAll(".toolbar-filter-option[role='option']").forEach((btn) => {
    const value = btn.dataset.filterValue;
    if (value === undefined) return;
    btn.setAttribute("aria-selected", set?.has(value) ? "true" : "false");
  });
}

function closeFilterPanel() {
  if (!filterUi.openKind) return;
  const { btn, panel } = getFilterPanelElements(filterUi.openKind) || {};
  panel?.setAttribute("hidden", "");
  btn?.setAttribute("aria-expanded", "false");
  filterUi.openKind = null;
  document.getElementById("toolbarFilterLayer")?.setAttribute("aria-hidden", "true");
}

function getFilterPanelLayer() {
  return document.getElementById("toolbarFilterLayer");
}

function syncFilterPanelPosition(panel, btn) {
  if (!panel || !btn) return;
  const rect = btn.getBoundingClientRect();
  panel.style.position = "fixed";
  panel.style.left = `${rect.left}px`;
  panel.style.top = `${rect.bottom + 6}px`;
  panel.style.width = `${rect.width}px`;
  panel.style.right = "auto";
}

function mountFilterPanelToLayer(panel, btn) {
  const layer = getFilterPanelLayer();
  if (!layer || !panel || !btn) return;
  if (panel.parentElement !== layer) {
    layer.appendChild(panel);
  }
  syncFilterPanelPosition(panel, btn);
  layer.setAttribute("aria-hidden", "false");
  window.SplitColor?.refresh?.();
}

function scrollFilterPanelSelectionToCenter(panel) {
  if (!panel) return;
  const scrollSelected = () => {
    const selected = panel.querySelector(
      '.toolbar-filter-option[role="option"][aria-selected="true"]',
    );
    if (selected) {
      selected.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    }
  };
  requestAnimationFrame(() => {
    scrollSelected();
    requestAnimationFrame(scrollSelected);
  });
}

function openFilterPanel(kind) {
  if (filterUi.openKind === kind) {
    closeFilterPanel();
    return;
  }
  closeFilterPanel();
  buildFilterPanel(kind);
  const { btn, panel } = getFilterPanelElements(kind) || {};
  if (!panel || !btn) return;
  mountFilterPanelToLayer(panel, btn);
  panel.hidden = false;
  btn.setAttribute("aria-expanded", "true");
  filterUi.openKind = kind;
  scrollFilterPanelSelectionToCenter(panel);
}

function applyFiltersFromUi() {
  sanitizeFilterSelection();
  const openKind = filterUi.openKind;
  let openScrollTop = 0;
  let openPanel = null;

  if (openKind) {
    openPanel = getFilterPanelElements(openKind)?.panel;
    if (openPanel) openScrollTop = openPanel.scrollTop;
    FILTER_PANELS.forEach(({ kind }) => {
      if (kind === openKind) refreshFilterPanelSelection(kind);
      else buildFilterPanel(kind, { skipSplitRefresh: true });
    });
  } else {
    buildAllFilterPanels();
  }

  updateFilterButtonLabels();

  renderInfoView();
  renderPlaylist();

  if (openKind && openPanel) {
    const top = openScrollTop;
    requestAnimationFrame(() => {
      openPanel.scrollTop = top;
      requestAnimationFrame(() => {
        openPanel.scrollTop = top;
      });
    });
  }
}

function toggleFilterValue(kind, value, options = {}) {
  const set = getFilterSet(kind);
  if (!set) return;
  const key = value === FILTER_NONE ? FILTER_NONE : String(value).trim();
  if (!key) return;
  if (kind === "category" && isExcludedFilterCategory(key)) return;
  const wasSelected = set.has(key);
  if (wasSelected) set.delete(key);
  else set.add(key);
  applyFiltersFromUi();
  if (options.silentToast) return;
  const label = filterDisplayLabel(key, kind);
  showToast(wasSelected ? `已取消筛选：${label}` : `已筛选：${label}`);
}

function bindFilterEvents() {
  FILTER_PANELS.forEach(({ kind, btnId }) => {
    const btn = document.getElementById(btnId);
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      openFilterPanel(kind);
    });
  });

  dom.searchInput?.addEventListener("input", () => {
    renderPlaylist();
  });

  document.querySelectorAll(".toolbar-filter-panel").forEach((panel) => {
    panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  document.addEventListener("click", () => {
    closeFilterPanel();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFilterPanel();
  });

  window.addEventListener("resize", () => {
    if (!filterUi.openKind) return;
    const { btn, panel } = getFilterPanelElements(filterUi.openKind) || {};
    syncFilterPanelPosition(panel, btn);
  });
}

/* ---------- 视频信息：标签 ---------- */

function renderChips(container, items, kind) {
  if (!container) return;
  container.innerHTML = "";
  const list = (items || []).map((s) => String(s).trim()).filter(Boolean);
  const set =
    kind === "category"
      ? filterSelection.category
      : kind === "author"
        ? filterSelection.author
        : filterSelection.role;

  if (!list.length) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-chip is-empty";
    btn.textContent = "暂无";
    if (set.has(FILTER_NONE)) btn.classList.add("is-selected");
    btn.addEventListener("click", () => {
      if (infoUi.editing) return;
      toggleFilterValue(kind, FILTER_NONE);
    });
    container.appendChild(btn);
    return;
  }

  list.forEach((raw) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-chip";
    btn.textContent = formatUserFacingText(raw);
    const key = String(raw).trim();
    if (set.has(key)) btn.classList.add("is-selected");
    btn.addEventListener("click", () => {
      if (infoUi.editing) return;
      toggleFilterValue(kind, key);
    });
    container.appendChild(btn);
  });
}

/* ---------- 视频信息：喜爱等级 ---------- */

function ensureLevelBoxes() {
  if (!dom.infoLevel) return;
  if (
    dom.infoLevel.dataset.ready === String(LEVEL_SLOT_COUNT) &&
    dom.infoLevel.children.length === LEVEL_SLOT_COUNT
  ) {
    return;
  }
  dom.infoLevel.dataset.ready = String(LEVEL_SLOT_COUNT);
  dom.infoLevel.innerHTML = "";
  for (let i = 1; i <= LEVEL_SLOT_COUNT; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-level-box";
    btn.dataset.level = String(i);
    btn.innerHTML = LEVEL_HEART_SVG;
    if (i > LEVEL_MAX) {
      btn.classList.add("info-level-box--hidden");
      btn.disabled = true;
      btn.setAttribute("aria-hidden", "true");
      btn.tabIndex = -1;
    } else {
      btn.setAttribute("aria-label", `喜爱 ${i} 级`);
      btn.addEventListener("click", () => {
        if (!infoUi.editing || !infoUi.editWork) return;
        infoUi.editWork.level = i;
        renderLevel();
      });
    }
    dom.infoLevel.appendChild(btn);
  }
}

function renderLevel() {
  ensureLevelBoxes();
  const meta = getInfoEditMeta();
  const level = normalizeLevel(meta?.level ?? 1);
  dom.infoLevel?.querySelectorAll(".info-level-box").forEach((btn) => {
    const lv = Number(btn.dataset.level);
    if (lv > LEVEL_MAX) return;
    btn.classList.toggle("is-on", lv <= level);
  });
}

/* ---------- 取色盘 ---------- */

function drawPaletteWheel(lightness = 50) {
  const canvas = dom.infoColorWheel;
  if (!canvas) return;
  const size = canvas.width;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;
      if (dist > r) {
        image.data[i + 3] = 0;
        continue;
      }
      const hue = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
      const sat = (dist / r) * 100;
      const [rr, gg, bb] = hslToRgb(hue, sat, lightness);
      image.data[i] = rr;
      image.data[i + 1] = gg;
      image.data[i + 2] = bb;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function redrawActivePalette() {
  if (infoUi.coverViewMode === "light") drawPaletteWheel(50);
  else if (infoUi.coverViewMode === "dark") drawPaletteWheel(18);
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function pickColorFromWheel(clientX, clientY) {
  const canvas = dom.infoColorWheel;
  if (!canvas || canvas.hidden) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) / rect.width) * canvas.width);
  const y = Math.floor(((clientY - rect.top) / rect.height) * canvas.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const d = ctx.getImageData(x, y, 1, 1).data;
  if (d[3] < 128) return;
  applyPickedColor(U.rgbToHex(d[0], d[1], d[2]));
}

function pickColorFromCover(clientX, clientY) {
  const v = getCurrentVideo();
  if (!v?.coverUrl || !dom.infoCoverPickCanvas) return;
  const img = dom.infoCoverImg;
  if (!img?.complete) return;
  const size = 160;
  dom.infoCoverPickCanvas.width = size;
  dom.infoCoverPickCanvas.height = size;
  const ctx = dom.infoCoverPickCanvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, size, size);
  const coverRect = dom.infoCoverBox.getBoundingClientRect();
  const px = Math.floor(((clientX - coverRect.left) / coverRect.width) * size);
  const py = Math.floor(((clientY - coverRect.top) / coverRect.height) * size);
  const d = ctx.getImageData(px, py, 1, 1).data;
  applyPickedColor(U.rgbToHex(d[0], d[1], d[2]));
}

function applyPickedColor(hex) {
  const work = infoUi.editing ? infoUi.editWork : null;
  if (infoUi.pickTarget === "component") {
    const bg = work?.themeBg ?? getCurrentVideo()?.themeBg ?? theme.themeColor;
    applyTheme(bg, hex);
    if (work) work.themeFg = hex;
    else {
      const v = getCurrentVideo();
      if (v) v.themeFg = hex;
    }
  } else {
    const fg = work?.themeFg ?? getCurrentVideo()?.themeFg ?? theme.componentColor;
    applyTheme(hex, fg);
    if (work) work.themeBg = hex;
    else {
      const v = getCurrentVideo();
      if (v) v.themeBg = hex;
    }
  }
  updateColorPreviews();
}

function updateCoverModeButtons() {
  dom.infoCoverMode?.querySelectorAll(".info-cover-mode-btn").forEach((btn) => {
    const mode = btn.dataset.mode;
    const active = infoUi.editing
      ? infoUi.coverViewMode === mode
      : mode === "cover";
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", active ? "true" : "false");
  });
}

function setCoverViewMode(mode) {
  if (!infoUi.editing) return;
  if (mode !== "cover" && mode !== "light" && mode !== "dark") mode = "cover";
  infoUi.coverViewMode = mode;
  syncCoverDisplay();
  if (mode === "light") drawPaletteWheel(50);
  else if (mode === "dark") drawPaletteWheel(18);
}

function syncCoverDisplay() {
  const v = getCurrentVideo();
  const showWheel =
    infoUi.editing &&
    (infoUi.coverViewMode === "light" || infoUi.coverViewMode === "dark");
  dom.infoColorWheel.hidden = !showWheel;
  dom.infoCoverImg.hidden = showWheel || !v?.coverUrl;
  dom.infoCoverPlaceholder.hidden = showWheel || !!v?.coverUrl;
  updateCoverModeButtons();
}

function setPickTarget(target) {
  infoUi.pickTarget = target === "component" ? "component" : "theme";
  dom.infoThemePreview?.classList.toggle(
    "is-active-target",
    infoUi.editing && infoUi.pickTarget === "theme",
  );
  dom.infoComponentPreview?.classList.toggle(
    "is-active-target",
    infoUi.editing && infoUi.pickTarget === "component",
  );
}

/* ---------- 特殊歌曲封面折角星标 ---------- */

function createVideoSpecialBadgeEl(variant = "card") {
  const badge = document.createElement("span");
  badge.className =
    variant === "meta"
      ? "video-card-special-badge video-card-special-badge--meta"
      : "video-card-special-badge";
  badge.setAttribute("aria-hidden", "true");
  const star = document.createElement("span");
  star.className = "video-card-special-badge__star";
  star.textContent = "★";
  badge.appendChild(star);
  return badge;
}

function syncInfoCoverSpecialBadge(v) {
  if (!dom.infoCoverBox) return;
  dom.infoCoverBox.querySelector(".video-card-special-badge")?.remove();
  if (!v || !window.Special?.hasSpecialSongEffects?.(v)) return;
  dom.infoCoverBox.appendChild(createVideoSpecialBadgeEl("meta"));
}

/* ---------- 视频列表 ---------- */

function renderPlaylist() {
  if (!dom.playlistGrid) return;
  dom.playlistGrid.innerHTML = "";

  getFilteredIndices().forEach((index) => {
    const v = state.videos[index];
    if (!v) return;
    const card = document.createElement("div");
    card.className = "video-card";
    card.dataset.videoIndex = String(index);
    if (index === state.currentIndex) card.classList.add("is-current");

    const cover = document.createElement("button");
    cover.type = "button";
    cover.className = "video-card-cover";
    cover.setAttribute("aria-label", formatUserFacingText(v.title || v.titleDisplay || "") || "播放");

    const img = document.createElement("img");
    img.className = "video-card-cover-img";
    img.alt = "";
    if (v.coverUrl) {
      img.src = v.coverUrl;
    } else {
      img.hidden = true;
    }

    const icon = document.createElement("span");
    icon.className = "video-card-play-icon";
    icon.innerHTML = getPlayIconSvg(index);

    cover.append(img, icon);

    if (
      index !== state.currentIndex &&
      window.Special?.hasSpecialSongEffects?.(v)
    ) {
      cover.appendChild(createVideoSpecialBadgeEl("card"));
    }

    const title = document.createElement("span");
    title.className = "video-card-title";
    title.textContent = formatUserFacingText(v.title || v.titleDisplay || "");

    cover.addEventListener("click", () => onPlaylistCoverClick(index));
    card.append(cover, title);
    dom.playlistGrid.appendChild(card);
  });

  syncShuffleOrder();
  window.SplitColor?.refresh?.();
}

function onPlaylistCoverClick(index) {
  if (index < 0 || index >= state.videos.length) return;
  if (state.currentIndex === index) {
    if (!dom.videoEl) return;
    if (dom.videoEl.paused || dom.videoEl.ended) {
      dom.videoEl.play().catch(() => {});
    } else {
      dom.videoEl.pause();
    }
    renderPlaylist();
    return;
  }
  setCurrentIndex(index);
}

function setCurrentIndex(index) {
  if (index < 0 || index >= state.videos.length) return;
  const themeToken = noteThemeSongSwitch();
  state.currentIndex = index;
  syncInfoEditSessionToCurrentVideo();
  const v = state.videos[index];
  if (dom.videoEl && v.url) {
    setVideoSource(v.url);
    applyPlaybackRate();
    dom.videoEl.play().catch(() => {});
  }
  renderInfoView({ bumpTheme: true, refreshCover: true, themeToken });
  renderPlaylist();
  syncPlayPauseButton();
  syncProgressSlider();
  refreshMediaEffects();
}

/* ---------- 视频信息：渲染 ---------- */

function renderInfoView(options = {}) {
  const { bumpTheme = false, refreshCover = true, themeToken = themeApplyToken } = options;
  const v = getCurrentVideo();
  if (!v) {
    coverTransitionToken++;
    lastCoverSrc = null;
    if (dom.infoNameDisplay) dom.infoNameDisplay.textContent = INFO_DEFAULT_NAME;
    renderChips(dom.infoCategoryChips, [], "category");
    renderChips(dom.infoAuthorChips, [], "author");
    renderChips(dom.infoRoleChips, [], "role");
    if (dom.infoCoverImg) {
      dom.infoCoverImg.hidden = true;
      dom.infoCoverImg.removeAttribute("src");
    }
    if (dom.infoCoverPlaceholder) dom.infoCoverPlaceholder.hidden = false;
    if (dom.infoColorWheel) dom.infoColorWheel.hidden = true;
    syncInfoCoverSpecialBadge(null);
    renderLevel();
    syncCoverDisplay();
    applyTheme(DEFAULT_THEME.bgHex, DEFAULT_THEME.fgHex, { animate: false });
    return;
  }

  if (dom.infoNameDisplay) {
    dom.infoNameDisplay.textContent = formatUserFacingText(v.title || v.titleDisplay || "");
  }

  renderChips(dom.infoCategoryChips, v.categories || [], "category");
  renderChips(dom.infoAuthorChips, v.authors || [], "author");
  renderChips(dom.infoRoleChips, v.roles || [], "role");

  if (infoUi.editing && infoUi.editWork) {
    if (dom.infoCategoryInput) {
      dom.infoCategoryInput.value = joinByComma(infoUi.editWork.categories ?? []);
    }
    if (dom.infoAuthorInput) {
      dom.infoAuthorInput.value = joinByComma(infoUi.editWork.authors ?? []);
    }
    if (dom.infoRoleInput) {
      dom.infoRoleInput.value = joinByComma(infoUi.editWork.roles ?? []);
    }
  }

  if (refreshCover) {
    setCoverImage(v.coverUrl || null, {
      video: v,
      themeToken,
      animate: bumpTheme,
    });
  } else {
    const themeMeta = getInfoEditMeta();
    if (themeMeta?.themeBg && themeMeta?.themeFg) {
      applyTheme(themeMeta.themeBg, themeMeta.themeFg, { animate: false });
    }
    if (dom.infoCoverImg && v.coverUrl) {
      dom.infoCoverImg.src = v.coverUrl;
    }
    syncCoverDisplay();
  }

  renderLevel();
  setPickTarget(infoUi.pickTarget);
  syncInfoCoverSpecialBadge(v);
}

/* ---------- 编辑模式 ---------- */

function setInfoEditing(editing, options = {}) {
  const wasEditing = infoUi.editing;
  if (wasEditing && !editing && !options.commit) {
    revertInfoEditDraft();
    clearInfoEditSession();
  }

  infoUi.editing = !!editing;
  dom.infoPanelRoot?.classList.toggle("is-editing", infoUi.editing);
  dom.infoTitleBtn?.setAttribute("aria-expanded", infoUi.editing ? "true" : "false");

  const inputs = [
    dom.infoCategoryInput,
    dom.infoAuthorInput,
    dom.infoRoleInput,
  ];
  inputs.forEach((el) => {
    if (!el) return;
    el.hidden = !infoUi.editing;
  });

  if (infoUi.editing) {
    infoUi.coverViewMode = "cover";
    setPickTarget("theme");
  } else {
    infoUi.coverViewMode = "cover";
  }

  renderInfoView();
}

function toggleInfoEditing() {
  if (infoUi.editing) {
    setInfoEditing(false);
    showToast("已退出编辑模式");
    return;
  }
  const v = getCurrentVideo();
  if (!v) {
    showToast("请先选择视频");
    return;
  }
  const snap = cloneVideoMeta(v);
  infoUi.editSnapshot = snap;
  infoUi.editWork = cloneVideoMeta(v);
  setInfoEditing(true);
  showToast("已进入编辑模式");
}

function saveInfoEdit() {
  const v = getCurrentVideo();
  if (!v) return;
  if (infoUi.editing) {
    v.categories = splitByComma(dom.infoCategoryInput?.value);
    v.authors = splitByComma(dom.infoAuthorInput?.value);
    v.roles = splitByComma(dom.infoRoleInput?.value);
    if (infoUi.editWork) {
      v.level = normalizeLevel(infoUi.editWork.level);
      v.themeBg = infoUi.editWork.themeBg;
      v.themeFg = infoUi.editWork.themeFg;
    }
    if (v.themeBg && v.themeFg) {
      applyTheme(v.themeBg, v.themeFg);
    }
  }
  clearInfoEditSession();
  setInfoEditing(false, { commit: true });
  sanitizeFilterSelection();
  applyFiltersFromUi();
  showToast("保存成功");
}

/* ---------- 事件 ---------- */

function bindInfoEvents() {
  dom.infoTitleBtn?.addEventListener("click", toggleInfoEditing);

  dom.infoNameDisplay?.addEventListener("click", (e) => {
    e.stopPropagation();
    copyInfoNameToClipboard();
  });

  dom.infoNameDisplay?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopPropagation();
    copyInfoNameToClipboard();
  });

  dom.infoConfirmBtn?.addEventListener("click", saveInfoEdit);

  dom.infoCoverMode?.querySelectorAll(".info-cover-mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!infoUi.editing) return;
      setCoverViewMode(btn.dataset.mode || "cover");
    });
  });

  dom.infoThemePreview?.addEventListener("click", () => {
    if (!infoUi.editing) return;
    setPickTarget("theme");
  });

  dom.infoComponentPreview?.addEventListener("click", () => {
    if (!infoUi.editing) return;
    setPickTarget("component");
  });

  const onPick = (e) => {
    if (!infoUi.editing) return;
    if (infoUi.coverViewMode === "light" || infoUi.coverViewMode === "dark") {
      pickColorFromWheel(e.clientX, e.clientY);
    } else if (getCurrentVideo()?.coverUrl) {
      pickColorFromCover(e.clientX, e.clientY);
    }
  };

  dom.infoCoverBox?.addEventListener("click", onPick);
  dom.infoColorWheel?.addEventListener("click", onPick);

  drawPaletteWheel(50);
  syncInfoWheelSize();
  window.addEventListener("resize", syncInfoWheelSize);
}

function syncInfoWheelSize() {
  const box = dom.infoCoverBox;
  const canvas = dom.infoColorWheel;
  if (!box || !canvas) return;
  const w = Math.round(box.getBoundingClientRect().width) || 200;
  if (canvas.width !== w) {
    canvas.width = w;
    canvas.height = w;
    redrawActivePalette();
  }
}

function bindPlaylistEvents() {
  if (!dom.videoEl || dom.videoEl.dataset.playlistBound) return;
  dom.videoEl.dataset.playlistBound = "1";
  const refresh = () => {
    renderPlaylist();
    syncPlayPauseButton();
  };
  dom.videoEl.addEventListener("play", () => {
    refresh();
    resumeAudioContext();
  });
  dom.videoEl.addEventListener("pause", refresh);
  dom.videoEl.addEventListener("timeupdate", syncProgressSlider);
  dom.videoEl.addEventListener("loadedmetadata", syncProgressSlider);
  dom.videoEl.addEventListener("seeked", syncProgressSlider);
  dom.videoEl.addEventListener("ended", handleVideoEnded);
  dom.videoEl.addEventListener("loadeddata", () => {
    applyPlaybackRate();
    syncProgressSlider();
  });
}

/* ---------- 音频可视化 ---------- */

let audioContext = null;
let analyser = null;
let analyserDataArray = null;
let analyserTimeData = null;
let visualizerRaf = 0;
let resizeVisualizerCanvas = null;

function readVisualizerShadowMetrics() {
  const cs = getComputedStyle(document.documentElement);
  return {
    offsetX: parseFloat(cs.getPropertyValue("--ui-shadow-x")) || 6,
    offsetY: parseFloat(cs.getPropertyValue("--ui-shadow-y")) || 6,
    blurSoft: 18,
    alphaHard: 0.4,
    alphaSoft: 0.26,
  };
}

function readVisualizerCenterOffsetX(canvas) {
  const cssPx =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--player-viz-center-offset-x"),
    ) || 0;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !cssPx) return 0;
  return (cssPx / rect.width) * canvas.width;
}

function drawBarsVisualizer(ctx, canvas, rgb, freqData) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const split = window.SplitColor?.getVisualizerSplitState?.(canvas);
  const splitActive = split?.active;
  const rgbLeft = splitActive ? split.rgbLeft : rgb;
  const rgbRight = splitActive ? split.rgbRight : rgb;
  const splitX = splitActive ? split.splitX : w / 2;
  const shadow = readVisualizerShadowMetrics();

  const barCount = 36;
  const barMaxHeight = h * 0.85;
  const midX = w / 2 + readVisualizerCenterOffsetX(canvas);
  const barWidth = w / 2 / barCount;

  const drawBar = (x, barHeight) => {
    const bx = x + 2;
    const barW = barWidth - 4;
    const cx = bx + barW / 2;
    const { r, g, b } = cx < splitX ? rgbLeft : rgbRight;
    const y = h - barHeight;
    const gradient = ctx.createLinearGradient(0, y, 0, h);
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.35)`);

    const paintFill = () => {
      ctx.fillStyle = gradient;
      ctx.fillRect(bx, y, barW, barHeight);
    };

    const paintShadow = (blur, alpha) => {
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.shadowBlur = blur;
      ctx.shadowOffsetX = shadow.offsetX;
      ctx.shadowOffsetY = shadow.offsetY;
      paintFill();
      ctx.restore();
    };

    paintShadow(0, shadow.alphaHard);
    paintShadow(shadow.blurSoft, shadow.alphaSoft);
    paintFill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, y, barW, barHeight);
  };

  for (let i = 0; i < barCount; i++) {
    const dataIndex = Math.floor((i / barCount) * freqData.length);
    const magnitude = freqData[dataIndex] / 255;
    const barHeight = Math.max(2, magnitude * barMaxHeight);
    drawBar(midX - (i + 1) * barWidth, barHeight);
    drawBar(midX + i * barWidth, barHeight);
  }

  if (splitActive) {
    ctx.fillStyle = `rgba(${rgbLeft.r}, ${rgbLeft.g}, ${rgbLeft.b}, 0.12)`;
    ctx.fillRect(0, h - 6, splitX, 2);
    ctx.fillStyle = `rgba(${rgbRight.r}, ${rgbRight.g}, ${rgbRight.b}, 0.12)`;
    ctx.fillRect(splitX, h - 6, w - splitX, 2);
  } else {
    const { r, g, b } = rgb;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
    ctx.fillRect(0, h - 6, w, 2);
  }
}

function setupAudioVisualization() {
  const canvas = dom.visualizerCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));
    const vizMode = window.Special?.getVisualizerMode?.();
    if (vizMode === "ecg") window.Special?.resetEcgOnResize?.();
    else if (vizMode === "uno") window.Special?.resetUnoOnResize?.();
    else if (vizMode === "hero") window.Special?.resetHeroOnResize?.();
  };
  resizeVisualizerCanvas = resize;
  resize();
  window.addEventListener("resize", resize);

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const initialMode = window.Special?.getVisualizerMode?.() || "bars";
    analyser.smoothingTimeConstant = initialMode === "ecg" ? 0.28 : 0.7;
    analyserDataArray = new Uint8Array(analyser.frequencyBinCount);
    analyserTimeData = new Uint8Array(analyser.fftSize);
    try {
      const src = audioContext.createMediaElementSource(dom.videoEl);
      src.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (e) {
      if (e.name !== "InvalidStateError") {
        console.error("创建可视化音频源失败:", e);
      }
    }
  }

  const draw = () => {
    visualizerRaf = requestAnimationFrame(draw);
    if (!analyser) return;
    analyser.getByteFrequencyData(analyserDataArray);
    if (analyserTimeData) analyser.getByteTimeDomainData(analyserTimeData);

    const rgb = U.parseHexColor(
      getComputedStyle(document.documentElement).getPropertyValue("--component-color").trim(),
      RGB_BLACK,
    );
    const vizMode = state.specialEffectsEnabled
      ? window.Special?.getVisualizerMode?.() || "bars"
      : "bars";

    if (vizMode === "ecg") {
      window.Special?.drawEcgVisualizer?.(
        ctx,
        canvas,
        rgb,
        analyserDataArray,
        analyserTimeData,
      );
    } else if (vizMode === "uno") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.Special?.updateUnoVisualizer?.();
    } else if (vizMode === "hero") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.Special?.updateHeroVisualizer?.();
    } else {
      drawBarsVisualizer(ctx, canvas, rgb, analyserDataArray);
    }
  };

  syncVisualizerMode();

  if (!visualizerRaf) {
    visualizerRaf = requestAnimationFrame(draw);
  }
}

function resumeAudioContext() {
  if (audioContext?.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

/* ---------- 播放进度 ---------- */

const PROGRESS_THUMB_PX = 18;

function getProgressThumbPx() {
  return window.Special?.getProgressThumbPx?.() ?? PROGRESS_THUMB_PX;
}

function updateProgressTrackVisual(pct) {
  const n = Math.min(100, Math.max(0, pct));
  dom.playerProgressTrack?.style.setProperty("--progress-pct", String(n));
  dom.playerProgressTrack?.setAttribute("aria-valuenow", String(Math.round(n)));
  dom.playerProgressWrap?.style.setProperty("--progress-pct", String(n));
}

function syncProgressSlider() {
  const video = dom.videoEl;
  if (!video?.src || !Number.isFinite(video.duration) || video.duration <= 0) {
    updateProgressTrackVisual(0);
    return;
  }
  const pct = (video.currentTime / video.duration) * 100;
  updateProgressTrackVisual(pct);
}

function progressPctFromClientX(clientX) {
  const track = dom.playerProgressTrack;
  if (!track) return 0;
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  const inset = getProgressThumbPx() / 2;
  const travel = rect.width - getProgressThumbPx();
  if (travel <= 0) return 0;
  const x = clientX - rect.left - inset;
  const ratio = x / travel;
  return Math.min(100, Math.max(0, ratio * 100));
}

function applyProgressFromPointer(clientX) {
  const video = dom.videoEl;
  if (!video?.src || !Number.isFinite(video.duration) || video.duration <= 0) return;
  const pct = progressPctFromClientX(clientX);
  updateProgressTrackVisual(pct);
  try {
    video.currentTime = (pct / 100) * video.duration;
  } catch {
    /* ignore */
  }
  syncVideoBackdropTime();
}

function bindProgressEvents() {
  U.bindPointerSlider(dom.playerProgressTrack, {
    onMove: (e) => applyProgressFromPointer(e.clientX),
    onKeydown: (e) => {
      const video = dom.videoEl;
      if (!video?.src || !Number.isFinite(video.duration) || video.duration <= 0) return;
      const step = video.duration * 0.05;
      let next = video.currentTime;
      if (e.key === "ArrowRight") next = Math.min(video.duration, video.currentTime + step);
      else if (e.key === "ArrowLeft") next = Math.max(0, video.currentTime - step);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = video.duration;
      else return;
      e.preventDefault();
      try {
        video.currentTime = next;
      } catch {
        /* ignore */
      }
      syncProgressSlider();
      syncVideoBackdropTime();
    },
  });
}

/* ---------- 音量 ---------- */

const volumeUi = {
  open: false,
};

function updateVolumeTrackVisual(pct) {
  const n = Math.min(100, Math.max(0, pct));
  const wrap = dom.volumeTrack?.closest(".player-volume-slider-wrap");
  wrap?.style.setProperty("--volume-pct", String(n));
  dom.volumeTrack?.setAttribute("aria-valuenow", String(n));
  if (dom.volumeSlider) dom.volumeSlider.value = String(n);
}

function syncVolumeSlider() {
  if (!dom.videoEl) return;
  const vol = dom.videoEl.muted ? 0 : dom.videoEl.volume;
  const pct = Math.round(Math.min(1, Math.max(0, vol)) * 100);
  updateVolumeTrackVisual(pct);
}

const VOLUME_THUMB_PX = 13;

function volumePctFromClientY(clientY) {
  const wrap = dom.volumeTrack?.closest(".player-volume-slider-wrap") || dom.volumeTrack;
  if (!wrap) return 0;
  const rect = wrap.getBoundingClientRect();
  if (rect.height <= 0) return 0;
  const inset = VOLUME_THUMB_PX / 2;
  const travel = rect.height - VOLUME_THUMB_PX;
  if (travel <= 0) return 0;
  const y = clientY - rect.top - inset;
  const ratio = 1 - y / travel;
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}

function applyVolumeFromPointer(clientY) {
  const pct = volumePctFromClientY(clientY);
  setVideoVolume(pct / 100);
}

function setVideoVolume(normalized) {
  const main = dom.videoEl;
  if (!main) return;
  const vol = Math.min(1, Math.max(0, normalized));
  main.volume = vol;
  main.muted = vol <= 0;
  syncVolumeSlider();
}

function setVolumePopoverOpen(open) {
  volumeUi.open = !!open;
  if (dom.volumePopover) dom.volumePopover.hidden = !volumeUi.open;
  dom.btnVolume?.setAttribute("aria-expanded", volumeUi.open ? "true" : "false");
}

function toggleVolumePopover() {
  setVolumePopoverOpen(!volumeUi.open);
  if (volumeUi.open) syncVolumeSlider();
}

function bindVolumeEvents() {
  dom.btnVolume?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleVolumePopover();
  });

  U.bindPointerSlider(dom.volumeTrack, {
    onMove: (e) => applyVolumeFromPointer(e.clientY),
    onKeydown: (e) => {
      const current = Number(dom.volumeSlider?.value || 0);
      let next = current;
      if (e.key === "ArrowUp" || e.key === "ArrowRight") next = Math.min(100, current + 5);
      else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = Math.max(0, current - 5);
      else if (e.key === "Home") next = 100;
      else if (e.key === "End") next = 0;
      else return;
      e.preventDefault();
      setVideoVolume(next / 100);
    },
  });

  dom.volumePopover?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (!volumeUi.open || !dom.volumeControl) return;
    if (!dom.volumeControl.contains(e.target)) {
      setVolumePopoverOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && volumeUi.open) {
      setVolumePopoverOpen(false);
    }
  });
}

function applyPlaylistExpandedUi() {
  dom.appMain?.classList.toggle("is-playlist-expanded", playlistUi.expanded);
  dom.playlistTitleBtn?.setAttribute(
    "aria-expanded",
    playlistUi.expanded ? "true" : "false",
  );
  window.SplitColor?.refresh?.();
  window.setTimeout(() => window.SplitColor?.refresh?.(), 360);
}

function togglePlaylistExpanded() {
  playlistUi.expanded = !playlistUi.expanded;
  applyPlaylistExpandedUi();
}

function isKeyboardTypingTarget(el) {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return el.isContentEditable;
}

function bindKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (e.repeat) return;
    const target = e.target;
    if (isKeyboardTypingTarget(target)) return;
    if (target instanceof HTMLButtonElement) return;
    e.preventDefault();
    togglePlayPause();
  });
}

function bindEvents() {
  dom.playlistTitleBtn?.addEventListener("click", togglePlaylistExpanded);
  bindInfoEvents();
  bindPlaylistEvents();
  bindVideoBackdropSync();
  bindVolumeEvents();
  bindProgressEvents();
  bindFilterEvents();
  bindKeyboardShortcuts();
  dom.btnImport?.addEventListener("click", () => {
    openImportFolderPicker().catch((e) => console.error(e));
  });
  dom.btnExportJson?.addEventListener("click", () => {
    exportVideoJson().catch((e) => console.error(e));
  });
  dom.btnTranslate?.addEventListener("click", toggleTranslateMode);
  dom.btnSpecialFx?.addEventListener("click", toggleSpecialEffects);
  dom.btnPrev?.addEventListener("click", playPreviousTrack);
  dom.btnPlayPause?.addEventListener("click", togglePlayPause);
  dom.btnNext?.addEventListener("click", playNextTrack);
  dom.btnSpeed?.addEventListener("click", cyclePlaybackSpeed);
  dom.btnPlayMode?.addEventListener("click", togglePlayMode);
  dom.btnPip?.addEventListener("click", () => {
    togglePictureInPicture().catch((e) => console.error(e));
  });
  dom.btnFullscreen?.addEventListener("click", () => {
    toggleFullscreen().catch((e) => console.error(e));
  });
  dom.btnLocate?.addEventListener("click", locateCurrentInPlaylist);
}

function init() {
  applyTheme(theme.themeColor, theme.componentColor);
  applyTranslateModeUi();
  applySpecialEffectsUi();
  bindEvents();
  if (state.currentIndex < 0 && state.videos.length) state.currentIndex = 0;
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  applyPlayModeUi();
  if (dom.btnSpeed) {
    dom.btnSpeed.innerHTML = SPEED_ICON_SVG;
    dom.btnSpeed.title = "加速";
    dom.btnSpeed.setAttribute("aria-label", "加速");
  }
  renderInfoView();
  renderPlaylist();
  buildAllFilterPanels();
  syncPlayPauseButton();
  applyPlaybackRate();
  syncProgressSlider();
  setupAudioVisualization();
  syncVolumeSlider();
  window.Special?.init?.(playerHooks);
  window.Special?.setEnabled?.(state.specialEffectsEnabled);
  refreshMediaEffects();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
