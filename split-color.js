/**
 * 左右分屏主题/组件色对调（分阶段）
 */

const SPLIT_MID_OFFSET_PX = 0;
const SPLIT_MID_EPS = 0.5;

const SPLIT_COLOR_BODY_CLASS = "split-color-swap-active";
const SPLIT_ZONE_ATTR = "data-split-zone";
const SPLIT_ROLE_ATTR = "data-split-role";

const TOOLBAR_RIGHT_FILTER_IDS = [
  "filterRoleBtn",
  "filterRolePanel",
  "filterLevelBtn",
  "filterLevelPanel",
];

/** 跨中线：筛选作者按键 + 下拉 */
const MIDDLE_TOOLBAR_FILTER_IDS = {
  btnId: "filterAuthorBtn",
  panelId: "filterAuthorPanel",
  btnRole: "fg-fill",
  panelRole: "surface",
};

/** 跨中线：播放/暂停（暂停键之后其余控制钮见 PLAYER_CTRL_AFTER_PAUSE_IDS） */
const MIDDLE_PLAYER_CTRL = {
  btnId: "btnPlayPause",
  btnRole: "fg-fill",
};

/** 跨中线：频谱区与功能键之间的分割线 */
const MIDDLE_PLAYER_DIVIDER = {
  selector: ".player-zone-divider",
  role: "player-divider",
};

/** 跨中线：频谱区 */
const MIDDLE_PLAYER_VIZ = {
  selector: ".player-zone-viz",
  role: "player-viz",
};

const PLAYER_CTRL_AFTER_PAUSE_IDS = [
  "btnNext",
  "btnSpeed",
  "btnPlayMode",
  "btnPip",
  "btnFullscreen",
  "btnLocate",
];

let activeForVideo = false;
let refreshRaf = 0;
let resizeBound = false;

function isSplitColorSwapVideo(v) {
  return SongRegistry.isSplitColorVideo(v);
}

function getSplitMid() {
  return window.innerWidth / 2 - SPLIT_MID_OFFSET_PX;
}

function crossesMid(rect, mid) {
  return rect.left < mid - SPLIT_MID_EPS && rect.right > mid + SPLIT_MID_EPS;
}

function isFullyRightOfMid(rect, mid) {
  return rect.width > 0 && rect.left >= mid - SPLIT_MID_EPS;
}

function setRightZoneOnly(el) {
  if (!el) return;
  setSplitZone(el, "right");
  el.removeAttribute(SPLIT_ROLE_ATTR);
  el.style.removeProperty("--split-gradient-stop");
}

function clearSplitElement(el) {
  if (!el) return;
  el.removeAttribute(SPLIT_ZONE_ATTR);
  el.removeAttribute(SPLIT_ROLE_ATTR);
  el.style.removeProperty("--split-gradient-stop");
}

function setSplitZone(el, zone) {
  if (!el) return;
  if (zone) el.setAttribute(SPLIT_ZONE_ATTR, zone);
  else el.removeAttribute(SPLIT_ZONE_ATTR);
}

function applySplitGeometry(el, mid, role) {
  if (!el || !(el instanceof HTMLElement)) return;
  const rect = el.getBoundingClientRect();
  if (!rect.width && !rect.height) {
    clearSplitElement(el);
    return;
  }

  if (crossesMid(rect, mid)) {
    const stopPct = Math.max(0, Math.min(100, ((mid - rect.left) / rect.width) * 100));
    el.setAttribute(SPLIT_ZONE_ATTR, "span");
    el.setAttribute(SPLIT_ROLE_ATTR, role);
    el.style.setProperty("--split-gradient-stop", `${stopPct}%`);
    return;
  }

  el.removeAttribute(SPLIT_ROLE_ATTR);
  el.style.removeProperty("--split-gradient-stop");
  if (isFullyRightOfMid(rect, mid)) setSplitZone(el, "right");
  else setSplitZone(el, null);
}

function clearAllSplitZones() {
  document.querySelectorAll(`[${SPLIT_ZONE_ATTR}], [${SPLIT_ROLE_ATTR}]`).forEach((el) => {
    clearSplitElement(el);
  });
  document.querySelector(".panel-player .panel-player-split-frame")?.setAttribute("hidden", "");
  clearPlayerZoneDividerLayout();
}

function markToolbarRightFilters() {
  for (const id of TOOLBAR_RIGHT_FILTER_IDS) {
    const el = document.getElementById(id);
    setRightZoneOnly(el);
    if (el?.id.endsWith("Btn")) setRightZoneOnly(el.closest(".toolbar-filter"));
  }
}

function markMiddleToolbarFilters(mid) {
  const { btnId, panelId, btnRole, panelRole } = MIDDLE_TOOLBAR_FILTER_IDS;
  const btn = document.getElementById(btnId);
  const panel = document.getElementById(panelId);

  if (btn) applySplitGeometry(btn, mid, btnRole);

  if (panel && !panel.hidden) {
    applySplitGeometry(panel, mid, panelRole);
    panel.querySelectorAll(".toolbar-filter-option").forEach((opt) => {
      applySplitGeometry(opt, mid, "text-only");
    });
  } else if (panel) {
    clearSplitElement(panel);
  }
}

function markMiddlePlayerControls(mid) {
  const btn = document.getElementById(MIDDLE_PLAYER_CTRL.btnId);
  if (btn) applySplitGeometry(btn, mid, MIDDLE_PLAYER_CTRL.btnRole);
}

function clearPlayerZoneDividerLayout() {
  const divider = document.querySelector(MIDDLE_PLAYER_DIVIDER.selector);
  if (!divider) return;
  ["top", "left", "right", "width", "height", "position", "display"].forEach((prop) => {
    divider.style.removeProperty(prop);
  });
}

function syncPlayerZoneDividerLayout() {
  const panel = document.querySelector(".panel-player");
  const divider = document.querySelector(MIDDLE_PLAYER_DIVIDER.selector);
  const viz = panel?.querySelector(".player-zone-viz");
  if (!panel || !divider || !viz) return;

  if (!activeForVideo) {
    clearPlayerZoneDividerLayout();
    return;
  }

  const panelRect = panel.getBoundingClientRect();
  const vizRect = viz.getBoundingClientRect();
  const rootCs = getComputedStyle(document.documentElement);
  const panelCs = getComputedStyle(panel);
  const bw = parseFloat(rootCs.getPropertyValue("--panel-border-width")) || 7;
  const strokeExtra = parseFloat(panelCs.getPropertyValue("--panel-split-stroke-extra")) || 0;
  const strokeW = bw + strokeExtra;

  divider.style.display = "block";
  divider.style.position = "absolute";
  divider.style.left = `${strokeW}px`;
  divider.style.right = `${strokeW}px`;
  divider.style.width = "auto";
  divider.style.height = `${bw}px`;
  divider.style.top = `${vizRect.bottom - panelRect.top - bw}px`;
}

function parseSplitHexRgb(hex) {
  return AppUtils.parseHexColor(hex, { r: 0, g: 0, b: 0 });
}

function getVisualizerSplitState(canvas) {
  if (!activeForVideo || !canvas) return { active: false };
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return { active: false };
  const mid = getSplitMid();
  const splitX = Math.max(
    0,
    Math.min(canvas.width, ((mid - rect.left) / rect.width) * canvas.width),
  );
  const bodyCs = getComputedStyle(document.body);
  const leftHex =
    bodyCs.getPropertyValue("--split-root-component").trim() ||
    getComputedStyle(document.documentElement).getPropertyValue("--component-color").trim() ||
    "#000000";
  const rightHex =
    bodyCs.getPropertyValue("--split-root-theme").trim() ||
    getComputedStyle(document.documentElement).getPropertyValue("--theme-color").trim() ||
    "#ffffff";
  return {
    active: true,
    splitX,
    rgbLeft: parseSplitHexRgb(leftHex),
    rgbRight: parseSplitHexRgb(rightHex),
  };
}

function markPlayerZoneViz(mid) {
  const viz = document.querySelector(MIDDLE_PLAYER_VIZ.selector);
  if (viz) applySplitGeometry(viz, mid, MIDDLE_PLAYER_VIZ.role);
}

function markPlayerZoneDivider(mid) {
  const divider = document.querySelector(MIDDLE_PLAYER_DIVIDER.selector);
  if (!divider) return;
  syncPlayerZoneDividerLayout();
  applySplitGeometry(divider, mid, MIDDLE_PLAYER_DIVIDER.role);
  divider.style.display = divider.getAttribute(SPLIT_ZONE_ATTR) ? "block" : "none";
}

function markPlayerControlsAfterPause() {
  PLAYER_CTRL_AFTER_PAUSE_IDS.forEach((id) => setRightZoneOnly(document.getElementById(id)));
}

function syncPlayerSplitFrameRing(panel, mid) {
  const svg = panel?.querySelector(".panel-player-split-frame");
  const ring = svg?.querySelector(".panel-player-split-frame__ring");
  const grad = svg?.querySelector("#panelPlayerBorderGrad");
  if (!svg || !ring || !grad) return;

  if (panel.getAttribute(SPLIT_ZONE_ATTR) !== "span") {
    svg.setAttribute("hidden", "");
    return;
  }
  svg.removeAttribute("hidden");

  const panelRect = panel.getBoundingClientRect();
  const panelCs = getComputedStyle(panel);
  const rootCs = getComputedStyle(document.documentElement);
  const bw = parseFloat(rootCs.getPropertyValue("--panel-border-width")) || 7;
  const strokeExtra = parseFloat(panelCs.getPropertyValue("--panel-split-stroke-extra")) || 0;
  const strokeW = bw + strokeExtra;
  const radius = parseFloat(rootCs.getPropertyValue("--radius-lg")) || 14;
  const inset = strokeW / 2;
  const w = Math.max(0, panelRect.width - strokeW);
  const h = Math.max(0, panelRect.height - strokeW);
  const r = Math.max(0, radius - inset);

  ring.setAttribute("x", String(inset));
  ring.setAttribute("y", String(inset));
  ring.setAttribute("width", String(w));
  ring.setAttribute("height", String(h));
  ring.setAttribute("rx", String(r));
  ring.setAttribute("ry", String(r));
  ring.setAttribute("stroke-width", String(strokeW));
  ring.setAttribute("stroke-linejoin", "round");
  ring.setAttribute("stroke-linecap", "round");

  const cs = getComputedStyle(panel);
  const bodyCs = getComputedStyle(document.body);
  const leftColor =
    cs.getPropertyValue("--split-border-left").trim() ||
    bodyCs.getPropertyValue("--split-root-component").trim() ||
    "#000000";
  const rightColor =
    cs.getPropertyValue("--split-border-right").trim() ||
    bodyCs.getPropertyValue("--split-root-theme").trim() ||
    "#ffffff";
  const stopPct =
    panelRect.width > 0
      ? Math.max(0, Math.min(100, ((mid - panelRect.left) / panelRect.width) * 100))
      : 50;

  while (grad.firstChild) grad.removeChild(grad.firstChild);
  for (const { offset, color } of [
    { offset: "0%", color: leftColor },
    { offset: `${stopPct}%`, color: leftColor },
    { offset: `${stopPct}%`, color: rightColor },
    { offset: "100%", color: rightColor },
  ]) {
    const stop = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    grad.appendChild(stop);
  }
}

/** 中间视频展示栏：仅最外层边框分色 */
function markPlayerPanel(mid) {
  const panel = document.querySelector(".panel-player");
  if (!panel) return;
  applySplitGeometry(panel, mid, "panel-border");
  syncPlayerSplitFrameRing(panel, mid);
  syncPlayerZoneDividerLayout();
}

function markPlaylistRightZones(mid) {
  const panel = document.querySelector(".panel-playlist");
  if (!panel) return;

  const panelParts = [
    panel,
    panel.querySelector("#playlistTitleBtn"),
    panel.querySelector("#playlistPanel"),
    panel.querySelector(".playlist-grid"),
  ].filter(Boolean);
  const cards = [...panel.querySelectorAll(".video-card")];
  const allEls = [...panelParts, ...cards];

  if (isFullyRightOfMid(panel.getBoundingClientRect(), mid)) {
    allEls.forEach(setRightZoneOnly);
    return;
  }

  allEls.forEach((el) => {
    clearSplitElement(el);
    if (isFullyRightOfMid(el.getBoundingClientRect(), mid)) setSplitZone(el, "right");
  });
}

function refreshSplitZones() {
  if (!activeForVideo) return;
  clearAllSplitZones();
  const mid = getSplitMid();
  document.body.style.setProperty("--split-mid", `${mid}px`);
  markMiddleToolbarFilters(mid);
  markPlayerPanel(mid);
  markPlayerZoneViz(mid);
  markPlayerZoneDivider(mid);
  markMiddlePlayerControls(mid);
  markToolbarRightFilters();
  markPlayerControlsAfterPause();
  markPlaylistRightZones(mid);
}

function scheduleRefresh() {
  if (!activeForVideo) return;
  if (refreshRaf) cancelAnimationFrame(refreshRaf);
  refreshRaf = requestAnimationFrame(() => {
    refreshRaf = 0;
    refreshSplitZones();
  });
}

function bindResize() {
  if (resizeBound) return;
  resizeBound = true;
  window.addEventListener("resize", scheduleRefresh);
}

function unbindResize() {
  if (!resizeBound) return;
  resizeBound = false;
  window.removeEventListener("resize", scheduleRefresh);
}

function enableSplitColor() {
  if (activeForVideo) {
    scheduleRefresh();
    return;
  }
  activeForVideo = true;
  document.body.classList.add(SPLIT_COLOR_BODY_CLASS);
  bindResize();
  refreshSplitZones();
}

function disableSplitColor() {
  if (!activeForVideo) return;
  activeForVideo = false;
  document.body.classList.remove(SPLIT_COLOR_BODY_CLASS);
  document.body.style.removeProperty("--split-mid");
  clearAllSplitZones();
  unbindResize();
  if (refreshRaf) {
    cancelAnimationFrame(refreshRaf);
    refreshRaf = 0;
  }
}

const SplitColor = {
  isActive() {
    return activeForVideo;
  },

  isSplitColorSwapVideo(v) {
    return isSplitColorSwapVideo(v);
  },

  applyForVideo(v) {
    if (isSplitColorSwapVideo(v)) enableSplitColor();
    else disableSplitColor();
  },

  refresh() {
    scheduleRefresh();
  },

  onThemeChanged() {
    if (!activeForVideo) return;
    scheduleRefresh();
  },

  getVisualizerSplitState(canvas) {
    return getVisualizerSplitState(canvas);
  },
};

window.SplitColor = SplitColor;
