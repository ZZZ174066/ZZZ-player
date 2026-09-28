/**
 * 本地视频播放器 */

const MEDIA_EXTS = [".mp4", ".mp3", ".flac"];
const COVER_EXTS = [".jpg", ".jpeg", ".png", ".gif"];
const LRC_EXT = ".lrc";
const LEVEL_MAX = 5;
/** 乐库目录选择器 ID（≤32 字符；浏览器按此记住上次位置） */
const LIBRARY_PICKER_ID = "vp-lib-d-video-music";
const LIBRARY_DB_NAME = "video-player-library";
const LIBRARY_STORE = "handles";
const LIBRARY_HANDLE_KEY = "root";

const PLAY_ICON_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M893.035 463.821679C839.00765 429.699141 210.584253 28.759328 179.305261 8.854514 139.495634-16.737389 99.686007 17.385148 99.686007 57.194775v909.934329c0 45.496716 42.653172 68.245075 76.775709 48.340262 45.496716-28.435448 676.763657-429.375262 716.573284-454.967165 34.122537-22.748358 34.122537-76.775709 0-96.680522z"/></svg>`;
const PAUSE_ICON_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M128 0h253.155556v1024H128V0z m512 0h256v1024h-256V0z"/></svg>`;
const PLAY_MODE_SHUFFLE_SVG = `<svg viewBox="0 0 1170 1024" aria-hidden="true"><path fill="currentColor" d="M950.616094 1023.999269a73.124315 73.124315 0 0 1-51.918264-21.206052 73.124315 73.124315 0 0 1 0-103.836527l21.937295-21.206051H731.243149a73.124315 73.124315 0 0 1-62.155668-34.368428L325.403201 292.75612H73.124315a73.124315 73.124315 0 0 1 0-146.24863h292.49726a73.124315 73.124315 0 0 1 62.155667 34.368428l121.386363 193.779434 119.923876-193.779434A73.124315 73.124315 0 0 1 731.243149 146.50749h189.391976l-21.937295-21.206051A73.124315 73.124315 0 0 1 1002.534357 21.464911l146.24863 146.24863a73.124315 73.124315 0 0 1 0 103.836527l-146.24863 146.24863a73.124315 73.124315 0 0 1-103.836527-103.836527l21.937295-21.206051h-146.24863l-138.936198 219.372944 136.011225 219.372945h146.24863l-21.937294-21.206051a73.124315 73.124315 0 0 1 103.836527-103.836527l146.24863 146.248629a73.124315 73.124315 0 0 1 0 103.836528l-146.24863 146.248629A73.124315 73.124315 0 0 1 950.616094 1023.999269z m-584.994519-146.24863H73.124315a73.124315 73.124315 0 0 1 0-146.24863h253.010129l25.593511-40.218373a73.124315 73.124315 0 0 1 122.848849 79.705503l-47.530805 73.124315A73.124315 73.124315 0 0 1 365.621575 877.750639z"/></svg>`;
const PLAY_MODE_LIST_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M569.6 448H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c-6.4-25.6-25.6-44.8-51.2-44.8z m0 332.8H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c-6.4-25.6-25.6-44.8-51.2-44.8zM44.8 243.2H576c25.6 0 44.8-19.2 44.8-44.8v-44.8c0-25.6-19.2-44.8-44.8-44.8H44.8c-25.6 0-44.8 19.2-44.8 44.8v44.8c0 25.6 19.2 44.8 44.8 44.8z m684.8-134.4c-25.6 0-44.8 19.2-38.4 44.8v716.8c0 25.6 19.2 44.8 44.8 44.8h32c12.8 0 32-6.4 38.4-25.6l217.6-236.8c0-25.6-19.2-44.8-44.8-44.8h-166.4V153.6c0-25.6-19.2-44.8-44.8-44.8h-38.4z"/></svg>`;
const PLAY_MODE_SINGLE_SVG = `<svg viewBox="0 0 1024 1024" aria-hidden="true"><path fill="currentColor" d="M449.024 832.512h-52.736c-152.064-25.088-268.288-157.184-268.288-315.904 0-53.248 13.824-102.912 36.864-146.944l39.424 54.272c28.672 39.424 90.112 28.672 103.424-18.432l31.232-112.64 43.008-155.136c10.24-37.376-17.408-73.728-56.32-73.728h-267.264c-47.616 0-74.752 53.76-47.104 92.16l72.192 100.352c-52.224 73.216-83.456 162.816-83.456 260.096 0 224.256 164.352 409.6 378.88 442.88 5.632 1.024 11.776 0.512 16.896 0v1.024h52.736c34.816 0 62.976-28.16 62.976-62.976v-1.536c0.512-35.328-27.648-63.488-62.464-63.488zM1012.736 867.328l-72.192-100.352C992.768 693.76 1024 604.16 1024 507.392c0-224.256-164.352-409.6-378.88-442.88-5.632-1.024-11.776-0.512-16.896 0v-1.024h-52.736c-34.816 0-62.976 28.16-62.976 62.976v1.536c0 34.816 28.16 62.976 62.976 62.976h52.736C779.776 216.064 896 348.672 896 507.392c0 53.248-13.824 102.912-36.864 146.944l-39.424-54.272c-28.672-39.424-90.112-28.672-103.424 18.432l-31.232 112.64-43.008 155.136c-10.24 37.376 17.408 73.728 56.32 73.728h267.264c47.616-0.512 74.752-54.272 47.104-92.672z"/><path fill="currentColor" d="M554.496 349.184v263.168h-43.008v-211.456c-15.872 14.336-35.84 25.088-59.904 32.256v-43.008c11.776-3.072 24.576-8.192 37.376-15.36 13.312-8.192 24.576-16.384 33.28-25.6h32.256z"/></svg>`;
const PLAY_MODE_LABELS = {
  shuffle: "随机播放",
  list: "顺序播放",
  single: "单曲循环",
};

const HEART_PATH =
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
const heartSvg = (cls) =>
  `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}"/></svg>`;
const LEVEL_FILTER_HEART_SVG = heartSvg("level-filter-heart");
const INFO_DEFAULT_NAME = "歌曲名称";
const DEFAULT_THEME = { bgHex: "#ffffff", fgHex: "#000000" };
const FILTER_NONE = "__filter_none__";
const FILTER_KINDS = ["author", "role", "level"];

const FILTER_PANELS = [
  { kind: "author", btnId: "filterAuthorBtn", panelId: "filterAuthorPanel", defaultLabel: "作者" },
  { kind: "role", btnId: "filterRoleBtn", panelId: "filterRolePanel", defaultLabel: "歌手" },
  { kind: "level", btnId: "filterLevelBtn", panelId: "filterLevelPanel", defaultLabel: "喜爱" },
];

const state = {
  root: null,
  songs: [],
  currentIndex: -1,
  searchQuery: "",
  infoPanelMode: "info",
  playbackRate: 1,
  playMode: "shuffle",
  shuffleOrder: [],
  shuffleFingerprint: "",
  volume: 1,
  volumeOpen: false,
  themeColor: DEFAULT_THEME.bgHex,
  componentColor: DEFAULT_THEME.fgHex,
  lyrics: [],
  lyricsSongId: -1,
  activeLyricIndex: -1,
  lyricsLoadToken: 0,
  filters: { author: new Set(), role: new Set(), level: new Set() },
  openKind: null,
  editing: false,
  editSnapshot: null,
  editWork: null,
  pickTarget: null,
};

const $ = (id) => document.getElementById(id);
const on = (el, ev, fn, opts) => el?.addEventListener(ev, fn, opts);
const cmpZh = (a, b) =>
  String(a).localeCompare(String(b), "zh-CN", { numeric: true, sensitivity: "base" });
const dom = {
  playlistGrid: $("playlistGrid"),
  playlistHeader: $("playlistHeader"),
  playlistSearch: $("playlistSearch"),
  btnPlaylistSearch: $("btnPlaylistSearch"),
  infoPanelRoot: $("infoPanelRoot"),
  infoTabSongBtn: $("infoTabSongBtn"),
  infoTabLyricsBtn: $("infoTabLyricsBtn"),
  infoView: $("infoView"),
  infoLyricsView: $("infoLyricsView"),
  infoLyricsEmpty: $("infoLyricsEmpty"),
  infoLyricsScroller: $("infoLyricsScroller"),
  infoLyricsPrev: $("infoLyricsPrev"),
  infoLyricsCurrent: $("infoLyricsCurrent"),
  infoLyricsNext: $("infoLyricsNext"),
  infoControls: $("infoControls"),
  btnInfoEdit: $("btnInfoEdit"),
  btnInfoSave: $("btnInfoSave"),
  btnInfoExport: $("btnInfoExport"),
  infoCoverBox: $("infoCoverBox"),
  infoCoverPlaceholder: $("infoCoverPlaceholder"),
  infoCoverImg: $("infoCoverImg"),
  infoNameDisplay: $("infoNameDisplay"),
  infoNameInput: $("infoNameInput"),
  infoAuthorChips: $("infoAuthorChips"),
  infoAuthorInput: $("infoAuthorInput"),
  infoRoleChips: $("infoRoleChips"),
  infoRoleInput: $("infoRoleInput"),
  infoLevel: $("infoLevel"),
  infoThemePreview: $("infoThemePreview"),
  infoComponentPreview: $("infoComponentPreview"),
  infoCoverPickCanvas: $("infoCoverPickCanvas"),
  playerZoneVideo: document.querySelector(".player-zone-video"),
  videoEl: $("videoElement"),
  progressWrap: $("progressWrap"),
  progressTrack: $("progressTrack"),
  progressTimeTip: $("progressTimeTip"),
  progressTimeCurrent: $("progressTimeCurrent"),
  progressTimeDuration: $("progressTimeDuration"),
  vizCanvas: $("visualizerCanvas"),
  btnImport: $("btnImport"),
  btnVolume: $("btnVolume"),
  btnPrev: $("btnPrev"),
  btnPlayPause: $("btnPlayPause"),
  btnNext: $("btnNext"),
  btnSpeed: $("btnSpeed"),
  btnPlayMode: $("btnPlayMode"),
  btnPip: $("btnPip"),
  btnFullscreen: $("btnFullscreen"),
  volumeControl: $("volumeControl"),
  volumePopover: $("volumePopover"),
  volumeSlider: $("volumeSlider"),
  playlistControls: $("playlistControls"),
  btnListTop: $("btnListTop"),
  btnLocate: $("btnLocate"),
  btnListBottom: $("btnListBottom"),
};

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
    if (dom.progressTimeCurrent) dom.progressTimeCurrent.textContent = "0:00";
    if (dom.progressTimeDuration) dom.progressTimeDuration.textContent = "0:00";
    syncActiveLyric();
    return;
  }
  setProgressUi((v.currentTime / v.duration) * 100);
  if (dom.progressTimeCurrent) {
    dom.progressTimeCurrent.textContent = formatMediaTime(v.currentTime);
  }
  if (dom.progressTimeDuration) {
    dom.progressTimeDuration.textContent = formatMediaTime(v.duration);
  }
  syncActiveLyric();
}

function seekByClientX(clientX) {
  const v = dom.videoEl;
  if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return;
  v.currentTime = progressRatioFromClientX(clientX) * v.duration;
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
  const rect = track.getBoundingClientRect();
  tip.style.left = `${Math.min(rect.width, Math.max(0, clientX - rect.left))}px`;
}

function hideProgressTimeTip() {
  if (!dom.progressTimeTip) return;
  dom.progressTimeTip.hidden = true;
}

function songMatchesSearchQuery(song, q) {
  if (!q) return true;
  const hay = [
    song.titleDisplay || song.title || "",
    ...(song.authors || []),
    ...(song.roles || []),
  ]
    .join("\n")
    .toLowerCase();
  return hay.includes(q);
}

function getVisibleSongs() {
  const q = state.searchQuery.trim().toLowerCase();
  return state.songs.filter((s) => songPassesFilters(s) && songMatchesSearchQuery(s, q));
}

function isPlaying(index) {
  const v = dom.videoEl;
  return index === state.currentIndex && !!v?.src && !v.paused && !v.ended;
}

function setInfoPanelMode(mode) {
  const next = mode === "lyrics" ? "lyrics" : "info";
  if (state.infoPanelMode === next) {
    if (next === "lyrics") ensureLyricsLoaded().then(() => syncActiveLyric(true));
    return;
  }
  if (next !== "info" && state.editing) setInfoEditing(false);
  state.infoPanelMode = next;
  syncInfoPanelModeUi();
  if (next === "lyrics") ensureLyricsLoaded().then(() => syncActiveLyric(true));
}

function syncInfoPanelModeUi() {
  const isInfo = state.infoPanelMode === "info";
  dom.infoPanelRoot?.classList.toggle("is-info-mode", isInfo);
  if (dom.infoLyricsView) dom.infoLyricsView.hidden = isInfo;
  if (dom.infoView) dom.infoView.hidden = !isInfo;
  if (dom.infoControls) dom.infoControls.hidden = !isInfo;
  dom.infoTabSongBtn?.classList.toggle("is-active", isInfo);
  dom.infoTabLyricsBtn?.classList.toggle("is-active", !isInfo);
}

function songHasSpecialBadge(song) {
  if (!song) return false;
  if (song.coverIsGif) return true;
  const name = String(song.coverFileName || "").toLowerCase();
  return name.endsWith(".gif");
}

function specialBadgeHtml(variant = "card") {
  const meta = variant === "meta" ? " video-card-special-badge--meta" : "";
  return `<span class="video-card-special-badge${meta}" aria-hidden="true"><span class="video-card-special-badge__star">★</span></span>`;
}

function syncInfoCoverSpecialBadge(song) {
  if (!dom.infoCoverBox) return;
  dom.infoCoverBox.querySelector(".video-card-special-badge")?.remove();
  if (songHasSpecialBadge(song)) {
    dom.infoCoverBox.insertAdjacentHTML("beforeend", specialBadgeHtml("meta"));
  }
}

function renderPlaylist() {
  const grid = dom.playlistGrid;
  if (!grid) return;
  const songs = getVisibleSongs();
  if (!songs.length) {
    grid.innerHTML = `<div class="playlist-empty">暂无歌曲</div>`;
    return;
  }
  grid.innerHTML = songs
    .map((song) => {
      const cur = song.id === state.currentIndex;
      const icon = isPlaying(song.id) ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
      const img = song.coverUrl
        ? `<img src="${song.coverUrl}" alt="" />`
        : "";
      const badge = !cur && songHasSpecialBadge(song) ? specialBadgeHtml("card") : "";
      return `<button type="button" class="song-card${cur ? " is-current" : ""}" data-id="${song.id}">
        <div class="song-card-cover">${img}${badge}<span class="song-card-play-icon">${icon}</span></div>
        <div class="song-card-title">${escapeHtml(song.titleDisplay || song.title || "")}</div>
      </button>`;
    })
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  if (state.editing) {
    const cur = getCurrentSong();
    if (cur) {
      state.editSnapshot = cloneSongMeta(cur);
      state.editWork = cloneSongMeta(cur);
      state.pickTarget = null;
    } else {
      state.editSnapshot = state.editWork = null;
    }
  }
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
  if (!dom.playlistHeader || !dom.playlistSearch) return;
  if (dom.playlistHeader.classList.contains("is-searching")) {
    dom.playlistSearch.focus();
    dom.playlistSearch.select();
    return;
  }
  closeFilterPanel();
  dom.playlistHeader.classList.add("is-searching");
  dom.playlistSearch.hidden = false;
  dom.playlistSearch.value = state.searchQuery;
  dom.playlistSearch.focus();
  dom.playlistSearch.select();
}

function closePlaylistSearch() {
  if (!dom.playlistHeader || !dom.playlistSearch) return;
  if (!dom.playlistHeader.classList.contains("is-searching")) return;
  state.searchQuery = "";
  dom.playlistSearch.value = "";
  dom.playlistSearch.hidden = true;
  dom.playlistHeader.classList.remove("is-searching");
  renderPlaylist();
}

function isPlaylistSearchOpen() {
  return !!dom.playlistHeader?.classList.contains("is-searching");
}

function getCurrentSong() {
  if (state.currentIndex < 0) return null;
  return state.songs[state.currentIndex] || null;
}

function parseBilingualLrc(text) {
  const lineRe = /^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/;
  const toTime = (min, sec, frac) => {
    const f = String(frac || "0");
    const sub =
      f.length <= 2
        ? Number(f.padEnd(2, "0")) / 100
        : Number(f.slice(0, 3).padEnd(3, "0")) / 1000;
    return (Number(min) || 0) * 60 + (Number(sec) || 0) + sub;
  };
  const keyOf = (t) => (Math.round(t * 1000) / 1000).toFixed(3);
  const entries = [];
  for (const raw of String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^\[[a-zA-Z]+:/i.test(line)) continue;
    const m = line.match(lineRe);
    if (m) entries.push({ time: toTime(m[1], m[2], m[3]), text: String(m[4] || "").trim() });
  }
  if (!entries.length) return [];

  let splitAt = -1;
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].time + 0.001 < entries[i - 1].time) {
      splitAt = i;
      break;
    }
  }

  const push = (map, e) => {
    const k = keyOf(e.time);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(e.text);
  };

  if (splitAt < 0) {
    const queues = new Map();
    entries.forEach((e) => push(queues, e));
    const out = [];
    queues.forEach((texts, key) => {
      const time = Number(key);
      for (let i = 0; i < texts.length; i += 2) {
        if (texts[i] || texts[i + 1]) out.push({ time, orig: texts[i] || "", trans: texts[i + 1] || "" });
      }
    });
    return out.sort((a, b) => a.time - b.time);
  }

  const trans = new Map();
  entries.slice(splitAt).forEach((e) => push(trans, e));
  return entries
    .slice(0, splitAt)
    .map((o) => {
      const q = trans.get(keyOf(o.time));
      return { time: o.time, orig: o.text, trans: q?.length ? q.shift() : "" };
    })
    .filter((x) => x.orig || x.trans);
}

async function decodeTextBuffer(buf) {
  let best = "";
  for (const enc of ["utf-8", "gbk", "gb18030", "shift_jis"]) {
    try {
      const text = new TextDecoder(enc, { fatal: false }).decode(buf);
      const bad = (text.match(/\uFFFD/g) || []).length;
      if (!(bad > 0 && bad / Math.max(1, text.length) > 0.002)) return text;
      if (!best) best = text;
    } catch {
      /* ignore */
    }
  }
  return best || new TextDecoder("utf-8").decode(buf);
}

const readLrcTextFromFile = (file) => file.arrayBuffer().then(decodeTextBuffer);
const readLrcTextFromUrl = async (url) =>
  decodeTextBuffer(await (await fetch(url)).arrayBuffer());

function fillLyricSlot(el, line) {
  if (!el) return;
  if (!line) {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<div class="info-lyrics-orig">${escapeHtml(line.orig || "")}</div>${
    line.trans ? `<div class="info-lyrics-trans">${escapeHtml(line.trans)}</div>` : ""
  }`;
}

function syncActiveLyric(force = false) {
  const lines = state.lyrics;
  const empty = dom.infoLyricsEmpty;
  if (!lines.length) {
    if (empty) {
      empty.hidden = false;
      empty.textContent = "暂无歌词";
    }
    if (dom.infoLyricsScroller) dom.infoLyricsScroller.hidden = true;
    fillLyricSlot(dom.infoLyricsPrev, null);
    fillLyricSlot(dom.infoLyricsCurrent, null);
    fillLyricSlot(dom.infoLyricsNext, null);
    return;
  }
  if (empty) empty.hidden = true;
  if (dom.infoLyricsScroller) dom.infoLyricsScroller.hidden = false;

  const t = dom.videoEl?.currentTime ?? 0;
  let idx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].time <= t + 0.02) idx = i;
    else break;
  }
  if (idx === state.activeLyricIndex && !force) return;
  state.activeLyricIndex = idx;
  fillLyricSlot(dom.infoLyricsPrev, idx > 0 ? lines[idx - 1] : null);
  fillLyricSlot(dom.infoLyricsCurrent, idx >= 0 ? lines[idx] : null);
  fillLyricSlot(
    dom.infoLyricsNext,
    idx >= 0 && idx + 1 < lines.length ? lines[idx + 1] : idx < 0 ? lines[0] : null,
  );
  dom.infoLyricsCurrent?.classList.toggle("is-active", idx >= 0);
}

function clearLyricsState() {
  state.lyrics = [];
  state.lyricsSongId = -1;
  state.activeLyricIndex = -1;
  syncActiveLyric(true);
}

const renderLyricsView = () => syncActiveLyric(true);

async function ensureLyricsLoaded() {
  const song = getCurrentSong();
  if (!song) return clearLyricsState();
  if (state.lyricsSongId === song.id) return;
  const token = ++state.lyricsLoadToken;
  let text = song.lrcText || "";
  if (!text && song.lrcUrl) {
    try {
      text = await readLrcTextFromUrl(song.lrcUrl);
      song.lrcText = text;
    } catch (e) {
      console.error(e);
    }
  }
  if (token !== state.lyricsLoadToken) return;
  state.lyricsSongId = song.id;
  state.lyrics = text ? parseBilingualLrc(text) : [];
  state.activeLyricIndex = -1;
  syncActiveLyric(true);
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

function hexToRgbChannels(hex, fallback = { r: 0, g: 0, b: 0 }) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) return fallback;
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
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
  const { r, g, b } = hexToRgbChannels(fg);
  document.documentElement.style.setProperty("--theme-color", bg);
  document.documentElement.style.setProperty("--component-color", fg);
  document.documentElement.style.setProperty(
    "--component-color-rgb",
    `${r}, ${g}, ${b}`,
  );
  updateColorPreviews(bg, fg);
}

function renderChips(container, items, kind) {
  if (!container) return;
  const list = (items || []).map((s) => String(s).trim()).filter(Boolean);
  const set = kind === "author" || kind === "role" ? state.filters[kind] : null;
  if (!list.length) {
    const sel = set?.has(FILTER_NONE) ? " is-selected" : "";
    container.innerHTML = `<button type="button" class="info-chip is-empty${sel}" data-filter-kind="${kind || ""}" data-filter-value="${FILTER_NONE}">无</button>`;
    return;
  }
  container.innerHTML = list
    .map((raw) => {
      const key = String(raw).trim();
      const sel = set?.has(key) ? " is-selected" : "";
      return `<button type="button" class="info-chip${sel}" data-filter-kind="${kind || ""}" data-filter-value="${escapeHtml(key)}">${escapeHtml(raw)}</button>`;
    })
    .join("");
}

function renderLevelHearts(level) {
  if (!dom.infoLevel) return;
  const lv = normalizeLevel(level);
  dom.infoLevel.innerHTML = Array.from({ length: LEVEL_MAX }, (_, i) => {
    const n = i + 1;
    const onCls = n <= lv ? " is-on" : "";
    return `<button type="button" class="info-level-heart-btn" data-level="${n}" aria-label="喜爱 ${n} 级"><svg class="info-level-heart${onCls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}"/></svg></button>`;
  }).join("");
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
    title: v.title || "",
    authors: [...(v.authors || [])],
    roles: [...(v.roles || [])],
    level: normalizeLevel(v?.level),
    themeBg: v.themeBg || "",
    themeFg: v.themeFg || "",
  };
}

function applySongMetaToSong(v, meta) {
  if (!v || !meta) return;
  if (meta.title != null) {
    const next = String(meta.title).trim();
    if (next) v.title = next;
  }
  v.authors = [...(meta.authors || [])];
  v.roles = [...(meta.roles || [])];
  v.level = normalizeLevel(meta.level);
  v.themeBg = meta.themeBg || "";
  v.themeFg = meta.themeFg || "";
}

function syncInfoEditingUi() {
  dom.infoPanelRoot?.classList.toggle("is-editing", state.editing);
  document.documentElement.classList.toggle("is-info-editing", state.editing);
  dom.btnInfoEdit?.setAttribute("aria-pressed", state.editing ? "true" : "false");
  [dom.infoNameInput, dom.infoAuthorInput, dom.infoRoleInput].forEach((el) => {
    if (el) el.hidden = !state.editing;
  });
}

function setInfoEditing(editing, options = {}) {
  if (state.editing && !editing && !options.commit) {
    const v = getCurrentSong();
    if (v && state.editSnapshot) {
      applySongMetaToSong(v, state.editSnapshot);
      applyDuplicateTitleLabels(state.songs);
      applyTheme(
        v.themeBg && v.themeFg ? v.themeBg : DEFAULT_THEME.bgHex,
        v.themeBg && v.themeFg ? v.themeFg : DEFAULT_THEME.fgHex,
      );
    }
    state.editSnapshot = state.editWork = null;
  }
  state.editing = !!editing;
  setPickTarget(null);
  syncInfoEditingUi();
  renderInfoView();
}

function toggleInfoEditing() {
  if (state.editing) {
    setInfoEditing(false);
    return;
  }
  const v = getCurrentSong();
  if (!v?.url) {
    return;
  }
  state.editSnapshot = cloneSongMeta(v);
  state.editWork = cloneSongMeta(v);
  setInfoEditing(true);

}

function saveInfoEdit(options = {}) {
  const v = getCurrentSong();
  if (!v) {
    return false;
  }
  if (state.editing) {
    const nextTitle = String(dom.infoNameInput?.value ?? "").trim();
    if (nextTitle) v.title = nextTitle;
    v.authors = splitByComma(dom.infoAuthorInput?.value);
    v.roles = splitByComma(dom.infoRoleInput?.value);
    if (state.editWork) {
      v.level = normalizeLevel(state.editWork.level);
      v.themeBg = normalizeHexColor(state.editWork.themeBg) || v.themeBg;
      v.themeFg = normalizeHexColor(state.editWork.themeFg) || v.themeFg;
    }
    applyDuplicateTitleLabels(state.songs);
    if (v.themeBg && v.themeFg) applyTheme(v.themeBg, v.themeFg);
  }
  state.editSnapshot = state.editWork = null;
  setInfoEditing(false, { commit: true });
  buildAllFilterPanels();
  renderPlaylist();
  return true;
}

async function exportInfoWithSave() {
  if (state.editing) saveInfoEdit({ silent: true });
  await exportVideoJson();
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((n) => Math.max(0, Math.min(255, n | 0)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function applyPickedColor(hex) {
  const color = normalizeHexColor(hex);
  if (!color || !state.editing || !state.editWork || !state.pickTarget) return;
  if (state.pickTarget === "component") {
    state.editWork.themeFg = color;
    applyTheme(normalizeHexColor(state.editWork.themeBg) || state.themeColor, color);
  } else {
    state.editWork.themeBg = color;
    applyTheme(color, normalizeHexColor(state.editWork.themeFg) || state.componentColor);
  }
}

function samplePixel(draw, w, h, px, py) {
  const canvas = dom.infoCoverPickCanvas;
  if (!canvas) return "";
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "";
  draw(ctx);
  const d = ctx.getImageData(
    Math.min(w - 1, Math.max(0, px)),
    Math.min(h - 1, Math.max(0, py)),
    1,
    1,
  ).data;
  return rgbToHex(d[0], d[1], d[2]);
}

function pickColorFromCover(clientX, clientY) {
  const v = getCurrentSong();
  const img = dom.infoCoverImg;
  if (!v?.coverUrl || !img || img.hidden || !img.complete || !dom.infoCoverBox) return;
  const size = 160;
  const rect = dom.infoCoverBox.getBoundingClientRect();
  const hex = samplePixel(
    (ctx) => ctx.drawImage(img, 0, 0, size, size),
    size,
    size,
    Math.floor(((clientX - rect.left) / rect.width) * size),
    Math.floor(((clientY - rect.top) / rect.height) * size),
  );
  if (hex) applyPickedColor(hex);
}

function getVideoContentRect(video) {
  if (!video) return null;
  const rect = video.getBoundingClientRect();
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || rect.width <= 0 || rect.height <= 0) return null;
  const vr = vw / vh;
  const er = rect.width / rect.height;
  const contentW = vr > er ? rect.width : rect.height * vr;
  const contentH = vr > er ? rect.width / vr : rect.height;
  return {
    left: rect.left + (rect.width - contentW) / 2,
    top: rect.top + (rect.height - contentH) / 2,
    width: contentW,
    height: contentH,
    videoWidth: vw,
    videoHeight: vh,
  };
}

function pickColorFromVideo(clientX, clientY) {
  const video = dom.videoEl;
  if (!video?.src) return;
  if (!video.videoWidth) return;
  const c = getVideoContentRect(video);
  if (!c) return;
  if (
    clientX < c.left ||
    clientX > c.left + c.width ||
    clientY < c.top ||
    clientY > c.top + c.height
  )
    return;
  try {
    const hex = samplePixel(
      (ctx) => ctx.drawImage(video, 0, 0, c.videoWidth, c.videoHeight),
      c.videoWidth,
      c.videoHeight,
      Math.floor(((clientX - c.left) / c.width) * c.videoWidth),
      Math.floor(((clientY - c.top) / c.height) * c.videoHeight),
    );
    if (hex) applyPickedColor(hex);
  } catch (err) {
    console.error(err);

  }
}

function setPickTarget(target) {
  state.pickTarget = target === "theme" || target === "component" ? target : null;
  const editing = state.editing;
  dom.infoThemePreview?.classList.toggle(
    "is-active-target",
    editing && state.pickTarget === "theme",
  );
  dom.infoComponentPreview?.classList.toggle(
    "is-active-target",
    editing && state.pickTarget === "component",
  );
  document.documentElement.classList.toggle(
    "is-picking-color",
    editing && !!state.pickTarget,
  );
}

function setInfoCover(coverUrl) {
  const img = dom.infoCoverImg;
  if (!img) return;
  if (coverUrl) img.src = coverUrl;
  else img.removeAttribute("src");
  const song = getCurrentSong();
  const has = !!song?.coverUrl;
  if (dom.infoCoverImg) dom.infoCoverImg.hidden = !has;
  if (dom.infoCoverPlaceholder) dom.infoCoverPlaceholder.hidden = has;
  syncInfoCoverSpecialBadge(song);
}

function bindColorPickEvents() {
  on(dom.infoThemePreview, "click", () => {
    if (!state.editing) return;
    setPickTarget(state.pickTarget === "theme" ? null : "theme");
  });
  on(dom.infoComponentPreview, "click", () => {
    if (!state.editing) return;
    setPickTarget(state.pickTarget === "component" ? null : "component");
  });
  on(dom.infoCoverBox, "click", (e) => {
    if (!state.editing) return;
    if (!state.pickTarget) return;
    if (!getCurrentSong()?.coverUrl) return;
    pickColorFromCover(e.clientX, e.clientY);
  });
  const onVideoPick = (e) => {
    if (!state.editing || !state.pickTarget) return;
    e.preventDefault();
    e.stopPropagation();
    pickColorFromVideo(e.clientX, e.clientY);
  };
  on(dom.playerZoneVideo, "click", onVideoPick, true);
  on(dom.videoEl, "click", onVideoPick, true);
}

function renderInfoView() {
  const song = getCurrentSong();
  if (!song) {
    if (dom.infoNameDisplay) dom.infoNameDisplay.textContent = INFO_DEFAULT_NAME;
    if (dom.infoNameInput) dom.infoNameInput.value = "";
    if (dom.infoAuthorInput) dom.infoAuthorInput.value = "";
    if (dom.infoRoleInput) dom.infoRoleInput.value = "";
    renderChips(dom.infoAuthorChips, [], "author");
    renderChips(dom.infoRoleChips, [], "role");
    renderLevelHearts(1);
    setInfoCover(null);
    applyTheme(DEFAULT_THEME.bgHex, DEFAULT_THEME.fgHex);
    setPickTarget(state.pickTarget);
    return;
  }

  const meta = (state.editing && state.editWork) || song;
  if (dom.infoNameDisplay) {
    dom.infoNameDisplay.textContent =
      String(meta.title || song.title || "").trim() || INFO_DEFAULT_NAME;
  }
  renderChips(dom.infoAuthorChips, meta.authors || [], "author");
  renderChips(dom.infoRoleChips, meta.roles || [], "role");
  if (state.editing && state.editWork) {
    if (dom.infoNameInput) dom.infoNameInput.value = String(state.editWork.title || song.title || "");
    if (dom.infoAuthorInput) dom.infoAuthorInput.value = joinByComma(state.editWork.authors);
    if (dom.infoRoleInput) dom.infoRoleInput.value = joinByComma(state.editWork.roles);
  }
  renderLevelHearts(meta.level ?? song.level);
  setInfoCover(song.coverUrl || null);
  applyTheme(
    normalizeHexColor(meta.themeBg) || normalizeHexColor(song.themeBg) || DEFAULT_THEME.bgHex,
    normalizeHexColor(meta.themeFg) || normalizeHexColor(song.themeFg) || DEFAULT_THEME.fgHex,
  );
  setPickTarget(state.pickTarget);
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
  if (current) current.innerHTML = isPlaying(state.currentIndex) ? PAUSE_ICON_SVG : PLAY_ICON_SVG;
}

function togglePlayPause() {
  const list = getPlayableIndices();
  if (!list.length) {

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
function lrcBaseKey(name) {
  return baseNameOf(name).replace(/^@+/, "").trim().toLowerCase();
}
function extOf(name) {
  const m = String(name).toLowerCase().match(/(\.[^./\\]+)$/);
  return m ? m[1] : "";
}
function splitMetaTokens(val) {
  const t = String(val ?? "").trim();
  if (!t) return [];
  if (t.includes("，")) return t.split("，").map((x) => x.trim()).filter(Boolean);
  if (/\s+/.test(t)) return t.split(/\s+/).map((x) => x.trim()).filter(Boolean);
  return [t];
}
function normAndSort(arr) {
  return [...new Set(arr)].filter(Boolean).sort(cmpZh);
}
function normalizeLevel(n) {
  const x = Math.round(Number(n));
  return Number.isFinite(x) ? Math.min(LEVEL_MAX, Math.max(1, x)) : 1;
}
function readStringListFromMeta(saved, ...keys) {
  for (const key of keys) {
    const val = saved[key];
    if (Array.isArray(val)) return normAndSort(val);
    if (typeof val === "string") return normAndSort(splitMetaTokens(val));
  }
  return [];
}
function revokeOneSongObjectUrls(v) {
  if (!v) return;
  for (const k of ["url", "coverUrl", "lrcUrl"]) {
    if (v[k]?.startsWith("blob:")) URL.revokeObjectURL(v[k]);
  }
}
function revokeSongObjectUrls(songs) {
  (songs || []).forEach(revokeOneSongObjectUrls);
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
function pickBestByExt(list, order, keyFn = (x) => x.name) {
  if (!list?.length) return null;
  return [...list].sort(
    (a, b) => (order[extOf(a.name)] ?? 99) - (order[extOf(b.name)] ?? 99) || cmpZh(keyFn(a), keyFn(b)),
  )[0];
}
function pickBestCover(list) {
  return pickBestByExt(list, { ".png": 0, ".jpg": 1, ".jpeg": 2, ".gif": 3 });
}
function pickBestMedia(list) {
  return pickBestByExt(list, { ".mp4": 0, ".flac": 1, ".mp3": 2 }, (x) => x.relPath);
}
function pushMap(map, key, item, multi) {
  if (multi) {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  } else if (!map.has(key)) {
    map.set(key, item);
  }
}
function sortSongsByMtime(arr) {
  arr.sort(
    (a, b) =>
      (b.mtime || 0) - (a.mtime || 0) ||
      cmpZh(a.title, b.title) ||
      cmpZh(a.relPath || "", b.relPath || ""),
  );
}

function applyDuplicateTitleLabels(songs) {
  const groups = new Map();
  songs.forEach((v) => {
    const key = String(v.title || "").trim().toLowerCase();
    pushMap(groups, key, v, true);
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

async function openLibraryDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(LIBRARY_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LIBRARY_STORE)) db.createObjectStore(LIBRARY_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveRootHandle(handle) {
  if (!handle || !window.indexedDB) return;
  try {
    const db = await openLibraryDb();
    await idbReq(
      db.transaction(LIBRARY_STORE, "readwrite").objectStore(LIBRARY_STORE).put(handle, LIBRARY_HANDLE_KEY),
    );
    db.close();
  } catch (e) {
    console.error(e);
  }
}

async function loadRootHandle() {
  if (!window.indexedDB) return null;
  try {
    const db = await openLibraryDb();
    const handle = await idbReq(
      db.transaction(LIBRARY_STORE, "readonly").objectStore(LIBRARY_STORE).get(LIBRARY_HANDLE_KEY),
    );
    db.close();
    return handle || null;
  } catch {
    return null;
  }
}

async function ensureDirPermission(handle) {
  if (!handle?.queryPermission || !handle.requestPermission) return !!handle;
  const opts = { mode: "read" };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  return (await handle.requestPermission(opts)) === "granted";
}

async function pickRootFolder() {
  if (!window.showDirectoryPicker) return null;
  const saved = await loadRootHandle();
  const opts = {
    id: LIBRARY_PICKER_ID,
    mode: "read",
    startIn: saved || "music",
  };
  try {
    try {
      return await window.showDirectoryPicker(opts);
    } catch (e) {
      if (e?.name === "AbortError" || e?.name === "NotAllowedError") return null;
      return await window.showDirectoryPicker({ id: LIBRARY_PICKER_ID, mode: "read" });
    }
  } catch (e) {
    if (!(e?.name === "AbortError" || e?.name === "NotAllowedError")) console.error(e);
    return null;
  }
}

async function walkDir(dirHandle, prefix = "") {
  const results = [];
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === "directory") {
      results.push(...(await walkDir(handle, prefix ? `${prefix}/${name}` : name)));
    } else if (handle.kind === "file") {
      results.push({
        name,
        handle,
        relPath: prefix ? `${prefix}/${name}` : name,
        relDir: prefix,
      });
    }
  }
  return results;
}

async function scanAllFromRoot() {
  if (!state.root) {

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
      const arr = JSON.parse(await (await jsonFile.handle.getFile()).text());
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
    pushMap(coverMapScoped, `${f.relDir || ""}::${baseLower}`, f, true);
    pushMap(coverMapGlobal, baseLower, f, true);
  });

  const lrcMapScoped = new Map();
  const lrcMapGlobal = new Map();
  lrcFiles.forEach((f) => {
    const baseLower = lrcBaseKey(f.name);
    if (!baseLower) return;
    pushMap(lrcMapScoped, `${f.relDir || ""}::${baseLower}`, f, false);
    pushMap(lrcMapGlobal, baseLower, f, false);
  });

  const mediaByScope = new Map();
  mediaFiles.forEach((f) => {
    pushMap(mediaByScope, `${f.relDir || ""}::${baseNameOf(f.name).toLowerCase()}`, f, true);
  });

  const lookup = (scoped, global, dir, ...keys) => {
    for (const k of keys) {
      if (!k) continue;
      const hit = scoped.get(`${dir}::${k}`) || global.get(k);
      if (hit) return hit;
    }
    return null;
  };

  const songs = [];
  for (const [, group] of [...mediaByScope.entries()].sort((a, b) => cmpZh(a[0], b[0]))) {
    const fileItem = pickBestMedia(group);
    if (!fileItem) continue;
    const base = baseNameOf(fileItem.name);
    const baseLower = base.toLowerCase();
    const relDir = fileItem.relDir || "";
    const relPath = fileItem.relPath || fileItem.name;
    const mediaFile = await fileItem.handle.getFile();
    const url = URL.createObjectURL(mediaFile);
    const mtime = Number(mediaFile.lastModified) || 0;

    const bestCover = pickBestCover(
      coverMapScoped.get(`${relDir}::${baseLower}`) || coverMapGlobal.get(baseLower) || [],
    );
    const coverUrl = bestCover
      ? URL.createObjectURL(await bestCover.handle.getFile())
      : "";
    const coverFileName = bestCover?.name || null;

    const saved =
      lookup(savedMetaScoped, savedMetaGlobal, relDir, base, fileItem.name, relPath) || {};

    let lrcUrl = "";
    let lrcFileName = null;
    let lrcText = "";
    const lrcItem = lookup(
      lrcMapScoped,
      lrcMapGlobal,
      relDir,
      lrcBaseKey(base),
      lrcBaseKey(saved.title || base),
    );
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
      mtime,
      authors: readStringListFromMeta(saved, "authors", "author"),
      roles: readStringListFromMeta(saved, "roles", "role"),
      level: normalizeLevel(saved.level),
      themeBg: saved.themeBg || "",
      themeFg: saved.themeFg || "",
      coverUrl,
      coverFileName,
      coverIsGif: !!coverFileName && /\.gif$/i.test(coverFileName),
      lrcUrl,
      lrcFileName,
      lrcText,
    });
  }

  sortSongsByMtime(songs);
  const keepPlaying = state.currentIndex >= 0 ? state.songs[state.currentIndex] : null;
  const existing = hasImportedSongs() ? state.songs.filter((s) => !!s.url) : [];
  const existingKeys = new Set(existing.map(songDedupeKey).filter(Boolean));
  const added = [];
  let skipped = 0;
  for (const song of songs) {
    const key = songDedupeKey(song);
    if (key && existingKeys.has(key)) {
      revokeOneSongObjectUrls(song);
      skipped += 1;
      continue;
    }
    if (key) existingKeys.add(key);
    added.push(song);
  }
  if (!existing.length) revokeSongObjectUrls(state.songs.filter((s) => !s.url));

  const merged = [...existing, ...added];
  sortSongsByMtime(merged);
  applyDuplicateTitleLabels(merged);
  merged.forEach((v, index) => {
    v.id = index;
  });
  state.songs = merged;
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  buildAllFilterPanels();
  clearLyricsState();
  refreshUiAfterSongListChange(keepPlaying);

  if (existing.length) {

  } else {

  }
}

function refreshUiAfterSongListChange(keepPlaying) {
  const merged = state.songs;
  if (keepPlaying?.url) {
    const idx = merged.findIndex(
      (s) =>
        s.url === keepPlaying.url ||
        (songDedupeKey(s) && songDedupeKey(s) === songDedupeKey(keepPlaying)),
    );
    state.currentIndex = idx >= 0 ? idx : merged.length ? 0 : -1;
  } else if (merged.length) {
    state.currentIndex = 0;
    const v = merged[0];
    if (v?.url) {
      setVideoSource(v.url);
      applyPlaybackRate();
      applyVolume();
    }
  } else {
    state.currentIndex = -1;
    setVideoSource("");
    if (state.editing) {
      state.editSnapshot = state.editWork = null;
      state.editing = false;
      syncInfoEditingUi();
    }
  }
  renderPlaylist();
  syncPlayPauseButton();
  syncProgressFromVideo();
  if (state.editing) {
    const cur = getCurrentSong();
    if (cur) {
      state.editSnapshot = cloneSongMeta(cur);
      state.editWork = cloneSongMeta(cur);
      state.pickTarget = null;
    } else {
      state.editSnapshot = state.editWork = null;
    }
  }
  renderInfoView();
  ensureLyricsLoaded();
}

async function openImportFolderPicker() {
  const rootHandle = await pickRootFolder();
  if (!rootHandle) return;
  state.root = rootHandle;
  await saveRootHandle(rootHandle);
  await scanAllFromRoot();
}

async function restoreLibraryOnStart() {
  const handle = await loadRootHandle();
  if (!handle) return;
  if (!(await ensureDirPermission(handle))) return;
  state.root = handle;
  await scanAllFromRoot();
}

/* ---------- 可视化 ---------- */

let audioContext = null;
let analyser = null;
let analyserDataArray = null;
let visualizerRaf = 0;

function parseComponentRgb() {
  return hexToRgbChannels(state.componentColor);
}

function drawBarsVisualizer(ctx, canvas, freqData) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const cs = getComputedStyle(document.documentElement);
  const ox = parseFloat(cs.getPropertyValue("--ui-shadow-x")) || 5;
  const oy = parseFloat(cs.getPropertyValue("--ui-shadow-y")) || 5;
  const barCount = 36;
  const barMax = h * 0.85;
  const midX = w / 2;
  const barW = w / 2 / barCount;
  const { r, g, b } = parseComponentRgb();

  for (let i = 0; i < barCount; i++) {
    const mag = freqData ? (freqData[Math.floor((i / barCount) * freqData.length)] || 0) / 255 : 0;
    const bh = Math.max(2, mag * barMax);
    const paint = (x) => {
      const bx = x + 2;
      const bw = Math.max(1, barW - 4);
      const y = h - bh;
      const gdt = ctx.createLinearGradient(0, y, 0, h);
      gdt.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
      gdt.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.35)`);
      ctx.fillStyle = gdt;
      ctx.save();
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.45)`;
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = ox;
      ctx.shadowOffsetY = oy;
      ctx.fillRect(bx, y, bw, bh);
      ctx.restore();
      ctx.fillRect(bx, y, bw, bh);
    };
    paint(midX - (i + 1) * barW);
    paint(midX + i * barW);
  }
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
  ctx.fillRect(0, h - 2, w, 2);
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
  if (audioContext?.state === "suspended") audioContext.resume().catch(() => {});
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
      audioContext.createMediaElementSource(dom.videoEl).connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (e) {
      if (e.name !== "InvalidStateError") console.error(e);
    }
  }
  const draw = () => {
    visualizerRaf = requestAnimationFrame(draw);
    if (analyser && analyserDataArray) analyser.getByteFrequencyData(analyserDataArray);
    drawBarsVisualizer(ctx, canvas, analyserDataArray);
  };
  if (!visualizerRaf) visualizerRaf = requestAnimationFrame(draw);
}

/* ---------- 导出 ---------- */

async function exportVideoJson() {
  const payload = state.songs
    .filter((v) => v.fileName || v.relPath)
    .map((v) => {
      const item = {
        title: v.title,
        fileName: v.fileName,
        relPath: v.relPath,
        authors: v.authors || [],
        roles: v.roles || [],
        level: normalizeLevel(v.level),
        themeBg: v.themeBg || "",
        themeFg: v.themeFg || "",
      };
      if (v.coverFileName) item.coverFileName = v.coverFileName;
      if (v.lrcFileName) item.lrcFileName = v.lrcFileName;
      return item;
    });
  if (!payload.length) {

    return;
  }
  const dataStr = JSON.stringify(payload, null, 2);
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        startIn: "videos",
        suggestedName: "video.json",
        types: [{ description: "JSON 文件", accept: { "application/json": [".json"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(dataStr);
      await writable.close();

      return;
    } catch (e) {
      if (e?.name === "AbortError" || e?.name === "NotAllowedError") return;
      console.error(e);
    }
  }
  const url = URL.createObjectURL(new Blob([dataStr], { type: "application/json" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "video.json" });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

}

/* ---------- 音量 ---------- */

function applyVolume() {
  if (!dom.videoEl) return;
  const vol = Math.min(1, Math.max(0, state.volume));
  dom.videoEl.volume = vol;
  dom.videoEl.muted = vol <= 0;
  if (dom.volumeSlider) {
    const pct = Math.round((dom.videoEl.muted ? 0 : dom.videoEl.volume) * 100);
    state.volume = pct / 100;
    dom.volumeSlider.value = String(pct);
  }
}

function setVolumePopoverOpen(open) {
  state.volumeOpen = !!open;
  if (dom.volumePopover) dom.volumePopover.hidden = !state.volumeOpen;
  dom.btnVolume?.setAttribute("aria-expanded", state.volumeOpen ? "true" : "false");
  if (state.volumeOpen) applyVolume();
}

function bindVolumeEvents() {
  on(dom.btnVolume, "click", (e) => {
    e.stopPropagation();
    setVolumePopoverOpen(!state.volumeOpen);
  });
  on(dom.volumeSlider, "input", () => {
    const pct = Number(dom.volumeSlider.value);
    if (Number.isFinite(pct)) {
      state.volume = Math.min(1, Math.max(0, pct / 100));
      applyVolume();
    }
  });
  on(dom.volumePopover, "click", (e) => e.stopPropagation());
}

/* ---------- 搜索与筛选 ---------- */

function filterFieldValues(v, kind) {
  const arr = kind === "author" ? v.authors : kind === "role" ? v.roles : null;
  return arr ? arr.map((s) => String(s).trim()).filter(Boolean) : [];
}

function matchesSetWithNone(set, values) {
  if (!set?.size) return true;
  const wantsEmpty = set.has(FILTER_NONE);
  const wants = [...set].filter((k) => k !== FILTER_NONE);
  if (wantsEmpty && !wants.length) return !values.length;
  return (wantsEmpty && !values.length) || wants.some((w) => values.includes(w));
}

function songPassesFilters(v) {
  const { author, role, level } = state.filters;
  if (author.size && !matchesSetWithNone(author, filterFieldValues(v, "author"))) return false;
  if (role.size && !matchesSetWithNone(role, filterFieldValues(v, "role"))) return false;
  if (level.size && !level.has(String(normalizeLevel(v.level)))) return false;
  return true;
}

function getFilteredIndices() {
  return state.songs.reduce((acc, v, i) => (songPassesFilters(v) ? (acc.push(i), acc) : acc), []);
}

function getPlayableIndices() {
  return getFilteredIndices().filter((i) => !!state.songs[i]?.url);
}

function heartsHtml(n, suffix = "") {
  let slots = "";
  for (let i = 1; i <= LEVEL_MAX; i++) {
    slots += `<span class="level-filter-heart-slot${i <= n ? " is-on" : ""}">${LEVEL_FILTER_HEART_SVG}</span>`;
  }
  return `<span class="level-filter-label-wrap"><span class="level-filter-hearts">${slots}</span>${
    suffix ? `<span class="level-filter-label-suffix">${suffix}</span>` : ""
  }</span>`;
}

function filterLabel(key, kind) {
  if (key === FILTER_NONE) return "暂无";
  if (kind === "level") {
    const n = normalizeLevel(key);
    return `${"♥".repeat(n)}${"♡".repeat(LEVEL_MAX - n)}`;
  }
  return String(key);
}

function panelEls(kind) {
  const def = FILTER_PANELS.find((p) => p.kind === kind);
  if (!def) return null;
  const btn = $(def.btnId);
  return { def, btn, panel: $(def.panelId), labelEl: btn?.querySelector(".toolbar-filter-label") };
}

function songsForFilterKind(kind) {
  return state.songs.filter((v) => {
    for (const k of FILTER_KINDS) {
      if (k === kind) continue;
      if (k === "level") {
        if (state.filters.level.size && !state.filters.level.has(String(normalizeLevel(v.level))))
          return false;
      } else if (state.filters[k].size && !matchesSetWithNone(state.filters[k], filterFieldValues(v, k))) {
        return false;
      }
    }
    return true;
  });
}

function collectFilterOptions(kind) {
  const songs = songsForFilterKind(kind);
  const set = state.filters[kind];
  const countOf = (key) => {
    if (kind === "level")
      return songs.filter((v) => String(normalizeLevel(v.level)) === String(key)).length;
    if (key === FILTER_NONE) return songs.filter((v) => !filterFieldValues(v, kind).length).length;
    return songs.filter((v) => filterFieldValues(v, kind).includes(key)).length;
  };

  let values;
  if (kind === "level") {
    values = Array.from({ length: LEVEL_MAX }, (_, i) => String(i + 1));
  } else {
    values = [...new Set(songs.flatMap((v) => filterFieldValues(v, kind)))];
    if (songs.some((v) => !filterFieldValues(v, kind).length)) values.unshift(FILTER_NONE);
  }

  let options = values
    .map((value) => ({ value, count: countOf(value), label: filterLabel(value, kind) }))
    .filter((o) => o.count > 0)
    .sort((a, b) =>
      kind === "level"
        ? Number(a.value) - Number(b.value)
        : b.count - a.count || cmpZh(a.value, b.value),
    );

  if (set?.size) {
    const have = new Set(options.map((o) => o.value));
    for (const value of set) {
      if (!have.has(value))
        options.unshift({ value, count: countOf(value), label: filterLabel(value, kind) });
    }
  }
  return options;
}

function sanitizeFilters() {
  for (const kind of FILTER_KINDS) {
    const set = state.filters[kind];
    if (!set.size) continue;
    const valid =
      kind === "level"
        ? new Set(Array.from({ length: LEVEL_MAX }, (_, i) => String(i + 1)))
        : new Set([
            ...state.songs.flatMap((v) => filterFieldValues(v, kind).map(String)),
            ...(state.songs.some((v) => !filterFieldValues(v, kind).length) ? [FILTER_NONE] : []),
          ]);
    for (const key of [...set]) if (!valid.has(key)) set.delete(key);
  }
}

function updateFilterLabels() {
  FILTER_PANELS.forEach(({ kind, defaultLabel }) => {
    const { labelEl } = panelEls(kind) || {};
    if (!labelEl) return;
    labelEl.textContent = state.filters[kind].size ? "已筛选" : defaultLabel;
  });
}

function buildFilterPanel(kind) {
  const { panel } = panelEls(kind) || {};
  if (!panel) return;
  const set = state.filters[kind];
  const options = collectFilterOptions(kind);
  if (!options.length) {
    panel.innerHTML = `<div class="toolbar-filter-option" aria-disabled="true">暂无可选项</div>`;
    return;
  }
  panel.innerHTML = options
    .map(({ value, count, label }) => {
      const selected = set.has(value) ? "true" : "false";
      const body =
        kind === "level"
          ? heartsHtml(normalizeLevel(value), ` (${count})`)
          : `${escapeHtml(label)} (${count})`;
      return `<button type="button" class="toolbar-filter-option" role="option" aria-selected="${selected}" data-filter-value="${escapeHtml(value)}">${body}</button>`;
    })
    .join("");
}

function buildAllFilterPanels() {
  sanitizeFilters();
  FILTER_PANELS.forEach(({ kind }) => buildFilterPanel(kind));
  updateFilterLabels();
}

function closeFilterPanel() {
  if (!state.openKind) return;
  const { btn, panel } = panelEls(state.openKind) || {};
  if (panel) panel.hidden = true;
  btn?.setAttribute("aria-expanded", "false");
  state.openKind = null;
}

function openFilterPanel(kind) {
  if (state.openKind === kind) return closeFilterPanel();
  closeFilterPanel();
  sanitizeFilters();
  buildFilterPanel(kind);
  const { btn, panel } = panelEls(kind) || {};
  if (!panel || !btn) return;
  panel.hidden = false;
  btn.setAttribute("aria-expanded", "true");
  state.openKind = kind;
  requestAnimationFrame(() =>
    panel
      .querySelector('[role="option"][aria-selected="true"]')
      ?.scrollIntoView({ block: "center", behavior: "auto" }),
  );
}

function refreshFilters() {
  sanitizeFilters();
  const open = state.openKind;
  const top = open ? panelEls(open)?.panel?.scrollTop || 0 : 0;
  FILTER_PANELS.forEach(({ kind }) => buildFilterPanel(kind));
  updateFilterLabels();
  renderInfoView();
  renderPlaylist();
  if (open) {
    const p = panelEls(open)?.panel;
    if (p) requestAnimationFrame(() => {
      p.scrollTop = top;
    });
  }
}

function toggleFilterValue(kind, value, options = {}) {
  const set = state.filters[kind];
  if (!set) return;
  const key = value === FILTER_NONE ? FILTER_NONE : String(value).trim();
  if (!key) return;
  const was = set.has(key);
  was ? set.delete(key) : set.add(key);
  refreshFilters();
  if (!options.silentToast) {
    const label = filterLabel(key, kind);

  }
}

function bindFilterEvents() {
  FILTER_PANELS.forEach(({ kind, btnId, panelId }) => {
    on($(btnId), "click", (e) => {
      e.stopPropagation();
      if (!isPlaylistSearchOpen()) openFilterPanel(kind);
    });
    on($(panelId), "click", (e) => {
      e.stopPropagation();
      const opt = e.target.closest?.("[data-filter-value]");
      if (opt) toggleFilterValue(kind, opt.dataset.filterValue);
    });
  });
  on(document, "click", closeFilterPanel);
  on(document, "keydown", (e) => {
    if (e.key === "Escape") closeFilterPanel();
  });
}

function regenerateShuffleOrder() {
  const list = getPlayableIndices().slice();
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  state.shuffleOrder = list;
  state.shuffleFingerprint = getPlayableIndices().join(",");
}

function resolveTrackIndex(direction = 1) {
  const list = getPlayableIndices();
  if (!list.length) return null;
  const cur = state.currentIndex;
  if (state.playMode !== "list" && state.shuffleFingerprint !== list.join(",")) {
    regenerateShuffleOrder();
  }
  const order =
    state.playMode === "list"
      ? list
      : state.shuffleOrder.length
        ? state.shuffleOrder
        : list;
  if (cur < 0) return order[0];
  const pos = order.indexOf(cur);
  if (pos === -1) return order[0];
  if (direction < 0) return order[pos <= 0 ? order.length - 1 : pos - 1];
  if (pos >= order.length - 1) {
    if (state.playMode !== "list") regenerateShuffleOrder();
    return (state.playMode === "list" ? list : state.shuffleOrder)[0] ?? list[0];
  }
  return order[pos + 1];
}

function restartCurrentMedia() {
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

    return;
  }
  if (state.playMode === "single") {
    if (state.currentIndex < 0 || !list.includes(state.currentIndex)) return playSongAt(list[0]);
    return restartCurrentMedia();
  }
  const idx = resolveTrackIndex(direction);
  if (idx !== null) playSongAt(idx);
}

function handleVideoEnded() {
  if (!getPlayableIndices().length) {
    syncPlayPauseButton();
    renderPlaylist();
    return;
  }
  if (state.playMode === "single") return restartCurrentMedia();
  const nextIdx = resolveTrackIndex(1);
  if (nextIdx !== null) playSongAt(nextIdx);
  else {
    syncPlayPauseButton();
    renderPlaylist();
  }
}

function applyPlaybackRate() {
  if (dom.videoEl) dom.videoEl.playbackRate = state.playbackRate;
}

function cyclePlaybackSpeed() {
  state.playbackRate =
    state.playbackRate < 2
      ? Math.min(2, Math.round((state.playbackRate + 0.25) * 100) / 100)
      : 1;
  applyPlaybackRate();

}

function applyPlayModeUi() {
  if (!dom.btnPlayMode) return;
  const icons = {
    shuffle: PLAY_MODE_SHUFFLE_SVG,
    list: PLAY_MODE_LIST_SVG,
    single: PLAY_MODE_SINGLE_SVG,
  };
  const label = PLAY_MODE_LABELS[state.playMode] || PLAY_MODE_LABELS.shuffle;
  dom.btnPlayMode.innerHTML = icons[state.playMode] || icons.shuffle;
  dom.btnPlayMode.title = label;
  dom.btnPlayMode.setAttribute("aria-label", label);
}

function togglePlayMode() {
  const modes = ["shuffle", "list", "single"];
  state.playMode = modes[(modes.indexOf(state.playMode) + 1) % modes.length];
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  applyPlayModeUi();

}
async function togglePictureInPicture() {
  const video = dom.videoEl;
  if (!video?.src) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      return;
    }
    if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
      await video.requestPictureInPicture();
      return;
    }

  } catch (err) {
    console.error(err);

  }
}
async function toggleFullscreen() {
  const video = dom.videoEl;
  const target = document.querySelector(".player-zone-video") || video;
  if (!target) return;
  const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  try {
    if (fsEl) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      return;
    }
    if (target.requestFullscreen) await target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
    else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
  } catch (err) {
    console.error(err);
  }
}
function locateCurrentInPlaylist() {
  if (state.currentIndex < 0) return;
  if (!getVisibleSongs().some((s) => s.id === state.currentIndex)) {
    return;
  }
  requestAnimationFrame(() => {
    const scrollBox = dom.playlistGrid;
    const card = scrollBox?.querySelector(`.song-card[data-id="${state.currentIndex}"]`);
    if (!card || !scrollBox) return;
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
  on(dom.playlistGrid, "click", (e) => {
    const card = e.target.closest?.(".song-card");
    if (!card || !dom.playlistGrid.contains(card)) return;
    const id = Number(card.dataset.id);
    if (Number.isFinite(id)) onSongCardClick(id);
  });

  on(dom.infoAuthorChips, "click", (e) => {
    if (state.editing) return;
    const chip = e.target.closest?.("[data-filter-value]");
    if (chip) toggleFilterValue("author", chip.dataset.filterValue);
  });
  on(dom.infoRoleChips, "click", (e) => {
    if (state.editing) return;
    const chip = e.target.closest?.("[data-filter-value]");
    if (chip) toggleFilterValue("role", chip.dataset.filterValue);
  });
  on(dom.infoLevel, "click", (e) => {
    if (!state.editing || !state.editWork) return;
    const btn = e.target.closest?.("[data-level]");
    if (!btn) return;
    state.editWork.level = Number(btn.dataset.level);
    renderLevelHearts(state.editWork.level);
  });

  on(document, "click", (e) => {
    if (state.volumeOpen && dom.volumeControl && !dom.volumeControl.contains(e.target)) {
      setVolumePopoverOpen(false);
    }
  });
  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;
    if (state.volumeOpen) setVolumePopoverOpen(false);
  });

  on(dom.btnPlaylistSearch, "click", (e) => {
    e.stopPropagation();
    closeFilterPanel();
    isPlaylistSearchOpen() ? closePlaylistSearch() : openPlaylistSearch();
  });
  on(dom.playlistSearch, "input", () => {
    state.searchQuery = dom.playlistSearch.value;
    renderPlaylist();
  });
  on(dom.playlistSearch, "keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePlaylistSearch();
    }
  });
  on(dom.playlistSearch, "click", (e) => e.stopPropagation());
  on(document, "click", (e) => {
    if (!isPlaylistSearchOpen()) return;
    if (e.target === dom.playlistSearch) return;
    if (e.target === dom.btnPlaylistSearch || dom.btnPlaylistSearch?.contains(e.target)) return;
    closePlaylistSearch();
  });

  on(dom.infoTabSongBtn, "click", () => setInfoPanelMode("info"));
  on(dom.infoTabLyricsBtn, "click", () => setInfoPanelMode("lyrics"));
  on(dom.btnInfoEdit, "click", (e) => {
    e.stopPropagation();
    toggleInfoEditing();
  });
  on(dom.btnInfoSave, "click", (e) => {
    e.stopPropagation();
    if (!state.editing) return;
    saveInfoEdit();
  });
  on(dom.btnInfoExport, "click", (e) => {
    e.stopPropagation();
    exportInfoWithSave().catch(console.error);
  });

  bindColorPickEvents();
  on(dom.btnImport, "click", () => openImportFolderPicker().catch(console.error));
  bindVolumeEvents();
  on(dom.btnPrev, "click", () => playAdjacentTrack(-1));
  on(dom.btnPlayPause, "click", togglePlayPause);
  on(dom.btnNext, "click", () => playAdjacentTrack(1));
  on(dom.btnSpeed, "click", cyclePlaybackSpeed);
  on(dom.btnPlayMode, "click", togglePlayMode);
  on(dom.btnPip, "click", () => togglePictureInPicture().catch(console.error));
  on(dom.btnFullscreen, "click", () => toggleFullscreen().catch(console.error));
  on(dom.btnListTop, "click", () =>
    dom.playlistGrid?.scrollTo({ top: 0, behavior: "smooth" }),
  );
  on(dom.btnLocate, "click", locateCurrentInPlaylist);
  on(dom.btnListBottom, "click", () => {
    const box = dom.playlistGrid;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  });
  bindFilterEvents();

  on(dom.videoEl, "timeupdate", syncProgressFromVideo);
  on(dom.videoEl, "loadedmetadata", () => {
    applyPlaybackRate();
    applyVolume();
    syncProgressFromVideo();
  });
  on(dom.videoEl, "play", () => {
    resumeAudioContext();
    syncPlayPauseButton();
  });
  on(dom.videoEl, "pause", syncPlayPauseButton);
  on(dom.videoEl, "ended", handleVideoEnded);
  on(dom.videoEl, "volumechange", applyVolume);

  on(dom.progressTrack, "pointerdown", (e) => {
    dom.progressTrack.setPointerCapture?.(e.pointerId);
    seekByClientX(e.clientX);
    updateProgressTimeTip(e.clientX);
  });
  on(dom.progressTrack, "pointermove", (e) => {
    updateProgressTimeTip(e.clientX);
    if (e.buttons === 1) seekByClientX(e.clientX);
  });
  on(dom.progressTrack, "pointerenter", (e) => updateProgressTimeTip(e.clientX));
  on(dom.progressTrack, "pointerleave", hideProgressTimeTip);
}

function init() {
  bindEvents();
  applyVolume();
  applyPlaybackRate();
  applyPlayModeUi();
  syncInfoPanelModeUi();
  syncInfoEditingUi();
  if (state.playMode === "shuffle") regenerateShuffleOrder();
  buildAllFilterPanels();
  renderPlaylist();
  renderInfoView();
  syncProgressFromVideo();
  syncPlayPauseButton();
  setupAudioVisualization();
  restoreLibraryOnStart().catch(console.error);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
