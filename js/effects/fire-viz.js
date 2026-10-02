/**
 * FOMO 像素火焰频谱
 */
(function () {
  const COLS = 28;
  const BACK = "#9a1212";
  const FRONT = "#ff6b6b";
  const FRONT_HOT = "#ffb4a8";
  const BG_TOP = "#2b0a0a";
  const BG_BOT = "#4a1515";
  const HEIGHT_SCALE = 0.8;

  let heights = new Float32Array(COLS);
  let target = new Float32Array(COLS);
  let jitter = new Float32Array(COLS);
  let particles = [];
  let smokePhase = 0;
  let lastTs = 0;
  let grainCanvas = null;
  let grainTick = 0;

  function reset() {
    heights.fill(0.08);
    target.fill(0.08);
    for (let i = 0; i < COLS; i++) jitter[i] = Math.random();
    particles = [];
    smokePhase = 0;
    lastTs = 0;
  }

  function snap(n, step) {
    return Math.round(n / step) * step;
  }

  function ensureGrain(w, h) {
    if (grainCanvas && grainCanvas.width === w && grainCanvas.height === h) return grainCanvas;
    grainCanvas = document.createElement("canvas");
    grainCanvas.width = w;
    grainCanvas.height = h;
    return grainCanvas;
  }

  function paintGrain(ctx, w, h) {
    grainTick = (grainTick + 1) % 3;
    if (grainTick !== 0 && grainCanvas) {
      ctx.globalAlpha = 0.18;
      ctx.drawImage(grainCanvas, 0, 0);
      ctx.globalAlpha = 1;
      return;
    }
    const g = ensureGrain(w, h);
    const gctx = g.getContext("2d");
    const img = gctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 40;
    }
    gctx.putImageData(img, 0, 0);
    ctx.globalAlpha = 0.22;
    ctx.drawImage(g, 0, 0);
    ctx.globalAlpha = 1;
  }

  function sampleTargets(freqData) {
    const half = Math.ceil(COLS / 2);
    const levels = new Float32Array(half);
    if (window.VizSample) {
      VizSample.fillMirrored(freqData, levels);
    } else if (freqData?.length) {
      const n = freqData.length;
      for (let i = 0; i < half; i++) {
        const t = half <= 1 ? 0 : i / (half - 1);
        const a = Math.floor(n * 0.02 + t * n * 0.5);
        const b = Math.max(a + 1, Math.floor(n * 0.02 + Math.min(1, t + 1 / half) * n * 0.5));
        let peak = 0;
        for (let j = a; j < b && j < n; j++) peak = Math.max(peak, (freqData[j] || 0) / 255);
        levels[i] = Math.pow(Math.max(0, peak - 0.12) / 0.88, 2.35) * 0.92;
      }
    }

    const mid = (COLS - 1) / 2;
    const raw = new Float32Array(COLS);
    for (let i = 0; i < COLS; i++) {
      const dist = mid <= 0 ? 0 : (i - mid) / mid;
      const t = Math.abs(dist);
      const idx = Math.min(half - 1, Math.round(t * (half - 1)));
      const sigma = dist < 0 ? 0.55 : 0.42;
      const envelope = Math.exp(-(dist * dist) / (2 * sigma * sigma));

      // 与常规频谱同一套采样；轻包络保留火焰中心略高
      let v = levels[idx] * (0.82 + 0.28 * envelope);
      const wobble =
        0.03 * Math.sin(smokePhase * 2.8 + i * 1.1 + jitter[i] * 5);
      const asym =
        dist < 0
          ? 0.04 * Math.sin(smokePhase * 1.9 + i * 0.7)
          : 0.035 * Math.sin(smokePhase * 3.1 + i * 1.4 + 1.1);
      raw[i] = Math.min(1, Math.max(0.03, v + wobble + asym));
    }

    // 邻柱对比：制造波谷起伏，避免一整条高原
    for (let i = 0; i < COLS; i++) {
      const prev = raw[i > 0 ? i - 1 : i];
      const next = raw[i < COLS - 1 ? i + 1 : i];
      const valley = Math.min(prev, next);
      const peaked = raw[i] * 0.72 + Math.max(0, raw[i] - valley) * 1.05;
      const edgeKeep = 0.05 + 0.04 * Math.sin(Math.PI * (i / (COLS - 1)));
      target[i] = Math.min(0.92, Math.max(edgeKeep, peaked * 0.95 + edgeKeep * 0.2));
    }
  }

  function smoothHeights(dt) {
    // 更快跟随，起伏更明显
    const k = 1 - Math.exp(-dt * 14);
    for (let i = 0; i < COLS; i++) {
      heights[i] += (target[i] - heights[i]) * k;
    }
  }

  function buildJaggedPath(ctx, w, h, scale, seed) {
    const baseY = h;
    const usable = h * HEIGHT_SCALE;
    const step = w / (COLS - 1);
    const px = Math.max(2, Math.floor(w / 90));

    ctx.beginPath();
    ctx.moveTo(0, baseY);
    let x0 = 0;
    let y0 = baseY - heights[0] * usable * scale;
    ctx.lineTo(0, snap(y0, px));

    for (let i = 0; i < COLS - 1; i++) {
      const x1 = (i + 1) * step;
      const h0 = heights[i] * usable * scale;
      const h1 = heights[i + 1] * usable * scale;
      const yA = baseY - h0;
      const yB = baseY - h1;
      const midX = (x0 + x1) / 2;
      const jag =
        ((i + seed) % 2 === 0 ? 1 : -1) *
        (5 + 12 * Math.max(h0, h1) / usable) *
        (0.55 + 0.45 * Math.sin(smokePhase * 3.4 + i + jitter[i] * 4));
      const midY = (yA + yB) / 2 + jag;
      const peakBoost = Math.max(0, Math.max(h0, h1) - Math.min(h0, h1)) * 0.55;
      const tipY = Math.min(yA, yB) - peakBoost - (3 + 10 * Math.max(h0, h1) / usable);

      ctx.lineTo(snap(midX - step * 0.18, px), snap(yA + (midY - yA) * 0.35, px));
      ctx.lineTo(snap(midX, px), snap(tipY, px));
      ctx.lineTo(snap(midX + step * 0.18, px), snap(yB + (midY - yB) * 0.35, px));
      ctx.lineTo(snap(x1, px), snap(yB, px));
      x0 = x1;
    }
    ctx.lineTo(w, baseY);
    ctx.closePath();
  }

  function spawnParticles(w, h) {
    const usable = h * HEIGHT_SCALE;
    const step = w / (COLS - 1);
    for (let i = 0; i < COLS; i++) {
      if (heights[i] < 0.4) continue;
      if (Math.random() > 0.08 + heights[i] * 0.12) continue;
      const x = i * step + (Math.random() - 0.5) * step * 0.4;
      const y = h - heights[i] * usable * 0.95;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 18,
        vy: -(20 + Math.random() * 40),
        life: 1,
        size: 2 + Math.random() * 3,
        hot: Math.random() > 0.45,
      });
    }
    if (particles.length > 80) particles.splice(0, particles.length - 80);
  }

  function tickParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt * 1.35;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy -= 18 * dt;
      if (p.life <= 0 || p.y < -10) particles.splice(i, 1);
    }
  }

  function drawParticles(ctx) {
    for (const p of particles) {
      const s = Math.max(1, Math.round(p.size * p.life));
      ctx.fillStyle = p.hot ? FRONT_HOT : FRONT;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), s, s);
    }
    ctx.globalAlpha = 1;
  }

  function draw(ctx, canvas, freqData, nowMs) {
    const w = canvas.width;
    const h = canvas.height;
    if (w < 2 || h < 2) return;

    const ts = nowMs || performance.now();
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;
    smokePhase += dt;

    sampleTargets(freqData);
    smoothHeights(dt);
    spawnParticles(w, h);
    tickParticles(dt);

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, BG_TOP);
    bg.addColorStop(1, BG_BOT);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 后层：略高、深红（无描边）
    buildJaggedPath(ctx, w, h, 1.0, 1);
    ctx.fillStyle = BACK;
    ctx.fill();

    // 前层：更矮、亮珊瑚
    buildJaggedPath(ctx, w, h, 0.62, 2);
    const fg = ctx.createLinearGradient(0, h * 0.2, 0, h);
    fg.addColorStop(0, FRONT_HOT);
    fg.addColorStop(0.45, FRONT);
    fg.addColorStop(1, BACK);
    ctx.fillStyle = fg;
    ctx.fill();

    drawParticles(ctx);
    paintGrain(ctx, w, h);
  }

  reset();
  window.FireViz = { draw, reset };
})();
