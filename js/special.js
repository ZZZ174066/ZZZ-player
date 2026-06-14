/**
 * 特殊效果编排 — 对外 API 保持不变 (window.Special)
 */
(function () {
  const { ProgressThumbEffect } = EffectBase;
  const { parseHexColor } = AppUtils;
  const { SPECIAL_SONG_BG_BODY_CLASS } = EffectBase;

  let playerHooks = null;
  const panelEffects = PanelEffects.buildAll();

  const progressEffects = SongRegistry.SONGS.filter((s) => s.progress).map((s) => ({
    match: (v) => SongRegistry.matchSong(v, s),
    fx: new ProgressThumbEffect(s.progress),
  }));

  window.SpecialHooks = {
    get: () => playerHooks,
    set: (h) => {
      playerHooks = h;
    },
  };

  function syncProgress(v) {
    const wrap = document.getElementById("playerProgressWrap");
    let anyActive = false;
    for (const { match, fx } of progressEffects) {
      const on = !!v && match(v);
      fx.setActive(on);
      if (on) anyActive = true;
    }
    if (!anyActive) wrap?.style.removeProperty("--player-progress-thumb");
  }

  function getProgressThumbPx() {
    for (const { fx } of progressEffects) {
      if (fx.active) return fx.thumbPx;
    }
    return null;
  }

  const Special = {
    enabled: false,
    root: null,
    canvas: null,
    ctx: null,
    raf: 0,
    lastTs: 0,
    activeEffect: null,
    renderCtx: {
      activeEffectId: "",
      regions: { visualizer: null, panel: null },
      themeRgb: { r: 255, g: 255, b: 255 },
      componentRgb: { r: 0, g: 0, b: 0 },
      ctx: null,
    },

    init(hooks) {
      SpecialHooks.set(hooks || null);
      this.root = document.getElementById("specialFxRoot");
      this.canvas = document.getElementById("specialFxCanvas");
      this.ctx = this.canvas?.getContext("2d") || null;
      const onResize = () => this.resize();
      window.addEventListener("resize", onResize);
      const panel = document.getElementById("playerPanel");
      if (window.ResizeObserver && panel) new ResizeObserver(onResize).observe(panel);
      this.resize();
    },

    resize() {
      const panel = document.getElementById("playerPanel");
      if (!this.canvas || !panel) return;
      const rect = panel.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.activeEffect?.syncLayout?.();
    },

    mountEffect(effectId) {
      const mod = panelEffects[effectId] || panelEffects.sparkle;
      this.activeEffect?.unmount?.();
      this.activeEffect = mod;
      mod.mount?.(this.renderCtx);
    },

    updateRegions() {
      const panel = document.getElementById("playerPanel");
      const vizEl = document.querySelector(".player-zone-viz");
      if (!panel || !this.canvas) {
        this.renderCtx.regions = { panel: null, visualizer: null };
        return;
      }
      const panelRect = panel.getBoundingClientRect();
      const canvasRect = this.canvas.getBoundingClientRect();
      const toLocal = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left - canvasRect.left,
          y: r.top - canvasRect.top,
          width: r.width,
          height: r.height,
        };
      };
      this.renderCtx.regions = {
        panel: {
          x: panelRect.left - canvasRect.left,
          y: panelRect.top - canvasRect.top,
          width: panelRect.width,
          height: panelRect.height,
        },
        visualizer: toLocal(vizEl),
      };
    },

    syncContext() {
      const theme = playerHooks?.getTheme?.() || {};
      this.renderCtx.themeRgb = parseHexColor(theme.themeColor, { r: 255, g: 255, b: 255 });
      this.renderCtx.componentRgb = parseHexColor(theme.componentColor, { r: 0, g: 0, b: 0 });
      this.updateRegions();
      const nextId = SongRegistry.resolvePanelEffect(playerHooks?.getCurrentVideo?.());
      if (nextId !== this.renderCtx.activeEffectId) this.mountEffect(nextId);
    },

    onVideoChanged() {
      if (!this.enabled) return;
      this.syncContext();
    },

    onThemeChanged() {
      if (!this.enabled) return;
      this.syncContext();
    },

    clearFrame() {
      if (!this.ctx || !this.canvas) return;
      const panel = document.getElementById("playerPanel");
      const w = panel?.getBoundingClientRect().width || this.canvas.clientWidth;
      const h = panel?.getBoundingClientRect().height || this.canvas.clientHeight;
      this.ctx.clearRect(0, 0, w, h);
    },

    stopLoop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.lastTs = 0;
      this.clearFrame();
      this.activeEffect?.unmount?.();
      this.activeEffect = null;
      this.renderCtx.activeEffectId = "";
      document.body.classList.remove(
        "chaos-boogie-active",
        "cheohyung-active",
        "character-t-active",
        SPECIAL_SONG_BG_BODY_CLASS,
      );
    },

    startLoop() {
      if (this.raf) return;
      const frame = (ts) => {
        this.raf = requestAnimationFrame(frame);
        if (!this.enabled || !this.ctx) return;
        const dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 0;
        this.lastTs = ts;
        this.updateRegions();
        this.clearFrame();
        this.renderCtx.ctx = this.ctx;
        this.activeEffect?.tick?.(this.renderCtx, dt);
      };
      this.raf = requestAnimationFrame(frame);
    },

    setEnabled(on) {
      const next = !!on;
      if (this.enabled === next) return;
      this.enabled = next;
      if (this.root) {
        this.root.hidden = !next;
        this.root.setAttribute("aria-hidden", next ? "false" : "true");
        this.root.classList.toggle("is-running", next);
      }
      document.body.classList.toggle("special-fx-enabled", next);
      if (next) {
        this.resize();
        this.syncContext();
        this.startLoop();
      } else {
        this.stopLoop();
      }
    },

    isEnabled: () => Special.enabled,
    hasSpecialSongEffects: (v) => SongRegistry.hasSpecialBadge(v),
    getVisualizerMode: () => VisualizerEffects.getMode(),
    syncVisualizer: (v, opts) => VisualizerEffects.sync(v, opts),
    drawEcgVisualizer: VisualizerEffects.drawEcg,
    resetEcgOnResize: VisualizerEffects.resetEcgOnResize,
    resetUnoOnResize: VisualizerEffects.resetUnoOnResize,
    resetHeroOnResize: VisualizerEffects.resetHeroOnResize,
    updateUnoVisualizer: VisualizerEffects.updateUno,
    updateHeroVisualizer: VisualizerEffects.updateHero,
    syncProgressEffect: syncProgress,
    getProgressThumbPx,
  };

  window.Special = Special;
})();
