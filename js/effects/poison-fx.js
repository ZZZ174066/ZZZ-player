/**
 * 展示中毒：分时段黑白 + 组件色红 + 亮蓝星空（流星、星点、烟花）+ 色散
 *
 * 0:00–0:15.2   正常
 * 0:15.2–0:42   黑白
 * 0:42–1:08     正常 + 亮蓝星空
 * 1:08–1:25     仅组件色红（无滤镜、无星空）
 * 1:25–1:36.5   普通黑白 + 色散
 * 1:36.5–结束   正常 + 亮蓝星空
 *               （1:52.8–1:55.2 突变黑白、星空骤关；2:15.8 起持续黑白）
 */
(function () {
  const RED_HEX = "#ff0000";
  const RED_RGB = "255, 0, 0";
  const SKY_BLUE = { r: 70, g: 190, b: 255 };
  const SKY_CORE = { r: 210, g: 245, b: 255 };
  const SKY_GLOW = { r: 40, g: 140, b: 255 };
  /** 烟花配色：蓝青为主，粉紫点缀 */
  const FW_COLORS = [
    { r: 230, g: 248, b: 255 },
    { r: 120, g: 210, b: 255 },
    { r: 60, g: 170, b: 255 },
    { r: 30, g: 120, b: 255 },
    { r: 80, g: 230, b: 255 },
    { r: 255, g: 90, b: 220 },
    { r: 190, g: 110, b: 255 },
    { r: 255, g: 150, b: 210 },
    { r: 140, g: 255, b: 230 },
  ];
  const FW_BLUE_WEIGHT = 5;

  const STAR_COUNT = 160;
  const MAX_METEORS = 18;
  const MAX_BURSTS = 8;
  const CHROMA_MAX_DX = 4.2;

  let active = false;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let lastTs = 0;
  let resizeObs = null;

  let stars = [];
  let meteors = [];
  let bursts = [];
  let nextMeteorAt = 0;
  let nextBurstAt = 0;

  let displayBw = 0;
  let displayRed = 0;
  let displaySky = 0;
  let displayChroma = 0;
  let componentOverridden = false;
  let savedComponent = null;
  let lastMediaTime = NaN;
  let skyLive = false;
  let redOffset = null;
  let blueOffset = null;

  function backdrop() {
    return document.getElementById("appThemeBackdrop");
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function clamp01(x) {
    return Math.min(1, Math.max(0, x));
  }

  function smoothstep(x) {
    const t = clamp01(x);
    return t * t * (3 - 2 * t);
  }

  /** 开区间渐入 / 闭区间内为 1 */
  function softWindow(t, start, end, edgeIn, edgeOut) {
    if (t < start - edgeIn || t > end + edgeOut) return 0;
    if (t >= start && t <= end) return 1;
    if (t < start) return smoothstep((t - (start - edgeIn)) / Math.max(1e-6, edgeIn));
    return smoothstep((end + edgeOut - t) / Math.max(1e-6, edgeOut));
  }

  function hardWindow(t, start, end) {
    return t >= start && t < end ? 1 : 0;
  }

  function targetsAt(t) {
    // 黑白：不含红组件色段
    const bw =
      Math.max(
        softWindow(t, 15.2, 42, 0.08, 0.12),
        softWindow(t, 85, 96.5, 0.1, 0.1),
        hardWindow(t, 112.8, 115.2),
        t >= 135.8 ? 1 : 0,
      );

    // 仅组件色红（1:08–1:25），不加滤镜
    const red = softWindow(t, 68, 85, 0.12, 0.2);

    // 色散（1:25–1:36.5，与黑白同段）
    const chroma = softWindow(t, 85, 96.5, 0.12, 0.12);

    // 星空：红段关闭；1:52.8–1:55.2 骤关
    let sky = 0;
    if (t >= 42 && t < 68) sky = 1;
    else if (t >= 96.5 && t < 112.8) sky = softWindow(t, 96.5, 112.8, 0.15, 0);
    else if (t >= 115.2) sky = 1;
    sky = clamp01(sky);

    return { bw, red, sky, chroma, snapBw: t >= 112.8 && t < 115.2 };
  }

  function ensureCanvas() {
    const host = backdrop();
    if (!host) return false;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "poisonShowCanvas";
      canvas.className = "poison-show-canvas";
      canvas.setAttribute("aria-hidden", "true");
      host.appendChild(canvas);
      ctx = canvas.getContext("2d");
    } else if (!host.contains(canvas)) {
      host.appendChild(canvas);
    }
    resize();
    return !!ctx;
  }

  function resize() {
    if (!canvas) return;
    const host = backdrop() || document.getElementById("app");
    const w = Math.max(1, Math.floor(host?.clientWidth || window.innerWidth));
    const h = Math.max(1, Math.floor(host?.clientHeight || window.innerHeight));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      seedStars(w, h);
    }
  }

  function seedStars(w, h) {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1.2, 4.5),
        glow: rand(6, 18),
        phase: rand(0, Math.PI * 2),
        speed: rand(1.4, 4.2),
        bright: rand(0.55, 1),
      });
    }
  }

  function spawnMeteor(w, h) {
    // 统一：右上 → 左下
    const x = rand(w * 0.42, w + 90);
    const y = rand(-60, h * 0.28);
    const speed = rand(640, 1200);
    const ang = rand(Math.PI * 0.62, Math.PI * 0.9);
    return {
      x,
      y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      life: rand(0.7, 1.45),
      age: 0,
      len: rand(160, 320),
      w: rand(3.5, 8),
      glow: rand(14, 28),
    };
  }

  function pickFwColor() {
    // 前若干为蓝青系，更高权重
    const roll = Math.random();
    if (roll < 0.72) return FW_COLORS[Math.floor(Math.random() * FW_BLUE_WEIGHT)];
    return FW_COLORS[FW_BLUE_WEIGHT + Math.floor(Math.random() * (FW_COLORS.length - FW_BLUE_WEIGHT))];
  }

  function spawnBurst(w, h) {
    const cx = rand(w * 0.1, w * 0.9);
    const cy = rand(h * 0.06, h * 0.58);
    const n = 110 + Math.floor(Math.random() * 70);
    const scale = Math.min(w, h) * rand(0.22, 0.42);
    const streaks = [];
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + rand(-0.04, 0.04);
      streaks.push({
        ang,
        maxR: scale * rand(0.5, 1.2),
        life: rand(0.75, 1.45),
        age: 0,
        w: rand(0.7, 2.0),
        glow: rand(2.5, 7),
        color: pickFwColor(),
        tipSpark: Math.random() < 0.22,
        curl: rand(-0.22, 0.22),
      });
    }
    return { cx, cy, flash: 1, streaks };
  }

  function setFilterVars(bw, chroma) {
    document.body.style.setProperty("--poison-bw", bw.toFixed(3));
    document.body.classList.toggle("poison-bw-on", bw > 0.01);
    document.body.classList.toggle("poison-chroma-on", chroma > 0.01);
  }

  function clearFilterVars() {
    document.body.style.removeProperty("--poison-bw");
    document.body.style.removeProperty("--poison-red");
    document.body.classList.remove("poison-bw-on", "poison-bw-red", "poison-chroma-on");
    displayBw = 0;
    displayRed = 0;
    displayChroma = 0;
    setChromaDx(0);
  }

  function ensureChromaOffsets() {
    if (!redOffset) redOffset = document.getElementById("fxChromaRed");
    if (!blueOffset) blueOffset = document.getElementById("fxChromaBlue");
    return !!(redOffset && blueOffset);
  }

  function setChromaDx(dx) {
    if (!ensureChromaOffsets()) return;
    const v = Math.round(dx * 100) / 100;
    redOffset.setAttribute("dx", String(-v));
    blueOffset.setAttribute("dx", String(v));
  }

  function resetSkySpawn(t) {
    nextMeteorAt = t;
    nextBurstAt = t;
    meteors = [];
    bursts = [];
  }

  function applyBloodComponent() {
    if (componentOverridden) return;
    const root = document.documentElement;
    savedComponent = {
      hex: root.style.getPropertyValue("--component-color").trim() ||
        getComputedStyle(root).getPropertyValue("--component-color").trim(),
      rgb: root.style.getPropertyValue("--component-color-rgb").trim() ||
        getComputedStyle(root).getPropertyValue("--component-color-rgb").trim(),
    };
    root.style.setProperty("--component-color", RED_HEX);
    root.style.setProperty("--component-color-rgb", RED_RGB);
    componentOverridden = true;
  }

  function restoreComponent() {
    if (!componentOverridden) return;
    const root = document.documentElement;
    if (savedComponent?.hex) root.style.setProperty("--component-color", savedComponent.hex);
    if (savedComponent?.rgb) root.style.setProperty("--component-color-rgb", savedComponent.rgb);
    savedComponent = null;
    componentOverridden = false;
  }

  function rgba(c, a) {
    return `rgba(${c.r},${c.g},${c.b},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  }

  function drawGlowDot(x, y, r, glow, alpha, color) {
    const c = color || SKY_BLUE;
    const core = color ? { r: Math.min(255, c.r + 80), g: Math.min(255, c.g + 80), b: Math.min(255, c.b + 80) } : SKY_CORE;
    const g = ctx.createRadialGradient(x, y, 0, x, y, glow);
    g.addColorStop(0, rgba(core, alpha));
    g.addColorStop(0.3, rgba(c, alpha * 0.7));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glow, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = rgba(core, Math.min(1, alpha * 1.1));
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSpark(x, y, size, alpha, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = rgba(color || SKY_CORE, alpha);
    ctx.lineWidth = Math.max(0.8, size * 0.18);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.strokeStyle = rgba(SKY_CORE, alpha * 0.85);
    ctx.lineWidth = Math.max(0.5, size * 0.1);
    const d = size * 0.55;
    ctx.beginPath();
    ctx.moveTo(-d, -d);
    ctx.lineTo(d, d);
    ctx.moveTo(d, -d);
    ctx.lineTo(-d, d);
    ctx.stroke();
    ctx.restore();
  }

  function drawStreamer(cx, cy, s, fade, expand) {
    const ang = s.ang + s.curl * (1 - fade) * 0.6;
    const rOuter = s.maxR * expand;
    const rInner = rOuter * 0.06;
    const cos = Math.cos(ang);
    const sin = Math.sin(ang);
    const x1 = cx + cos * rInner;
    const y1 = cy + sin * rInner;
    const x2 = cx + cos * rOuter;
    const y2 = cy + sin * rOuter;
    const tip = {
      r: Math.min(255, s.color.r + 90),
      g: Math.min(255, s.color.g + 90),
      b: Math.min(255, s.color.b + 90),
    };

    // 外层辉光带
    const fog = ctx.createLinearGradient(x1, y1, x2, y2);
    fog.addColorStop(0, rgba(s.color, 0));
    fog.addColorStop(0.35, rgba(s.color, 0.35 * fade));
    fog.addColorStop(0.85, rgba(s.color, 0.7 * fade));
    fog.addColorStop(1, rgba(tip, 0.15 * fade));
    ctx.strokeStyle = fog;
    ctx.lineWidth = s.glow;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 流线核心（白芯 → 彩色）
    const core = ctx.createLinearGradient(x1, y1, x2, y2);
    core.addColorStop(0, rgba(SKY_CORE, 0));
    core.addColorStop(0.25, rgba(s.color, 0.55 * fade));
    core.addColorStop(0.7, rgba(s.color, 0.95 * fade));
    core.addColorStop(1, rgba(tip, fade));
    ctx.strokeStyle = core;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (s.tipSpark && expand > 0.45) {
      drawSpark(x2, y2, 4 + s.w * 2.2, fade * 0.9, tip);
    } else {
      drawGlowDot(x2, y2, s.w * 0.6, s.glow * 0.85, fade * 0.85, s.color);
    }
  }

  function drawSky(dt, sky, nowSec) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (sky < 0.01) {
      meteors = [];
      bursts = [];
      return;
    }

    ctx.save();
    ctx.globalAlpha = sky;
    ctx.globalCompositeOperation = "lighter";

    // 星点（光晕）
    for (const s of stars) {
      const tw = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(s.phase + nowSec * s.speed));
      drawGlowDot(s.x, s.y, s.r, s.glow * (0.75 + tw * 0.5), s.bright * tw);
    }

    // 流星
    while (meteors.length < MAX_METEORS && nowSec >= nextMeteorAt) {
      meteors.push(spawnMeteor(w, h));
      nextMeteorAt = nowSec + rand(0.08, 0.35);
    }
    meteors = meteors.filter((m) => {
      m.age += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.age >= m.life || m.x < -120 || m.x > w + 120 || m.y > h + 120) return false;
      const fade = 1 - m.age / m.life;
      const dx = m.vx;
      const dy = m.vy;
      const hyp = Math.hypot(dx, dy) || 1;
      const tx = (dx / hyp) * m.len;
      const ty = (dy / hyp) * m.len;
      const x0 = m.x - tx;
      const y0 = m.y - ty;

      const fog = ctx.createLinearGradient(x0, y0, m.x, m.y);
      fog.addColorStop(0, rgba(SKY_GLOW, 0));
      fog.addColorStop(0.45, rgba(SKY_BLUE, 0.35 * fade));
      fog.addColorStop(1, rgba(SKY_CORE, 0.85 * fade));
      ctx.strokeStyle = fog;
      ctx.lineWidth = m.glow;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      const core = ctx.createLinearGradient(x0, y0, m.x, m.y);
      core.addColorStop(0, rgba(SKY_BLUE, 0));
      core.addColorStop(0.55, rgba(SKY_BLUE, 0.75 * fade));
      core.addColorStop(1, rgba(SKY_CORE, fade));
      ctx.strokeStyle = core;
      ctx.lineWidth = m.w;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      drawGlowDot(m.x, m.y, m.w * 0.7, m.glow * 0.9, fade);
      return true;
    });

    // 流线型五彩烟花（蓝为主）
    while (bursts.length < MAX_BURSTS && nowSec >= nextBurstAt) {
      bursts.push(spawnBurst(w, h));
      if (Math.random() < 0.4) bursts.push(spawnBurst(w, h));
      nextBurstAt = nowSec + rand(0.35, 0.9);
    }
    bursts = bursts.filter((b) => {
      if (b.flash > 0) {
        const flashR = 50 + (1 - b.flash) * 120;
        const g = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, flashR);
        g.addColorStop(0, rgba(SKY_CORE, 0.95 * b.flash));
        g.addColorStop(0.3, rgba(SKY_BLUE, 0.55 * b.flash));
        g.addColorStop(1, rgba(SKY_GLOW, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, flashR, 0, Math.PI * 2);
        ctx.fill();
        b.flash = Math.max(0, b.flash - dt * 2.4);
      }

      let alive = b.flash > 0.02;
      for (const s of b.streaks) {
        s.age += dt;
        if (s.age >= s.life) continue;
        alive = true;
        const u = s.age / s.life;
        const expand = Math.min(1, Math.pow(u * 1.65, 0.72));
        const fade = u < 0.3 ? 1 : Math.max(0, 1 - (u - 0.3) / 0.7);
        drawStreamer(b.cx, b.cy, s, fade, expand);
      }
      return alive;
    });

    ctx.restore();
  }

  function tick(ts) {
    if (!active) {
      raf = 0;
      return;
    }
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;

    const video = getVideo();
    const t = Number.isFinite(video?.currentTime) ? video.currentTime : 0;
    const paused = !video || video.paused || video.ended;
    const target = targetsAt(t);

    const seeked = Number.isFinite(lastMediaTime) && Math.abs(t - lastMediaTime) > 0.45;
    lastMediaTime = t;
    if (seeked) {
      displayBw = target.bw;
      displayRed = target.red;
      displaySky = target.sky;
      displayChroma = target.chroma;
      resetSkySpawn(t);
      skyLive = target.sky > 0.01;
    }

    // 突变段硬切；其余略平滑
    if (target.snapBw) {
      displayBw = target.bw;
      displaySky = 0;
      displayChroma = 0;
    } else if (!seeked) {
      const a = 1 - Math.exp(-dt / 0.08);
      displayBw += (target.bw - displayBw) * a;
      displaySky += (target.sky - displaySky) * a;
      displayChroma += (target.chroma - displayChroma) * a;
    }
    if (!seeked) {
      const ar = 1 - Math.exp(-dt / 0.12);
      displayRed += (target.red - displayRed) * ar;
    }
    if (displayBw < 0.01) displayBw = 0;
    if (displayRed < 0.01) displayRed = 0;
    if (displaySky < 0.01) displaySky = 0;
    if (displayChroma < 0.01) displayChroma = 0;

    const skyOn = target.sky > 0.01;
    if (skyOn && !skyLive) {
      resetSkySpawn(t);
      displaySky = Math.max(displaySky, target.sky);
    }
    skyLive = skyOn;

    setFilterVars(displayBw, displayChroma);
    setChromaDx(CHROMA_MAX_DX * displayChroma);
    if (displayRed > 0.05) applyBloodComponent();
    else restoreComponent();

    resize();
    if (!paused || displaySky > 0.01) {
      drawSky(paused ? 0 : dt, displaySky, t);
    } else if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (active) return;
    if (!ensureCanvas()) return;
    active = true;
    document.body.classList.add("poison-show-active");
    lastTs = 0;
    lastMediaTime = NaN;
    skyLive = false;
    displayBw = 0;
    displayRed = 0;
    displaySky = 0;
    displayChroma = 0;
    meteors = [];
    bursts = [];
    nextMeteorAt = 0;
    nextBurstAt = 0.6;

    const video = getVideo();
    if (video && Number.isFinite(video.currentTime)) {
      const target = targetsAt(video.currentTime);
      displayBw = target.bw;
      displayRed = target.red;
      displaySky = target.sky;
      displayChroma = target.chroma;
      skyLive = target.sky > 0.01;
      lastMediaTime = video.currentTime;
      resetSkySpawn(video.currentTime);
      setFilterVars(displayBw, displayChroma);
      setChromaDx(CHROMA_MAX_DX * displayChroma);
      if (displayRed > 0.05) applyBloodComponent();
    }

    if (!resizeObs && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver(() => resize());
      const host = backdrop();
      if (host) resizeObs.observe(host);
    }
    window.addEventListener("resize", resize);

    if (!raf) raf = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    document.body.classList.remove("poison-show-active");
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTs = 0;
    window.removeEventListener("resize", resize);
    clearFilterVars();
    restoreComponent();
    meteors = [];
    bursts = [];
    if (canvas) {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.remove();
    }
    canvas = null;
    ctx = null;
  }

  function destroy() {
    stop();
    resizeObs?.disconnect?.();
    resizeObs = null;
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "poisonShow");
  }

  window.EffectHub?.registerOverlay({
    exportAs: "PoisonFx",
    resolveSong,
    sync(v) {
      if (resolveSong(v)) start();
      else stop();
    },
    destroy,
  });
})();
