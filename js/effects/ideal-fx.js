/**
 * 理想・形象：背景下固定数量飘动的白色爱心、黑色小爱心、白色加号（不出界）
 */
(function () {
  const MAX = 36;
  const KINDS = [
    { id: "heartWhite", weight: 3 },
    { id: "heartBlack", weight: 4 },
    { id: "plusWhite", weight: 5 },
  ];
  /** 与喜爱等级同一路径（viewBox 0 0 24 24） */
  const HEART_D =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
  const HEART_PATH = typeof Path2D !== "undefined" ? new Path2D(HEART_D) : null;

  let active = false;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let lastTs = 0;
  let particles = [];
  let resizeObs = null;

  function backdrop() {
    return document.getElementById("appThemeBackdrop");
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pickKind() {
    const total = KINDS.reduce((s, k) => s + k.weight, 0);
    let r = Math.random() * total;
    for (const k of KINDS) {
      r -= k.weight;
      if (r <= 0) return k.id;
    }
    return "plusWhite";
  }

  function ensureCanvas() {
    const host = backdrop();
    if (!host) return false;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "idealFloatCanvas";
      canvas.className = "ideal-float-canvas";
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
    }
  }

  function padFor(p) {
    return p.size * 0.72;
  }

  function clampInside(p, w, h) {
    const pad = padFor(p);
    const minX = pad;
    const maxX = Math.max(pad, w - pad);
    const minY = pad;
    const maxY = Math.max(pad, h - pad);
    if (p.x < minX) {
      p.x = minX;
      p.vx = Math.abs(p.vx);
    } else if (p.x > maxX) {
      p.x = maxX;
      p.vx = -Math.abs(p.vx);
    }
    if (p.y < minY) {
      p.y = minY;
      p.vy = Math.abs(p.vy);
    } else if (p.y > maxY) {
      p.y = maxY;
      p.vy = -Math.abs(p.vy);
    }
  }

  function spawnParticle(w, h) {
    const kind = pickKind();
    const m = Math.min(w, h);
    let size;
    if (kind === "heartWhite") size = m * 0.05;
    else if (kind === "heartBlack") size = m * 0.026;
    else size = m * 0.04;

    const pad = size * 0.72;
    const x = rand(pad, Math.max(pad, w - pad));
    const y = rand(pad, Math.max(pad, h - pad));
    const speed = rand(90, 170);
    const ang = rand(0, Math.PI * 2);
    return {
      kind,
      x,
      y,
      size,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.28, 0.28),
      wobble: rand(0, Math.PI * 2),
      wobbleSp: rand(0.5, 1.4),
    };
  }

  function seed(w, h) {
    particles = [];
    for (let i = 0; i < MAX; i++) particles.push(spawnParticle(w, h));
  }

  /** 喜爱等级同款心形 */
  function drawHeart(g, size) {
    const s = size / 24;
    g.save();
    g.scale(s, s);
    g.translate(-12, -12);
    if (HEART_PATH) g.fill(HEART_PATH);
    else {
      g.beginPath();
      // Path2D 不可用时的简略回退
      g.moveTo(12, 21.35);
      g.bezierCurveTo(5.4, 15.36, 2, 12.28, 2, 8.5);
      g.bezierCurveTo(2, 5.42, 4.42, 3, 7.5, 3);
      g.bezierCurveTo(9.24, 3, 10.91, 3.81, 12, 5.09);
      g.bezierCurveTo(13.09, 3.81, 14.76, 3, 16.5, 3);
      g.bezierCurveTo(19.58, 3, 22, 5.42, 22, 8.5);
      g.bezierCurveTo(22, 12.28, 18.6, 15.36, 12, 21.35);
      g.closePath();
      g.fill();
    }
    g.restore();
  }

  /** 加号：细长 */
  function drawPlus(g, size) {
    const arm = size * 0.5;
    const t = size * 0.14;
    g.beginPath();
    g.rect(-t, -arm, t * 2, arm * 2);
    g.rect(-arm, -t, arm * 2, t * 2);
    g.fill();
  }

  function tick(ts) {
    if (!active) {
      raf = 0;
      return;
    }
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    resize();
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.wobble += dt * p.wobbleSp;
      const wobX = Math.sin(p.wobble) * 40;
      const wobY = Math.cos(p.wobble * 0.85) * 32;
      p.x += (p.vx + wobX) * dt;
      p.y += (p.vy + wobY) * dt;
      p.rot += p.vr * dt;
      clampInside(p, w, h);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.kind === "heartWhite") {
        ctx.fillStyle = "#ffffff";
        drawHeart(ctx, p.size);
      } else if (p.kind === "heartBlack") {
        ctx.fillStyle = "#0a0a0a";
        drawHeart(ctx, p.size);
      } else {
        ctx.fillStyle = "#ffffff";
        drawPlus(ctx, p.size);
      }
      ctx.restore();
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (active) return;
    if (!ensureCanvas()) return;
    active = true;
    document.body.classList.add("ideal-float-active");
    lastTs = 0;
    resize();
    seed(canvas.width, canvas.height);

    if (!resizeObs && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver(() => {
        resize();
        const w = canvas.width;
        const h = canvas.height;
        for (const p of particles) clampInside(p, w, h);
      });
      const host = backdrop();
      if (host) resizeObs.observe(host);
    }
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    document.body.classList.remove("ideal-float-active");
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    particles = [];
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.removeEventListener("resize", resize);
  }

  function destroy() {
    stop();
    resizeObs?.disconnect?.();
    resizeObs = null;
    canvas?.remove();
    canvas = null;
    ctx = null;
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "idealFloat");
  }

  function sync(v) {
    if (resolveSong(v)) start();
    else stop();
  }

  window.EffectHub?.registerOverlay({
    exportAs: "IdealFx",
    resolveSong,
    sync,
    destroy,
  });
})();
