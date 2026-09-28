/**
 * 面板层特效（canvas / DOM）
 */
(function () {
  const { BgEffect, HorizontalScrollLayer } = EffectBase;
  const { preloadImages, createImg, bindVideoEvents } = AppUtils;
  const FX = SongRegistry.FX;

  const CHAOS = {
    ring: `${FX}混沌ブギ（混沌布吉）/环.png`,
    handsUp: `${FX}混沌ブギ（混沌布吉）/举手.png`,
    clap: `${FX}混沌ブギ（混沌布吉）/鼓掌.png`,
    pause: `${FX}混沌ブギ（混沌布吉）/暂停.png`,
  };
  const CHAOS_PLAY = [CHAOS.handsUp, CHAOS.clap];
  const CHAOS_FPS_MS = 1000 / 3;

  const CHEOHYUNG = {
    clap: `${FX}처형박수（处刑拍手）/처형박수（处刑拍手）1.gif`,
    doubleAt: 136,
    interval: 2.2,
    scroll: 165,
    z: 1_000_000,
  };

  const FRUITS = [
    "梨", "榴莲", "樱桃", "橘子", "苹果", "草莓", "菠萝", "葡萄", "西瓜", "香蕉",
  ].map((n) => `${FX}Character T（角色T）/${n}.png`);

  function bg(id, imgId) {
    return new BgEffect({ id, imgId, bgCandidates: SongRegistry.getBgCandidates(id) });
  }

  const sparkle = {
    id: "sparkle",
    particles: [],
    lastSpawn: 0,
    mount(ctx) {
      this.particles = [];
      this.lastSpawn = 0;
      ctx.activeEffectId = this.id;
    },
    unmount() {
      this.particles = [];
    },
    tick(ctx, dt) {
      const viz = ctx.regions.visualizer;
      if (!viz || viz.width < 2 || viz.height < 2) return;
      const hooks = SpecialHooks.get();
      const freq = hooks?.getFrequencyData?.();
      const energy = freq ? freq.reduce((a, b) => a + b, 0) / (freq.length * 255) : 0;
      const bass = freq ? freq.slice(0, 8).reduce((a, b) => a + b, 0) / (8 * 255) : 0;
      const rate = 0.04 + energy * 0.22;
      this.lastSpawn += dt;
      while (this.lastSpawn > 1 / Math.max(0.05, rate)) {
        this.lastSpawn -= 1 / Math.max(0.05, rate);
        this.particles.push({
          x: viz.x + Math.random() * viz.width,
          y: viz.y + viz.height * (0.35 + Math.random() * 0.55),
          vx: (Math.random() - 0.5) * 40 * energy,
          vy: -(30 + Math.random() * 80) * (0.35 + energy),
          life: 0.7 + Math.random() * 0.9,
          age: 0,
          size: 2 + Math.random() * 3 * (0.5 + bass),
        });
      }
      const { ctx: c, themeRgb, componentRgb } = ctx;
      c.save();
      c.beginPath();
      c.rect(viz.x, viz.y, viz.width, viz.height);
      c.clip();
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.age += dt;
        if (p.age >= p.life) {
          this.particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 28 * dt;
        const t = 1 - p.age / p.life;
        const alpha = t * t * (0.35 + energy * 0.55);
        c.strokeStyle = `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, ${alpha})`;
        c.lineWidth = 1.2;
        c.lineCap = "round";
        const s = p.size * t;
        c.beginPath();
        c.moveTo(p.x - s, p.y);
        c.lineTo(p.x + s, p.y);
        c.moveTo(p.x, p.y - s);
        c.lineTo(p.x, p.y + s);
        c.stroke();
      }
      if (bass > 0.42) {
        const glow = (bass - 0.42) * 0.35;
        const g = c.createRadialGradient(
          viz.x + viz.width / 2,
          viz.y + viz.height * 0.85,
          0,
          viz.x + viz.width / 2,
          viz.y + viz.height * 0.85,
          viz.width * 0.55,
        );
        g.addColorStop(0, `rgba(${componentRgb.r}, ${componentRgb.g}, ${componentRgb.b}, ${glow})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(viz.x, viz.y, viz.width, viz.height);
      }
      c.restore();
    },
  };

  const chaosBoogie = {
    id: "chaosBoogie",
    ringEl: null,
    cornerWrap: null,
    cornerTimer: null,
    cornerFrameIndex: 0,
    cornerAnimState: null,
    unbindPlayback: null,

    getCornerImages() {
      return this.cornerWrap ? [...this.cornerWrap.querySelectorAll(".chaos-boogie-player-fx")] : [];
    },
    setCornerSrc(src) {
      this.getCornerImages().forEach((img) => {
        img.src = src;
      });
    },
    tickCornerPlayFrame() {
      this.setCornerSrc(CHAOS_PLAY[this.cornerFrameIndex]);
      this.cornerFrameIndex = (this.cornerFrameIndex + 1) % CHAOS_PLAY.length;
    },
    stopCornerAnimation() {
      if (this.cornerTimer != null) {
        clearInterval(this.cornerTimer);
        this.cornerTimer = null;
      }
    },
    enterCornerPlaying() {
      if (this.cornerAnimState === "playing" && this.cornerTimer != null) return;
      this.cornerAnimState = "playing";
      this.stopCornerAnimation();
      this.tickCornerPlayFrame();
      this.cornerTimer = setInterval(() => this.tickCornerPlayFrame(), CHAOS_FPS_MS);
    },
    enterCornerPaused() {
      if (this.cornerAnimState === "paused") return;
      this.cornerAnimState = "paused";
      this.stopCornerAnimation();
      this.setCornerSrc(CHAOS.pause);
    },
    syncCornerAnimation() {
      if (!document.body.classList.contains("chaos-boogie-active")) return;
      const video = SpecialHooks.get()?.getVideo?.();
      if (!video) return;
      if (video.paused || video.ended) this.enterCornerPaused();
      else this.enterCornerPlaying();
    },
    ensureDom() {
      const panel = document.getElementById("playerPanel");
      const backdrop = document.getElementById("appThemeBackdrop");
      const vizZone = document.querySelector(".player-zone-viz");
      if (!panel || !backdrop || !vizZone) return;
      if (!this.ringEl) {
        preloadImages([CHAOS.ring, ...CHAOS_PLAY, CHAOS.pause]);
        const ring = createImg(CHAOS.ring, "chaos-boogie-bg-ring");
        ring.id = "chaosBoogieRing";
        backdrop.appendChild(ring);
        this.ringEl = ring;
      }
      if (!this.cornerWrap) {
        const wrap = document.createElement("div");
        wrap.id = "chaosBoogieCornerFx";
        wrap.className = "chaos-boogie-corner-fx";
        wrap.setAttribute("aria-hidden", "true");
        wrap.append(
          createImg(CHAOS.pause, "chaos-boogie-player-fx chaos-boogie-player-fx--left"),
          createImg(CHAOS.pause, "chaos-boogie-player-fx chaos-boogie-player-fx--right"),
        );
        panel.appendChild(wrap);
        this.cornerWrap = wrap;
      }
      this.ringEl.hidden = false;
      this.cornerWrap.hidden = false;
    },
    destroyDom() {
      this.stopCornerAnimation();
      this.unbindPlayback?.();
      this.unbindPlayback = null;
      this.cornerFrameIndex = 0;
      this.cornerAnimState = null;
      this.ringEl?.remove();
      this.cornerWrap?.remove();
      this.ringEl = null;
      this.cornerWrap = null;
    },
    syncRingPosition() {
      const panel = document.getElementById("playerPanel");
      const backdrop = document.getElementById("appThemeBackdrop");
      if (!this.ringEl || !panel || !backdrop) return;
      const pr = panel.getBoundingClientRect();
      const br = backdrop.getBoundingClientRect();
      const offsetY =
        parseFloat(getComputedStyle(backdrop).getPropertyValue("--chaos-boogie-ring-offset-y")) || 0;
      this.ringEl.style.left = `${pr.left + pr.width / 2 - br.left}px`;
      this.ringEl.style.top = `${pr.top + pr.height / 2 - br.top + offsetY}px`;
    },
    syncLayout() {
      const panel = document.getElementById("playerPanel");
      const vizZone = document.querySelector(".player-zone-viz");
      if (!panel) return;
      this.syncRingPosition();
      if (vizZone && this.cornerWrap) {
        const pr = panel.getBoundingClientRect();
        const vr = vizZone.getBoundingClientRect();
        this.cornerWrap.style.top = `${vr.top - pr.top}px`;
        this.cornerWrap.style.left = `${vr.left - pr.left}px`;
        this.cornerWrap.style.width = `${vr.width}px`;
        this.cornerWrap.style.height = `${vr.height}px`;
      }
    },
    mount(ctx) {
      ctx.activeEffectId = this.id;
      document.body.classList.add("chaos-boogie-active");
      this.ensureDom();
      const video = SpecialHooks.get()?.getVideo?.();
      if (video) {
        const handler = () => this.syncCornerAnimation();
        this.unbindPlayback = bindVideoEvents(video, ["play", "pause", "ended"], handler);
      }
      this.syncLayout();
      this.syncCornerAnimation();
    },
    unmount() {
      document.body.classList.remove("chaos-boogie-active");
      this.destroyDom();
    },
    tick() {
      this.syncLayout();
    },
  };

  function createCheohyung() {
    const bgFx = bg("cheohyung", "cheohyungBg");
    const layer = new HorizontalScrollLayer({
      layerId: "cheohyungClapLayer",
      layerClass: "cheohyung-clap-layer",
      itemClass: "cheohyung-clap-hand",
      scrollPxS: CHEOHYUNG.scroll,
      zBase: CHEOHYUNG.z,
      spawnIntervalS: CHEOHYUNG.interval,
      getSpawnIntervalSec() {
        const t = Number(SpecialHooks.get()?.getVideo?.()?.currentTime) || 0;
        return t >= CHEOHYUNG.doubleAt ? CHEOHYUNG.interval / 2 : CHEOHYUNG.interval;
      },
      pickSrc: () => CHEOHYUNG.clap,
    });
    return {
      id: "cheohyung",
      mount(ctx) {
        bgFx.mount(ctx);
        document.body.classList.add("cheohyung-active");
        preloadImages([CHEOHYUNG.clap]);
        layer.ensureLayer();
        layer.spawnAccum = 0;
      },
      unmount() {
        document.body.classList.remove("cheohyung-active");
        layer.destroyLayer();
        bgFx.unmount();
      },
      tick(ctx, dt) {
        bgFx.tick(ctx, dt);
        layer.tick(dt, SpecialHooks.get());
      },
    };
  }

  function createCharacterT() {
    let imageIndex = 0;
    let swayTime = 0;
    const layer = new HorizontalScrollLayer({
      layerId: "characterTFruitLayer",
      layerClass: "character-t-fruit-layer",
      itemClass: "character-t-fruit",
      scrollPxS: 145,
      zBase: 1_000_000,
      spawnIntervalS: 1.6,
      pickSrc: () => FRUITS[(imageIndex++) % FRUITS.length],
      onItemTick(item, dt) {
        const hooks = SpecialHooks.get();
        const freq = hooks?.getFrequencyData?.();
        const energy = freq ? freq.reduce((a, b) => a + b, 0) / (freq.length * 255) : 0;
        swayTime += dt;
        const rot = Math.sin(swayTime * 4.2 + item.swayPhase) * (4 + energy * 7);
        item.el.style.transform = `rotate(${rot.toFixed(2)}deg)`;
      },
    });
    return {
      id: "characterT",
      mount(ctx) {
        ctx.activeEffectId = "characterT";
        document.body.classList.add("character-t-active");
        preloadImages(FRUITS);
        layer.ensureLayer();
        layer.spawnAccum = 0;
      },
      unmount() {
        document.body.classList.remove("character-t-active");
        layer.destroyLayer();
      },
      tick(_ctx, dt) {
        layer.tick(dt, SpecialHooks.get());
      },
    };
  }

  window.PanelEffects = {
    buildAll() {
      return {
        sparkle,
        chaosBoogie,
        moonBeautiful: bg("moonBeautiful", "moonBeautifulBg"),
        telepathy: bg("telepathy", "telepathyBg"),
        bakaMitai: bg("bakaMitai", "bakaMitaiBg"),
        cheohyung: createCheohyung(),
        characterT: createCharacterT(),
      };
    },
  };
})();
