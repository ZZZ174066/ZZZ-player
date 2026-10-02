/**
 * 特效总线：新增 overlay / 频谱特效只需 register，不必改 main.js
 *
 * Overlay API: { exportAs?, resolveSong(v), sync(v), destroy? }
 * 频谱：在 syncVisualizer 里按 mode 分发（fire|ecg|uno|hero|blocks|bars）
 */
(function () {
  /** @type {Array<{ resolveSong: Function, sync: Function, destroy?: Function, exportAs?: string }>} */
  const overlays = [];

  function registerOverlay(api) {
    if (!api || typeof api.sync !== "function" || typeof api.resolveSong !== "function") {
      console.warn("[EffectHub] invalid overlay", api);
      return api;
    }
    const name = api.exportAs || api.name;
    if (name && overlays.some((o) => (o.exportAs || o.name) === name)) {
      const i = overlays.findIndex((o) => (o.exportAs || o.name) === name);
      overlays[i] = api;
    } else {
      overlays.push(api);
    }
    if (name) window[name] = api;
    return api;
  }

  function syncOverlays(song) {
    for (const fx of overlays) {
      try {
        fx.sync(song);
      } catch (e) {
        console.error("[EffectHub] overlay sync", fx.exportAs || fx.name, e);
      }
    }
  }

  function hasOverlay(song) {
    return overlays.some((fx) => {
      try {
        return !!fx.resolveSong(song);
      } catch {
        return false;
      }
    });
  }

  function syncVisualizer(mode, { analyser } = {}) {
    const m = mode || "bars";
    document.body.classList.toggle("viz-fire-active", m === "fire");
    document.body.classList.toggle("viz-ecg-active", m === "ecg");
    document.body.classList.toggle("viz-hero-active", m === "hero");
    document.body.classList.toggle("viz-uno-active", m === "uno");
    document.body.classList.toggle("viz-blocks-active", m === "blocks");

    if (m !== "fire") window.FireViz?.reset?.();
    if (m !== "ecg") window.EcgViz?.reset?.();
    if (m !== "blocks") window.BlocksViz?.reset?.();
    window.UnoViz?.setActive?.(m === "uno");
    window.HeroViz?.setActive?.(m === "hero");

    if (analyser) {
      analyser.smoothingTimeConstant = m === "ecg" ? 0.28 : 0.55;
      analyser.minDecibels = -82;
      analyser.maxDecibels = -25;
    }
  }

  function syncAll(song, opts = {}) {
    window.BgSync?.sync?.(song);
    window.ProgressSync?.sync?.(song);
    window.FilterSync?.sync?.(song);
    syncOverlays(song);
    const mode = window.SongRegistry?.resolveVisualizerMode?.(song) || "bars";
    syncVisualizer(mode, opts);
    return mode;
  }

  function hasSpecialBadge(song) {
    if (!song) return false;
    if (window.BgSync?.resolveBgSong?.(song)) return true;
    if (window.ProgressSync?.resolveProgressSong?.(song)) return true;
    if (window.FilterSync?.resolveFilterSong?.(song)) return true;
    if (hasOverlay(song)) return true;
    return !!window.SongRegistry?.findSong?.(song, (s) => !!s.viz);
  }

  function drawVisualizer(ctx, canvas, { mode, freq, time, rgb, now }) {
    const m = mode || "bars";
    if (m === "fire" && window.FireViz) {
      FireViz.draw(ctx, canvas, freq, now);
      return true;
    }
    if (m === "blocks" && window.BlocksViz) {
      BlocksViz.draw(ctx, canvas, freq, rgb);
      return true;
    }
    if (m === "ecg" && window.EcgViz) {
      EcgViz.draw(ctx, canvas, freq, time, rgb);
      return true;
    }
    if (m === "uno") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.UnoViz?.update?.();
      return true;
    }
    if (m === "hero") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.HeroViz?.update?.();
      return true;
    }
    return false;
  }

  window.EffectHub = {
    registerOverlay,
    syncAll,
    syncOverlays,
    syncVisualizer,
    hasSpecialBadge,
    hasOverlay,
    drawVisualizer,
    listOverlays: () => overlays.slice(),
  };
})();
