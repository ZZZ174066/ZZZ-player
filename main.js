/**
 * 本地视频分类播放器
 */

const DEFAULT_SONGS = [];

const MEDIA_EXTS = [".mp4", ".mp3", ".flac"];
const COVER_EXTS = [".jpg", ".jpeg", ".png", ".gif"];
const LRC_EXT = ".lrc";
const LEVEL_MAX = 5;

const PLAY_ICON_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M893.035 463.821679C839.00765 429.699141 210.584253 28.759328 179.305261 8.854514 139.495634-16.737389 99.686007 17.385148 99.686007 57.194775v909.934329c0 45.496716 42.653172 68.245075 76.775709 48.340262 45.496716-28.435448 676.763657-429.375262 716.573284-454.967165 34.122537-22.748358 34.122537-76.775709 0-96.680522z"/></svg>`;
const VIZ_MODE_LYRICS_SVG = `<svg viewBox="-8 -8 1040 1040" aria-hidden="true"><path fill="currentColor" d="M927.27050913-6.45970103L96.72949087-6.45970103C39.73034507-6.45970103-6.45970103 40.10740668-6.45970103 96.72949087l0 830.47817565C-6.45970103 984.26965493 40.10740668 1030.45970103 96.72949087 1030.45970103l830.47817565 0c56.9991458 0 103.18919189-46.56710769 103.18919189-103.1891919L1030.39685694 96.72949087C1030.45970103 39.73034507 983.89259332-6.45970103 927.27050913-6.45970103zM935.69155253 936.19430083c0-0.43990567-847.88585338-0.50274831-847.88585336-0.5027483C88.24560484 935.69155253 88.30844747 87.80569917 88.30844747 87.80569917 88.30844747 88.24560484 936.19430083 88.30844747 936.19430083 88.30844747 935.75439516 88.30844747 935.69155253 936.19430083 935.69155253 936.19430083z"/><path fill="currentColor" d="M794.29345226 761.61477969l0.50274831 0.25137488L794.79620057 272.88010103c-1.69677721-27.39981014-20.54985724-41.97952441-56.49639603-43.6763016L435.07943344 229.20379943c-18.85308003 1.69677721-29.09658734 13.69990433-30.85620715 35.94653879 1.69677721 22.24663444 12.00312714 34.24976158 30.85620715 35.94653878l280.03108266 0c5.15317571 0 7.72976282 2.57658711 7.7297628 7.72976282l0 416.21316312 0.69127913 0.37706161-96.90483141 0c-9.86644571 0-25.89156372 12.82009443-27.14843524 33.36995167 1.25687152 22.24663444 14.89393324 34.24976158 27.14843524 35.94653878l145.73430869 0C785.30681645 793.16226745 792.59667504 782.10179284 794.29345226 761.61477969zM460.78246639 403.9090073c-17.15630283-1.69677721-26.51999876-13.69990433-28.27962006-35.9465388 1.69677721-20.54985724 11.12331723-31.67317446 28.27962006-33.36995166l210.65174811 0c20.54985724 1.69677721 31.67317446 12.82009443 33.36995167 33.36995166-1.69677721 22.24663444-12.00312714 34.24976158-30.85620718 35.9465388L460.78246639 403.9090073zM250.88484147 298.58313397C240.82986497 296.88635678 218.45754382 284.88322964 217.45204573 262.5737511 218.45754382 242.02389387 237.18493715 230.90057665 247.30275628 229.20379943l82.82786545 0c12.12881531 1.69677721 29.47364895 12.82009443 30.47914557 33.36995167C359.66711329 284.88322964 341.25393897 296.88635678 330.13062173 298.58313397L250.88484147 298.58313397zM350.30341737 723.53155803l0-301.6492806c1.69677721-37.70616007-12.82009443-55.6794302-43.6763016-53.98265301L244.97754258 367.89962442C226.12446254 369.65924572 215.88095671 381.66237286 214.12133541 403.9090073c1.69677721 24.00625573 12.00312714 36.82635015 30.85620717 38.52312736L270.68057552 442.43213466c5.15317571 0 7.72976282 2.57658711 7.72976282 7.72976282l0 304.41439851c-0.12568672 0.7541232-0.18853081 1.5710905-0.1885308 2.38805632 0.18853081 4.46189513 1.25687152 8.48388603 2.8908061 12.12881531 4.27336431 14.01412332 11.62606554 21.30398045 28.15393335 25.38881397 2.76511791 0.43990567 5.46739321-0.12568672 8.1696685-1.57109051l72.39582735 0c10.68341152-1.69677721 30.60483376-13.69990433 31.61033038-35.94653877-0.94265401-20.54985724-19.92142077-31.67317446-31.61033038-33.36995168 0 0-17.91042605 0-36.63781938 0L350.30341737 723.59440212zM494.21526067 691.66985277c-35.94653878 0-53.98265298-17.15630283-53.98265299-51.40606442L440.23260915 491.26161197c0-34.24976158 15.39668155-51.40606442 46.25289018-51.40606441l151.5787635 0c35.94653878 0 53.10284161 14.57971571 51.40606441 43.67630159l0 156.7319392c0 34.24976158-15.39668155 51.40606442-46.25289017 51.40606442L494.21526067 691.66985277zM512.18853081 617.13734252c1.69677721 3.45639851 4.27336431 5.97014151 7.72976281 7.7297628l89.92919177 0c5.15317571 0 7.72976282-2.57658711 7.72976282-7.7297628L617.57724821 516.9646449c0-5.15317571-2.57658711-7.72976282-7.72976282-7.72976281L519.85544953 509.23488209c-5.15317571 0-7.72976282 2.57658711-7.72976281 7.72976281L512.12568672 617.13734252z"/></svg>`;
const VIZ_MODE_VIZ_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M760.89 263.11v497.78h-99.56V263.11h99.56z m-398.22 0v497.78h-99.56V263.11h99.56zM163.56 412.44v199.11H64V412.44h99.56z m796.44 0v199.11h-99.56V412.44H960zM561.78 113.78v796.44h-99.56V113.78h99.56z"/></svg>`;
const PAUSE_ICON_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M128 0h253.155556v1024H128V0z m512 0h256v1024h-256V0z"/></svg>`;
const PLAY_MODE_SHUFFLE_SVG = `<svg viewBox="0 0 1170 1024" aria-hidden="true"><path fill="currentColor" d="M950.616094 1023.999269a73.124315 73.124315 0 0 1-51.918264-21.206052 73.124315 73.124315 0 0 1 0-103.836527l21.937295-21.206051H731.243149a73.124315 73.124315 0 0 1-62.155668-34.368428L325.403201 292.75612H73.124315a73.124315 73.124315 0 0 1 0-146.24863h292.49726a73.124315 73.124315 0 0 1 62.155667 34.368428l121.386363 193.779434 119.923876-193.779434A73.124315 73.124315 0 0 1 731.243149 146.50749h189.391976l-21.937295-21.206051A73.124315 73.124315 0 0 1 1002.534357 21.464911l146.24863 146.24863a73.124315 73.124315 0 0 1 0 103.836527l-146.24863 146.24863a73.124315 73.124315 0 0 1-103.836527-103.836527l21.937295-21.206051h-146.24863l-138.936198 219.372944 136.011225 219.372945h146.24863l-21.937294-21.206051a73.124315 73.124315 0 0 1 103.836527-103.836527l146.24863 146.248629a73.124315 73.124315 0 0 1 0 103.836528l-146.24863 146.248629A73.124315 73.124315 0 0 1 950.616094 1023.999269z m-584.994519-146.24863H73.124315a73.124315 73.124315 0 0 1 0-146.24863h253.010129l25.593511-40.218373a73.124315 73.124315 0 0 1 122.848849 79.705503l-47.530805 73.124315A73.124315 73.124315 0 0 1 365.621575 877.750639z"/></svg>`;
const PLAY_MODE_LIST_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M569.6 448H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c-6.4-25.6-25.6-44.8-51.2-44.8z m0 332.8H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c-6.4-25.6-25.6-44.8-51.2-44.8zM44.8 243.2H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c0-25.6-19.2-44.8-44.8-44.8H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8z m684.8-134.4c-25.6 0-44.8 19.2-38.4 44.8v716.8c0 25.6 19.2 44.8 44.8 44.8h32c12.8 0 32-6.4 38.4-25.6l217.6-236.8c0-25.6-19.2-44.8-44.8-44.8h-166.4V153.6c0-25.6-19.2-44.8-44.8-44.8h-38.4z"/></svg>`;
const PLAY_MODE_SINGLE_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M449.024 832.512h-52.736c-152.064-25.088-268.288-157.184-268.288-315.904 0-53.248 13.824-102.912 36.864-146.944l39.424 54.272c28.672 39.424 90.112 28.672 103.424-18.432l31.232-112.64 43.008-155.136c10.24-37.376-17.408-73.728-56.32-73.728h-267.264c-47.616 0-74.752 53.76-47.104 92.16l72.192 100.352c-52.224 73.216-83.456 162.816-83.456 260.096 0 224.256 164.352 409.6 378.88 442.88 5.632 1.024 11.776 0.512 16.896 0v1.024h52.736c34.816 0 62.976-28.16 62.976-62.976v-1.536c0.512-35.328-27.648-63.488-62.464-63.488zM1012.736 867.328l-72.192-100.352C992.768 693.76 1024 604.16 1024 507.392c0-224.256-164.352-409.6-378.88-442.88-5.632-1.024-11.776-0.512-16.896 0v-1.024h-52.736c-34.816 0-62.976 28.16-62.976 62.976v1.536c0 34.816 28.16 62.976 62.976 62.976h52.736C779.776 216.064 896 348.672 896 507.392c0 53.248-13.824 102.912-36.864 146.944l-39.424-54.272c-28.672-39.424-90.112-28.672-103.424 18.432l-31.232 112.64-43.008 155.136c-10.24 37.376 17.408 73.728 56.32 73.728h267.264c47.616-0.512 74.752-54.272 47.104-92.672z"/><path fill="currentColor" d="M554.496 349.184v263.168h-43.008v-211.456c-15.872 14.336-35.84 25.088-59.904 32.256v-43.008c11.776-3.072 24.576-8.192 37.376-15.36 13.312-8.192 24.576-16.384 33.28-25.6h32.256z"/></svg>`;
const PLAY_MODE_LABELS = {
  shuffle: "随机播放",
  list: "顺序播放",
  single: "单曲循环",
};

const LEVEL_HEART_SVG = `<svg class="info-level-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const LEVEL_FILTER_HEART_SVG = `<svg class="level-filter-heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const INFO_DEFAULT_NAME = "歌曲名称";
const DEFAULT_THEME = { bgHex: "#ffffff", fgHex: "#000000" };
const FILTER_NONE = "__filter_none__";
const FILTER_CATEGORY_LEGACY_UNCATEGORIZED = "未分类";

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

const filterSelection = {
  category: new Set(),
  author: new Set(),
  role: new Set(),
  level: new Set(),
};

const filterUi = {
  openKind: null,
};

const infoUi = {
  editing: false,
  editSnapshot: null,
  editWork: null,
  /** @type {"theme"|"component"|null} */
  pickTarget: null,
};

const state = {
  root: null,
  songs: DEFAULT_SONGS.map((title, id) => ({
    id,
    title,
    titleDisplay: title,
    coverUrl: "",
    url: "",
  })),
  currentIndex: -1,
  searchQuery: "",
  /** @type {"viz"|"lyrics"} 中间栏可视化区模式 */
  midChromeMode: "viz",
  translateMode: false,
  playbackRate: 1,
  playMode: "shuffle",
  shuffleOrder: [],
  shuffleFingerprint: "",
  volume: 1,
  volumeOpen: false,
  themeColor: DEFAULT_THEME.bgHex,
  componentColor: DEFAULT_THEME.fgHex,
  /** @type {{ time: number, orig: string, trans: string }[]} */
  lyrics: [],
  lyricsSongId: -1,
  activeLyricIndex: -1,
  lyricsLoadToken: 0,
};

const dom = {
  playlistGrid: document.getElementById("playlistGrid"),
  playlistTitleBtn: document.getElementById("playlistTitleBtn"),
  playlistSearch: document.getElementById("playlistSearch"),
  infoTitleBtn: document.getElementById("infoTitleBtn"),
  infoPanelRoot: document.getElementById("infoPanelRoot"),
  infoView: document.getElementById("infoView"),
  infoControls: document.getElementById("infoControls"),
  playerZoneViz: document.getElementById("playerZoneViz"),
  vizLyrics: document.getElementById("vizLyrics"),
  vizLyricsEmpty: document.getElementById("vizLyricsEmpty"),
  vizLyricsCurrent: document.getElementById("vizLyricsCurrent"),
  vizLyricsOrig: document.getElementById("vizLyricsOrig"),
  vizLyricsTrans: document.getElementById("vizLyricsTrans"),
  btnInfoEdit: document.getElementById("btnInfoEdit"),
  btnInfoSave: document.getElementById("btnInfoSave"),
  btnInfoExport: document.getElementById("btnInfoExport"),
  infoCoverBox: document.getElementById("infoCoverBox"),
  infoCoverPlaceholder: document.getElementById("infoCoverPlaceholder"),
  infoCoverImg: document.getElementById("infoCoverImg"),
  infoNameDisplay: document.getElementById("infoNameDisplay"),
  infoCategoryChips: document.getElementById("infoCategoryChips"),
  infoCategoryInput: document.getElementById("infoCategoryInput"),
  infoAuthorChips: document.getElementById("infoAuthorChips"),
  infoAuthorInput: document.getElementById("infoAuthorInput"),
  infoRoleChips: document.getElementById("infoRoleChips"),
  infoRoleInput: document.getElementById("infoRoleInput"),
  infoLevel: document.getElementById("infoLevel"),
  infoThemePreview: document.getElementById("infoThemePreview"),
  infoComponentPreview: document.getElementById("infoComponentPreview"),
  infoCoverPickCanvas: document.getElementById("infoCoverPickCanvas"),
  playerZoneVideo: document.querySelector(".player-zone-video"),
  videoEl: document.getElementById("videoElement"),
  progressWrap: document.getElementById("progressWrap"),
  progressTrack: document.getElementById("progressTrack"),
  progressFill: document.getElementById("progressFill"),
  progressThumb: document.getElementById("progressThumb"),
  progressTimeTip: document.getElementById("progressTimeTip"),
  vizCanvas: document.getElementById("visualizerCanvas"),
  btnImport: document.getElementById("btnImport"),
  btnVizLyrics: document.getElementById("btnVizLyrics"),
  btnTranslate: document.getElementById("btnTranslate"),
  btnVolume: document.getElementById("btnVolume"),
  btnPrev: document.getElementById("btnPrev"),
  btnPlayPause: document.getElementById("btnPlayPause"),
  btnNext: document.getElementById("btnNext"),
  btnSpeed: document.getElementById("btnSpeed"),
  btnPlayMode: document.getElementById("btnPlayMode"),
  btnPip: document.getElementById("btnPip"),
  btnFullscreen: document.getElementById("btnFullscreen"),
  volumeControl: document.getElementById("volumeControl"),
  volumePopover: document.getElementById("volumePopover"),
  volumeSlider: document.getElementById("volumeSlider"),
  playlistControls: document.getElementById("playlistControls"),
  btnListTop: document.getElementById("btnListTop"),
  btnLocate: document.getElementById("btnLocate"),
  btnListBottom: document.getElementById("btnListBottom"),
  filterCategoryBtn: document.getElementById("filterCategoryBtn"),
  filterAuthorBtn: document.getElementById("filterAuthorBtn"),
  filterRoleBtn: document.getElementById("filterRoleBtn"),
  filterLevelBtn: document.getElementById("filterLevelBtn"),
  toast: document.getElementById("toast"),
};

function scrollPlaylistTo(top) {
  const scrollBox = dom.playlistGrid;
  if (!scrollBox) return;
  scrollBox.scrollTo({ top, behavior: "smooth" });
}

function scrollPlaylistToTop() {
  scrollPlaylistTo(0);
}

function scrollPlaylistToBottom() {
  const scrollBox = dom.playlistGrid;
  if (!scrollBox) return;
  scrollPlaylistTo(scrollBox.scrollHeight);
}

function syncToastPosition() {
  const toast = dom.toast;
  if (!toast) return;
  const btn =
    dom.btnPlayPause ||
    document.querySelector(".player-zone-controls .btn-icon");
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const bottom = Math.max(0, window.innerHeight - rect.bottom);
  toast.style.bottom = `${bottom}px`;
}

/** 清除旧版 JS 对齐残留；三栏操作键改由 CSS --ctrl-chrome-bottom 对齐 */
function syncSideControlAlignment() {
  [dom.playlistControls, dom.infoControls].forEach((wrap) => {
    if (!wrap) return;
    wrap.style.bottom = "";
    wrap.style.top = "";
    wrap.style.transform = "";
  });
}

function syncBottomChromeAlignment() {
  syncSideControlAlignment();
  syncToastPosition();
}

function showToast(msg) {
  if (!dom.toast) {
    console.log(msg);
    return;
  }
  syncBottomChromeAlignment();
  dom.toast.textContent = msg;
  dom.toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => dom.toast.classList.remove("show"), 2000);
}

function setProgressUi(pct) {
  const p = Math.min(100, Math.max(0, pct));
  const n = String(p);
  if (dom.progressTrack) {
    dom.progressTrack.style.setProperty("--progress-pct", n);
    dom.progressTrack.setAttribute("aria-valuenow", String(Math.round(p)));
  }
  dom.progressWrap?.style.setProperty("--progress-pct", n);
}

function syncProgressFromVideo() {
  const v = dom.videoEl;
  if (!v || !Number.isFinite(v.duration) || v.duration <= 0) {
    setProgressUi(0);
    syncActiveLyric();
    return;
  }
  setProgressUi((v.currentTime / v.duration) * 100);
  syncActiveLyric();
}

function seekByClientX(clientX) {
  const v = dom.videoEl;
  const track = dom.progressTrack;
  if (!v || !track || !Number.isFinite(v.duration) || v.duration <= 0) return;
  const rect = track.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  v.currentTime = ratio * v.duration;
  syncProgressFromVideo();
}

function formatMediaTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function progressRatioFromClientX(clientX) {
  const track = dom.progressTrack;
  if (!track) return 0;
  const rect = track.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
}

function updateProgressTimeTip(clientX) {
  const tip = dom.progressTimeTip;
  const track = dom.progressTrack;
  const v = dom.videoEl;
  if (!tip || !track) return;
  const ratio = progressRatioFromClientX(clientX);
  const dur = v && Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 0;
  tip.textContent = formatMediaTime(ratio * dur);
  tip.hidden = false;
  tip.setAttribute("aria-hidden", "false");
  const rect = track.getBoundingClientRect();
  const x = Math.min(rect.width, Math.max(0, clientX - rect.left));
  tip.style.left = `${x}px`;
}

function hideProgressTimeTip() {
  const tip = dom.progressTimeTip;
  if (!tip) return;
  tip.hidden = true;
  tip.setAttribute("aria-hidden", "true");
}

function bilingualSearchHaystack(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return [];
  const p = parseBilingual(raw);
  const parts = [raw, p.foreign, p.chinese];
  return [...new Set(parts.map((x) => String(x).trim().toLowerCase()).filter(Boolean))];
}

function songMatchesSearchQuery(song, q) {
  if (!q) return true;
  const titleParts = bilingualSearchHaystack(song.titleDisplay || song.title);
  if (titleParts.some((p) => p.includes(q))) return true;

  for (const author of song.authors || []) {
    if (bilingualSearchHaystack(author).some((p) => p.includes(q))) return true;
  }
  for (const singer of song.roles || []) {
    if (bilingualSearchHaystack(singer).some((p) => p.includes(q))) return true;
  }
  return false;
}

function getVisibleSongs() {
  const q = state.searchQuery.trim().toLowerCase();
  return state.songs.filter((s) => {
    if (!songPassesFilters(s)) return false;
    return songMatchesSearchQuery(s, q);
  });
}

function isSongPlaying(index) {
  return (
    index === state.currentIndex &&
    !!dom.videoEl &&
    !!dom.videoEl.src &&
    !dom.videoEl.paused &&
    !dom.videoEl.ended
  );
}

function getPlayIconSvg(index) {
  return isSongPlaying(index) ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
}

function renderPlaylist() {
  const grid = dom.playlistGrid;
  if (!grid) return;
  grid.innerHTML = "";

  const songs = getVisibleSongs();
  if (!songs.length) {
    const empty = document.createElement("div");
    empty.className = "playlist-empty";
    empty.textContent = "暂无歌曲";
    grid.appendChild(empty);
    return;
  }

  songs.forEach((song) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "song-card";
    card.dataset.id = String(song.id);
    if (song.id === state.currentIndex) card.classList.add("is-current");

    const cover = document.createElement("div");
    cover.className = "song-card-cover";
    if (song.coverUrl) {
      const img = document.createElement("img");
      img.src = song.coverUrl;
      img.alt = "";
      cover.appendChild(img);
    }

    const icon = document.createElement("span");
    icon.className = "song-card-play-icon";
    icon.innerHTML = getPlayIconSvg(song.id);
    cover.appendChild(icon);

    const title = document.createElement("div");
    title.className = "song-card-title";
    title.textContent = formatUserFacingText(song.titleDisplay || song.title);

    card.append(cover, title);
    card.addEventListener("click", () => onSongCardClick(song.id));
    grid.appendChild(card);
  });
}

function setVideoSource(url) {
  const main = dom.videoEl;
  if (!main) return;
  if (url) {
    main.src = url;
    main.load();
  } else {
    main.removeAttribute("src");
    main.load();
  }
}

function playSongAt(index) {
  if (index < 0 || index >= state.songs.length) return;
  const song = state.songs[index];
  state.currentIndex = index;
  if (song.url) {
    setVideoSource(song.url);
    applyPlaybackRate();
    applyVolume();
    resumeAudioContext();
    dom.videoEl?.play().catch(() => {});
  }
  renderPlaylist();
  syncPlayPauseButton();
  syncProgressFromVideo();
  syncInfoEditSessionToCurrentSong();
  renderInfoView();
  ensureLyricsLoaded();
}

function onSongCardClick(index) {
  if (index < 0 || index >= state.songs.length) return;
  if (state.currentIndex === index) {
    togglePlayPause();
    renderPlaylist();
    return;
  }
  playSongAt(index);
}

function openPlaylistSearch() {
  if (!dom.playlistTitleBtn || !dom.playlistSearch) return;
  dom.playlistTitleBtn.hidden = true;
  dom.playlistSearch.hidden = false;
  dom.playlistSearch.value = state.searchQuery;
  dom.playlistSearch.focus();
  dom.playlistSearch.select();
}

function closePlaylistSearch() {
  if (!dom.playlistTitleBtn || !dom.playlistSearch) return;
  state.searchQuery = "";
  dom.playlistSearch.value = "";
  dom.playlistSearch.hidden = true;
  dom.playlistTitleBtn.hidden = false;
  renderPlaylist();
}

function toggleMidChromeMode() {
  state.midChromeMode = state.midChromeMode === "viz" ? "lyrics" : "viz";
  syncMidChromeModeUi();
  if (state.midChromeMode === "lyrics") {
    ensureLyricsLoaded().then(() => syncActiveLyric(true));
  }
  syncBottomChromeAlignment();
}

function syncMidChromeModeUi() {
  const isLyrics = state.midChromeMode === "lyrics";
  dom.playerZoneViz?.classList.toggle("is-lyrics", isLyrics);
  if (dom.vizLyrics) dom.vizLyrics.hidden = !isLyrics;
  if (dom.btnVizLyrics) {
    dom.btnVizLyrics.innerHTML = isLyrics ? VIZ_MODE_VIZ_SVG : VIZ_MODE_LYRICS_SVG;
    dom.btnVizLyrics.title = isLyrics ? "可视化" : "歌词";
    dom.btnVizLyrics.setAttribute("aria-label", isLyrics ? "可视化" : "歌词");
    dom.btnVizLyrics.setAttribute("aria-pressed", isLyrics ? "true" : "false");
  }
  if (isLyrics) syncActiveLyric(true);
}

function getCurrentSong() {
  if (state.currentIndex < 0) return null;
  return state.songs[state.currentIndex] || null;
}

function parseLrcTimestamp(min, sec, frac) {
  const m = Number(min) || 0;
  const s = Number(sec) || 0;
  const f = String(frac || "0");
  let sub = 0;
  if (f.length <= 2) sub = Number(f.padEnd(2, "0")) / 100;
  else sub = Number(f.slice(0, 3).padEnd(3, "0")) / 1000;
  return m * 60 + s + sub;
}

function timeKey(t) {
  return (Math.round(t * 1000) / 1000).toFixed(3);
}

/**
 * 解析「上半原文 + 下半同时间轴翻译」的双语 LRC
 * 时间戳支持 [mm:ss.xx] / [mm:ss:xx] / [mm:ss.xxx] / [mm:ss:xxx]
 * 同时间戳多行按出现顺序配对；下半允许空翻译占位
 * @returns {{ time: number, orig: string, trans: string }[]}
 */
function parseBilingualLrc(text) {
  // 小数部分可用 . 或 : 分隔，如 [02:08.91] / [02:08:91]
  const lineRe = /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/;
  const entries = [];
  String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .forEach((raw) => {
      const line = raw.trimEnd();
      if (!line.trim()) return;
      if (/^\[[a-zA-Z]+:/i.test(line.trim())) return;
      const m = line.trim().match(lineRe);
      if (!m) return;
      const content = String(m[4] || "").trim();
      entries.push({
        time: parseLrcTimestamp(m[1], m[2], m[3]),
        text: content,
      });
    });

  if (!entries.length) return [];

  let splitAt = -1;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].time + 0.001 < entries[i - 1].time) {
      splitAt = i;
      break;
    }
  }

  if (splitAt < 0) {
    // 无下半：同戳后出现的视为翻译
    const queues = new Map();
    entries.forEach((e) => {
      const key = timeKey(e.time);
      if (!queues.has(key)) queues.set(key, []);
      queues.get(key).push(e.text);
    });
    const out = [];
    queues.forEach((texts, key) => {
      const time = Number(key);
      const orig = texts[0] || "";
      const trans = texts[1] || "";
      if (!orig && !trans) return;
      out.push({ time, orig, trans });
      for (let i = 2; i < texts.length; i += 2) {
        out.push({ time, orig: texts[i] || "", trans: texts[i + 1] || "" });
      }
    });
    return out.sort((a, b) => a.time - b.time || 0);
  }

  const orig = entries.slice(0, splitAt);
  const transQueues = new Map();
  entries.slice(splitAt).forEach((e) => {
    const key = timeKey(e.time);
    if (!transQueues.has(key)) transQueues.set(key, []);
    transQueues.get(key).push(e.text);
  });

  return orig
    .map((o) => {
      const q = transQueues.get(timeKey(o.time));
      const trans = q && q.length ? q.shift() : "";
      return { time: o.time, orig: o.text, trans: trans || "" };
    })
    .filter((x) => x.orig || x.trans);
}

function looksLikeMojibake(text) {
  if (!text) return true;
  const bad = (text.match(/\uFFFD/g) || []).length;
  return bad > 0 && bad / Math.max(1, text.length) > 0.002;
}

async function decodeTextBuffer(buf) {
  const encodings = ["utf-8", "gbk", "gb18030", "shift_jis"];
  let best = "";
  for (const enc of encodings) {
    try {
      const text = new TextDecoder(enc, { fatal: false }).decode(buf);
      if (!looksLikeMojibake(text)) return text;
      if (!best) best = text;
    } catch {
      /* encoding unsupported */
    }
  }
  return best || new TextDecoder("utf-8").decode(buf);
}

async function readLrcTextFromFile(file) {
  const buf = await file.arrayBuffer();
  return decodeTextBuffer(buf);
}

async function readLrcTextFromUrl(url) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return decodeTextBuffer(buf);
}

function clearLyricsState() {
  state.lyrics = [];
  state.lyricsSongId = -1;
  state.activeLyricIndex = -1;
  syncActiveLyric(true);
}

function renderLyricsView() {
  // 中间栏只显示当前句，由 syncActiveLyric 刷新
  syncActiveLyric(true);
}

function findActiveLyricIndex(currentTime) {
  const lines = state.lyrics;
  if (!lines.length || !Number.isFinite(currentTime)) return -1;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= currentTime + 0.02) idx = i;
    else break;
  }
  return idx;
}

function syncActiveLyric(force = false) {
  const t = dom.videoEl?.currentTime ?? 0;
  const idx = findActiveLyricIndex(t);
  if (idx === state.activeLyricIndex && !force) return;
  state.activeLyricIndex = idx;

  const empty = dom.vizLyricsEmpty;
  const current = dom.vizLyricsCurrent;
  const origEl = dom.vizLyricsOrig;
  const transEl = dom.vizLyricsTrans;
  if (!empty || !current || !origEl || !transEl) return;

  const hasLyrics = state.lyrics.length > 0;
  if (!hasLyrics) {
    empty.hidden = false;
    empty.textContent = "暂无歌词";
    current.hidden = true;
    origEl.textContent = "";
    transEl.textContent = "";
    return;
  }

  const line = idx >= 0 ? state.lyrics[idx] : null;
  if (!line || (!line.orig && !line.trans)) {
    empty.hidden = false;
    empty.textContent = "♪";
    current.hidden = true;
    origEl.textContent = "";
    transEl.textContent = "";
    return;
  }

  empty.hidden = true;
  current.hidden = false;
  origEl.textContent = line.orig || "";
  transEl.textContent = line.trans || "";
}

async function ensureLyricsLoaded() {
  const song = getCurrentSong();
  if (!song) {
    clearLyricsState();
    renderLyricsView();
    return;
  }
  if (state.lyricsSongId === song.id) return;

  const token = ++state.lyricsLoadToken;
  let text = song.lrcText || "";
  if (!text && song.lrcUrl) {
    try {
      text = await readLrcTextFromUrl(song.lrcUrl);
      song.lrcText = text;
    } catch (e) {
      console.error("读取歌词失败：", e);
      text = "";
    }
  }

  if (token !== state.lyricsLoadToken) return;
  state.lyricsSongId = song.id;
  state.lyrics = text ? parseBilingualLrc(text) : [];
  state.activeLyricIndex = -1;
  renderLyricsView();
}

function normalizeHexColor(val) {
  const s = String(val ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`.toLowerCase();
  }
  return "";
}

function updateColorPreviews(bgHex, fgHex) {
  const bg = bgHex || state.themeColor;
  const fg = fgHex || state.componentColor;
  if (dom.infoThemePreview) {
    dom.infoThemePreview.style.background = bg;
    dom.infoThemePreview.title = `背景色 ${bg}`;
  }
  if (dom.infoComponentPreview) {
    dom.infoComponentPreview.style.background = fg;
    dom.infoComponentPreview.title = `组件色 ${fg}`;
  }
}

function applyTheme(themeColor, componentColor) {
  const bg =
    normalizeHexColor(themeColor) ||
    state.themeColor ||
    DEFAULT_THEME.bgHex;
  const fg =
    normalizeHexColor(componentColor) ||
    state.componentColor ||
    DEFAULT_THEME.fgHex;
  state.themeColor = bg;
  state.componentColor = fg;
  document.documentElement.style.setProperty("--theme-color", bg);
  document.documentElement.style.setProperty("--component-color", fg);
  updateColorPreviews(bg, fg);
}

function applyThemeForSong(song) {
  const bg = normalizeHexColor(song?.themeBg);
  const fg = normalizeHexColor(song?.themeFg);
  if (bg && fg) {
    applyTheme(bg, fg);
    return;
  }
  applyTheme(DEFAULT_THEME.bgHex, DEFAULT_THEME.fgHex);
}

function renderChips(container, items, kind) {
  if (!container) return;
  container.innerHTML = "";
  const list = (items || []).map((s) => String(s).trim()).filter(Boolean);
  const set =
    kind === "category"
      ? filterSelection.category
      : kind === "author"
        ? filterSelection.author
        : kind === "role"
          ? filterSelection.role
          : null;

  if (!list.length) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-chip is-empty";
    btn.textContent = "无";
    if (set?.has(FILTER_NONE)) btn.classList.add("is-selected");
    btn.addEventListener("click", () => {
      if (infoUi.editing || !kind) return;
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
    if (set?.has(key)) btn.classList.add("is-selected");
    btn.addEventListener("click", () => {
      if (infoUi.editing || !kind) return;
      toggleFilterValue(kind, key);
    });
    container.appendChild(btn);
  });
}

function renderLevelHearts(level) {
  if (!dom.infoLevel) return;
  const lv = normalizeLevel(level);
  dom.infoLevel.innerHTML = "";
  for (let i = 1; i <= LEVEL_MAX; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "info-level-heart-btn";
    btn.setAttribute("aria-label", `喜爱 ${i} 级`);
    btn.innerHTML = LEVEL_HEART_SVG;
    const svg = btn.querySelector(".info-level-heart");
    if (svg && i <= lv) svg.classList.add("is-on");
    btn.addEventListener("click", () => {
      if (!infoUi.editing || !infoUi.editWork) return;
      infoUi.editWork.level = i;
      renderLevelHearts(i);
    });
    dom.infoLevel.appendChild(btn);
  }
}

function splitByComma(val) {
  return String(val ?? "")
    .split("，")
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinByComma(arr) {
  return [...(arr || [])].join("，");
}

function cloneSongMeta(v) {
  return {
    categories: [...(v.categories || [])],
    authors: [...(v.authors || [])],
    roles: [...(v.roles || [])],
    level: normalizeLevel(v?.level),
    themeBg: v.themeBg || "",
    themeFg: v.themeFg || "",
  };
}

function getInfoEditMeta() {
  const v = getCurrentSong();
  if (!v) return null;
  if (infoUi.editing && infoUi.editWork) return infoUi.editWork;
  return v;
}

function applySongMetaToSong(v, meta) {
  if (!v || !meta) return;
  v.categories = [...(meta.categories || [])];
  v.authors = [...(meta.authors || [])];
  v.roles = [...(meta.roles || [])];
  v.level = normalizeLevel(meta.level);
  v.themeBg = meta.themeBg || "";
  v.themeFg = meta.themeFg || "";
}

function revertInfoEditDraft() {
  const v = getCurrentSong();
  const snap = infoUi.editSnapshot;
  if (!v || !snap) return;
  applySongMetaToSong(v, snap);
  if (v.themeBg && v.themeFg) {
    applyTheme(v.themeBg, v.themeFg);
  } else {
    applyTheme(DEFAULT_THEME.bgHex, DEFAULT_THEME.fgHex);
  }
}

function clearInfoEditSession() {
  infoUi.editSnapshot = null;
  infoUi.editWork = null;
}

function syncInfoEditSessionToCurrentSong() {
  if (!infoUi.editing) return;
  const v = getCurrentSong();
  if (!v) {
    clearInfoEditSession();
    return;
  }
  infoUi.editSnapshot = cloneSongMeta(v);
  infoUi.editWork = cloneSongMeta(v);
  infoUi.pickTarget = null;
}

function syncInfoEditingUi() {
  dom.infoPanelRoot?.classList.toggle("is-editing", infoUi.editing);
  document.documentElement.classList.toggle("is-info-editing", infoUi.editing);
  dom.btnInfoEdit?.setAttribute("aria-pressed", infoUi.editing ? "true" : "false");
  [dom.infoCategoryInput, dom.infoAuthorInput, dom.infoRoleInput].forEach((el) => {
    if (!el) return;
    el.hidden = !infoUi.editing;
  });
}

function setInfoEditing(editing, options = {}) {
  const wasEditing = infoUi.editing;
  if (wasEditing && !editing && !options.commit) {
    revertInfoEditDraft();
    clearInfoEditSession();
  }

  infoUi.editing = !!editing;
  setPickTarget(null);
  syncInfoEditingUi();
  renderInfoView();
}

function toggleInfoEditing() {
  if (infoUi.editing) {
    setInfoEditing(false);
    showToast("已退出编辑模式");
    return;
  }
  const v = getCurrentSong();
  if (!v?.url) {
    showToast(hasImportedSongs() ? "请先选择歌曲" : "请先导入歌曲");
    return;
  }
  infoUi.editSnapshot = cloneSongMeta(v);
  infoUi.editWork = cloneSongMeta(v);
  setInfoEditing(true);
  showToast("已进入编辑模式：点击封面或视频取色");
}

function commitInfoEditFromInputs() {
  const v = getCurrentSong();
  if (!v || !infoUi.editing) return false;
  v.categories = splitByComma(dom.infoCategoryInput?.value);
  v.authors = splitByComma(dom.infoAuthorInput?.value);
  v.roles = splitByComma(dom.infoRoleInput?.value);
  if (infoUi.editWork) {
    v.level = normalizeLevel(infoUi.editWork.level);
    v.themeBg =
      normalizeHexColor(infoUi.editWork.themeBg) || v.themeBg;
    v.themeFg =
      normalizeHexColor(infoUi.editWork.themeFg) || v.themeFg;
  }
  if (v.themeBg && v.themeFg) {
    applyTheme(v.themeBg, v.themeFg);
  }
  return true;
}

function saveInfoEdit(options = {}) {
  const v = getCurrentSong();
  if (!v) {
    if (!options.silent) showToast("请先选择歌曲");
    return false;
  }
  if (infoUi.editing) {
    commitInfoEditFromInputs();
  }
  clearInfoEditSession();
  setInfoEditing(false, { commit: true });
  buildAllFilterPanels();
  renderPlaylist();
  if (!options.silent) showToast("保存成功");
  return true;
}

async function exportInfoWithSave() {
  if (infoUi.editing) {
    saveInfoEdit({ silent: true });
  }
  await exportVideoJson();
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((n) => Math.max(0, Math.min(255, n | 0)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function applyPickedColor(hex) {
  const color = normalizeHexColor(hex);
  if (!color || !infoUi.editing || !infoUi.editWork || !infoUi.pickTarget) return;
  if (infoUi.pickTarget === "component") {
    infoUi.editWork.themeFg = color;
    applyTheme(
      normalizeHexColor(infoUi.editWork.themeBg) || state.themeColor,
      color,
    );
  } else if (infoUi.pickTarget === "theme") {
    infoUi.editWork.themeBg = color;
    applyTheme(
      color,
      normalizeHexColor(infoUi.editWork.themeFg) || state.componentColor,
    );
  }
}

function pickColorFromCover(clientX, clientY) {
  const v = getCurrentSong();
  if (!v?.coverUrl || !dom.infoCoverPickCanvas || !dom.infoCoverBox) return;
  const img = dom.infoCoverImg;
  if (!img || img.hidden || !img.complete) return;
  const size = 160;
  dom.infoCoverPickCanvas.width = size;
  dom.infoCoverPickCanvas.height = size;
  const ctx = dom.infoCoverPickCanvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, size, size);
  const coverRect = dom.infoCoverBox.getBoundingClientRect();
  const px = Math.floor(((clientX - coverRect.left) / coverRect.width) * size);
  const py = Math.floor(((clientY - coverRect.top) / coverRect.height) * size);
  const d = ctx.getImageData(
    Math.min(size - 1, Math.max(0, px)),
    Math.min(size - 1, Math.max(0, py)),
    1,
    1,
  ).data;
  applyPickedColor(rgbToHex(d[0], d[1], d[2]));
}

/** object-fit:contain 下视频画面在元素内的实际区域 */
function getVideoContentRect(video) {
  if (!video) return null;
  const rect = video.getBoundingClientRect();
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || rect.width <= 0 || rect.height <= 0) return null;
  const videoRatio = vw / vh;
  const elemRatio = rect.width / rect.height;
  let contentW;
  let contentH;
  let offsetX;
  let offsetY;
  if (videoRatio > elemRatio) {
    contentW = rect.width;
    contentH = rect.width / videoRatio;
    offsetX = 0;
    offsetY = (rect.height - contentH) / 2;
  } else {
    contentH = rect.height;
    contentW = rect.height * videoRatio;
    offsetX = (rect.width - contentW) / 2;
    offsetY = 0;
  }
  return {
    left: rect.left + offsetX,
    top: rect.top + offsetY,
    width: contentW,
    height: contentH,
    videoWidth: vw,
    videoHeight: vh,
  };
}

function pickColorFromVideo(clientX, clientY) {
  const video = dom.videoEl;
  const canvas = dom.infoCoverPickCanvas;
  if (!video || !canvas || !video.src) return;
  if (!video.videoWidth || !video.videoHeight) {
    showToast("视频尚未就绪");
    return;
  }
  const content = getVideoContentRect(video);
  if (!content) return;
  if (
    clientX < content.left ||
    clientX > content.left + content.width ||
    clientY < content.top ||
    clientY > content.top + content.height
  ) {
    return;
  }
  const px = Math.floor(
    ((clientX - content.left) / content.width) * content.videoWidth,
  );
  const py = Math.floor(
    ((clientY - content.top) / content.height) * content.videoHeight,
  );
  canvas.width = content.videoWidth;
  canvas.height = content.videoHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  try {
    ctx.drawImage(video, 0, 0, content.videoWidth, content.videoHeight);
    const d = ctx.getImageData(
      Math.min(content.videoWidth - 1, Math.max(0, px)),
      Math.min(content.videoHeight - 1, Math.max(0, py)),
      1,
      1,
    ).data;
    applyPickedColor(rgbToHex(d[0], d[1], d[2]));
  } catch (err) {
    console.error(err);
    showToast("无法从视频取色");
  }
}

function syncCoverDisplay() {
  const v = getCurrentSong();
  if (dom.infoCoverImg) {
    dom.infoCoverImg.hidden = !v?.coverUrl;
  }
  if (dom.infoCoverPlaceholder) {
    dom.infoCoverPlaceholder.hidden = !!v?.coverUrl;
  }
}

function setPickTarget(target) {
  infoUi.pickTarget =
    target === "theme" || target === "component" ? target : null;
  syncPickTargetUi();
}

function togglePickTarget(target) {
  if (!infoUi.editing) return;
  if (target !== "theme" && target !== "component") return;
  setPickTarget(infoUi.pickTarget === target ? null : target);
}

function syncPickTargetUi() {
  dom.infoThemePreview?.classList.toggle(
    "is-active-target",
    infoUi.editing && infoUi.pickTarget === "theme",
  );
  dom.infoComponentPreview?.classList.toggle(
    "is-active-target",
    infoUi.editing && infoUi.pickTarget === "component",
  );
  document.documentElement.classList.toggle(
    "is-picking-color",
    infoUi.editing && !!infoUi.pickTarget,
  );
}

function setInfoCover(coverUrl) {
  const img = dom.infoCoverImg;
  if (!img) return;
  if (coverUrl) {
    img.src = coverUrl;
  } else {
    img.removeAttribute("src");
  }
  syncCoverDisplay();
}

function bindColorPickEvents() {
  dom.infoThemePreview?.addEventListener("click", () => {
    togglePickTarget("theme");
  });

  dom.infoComponentPreview?.addEventListener("click", () => {
    togglePickTarget("component");
  });

  dom.infoCoverBox?.addEventListener("click", (e) => {
    if (!infoUi.editing) return;
    if (e.button != null && e.button !== 0) return;
    if (!infoUi.pickTarget) {
      showToast("请先选择背景或组件色");
      return;
    }
    if (!getCurrentSong()?.coverUrl) {
      showToast("当前无封面可取色");
      return;
    }
    pickColorFromCover(e.clientX, e.clientY);
  });

  const onVideoPick = (e) => {
    if (!infoUi.editing) return;
    if (!infoUi.pickTarget) return;
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    pickColorFromVideo(e.clientX, e.clientY);
  };

  // 捕获阶段拦截，避免与播放区其它点击冲突
  dom.playerZoneVideo?.addEventListener("click", onVideoPick, true);
  dom.videoEl?.addEventListener("click", onVideoPick, true);
}

function renderInfoView() {
  const song = getCurrentSong();
  if (!song) {
    if (dom.infoNameDisplay) dom.infoNameDisplay.textContent = INFO_DEFAULT_NAME;
    renderChips(dom.infoCategoryChips, [], "category");
    renderChips(dom.infoAuthorChips, [], "author");
    renderChips(dom.infoRoleChips, [], "role");
    if (dom.infoCategoryInput) dom.infoCategoryInput.value = "";
    if (dom.infoAuthorInput) dom.infoAuthorInput.value = "";
    if (dom.infoRoleInput) dom.infoRoleInput.value = "";
    renderLevelHearts(1);
    setInfoCover(null);
    applyTheme(DEFAULT_THEME.bgHex, DEFAULT_THEME.fgHex);
    setPickTarget(infoUi.pickTarget);
    syncCoverDisplay();
    return;
  }

  if (dom.infoNameDisplay) {
    const raw = song.titleDisplay || song.title || "";
    dom.infoNameDisplay.textContent = infoUi.editing
      ? String(raw)
      : formatUserFacingText(raw);
  }

  const meta = getInfoEditMeta() || song;
  renderChips(dom.infoCategoryChips, meta.categories || song.categories || [], "category");
  renderChips(dom.infoAuthorChips, meta.authors || song.authors || [], "author");
  renderChips(dom.infoRoleChips, meta.roles || song.roles || [], "role");

  if (infoUi.editing && infoUi.editWork) {
    if (dom.infoCategoryInput) {
      dom.infoCategoryInput.value = joinByComma(infoUi.editWork.categories);
    }
    if (dom.infoAuthorInput) {
      dom.infoAuthorInput.value = joinByComma(infoUi.editWork.authors);
    }
    if (dom.infoRoleInput) {
      dom.infoRoleInput.value = joinByComma(infoUi.editWork.roles);
    }
  }

  renderLevelHearts(meta.level ?? song.level);
  setInfoCover(song.coverUrl || null);

  const bg =
    normalizeHexColor(meta.themeBg) ||
    normalizeHexColor(song.themeBg) ||
    DEFAULT_THEME.bgHex;
  const fg =
    normalizeHexColor(meta.themeFg) ||
    normalizeHexColor(song.themeFg) ||
    DEFAULT_THEME.fgHex;
  applyTheme(bg, fg);
  setPickTarget(infoUi.pickTarget);
  syncCoverDisplay();
}

function syncPlayPauseButton() {
  if (!dom.btnPlayPause || !dom.videoEl) return;
  const playing = !dom.videoEl.paused && !dom.videoEl.ended && !!dom.videoEl.src;
  dom.btnPlayPause.innerHTML = playing ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
  dom.btnPlayPause.title = playing ? "暂停" : "播放";
  dom.btnPlayPause.setAttribute("aria-label", playing ? "暂停" : "播放");
  const current = dom.playlistGrid?.querySelector(
    ".song-card.is-current .song-card-play-icon",
  );
  if (current) current.innerHTML = getPlayIconSvg(state.currentIndex);
}

function togglePlayPause() {
  const list = getPlayableIndices();
  if (!list.length) {
    showToast(
      hasImportedSongs()
        ? "当前筛选结果为空"
        : "请先导入歌曲",
    );
    return;
  }
  if (state.currentIndex < 0 || !list.includes(state.currentIndex)) {
    playSongAt(list[0]);
    return;
  }
  const v = dom.videoEl;
  if (!v?.src) {
    playSongAt(state.currentIndex);
    return;
  }
  if (v.paused || v.ended) {
    resumeAudioContext();
    v.play().catch(() => {});
  } else {
    v.pause();
  }
}

/* ---------- 导入 ---------- */

function baseNameOf(name) {
  return String(name).replace(/\.[^.]+$/, "");
}

/** 歌词匹配键：去扩展名、去前导 @ */
function lrcBaseKey(name) {
  return baseNameOf(name).replace(/^@+/, "").trim().toLowerCase();
}

function extOf(name) {
  const m = String(name).toLowerCase().match(/(\.[^./\\]+)$/);
  return m ? m[1] : "";
}

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

function normalizeLevel(n) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return 1;
  return Math.min(LEVEL_MAX, Math.max(1, x));
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

function revokeSongObjectUrls(songs) {
  (songs || []).forEach((v) => revokeOneSongObjectUrls(v));
}

function revokeOneSongObjectUrls(v) {
  if (!v) return;
  if (v.url?.startsWith("blob:")) URL.revokeObjectURL(v.url);
  if (v.coverUrl?.startsWith("blob:")) URL.revokeObjectURL(v.coverUrl);
  if (v.lrcUrl?.startsWith("blob:")) URL.revokeObjectURL(v.lrcUrl);
}

function songDedupeKey(song) {
  const rel = String(song.relPath || "").trim().toLowerCase();
  if (rel) return `path:${rel}`;
  const file = String(song.fileName || "").trim().toLowerCase();
  if (file) return `file:${file}`;
  const title = String(song.title || "").trim().toLowerCase();
  return title ? `title:${title}` : "";
}

function hasImportedSongs() {
  return state.songs.some((s) => !!s.url);
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

function applyDuplicateTitleLabels(songs) {
  const groups = new Map();
  songs.forEach((v) => {
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

  songs.forEach((v) => {
    if (!v.titleDisplay) v.titleDisplay = v.title;
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
    if (MEDIA_EXTS.some((ext) => lower.endsWith(ext))) mediaFiles.push(f);
    else if (COVER_EXTS.some((ext) => lower.endsWith(ext))) coverFiles.push(f);
    else if (lower.endsWith(LRC_EXT)) lrcFiles.push(f);
    else if (lower === "video.json") videoJsonFiles.push(f);
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
    const baseLower = lrcBaseKey(f.name);
    if (!baseLower) return;
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

  const songs = [];

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

    let coverUrl = "";
    let coverFileName = null;
    const scopedCovers =
      coverMapScoped.get(`${relDir}::${baseLower}`) || coverMapGlobal.get(baseLower) || [];
    const bestCover = pickBestCover(scopedCovers);
    if (bestCover) {
      const coverFile = await bestCover.handle.getFile();
      coverUrl = URL.createObjectURL(coverFile);
      coverFileName = bestCover.name;
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

    let lrcUrl = "";
    let lrcFileName = null;
    let lrcText = "";
    const mediaKey = lrcBaseKey(base);
    const titleKey = lrcBaseKey(saved.title || base);
    const lrcItem =
      lrcMapScoped.get(`${relDir}::${mediaKey}`) ||
      lrcMapScoped.get(`${relDir}::${titleKey}`) ||
      lrcMapGlobal.get(mediaKey) ||
      lrcMapGlobal.get(titleKey) ||
      null;
    if (lrcItem) {
      const lrcFile = await lrcItem.handle.getFile();
      lrcText = await readLrcTextFromFile(lrcFile);
      lrcUrl = URL.createObjectURL(lrcFile);
      lrcFileName = lrcItem.name;
    }

    songs.push({
      id: songs.length,
      title: saved.title || base,
      titleDisplay: saved.title || base,
      fileName: fileItem.name,
      relPath,
      relDir,
      url,
      categories: readCategoriesFromMeta(saved),
      authors: readStringListFromMeta(saved, "authors", "author"),
      roles: readStringListFromMeta(saved, "roles", "role"),
      tags: readStringListFromMeta(saved, "tags", "labels"),
      level: normalizeLevel(saved.level),
      themeBg: saved.themeBg || "",
      themeFg: saved.themeFg || "",
      coverUrl,
      coverFileName,
      lrcUrl,
      lrcFileName,
      lrcText,
    });
  }

  songs.sort(
    (a, b) =>
      a.title.localeCompare(b.title, "zh-CN", { numeric: true, sensitivity: "base" }) ||
      a.relPath.localeCompare(b.relPath, "zh-CN", { numeric: true, sensitivity: "base" }),
  );

  const keepPlaying =
    state.currentIndex >= 0 ? state.songs[state.currentIndex] : null;
  const existing = hasImportedSongs()
    ? state.songs.filter((s) => !!s.url)
    : [];
  const existingKeys = new Set(
    existing.map(songDedupeKey).filter(Boolean),
  );

  const added = [];
  let skipped = 0;
  for (const s of songs) {
    const key = songDedupeKey(s);
    if (key && existingKeys.has(key)) {
      revokeOneSongObjectUrls(s);
      skipped += 1;
      continue;
    }
    if (key) existingKeys.add(key);
    added.push(s);
  }

  // 首次导入时清掉占位曲目；再次导入则叠加
  if (!existing.length) {
    revokeSongObjectUrls(state.songs.filter((s) => !s.url));
  }

  const merged = [...existing, ...added];
  merged.sort(
    (a, b) =>
      a.title.localeCompare(b.title, "zh-CN", { numeric: true, sensitivity: "base" }) ||
      String(a.relPath || "").localeCompare(String(b.relPath || ""), "zh-CN", {
        numeric: true,
        sensitivity: "base",
      }),
  );
  applyDuplicateTitleLabels(merged);
  merged.forEach((v, index) => {
    v.id = index;
  });
  state.songs = merged;
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  buildAllFilterPanels();
  clearLyricsState();

  if (keepPlaying?.url) {
    const idx = merged.findIndex(
      (s) =>
        s.url === keepPlaying.url ||
        (songDedupeKey(s) && songDedupeKey(s) === songDedupeKey(keepPlaying)),
    );
    state.currentIndex = idx >= 0 ? idx : merged.length ? 0 : -1;
    renderPlaylist();
    syncPlayPauseButton();
    syncProgressFromVideo();
    syncInfoEditSessionToCurrentSong();
    renderInfoView();
    ensureLyricsLoaded();
  } else if (merged.length) {
    state.currentIndex = 0;
    const v = merged[0];
    if (v?.url) {
      setVideoSource(v.url);
      applyPlaybackRate();
      applyVolume();
    }
    renderPlaylist();
    syncPlayPauseButton();
    syncProgressFromVideo();
    syncInfoEditSessionToCurrentSong();
    renderInfoView();
    ensureLyricsLoaded();
  } else {
    state.currentIndex = -1;
    setVideoSource("");
    renderPlaylist();
    syncPlayPauseButton();
    syncProgressFromVideo();
    if (infoUi.editing) {
      clearInfoEditSession();
      infoUi.editing = false;
      syncInfoEditingUi();
    }
    renderInfoView();
    ensureLyricsLoaded();
  }

  if (existing.length) {
    showToast(
      skipped
        ? `新增 ${added.length} 首，跳过 ${skipped} 首重复，共 ${merged.length} 首`
        : `新增 ${added.length} 首，共 ${merged.length} 首`,
    );
  } else {
    showToast(`已导入 ${merged.length} 首歌曲`);
  }
}

async function openImportFolderPicker() {
  const rootHandle = await pickRootFolder();
  if (!rootHandle) return;
  state.root = rootHandle;
  await scanAllFromRoot();
}

/* ---------- 可视化 ---------- */

let audioContext = null;
let analyser = null;
let analyserDataArray = null;
let visualizerRaf = 0;

function parseComponentRgb() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--component-color")
    .trim();
  if (raw.startsWith("#") && (raw.length === 7 || raw.length === 4)) {
    const hex =
      raw.length === 4
        ? `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`
        : raw;
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }
  const m = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return { r: 0, g: 0, b: 0 };
}

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

/** 与原设计一致：居中镜像柱状频谱 + 右下淡化阴影 */
function drawBarsVisualizer(ctx, canvas, rgb, freqData) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const shadow = readVisualizerShadowMetrics();
  const barCount = 36;
  const barMaxHeight = h * 0.85;
  const midX = w / 2;
  const barWidth = w / 2 / barCount;
  const hasData = freqData && freqData.length > 0;

  const drawBar = (x, barHeight) => {
    const bx = x + 2;
    const barW = Math.max(1, barWidth - 4);
    const { r, g, b } = rgb;
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
    const magnitude = hasData
      ? (freqData[Math.floor((i / barCount) * freqData.length)] || 0) / 255
      : 0;
    const barHeight = Math.max(2, magnitude * barMaxHeight);
    drawBar(midX - (i + 1) * barWidth, barHeight);
    drawBar(midX + i * barWidth, barHeight);
  }

  const { r, g, b } = rgb;
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
  ctx.fillRect(0, h - 6, w, 2);
}

function resizeVizCanvas() {
  const canvas = dom.vizCanvas;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function resumeAudioContext() {
  if (audioContext?.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
}

function setupAudioVisualization() {
  const canvas = dom.vizCanvas;
  if (!canvas || !dom.videoEl) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  resizeVizCanvas();
  window.addEventListener("resize", resizeVizCanvas);

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.7;
    analyserDataArray = new Uint8Array(analyser.frequencyBinCount);
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
    if (!analyser || !analyserDataArray) {
      drawBarsVisualizer(ctx, canvas, parseComponentRgb(), null);
      return;
    }
    analyser.getByteFrequencyData(analyserDataArray);
    drawBarsVisualizer(ctx, canvas, parseComponentRgb(), analyserDataArray);
  };

  if (!visualizerRaf) {
    visualizerRaf = requestAnimationFrame(draw);
  }
}

/* ---------- 文案 / 翻译 ---------- */

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

function formatUserFacingText(text) {
  return displayLabel(text);
}

function getInfoNameCopyText(song = getCurrentSong()) {
  if (!song) return "";
  const raw = String(song.titleDisplay || song.title || "").trim();
  if (!raw) return "";
  if (infoUi.editing) return raw;
  return formatUserFacingText(raw);
}

async function copyInfoNameToClipboard() {
  const text = getInfoNameCopyText();
  if (!text || text === INFO_DEFAULT_NAME) {
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

function toggleTranslateMode() {
  state.translateMode = !state.translateMode;
  applyTranslateModeUi();
  buildAllFilterPanels();
  renderPlaylist();
  renderInfoView();
  showToast(state.translateMode ? "已进入翻译模式" : "已退出翻译模式");
}

/* ---------- 导出 ---------- */

function buildVideoJsonPayload() {
  return state.songs
    .filter((v) => !!v.fileName || !!v.relPath)
    .map((v) => {
      const item = {
        title: v.title,
        fileName: v.fileName,
        relPath: v.relPath,
        categories: v.categories || [],
        authors: v.authors || [],
        roles: v.roles || [],
        tags: v.tags || [],
        level: normalizeLevel(v.level),
        themeBg: v.themeBg || "",
        themeFg: v.themeFg || "",
      };
      if (v.coverFileName) item.coverFileName = v.coverFileName;
      if (v.lrcFileName) item.lrcFileName = v.lrcFileName;
      return item;
    });
}

async function exportVideoJson() {
  const payload = buildVideoJsonPayload();
  if (!payload.length) {
    showToast(hasImportedSongs() ? "无可导出数据" : "请先导入歌曲");
    return;
  }

  const dataStr = JSON.stringify(payload, null, 2);

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

/* ---------- 音量 ---------- */

function applyVolume() {
  const v = dom.videoEl;
  if (!v) return;
  const vol = Math.min(1, Math.max(0, state.volume));
  v.volume = vol;
  v.muted = vol <= 0;
  syncVolumeSlider();
}

function syncVolumeSlider() {
  if (!dom.volumeSlider || !dom.videoEl) return;
  const vol = dom.videoEl.muted ? 0 : dom.videoEl.volume;
  const pct = Math.round(Math.min(1, Math.max(0, vol)) * 100);
  state.volume = pct / 100;
  dom.volumeSlider.value = String(pct);
}

function setVideoVolume(normalized) {
  state.volume = Math.min(1, Math.max(0, normalized));
  applyVolume();
}

function setVolumePopoverOpen(open) {
  state.volumeOpen = !!open;
  if (dom.volumePopover) dom.volumePopover.hidden = !state.volumeOpen;
  dom.btnVolume?.setAttribute(
    "aria-expanded",
    state.volumeOpen ? "true" : "false",
  );
  if (state.volumeOpen) syncVolumeSlider();
}

function toggleVolumePopover() {
  setVolumePopoverOpen(!state.volumeOpen);
}

function bindVolumeEvents() {
  dom.btnVolume?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleVolumePopover();
  });

  dom.volumeSlider?.addEventListener("input", () => {
    const pct = Number(dom.volumeSlider.value);
    if (!Number.isFinite(pct)) return;
    setVideoVolume(pct / 100);
  });

  dom.volumePopover?.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", (e) => {
    if (!state.volumeOpen || !dom.volumeControl) return;
    if (!dom.volumeControl.contains(e.target)) {
      setVolumePopoverOpen(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && state.volumeOpen) {
      setVolumePopoverOpen(false);
    }
  });
}

/* ---------- 播放队列 / 模式 / 速度 ---------- */

function getPlayableIndices() {
  return getFilteredIndices().filter((i) => !!state.songs[i]?.url);
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
  state.songs.forEach((v) => {
    filterFieldValues(v, kind).forEach((x) => {
      if (kind === "category" && isExcludedFilterCategory(x)) return;
      values.add(String(x).trim());
    });
  });
  if (countEmptyField(kind) > 0) values.add(FILTER_NONE);
  return values;
}

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

function matchesSetWithNone(set, values) {
  if (!set?.size) return true;
  const wantsEmpty = set.has(FILTER_NONE);
  const wantsValues = [...set].filter((k) => k !== FILTER_NONE);
  const matchEmpty = wantsEmpty && values.length === 0;
  const matchValues =
    wantsValues.length > 0 && values.some((x) => wantsValues.includes(String(x)));
  if (wantsEmpty && wantsValues.length === 0) return values.length === 0;
  if (!wantsEmpty && wantsValues.length > 0) return matchValues;
  if (wantsEmpty && wantsValues.length > 0) return matchEmpty || matchValues;
  return true;
}

function songMatchesMetaFilter(v, kind) {
  const set = getFilterSet(kind);
  if (!set?.size) return true;
  return matchesSetWithNone(set, filterFieldValues(v, kind));
}

function countEmptyField(kind) {
  if (kind === "level") return 0;
  return state.songs.filter((v) => filterFieldValues(v, kind).length === 0).length;
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

function songPassesFilters(v) {
  if (!songMatchesMetaFilter(v, "category")) return false;
  if (!songMatchesMetaFilter(v, "author")) return false;
  if (!songMatchesMetaFilter(v, "role")) return false;
  if (!matchesFilterLevel(filterSelection.level, v.level)) return false;
  return true;
}

function getFilteredIndices() {
  const indices = [];
  state.songs.forEach((v, index) => {
    if (songPassesFilters(v)) indices.push(index);
  });
  return indices;
}

function buildFilterPools() {
  const baseSongs = state.songs.filter((v) => songMatchesMetaFilter(v, "category"));

  const songsForCategories = state.songs.filter((v) => {
    if (filterSelection.author.size && !songMatchesMetaFilter(v, "author")) return false;
    if (filterSelection.role.size && !songMatchesMetaFilter(v, "role")) return false;
    if (
      filterSelection.level.size &&
      !filterSelection.level.has(String(normalizeLevel(v.level)))
    ) {
      return false;
    }
    return true;
  });

  const songsForAuthors = baseSongs.filter((v) => {
    if (filterSelection.role.size && !songMatchesMetaFilter(v, "role")) return false;
    if (
      filterSelection.level.size &&
      !filterSelection.level.has(String(normalizeLevel(v.level)))
    ) {
      return false;
    }
    return true;
  });

  const songsForRoles = baseSongs.filter((v) => {
    if (filterSelection.author.size && !songMatchesMetaFilter(v, "author")) return false;
    if (
      filterSelection.level.size &&
      !filterSelection.level.has(String(normalizeLevel(v.level)))
    ) {
      return false;
    }
    return true;
  });

  const songsForLevels = baseSongs.filter((v) => {
    if (filterSelection.author.size && !songMatchesMetaFilter(v, "author")) return false;
    if (filterSelection.role.size && !songMatchesMetaFilter(v, "role")) return false;
    return true;
  });

  const categories = new Set();
  songsForCategories.forEach((v) => {
    filterFieldValues(v, "category").forEach((c) => {
      if (!isExcludedFilterCategory(c)) categories.add(c);
    });
  });

  const authors = new Set();
  songsForAuthors.forEach((v) => {
    (v.authors || []).forEach((a) => authors.add(a));
  });

  const roles = new Set();
  songsForRoles.forEach((v) => {
    (v.roles || []).forEach((r) => roles.add(r));
  });

  const levels = new Set();
  for (let i = 1; i <= LEVEL_MAX; i++) levels.add(String(i));

  const countCategory = (cat) =>
    songsForCategories.filter((v) => filterFieldValues(v, "category").includes(cat))
      .length;
  const countAuthor = (author) =>
    author === FILTER_NONE
      ? countEmptyField("author")
      : songsForAuthors.filter((v) => (v.authors || []).includes(author)).length;
  const countRole = (role) =>
    role === FILTER_NONE
      ? countEmptyField("role")
      : songsForRoles.filter((v) => (v.roles || []).includes(role)).length;
  const countLevel = (level) =>
    songsForLevels.filter((v) => String(normalizeLevel(v.level)) === String(level))
      .length;

  return {
    categories,
    authors,
    roles,
    levels,
    countCategory,
    countAuthor,
    countRole,
    countLevel,
    countEmptyCategory: songsForCategories.filter(
      (v) => filterFieldValues(v, "category").length === 0,
    ).length,
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
    labelEl: document
      .getElementById(def.btnId)
      ?.querySelector(".toolbar-filter-label"),
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
  btn.textContent = text;
}

function buildFilterPanel(kind) {
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
}

function buildAllFilterPanels() {
  sanitizeFilterSelection();
  FILTER_PANELS.forEach(({ kind }) => buildFilterPanel(kind));
  updateFilterButtonLabels();
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
  const main = document.getElementById("appMain") || document.querySelector(".main");
  const mainTop = main?.getBoundingClientRect().top;
  panel.style.position = "fixed";
  panel.style.left = `${rect.left}px`;
  panel.style.top = `${Number.isFinite(mainTop) ? mainTop : rect.bottom + 6}px`;
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
}

function scrollFilterPanelSelectionToCenter(panel) {
  if (!panel) return;
  const scrollSelected = () => {
    const selected = panel.querySelector(
      '.toolbar-filter-option[role="option"][aria-selected="true"]',
    );
    if (selected) {
      selected.scrollIntoView({
        block: "center",
        inline: "nearest",
        behavior: "auto",
      });
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
  }

  FILTER_PANELS.forEach(({ kind }) => {
    buildFilterPanel(kind);
  });

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

function getShuffleFingerprint() {
  return getPlayableIndices().join(",");
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
  const indices = getPlayableIndices();
  state.shuffleOrder = indices.length ? shuffleIndices(indices) : [];
}

function syncShuffleOrder() {
  if (state.playMode !== "shuffle") return;
  if (state.shuffleFingerprint !== getShuffleFingerprint()) {
    regenerateShuffleOrder();
  }
}

function resolveManualTrackIndex(direction) {
  const list = getPlayableIndices();
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
  const list = getPlayableIndices();
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
  const list = getPlayableIndices();
  if (!list.length) {
    showToast(hasImportedSongs() ? "当前列表为空" : "请先导入歌曲");
    return;
  }
  if (state.currentIndex < 0 || !list.includes(state.currentIndex)) {
    playSongAt(list[0]);
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
  const list = getPlayableIndices();
  if (!list.length) {
    showToast(
      hasImportedSongs()
        ? "当前筛选结果为空"
        : "请先导入歌曲",
    );
    return;
  }
  if (state.playMode === "single") {
    replayCurrentInSingleMode();
    return;
  }
  const idx = resolveManualTrackIndex(direction);
  if (idx === null) return;
  playSongAt(idx);
}

function handleVideoEnded() {
  if (!getPlayableIndices().length) {
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
  if (nextIdx !== null) playSongAt(nextIdx);
  else {
    syncPlayPauseButton();
    renderPlaylist();
  }
}

function applyPlaybackRate() {
  if (!dom.videoEl) return;
  dom.videoEl.playbackRate = state.playbackRate;
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
  dom.btnPlayMode.innerHTML =
    iconByMode[state.playMode] || PLAY_MODE_SHUFFLE_SVG;
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
  const target =
    document.querySelector(".player-zone-video") || video;
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
  const visible = getVisibleSongs();
  if (!visible.some((s) => s.id === state.currentIndex)) {
    showToast("当前视频不在列表中，请清空或调整筛选/搜索");
    return;
  }
  requestAnimationFrame(() => {
    const card = dom.playlistGrid?.querySelector(
      `.song-card[data-id="${state.currentIndex}"]`,
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

function bindEvents() {
  dom.playlistTitleBtn?.addEventListener("click", openPlaylistSearch);

  dom.playlistSearch?.addEventListener("input", () => {
    state.searchQuery = dom.playlistSearch.value;
    renderPlaylist();
  });

  dom.playlistSearch?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePlaylistSearch();
    }
  });

  dom.playlistSearch?.addEventListener("blur", () => {
    if (!dom.playlistSearch.value.trim()) closePlaylistSearch();
  });

  dom.btnVizLyrics?.addEventListener("click", toggleMidChromeMode);

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

  dom.btnInfoEdit?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleInfoEditing();
  });
  dom.btnInfoSave?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!infoUi.editing) {
      showToast("当前不在编辑模式");
      return;
    }
    saveInfoEdit();
  });
  dom.btnInfoExport?.addEventListener("click", (e) => {
    e.stopPropagation();
    exportInfoWithSave().catch((err) => console.error(err));
  });

  bindColorPickEvents();

  dom.btnImport?.addEventListener("click", () => {
    openImportFolderPicker().catch((e) => console.error(e));
  });
  dom.btnTranslate?.addEventListener("click", toggleTranslateMode);
  bindVolumeEvents();

  dom.btnPrev?.addEventListener("click", () => playAdjacentTrack(-1));
  dom.btnPlayPause?.addEventListener("click", togglePlayPause);
  dom.btnNext?.addEventListener("click", () => playAdjacentTrack(1));
  dom.btnSpeed?.addEventListener("click", cyclePlaybackSpeed);
  dom.btnPlayMode?.addEventListener("click", togglePlayMode);
  dom.btnPip?.addEventListener("click", () => {
    togglePictureInPicture().catch((e) => console.error(e));
  });
  dom.btnFullscreen?.addEventListener("click", () => {
    toggleFullscreen().catch((e) => console.error(e));
  });

  dom.btnListTop?.addEventListener("click", scrollPlaylistToTop);
  dom.btnLocate?.addEventListener("click", () => locateCurrentInPlaylist());
  dom.btnListBottom?.addEventListener("click", scrollPlaylistToBottom);

  bindFilterEvents();

  if (dom.videoEl) {
    dom.videoEl.addEventListener("timeupdate", syncProgressFromVideo);
    dom.videoEl.addEventListener("loadedmetadata", () => {
      applyPlaybackRate();
      applyVolume();
      syncProgressFromVideo();
    });
    dom.videoEl.addEventListener("play", () => {
      resumeAudioContext();
      syncPlayPauseButton();
    });
    dom.videoEl.addEventListener("pause", syncPlayPauseButton);
    dom.videoEl.addEventListener("ended", handleVideoEnded);
    dom.videoEl.addEventListener("volumechange", syncVolumeSlider);
  }

  dom.progressTrack?.addEventListener("pointerdown", (e) => {
    dom.progressTrack.setPointerCapture?.(e.pointerId);
    seekByClientX(e.clientX);
    updateProgressTimeTip(e.clientX);
  });
  dom.progressTrack?.addEventListener("pointermove", (e) => {
    updateProgressTimeTip(e.clientX);
    if (e.buttons !== 1) return;
    seekByClientX(e.clientX);
  });
  dom.progressTrack?.addEventListener("pointerenter", (e) => {
    updateProgressTimeTip(e.clientX);
  });
  dom.progressTrack?.addEventListener("pointerleave", () => {
    hideProgressTimeTip();
  });
}

function init() {
  bindEvents();
  applyVolume();
  applyPlaybackRate();
  applyPlayModeUi();
  applyTranslateModeUi();
  syncMidChromeModeUi();
  syncInfoEditingUi();
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  buildAllFilterPanels();
  renderPlaylist();
  renderInfoView();
  syncProgressFromVideo();
  syncPlayPauseButton();
  syncBottomChromeAlignment();
  window.addEventListener("resize", syncBottomChromeAlignment);
  setupAudioVisualization();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
