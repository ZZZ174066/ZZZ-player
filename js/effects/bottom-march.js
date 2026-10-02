/**
 * 底部横向行进层工厂（DOM img）
 * 处刑拍手 / 角色T 等共用
 *
 * @example
 * EffectHub.registerOverlay(BottomMarch.create({
 *   exportAs: "ClapFx",
 *   overlayId: "clapMarch",
 *   layerId: "clapMarchLayer",
 *   pickSrc: () => "...gif",
 *   spawnInterval: 2.85,
 * }));
 */
(function () {
  function backdrop() {
    return document.getElementById("appThemeBackdrop");
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  /**
   * @param {object} cfg
   * @param {string} cfg.exportAs
   * @param {string} cfg.overlayId  songs.js overlay 字段
   * @param {string} cfg.layerId
   * @param {string} [cfg.layerClass]
   * @param {string} [cfg.itemClass]
   * @param {string} [cfg.bodyClass]
   * @param {() => string} cfg.pickSrc
   * @param {number} [cfg.speed]
   * @param {number} [cfg.spawnInterval]
   * @param {(base:number) => number} [cfg.getInterval]
   * @param {number} [cfg.maxUnits]
   * @param {number} [cfg.heightRatio]
   * @param {number} [cfg.heightMin]
   * @param {number} [cfg.heightMax]
   * @param {number} [cfg.bottomNudge]  正=下移，负=上移（写入 --march-bottom 时取反）
   * @param {{ amp:number, speed:number }} [cfg.sway]
   * @param {() => void} [cfg.onStart]
   * @param {() => void} [cfg.onStop]
   */
  function create(cfg) {
    const {
      exportAs,
      overlayId,
      layerId,
      layerClass = "",
      itemClass = "",
      bodyClass = "",
      pickSrc,
      speed = 52,
      spawnInterval = 2.5,
      getInterval = null,
      maxUnits = 18,
      heightRatio = 0.22,
      heightMin = 100,
      heightMax = 180,
      bottomNudge = 18,
      sway = null,
      onStart = null,
      onStop = null,
    } = cfg;

    let active = false;
    let layer = null;
    let raf = 0;
    let lastTs = 0;
    let spawnAcc = 0;
    let units = [];
    let resizeObs = null;
    let unitH = 0;
    let swayPhase = 0;

    function intervalNow() {
      const base = spawnInterval;
      return getInterval ? getInterval(base) : base;
    }

    function ensureLayer() {
      const host = backdrop();
      if (!host) return false;
      if (!layer) {
        layer = document.createElement("div");
        layer.id = layerId;
        layer.className = ["bottom-march-layer", layerClass].filter(Boolean).join(" ");
        layer.setAttribute("aria-hidden", "true");
        host.appendChild(layer);
      } else if (!host.contains(layer)) {
        host.appendChild(layer);
      }
      layout();
      return true;
    }

    function layout() {
      if (!layer) return;
      const host = backdrop() || document.getElementById("app");
      const h = Math.max(1, host?.clientHeight || window.innerHeight);
      unitH = Math.round(Math.min(heightMax, Math.max(heightMin, h * heightRatio)));
      layer.style.setProperty("--march-item-h", `${unitH}px`);
      layer.style.setProperty("--march-bottom", `${-bottomNudge}px`);
    }

    function spawnUnit() {
      if (!layer || units.length >= maxUnits) return;
      const src = pickSrc();
      if (!src) return;
      const img = document.createElement("img");
      img.className = ["bottom-march-item", itemClass].filter(Boolean).join(" ");
      img.alt = "";
      img.draggable = false;
      img.src = src;
      const x = layer.clientWidth || window.innerWidth;
      img.style.transform = `translate3d(${x}px, 0, 0) rotate(0deg)`;
      layer.appendChild(img);
      units.push({ el: img, x });
    }

    function clearUnits() {
      units.forEach((u) => u.el.remove());
      units = [];
    }

    function tick(ts) {
      if (!active) {
        raf = 0;
        return;
      }
      const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
      lastTs = ts;
      layout();

      spawnAcc += dt;
      const iv = intervalNow();
      while (spawnAcc >= iv && units.length < maxUnits) {
        spawnAcc -= iv;
        spawnUnit();
      }

      let rot = 0;
      if (sway) {
        swayPhase += dt * sway.speed;
        rot = Math.sin(swayPhase) * sway.amp;
      }

      for (let i = units.length - 1; i >= 0; i--) {
        const u = units[i];
        u.x -= speed * dt;
        u.el.style.transform = sway
          ? `translate3d(${u.x}px, 0, 0) rotate(${rot.toFixed(2)}deg)`
          : `translate3d(${u.x}px, 0, 0)`;
        const w = u.el.offsetWidth || unitH;
        if (u.x + w < -40) {
          u.el.remove();
          units.splice(i, 1);
        }
      }

      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (active) return;
      if (!ensureLayer()) return;
      active = true;
      if (bodyClass) document.body.classList.add(bodyClass);
      clearUnits();
      spawnAcc = intervalNow();
      lastTs = 0;
      swayPhase = 0;
      onStart?.();

      if (!resizeObs && typeof ResizeObserver !== "undefined") {
        resizeObs = new ResizeObserver(() => layout());
        const host = backdrop() || document.getElementById("app");
        if (host) resizeObs.observe(host);
      }
      window.addEventListener("resize", layout);
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function stop() {
      active = false;
      if (bodyClass) document.body.classList.remove(bodyClass);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      clearUnits();
      window.removeEventListener("resize", layout);
      onStop?.();
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
      return SongRegistry.findSong(v, (s) => s.overlay === overlayId);
    }

    function sync(v) {
      if (resolveSong(v)) start();
      else stop();
    }

    return {
      exportAs,
      name: exportAs,
      overlayId,
      resolveSong,
      sync,
      destroy,
      getVideo,
    };
  }

  window.BottomMarch = { create };
})();
