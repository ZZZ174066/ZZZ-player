/**
 * 驱魔：背景层黑色拉丁咒文 “Vade retro satana!”
 * 字号有大有小，一律从右向左滚动
 */
(function () {
  const TEXT = "Vade retro satana!";
  const MAX = 22;
  const SPAWN_MIN = 0.18;
  const SPAWN_MAX = 0.48;

  let active = false;
  let layer = null;
  let raf = 0;
  let lastTs = 0;
  let spawnAcc = 0;
  let nextSpawn = 0.4;
  let items = [];
  let resizeObs = null;

  function backdrop() {
    return document.getElementById("appThemeBackdrop");
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function ensureLayer() {
    const host = backdrop();
    if (!host) return false;
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "exorcismTextLayer";
      layer.className = "exorcism-text-layer";
      layer.setAttribute("aria-hidden", "true");
      host.appendChild(layer);
    } else if (!host.contains(layer)) {
      host.appendChild(layer);
    }
    return true;
  }

  function fontSize(w, h) {
    const base = Math.min(w, h);
    return rand(base * 0.016, base * 0.055);
  }

  function spawn(xOffset = 0) {
    if (!layer || items.length >= MAX) return;
    const host = backdrop() || document.getElementById("app");
    const w = host?.clientWidth || window.innerWidth;
    const h = host?.clientHeight || window.innerHeight;
    const size = fontSize(w, h);
    const el = document.createElement("div");
    el.className = "exorcism-text exorcism-text--scroll";
    el.textContent = TEXT;
    el.style.fontSize = `${size}px`;
    const margin = size * 8;
    const x = w + margin + xOffset;
    const y = rand(size, Math.max(size, h - size));
    const vx = -rand(90, 210);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = "translate(-50%, -50%)";
    layer.appendChild(el);
    items.push({ el, x, y, vx, size });
  }

  function tick(ts) {
    if (!active) {
      raf = 0;
      return;
    }
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    const host = backdrop() || document.getElementById("app");
    const w = host?.clientWidth || window.innerWidth;

    spawnAcc += dt;
    if (spawnAcc >= nextSpawn) {
      spawnAcc = 0;
      nextSpawn = rand(SPAWN_MIN, SPAWN_MAX);
      spawn();
    }

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.x += it.vx * dt;
      it.el.style.left = `${it.x}px`;
      if (it.x < -it.size * 8) {
        it.el.remove();
        items.splice(i, 1);
      }
    }

    raf = requestAnimationFrame(tick);
  }

  function clearItems() {
    items.forEach((it) => it.el.remove());
    items = [];
  }

  function start() {
    if (active) return;
    if (!ensureLayer()) return;
    active = true;
    document.body.classList.add("exorcism-text-active");
    clearItems();
    spawnAcc = 0;
    nextSpawn = 0.12;
    lastTs = 0;
    const host = backdrop() || document.getElementById("app");
    const w = host?.clientWidth || window.innerWidth;
    for (let i = 0; i < 5; i++) spawn(-w * 0.18 * i);

    if (!resizeObs && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver(() => {});
      const hostEl = backdrop();
      if (hostEl) resizeObs.observe(hostEl);
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    document.body.classList.remove("exorcism-text-active");
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    clearItems();
  }

  function destroy() {
    stop();
    resizeObs?.disconnect?.();
    resizeObs = null;
    layer?.remove();
    layer = null;
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "exorcismText");
  }

  function sync(v) {
    if (resolveSong(v)) start();
    else stop();
  }

  window.EffectHub?.registerOverlay({
    exportAs: "ExorcismFx",
    resolveSong,
    sync,
    destroy,
  });
})();
