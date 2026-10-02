/**
 * 关系少女：背景边缘穿入的圆角直角箭头
 */
(function () {
  const COLORS = ["#ffffff", "#00d68f", "#2f9bff", "#ffd400", "#ff3b3b"];
  const MAX_ARROWS = 16;
  const SPAWN_MIN = 0.28;
  const SPAWN_MAX = 0.85;

  let active = false;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let lastTs = 0;
  let spawnAcc = 0;
  let nextSpawn = 1;
  let arrows = [];
  let resizeObs = null;

  function backdrop() {
    return document.getElementById("appThemeBackdrop");
  }

  function ensureCanvas() {
    const host = backdrop();
    if (!host) return false;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "relationArrowCanvas";
      canvas.className = "relation-arrow-canvas";
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

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function dist(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.hypot(dx, dy);
  }

  /** 生成带可选圆滑直角弯的折线路径（含离屏起终点） */
  function makePath(w, h, bodyLen) {
    const pad = Math.max(bodyLen * 0.55, Math.min(w, h) * 0.22, 160);
    const edges = ["top", "bottom", "left", "right"];
    const edge = pick(edges);
    let x;
    let y;
    let dir;

    if (edge === "top") {
      x = rand(w * 0.08, w * 0.92);
      y = -pad;
      dir = { x: 0, y: 1 };
    } else if (edge === "bottom") {
      x = rand(w * 0.08, w * 0.92);
      y = h + pad;
      dir = { x: 0, y: -1 };
    } else if (edge === "left") {
      x = -pad;
      y = rand(h * 0.08, h * 0.92);
      dir = { x: 1, y: 0 };
    } else {
      x = w + pad;
      y = rand(h * 0.08, h * 0.92);
      dir = { x: -1, y: 0 };
    }

    const span = Math.min(w, h);
    const firstLen = rand(span * 0.28, span * 0.55);
    const p0 = { x, y };
    const p1 = { x: x + dir.x * firstLen, y: y + dir.y * firstLen };

    const doTurn = Math.random() < 0.72;
    const points = [p0, p1];
    let endDir = { ...dir };

    if (doTurn) {
      const turnLeft = Math.random() < 0.5;
      const nx = turnLeft ? -dir.y : dir.y;
      const ny = turnLeft ? dir.x : -dir.x;
      endDir = { x: nx, y: ny };
      const secondLen = rand(span * 0.35, span * 0.75);
      const p2 = { x: p1.x + nx * secondLen, y: p1.y + ny * secondLen };
      // 终点再多延伸一整段箭身，保证完整穿出后才离开路径
      const exit = pad + bodyLen + rand(40, 120);
      points.push(p2, { x: p2.x + nx * exit, y: p2.y + ny * exit });
    } else {
      const run = firstLen + rand(span * 0.5, span * 0.95);
      points[1] = { x: x + dir.x * run, y: y + dir.y * run };
      const exit = pad + bodyLen + rand(40, 120);
      points.push({
        x: points[1].x + dir.x * exit,
        y: points[1].y + dir.y * exit,
      });
    }

    return { points, endDir, turned: doTurn };
  }

  /** 折线 + 拐点圆角 → 采样点列 */
  function buildSamples(rawPoints, cornerR) {
    const points = rawPoints.map((p) => ({ x: p.x, y: p.y }));
    if (points.length < 2) return [];
    const samples = [];
    const pushLine = (a, b, skipFirst) => {
      const len = dist(a, b);
      const steps = Math.max(2, Math.ceil(len / 6));
      for (let i = skipFirst ? 1 : 0; i <= steps; i++) {
        const t = i / steps;
        samples.push({
          x: a.x + (b.x - a.x) * t,
          y: a.y + (b.y - a.y) * t,
        });
      }
    };

    let cursor = points[0];
    for (let i = 0; i < points.length - 1; i++) {
      const b = points[i + 1];
      const c = points[i + 2];
      if (!c) {
        pushLine(cursor, b, samples.length > 0);
        break;
      }
      const a = cursor;
      const ab = dist(a, b) || 1;
      const bc = dist(b, c) || 1;
      const r = Math.min(cornerR, ab * 0.45, bc * 0.45);
      const ux = (b.x - a.x) / ab;
      const uy = (b.y - a.y) / ab;
      const vx = (c.x - b.x) / bc;
      const vy = (c.y - b.y) / bc;
      const pre = { x: b.x - ux * r, y: b.y - uy * r };
      const post = { x: b.x + vx * r, y: b.y + vy * r };
      pushLine(a, pre, samples.length > 0);
      const steps = Math.max(8, Math.ceil((Math.PI * 0.5 * r) / 6));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const omt = 1 - t;
        samples.push({
          x: omt * omt * pre.x + 2 * omt * t * b.x + t * t * post.x,
          y: omt * omt * pre.y + 2 * omt * t * b.y + t * t * post.y,
        });
      }
      cursor = post;
    }
    return samples;
  }

  function cumLengths(samples) {
    const lens = [0];
    let total = 0;
    for (let i = 1; i < samples.length; i++) {
      total += dist(samples[i - 1], samples[i]);
      lens.push(total);
    }
    return { lens, total };
  }

  function pointAt(samples, lens, total, d) {
    if (!samples.length) return { x: 0, y: 0, tx: 1, ty: 0 };
    // 超出路径两端沿切线外推，整支箭完整穿出后再消失
    if (d < 0) {
      const a = samples[0];
      const b = samples[Math.min(1, samples.length - 1)];
      let tx = b.x - a.x;
      let ty = b.y - a.y;
      const m = Math.hypot(tx, ty) || 1;
      tx /= m;
      ty /= m;
      return { x: a.x + tx * d, y: a.y + ty * d, tx, ty };
    }
    if (d > total) {
      const a = samples[samples.length - 2] || samples[0];
      const b = samples[samples.length - 1];
      let tx = b.x - a.x;
      let ty = b.y - a.y;
      const m = Math.hypot(tx, ty) || 1;
      tx /= m;
      ty /= m;
      const extra = d - total;
      return { x: b.x + tx * extra, y: b.y + ty * extra, tx, ty };
    }
    let i = 1;
    while (i < lens.length && lens[i] < d) i++;
    const i0 = Math.max(1, i);
    const d0 = lens[i0 - 1];
    const d1 = lens[i0] || d0;
    const a = samples[i0 - 1];
    const b = samples[Math.min(samples.length - 1, i0)];
    const t = d1 > d0 ? (d - d0) / (d1 - d0) : 0;
    const x = a.x + (b.x - a.x) * t;
    const y = a.y + (b.y - a.y) * t;
    let tx = b.x - a.x;
    let ty = b.y - a.y;
    const m = Math.hypot(tx, ty) || 1;
    tx /= m;
    ty /= m;
    return { x, y, tx, ty };
  }

  function spawnArrow(w, h) {
    const span = Math.min(w, h);
    // 加长平均 / 最大可见箭身
    const bodyLen = rand(span * 0.48, span * 1.05);
    const { points } = makePath(w, h, bodyLen);
    const cornerR = rand(40, 72);
    const samples = buildSamples(
      points.map((p) => ({ ...p })),
      cornerR
    );
    const { lens, total } = cumLengths(samples);
    if (total < bodyLen + 80) return null;
    return {
      color: pick(COLORS),
      samples,
      lens,
      total,
      bodyLen,
      tip: -bodyLen * 0.08,
      speed: rand(150, 280),
      width: rand(18, 30),
    };
  }

  function outsideView(p, w, h, pad) {
    return p.x < -pad || p.x > w + pad || p.y < -pad || p.y > h + pad;
  }

  function arrowFullyOffscreen(arrow, w, h) {
    const { samples, lens, total, bodyLen, tip, width } = arrow;
    const pad = width * 2 + 40;
    const head = pointAt(samples, lens, total, tip);
    const tail = pointAt(samples, lens, total, tip - bodyLen);
    return outsideView(head, w, h, pad) && outsideView(tail, w, h, pad);
  }

  function drawArrowStroke(g, arrow, tipDist, color, width, alpha, ox, oy) {
    const { samples, lens, total, bodyLen } = arrow;
    ox = ox || 0;
    oy = oy || 0;

    const headLen = width * 1.55;
    const headW = width * 1.15;
    const bodyEnd = tipDist - headLen * 0.85;
    const startD = tipDist - bodyLen;
    if (bodyEnd - startD < 2) return;

    g.save();
    g.globalAlpha = alpha;
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = width;
    // butt：尾端矩形；尖头单独画三角
    g.lineCap = "butt";
    g.lineJoin = "round";

    g.beginPath();
    let started = false;
    const step = 4;
    for (let d = startD; d <= bodyEnd; d += step) {
      const p = pointAt(samples, lens, total, d);
      if (!started) {
        g.moveTo(p.x + ox, p.y + oy);
        started = true;
      } else g.lineTo(p.x + ox, p.y + oy);
    }
    const neck = pointAt(samples, lens, total, bodyEnd);
    g.lineTo(neck.x + ox, neck.y + oy);
    g.stroke();

    // 尾端矩形平切
    const tail = pointAt(samples, lens, total, startD);
    const half = width * 0.5;
    const nx = -tail.ty;
    const ny = tail.tx;
    g.beginPath();
    g.moveTo(tail.x + nx * half + ox, tail.y + ny * half + oy);
    g.lineTo(tail.x - nx * half + ox, tail.y - ny * half + oy);
    g.lineTo(
      tail.x - tail.tx * 1.5 - nx * half + ox,
      tail.y - tail.ty * 1.5 - ny * half + oy
    );
    g.lineTo(
      tail.x - tail.tx * 1.5 + nx * half + ox,
      tail.y - tail.ty * 1.5 + ny * half + oy
    );
    g.closePath();
    g.fill();

    const tipPt = pointAt(samples, lens, total, tipDist);
    const hx = -tipPt.ty;
    const hy = tipPt.tx;
    const baseX = tipPt.x - tipPt.tx * headLen;
    const baseY = tipPt.y - tipPt.ty * headLen;
    g.beginPath();
    g.moveTo(tipPt.x + ox, tipPt.y + oy);
    g.lineTo(baseX + hx * headW + ox, baseY + hy * headW + oy);
    g.lineTo(baseX - hx * headW + ox, baseY - hy * headW + oy);
    g.closePath();
    g.fill();
    g.restore();
  }

  function drawArrow(g, arrow) {
    const { tip, color, width } = arrow;
    drawArrowStroke(g, arrow, tip, "#ff6b4a", width + 1, 0.28, 2.2, -1.2);
    drawArrowStroke(g, arrow, tip, "#3ad0ff", width + 1, 0.26, -2.2, 1.2);
    drawArrowStroke(g, arrow, tip, color, width, 1, 0, 0);
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

    spawnAcc += dt;
    if (spawnAcc >= nextSpawn && arrows.length < MAX_ARROWS) {
      spawnAcc = 0;
      nextSpawn = rand(SPAWN_MIN, SPAWN_MAX);
      const a = spawnArrow(w, h);
      if (a) arrows.push(a);
    }

    for (let i = arrows.length - 1; i >= 0; i--) {
      const a = arrows[i];
      a.tip += a.speed * dt;
      // 至少走过一截后再做离屏判定，避免入场时被误删
      if (a.tip > a.bodyLen * 0.5 && arrowFullyOffscreen(a, w, h)) {
        arrows.splice(i, 1);
      }
    }

    ctx.clearRect(0, 0, w, h);
    for (const a of arrows) drawArrow(ctx, a);

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (active) return;
    if (!ensureCanvas()) return;
    active = true;
    document.body.classList.add("relation-arrows-active");
    arrows = [];
    spawnAcc = 0;
    nextSpawn = 0.35;
    lastTs = 0;
    resize();
    const w = canvas.width;
    const h = canvas.height;
    for (let i = 0; i < 5; i++) {
      const a = spawnArrow(w, h);
      if (!a) continue;
      a.tip = rand(a.bodyLen * 0.2, a.total * 0.45);
      arrows.push(a);
    }
    if (!resizeObs && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver(() => resize());
      const host = backdrop() || document.getElementById("app");
      if (host) resizeObs.observe(host);
    }
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    document.body.classList.remove("relation-arrows-active");
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    arrows = [];
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
    return SongRegistry.findSong(v, (s) => s.overlay === "arrows");
  }

  function sync(v) {
    const song = resolveSong(v);
    if (song) start();
    else stop();
  }

  window.EffectHub?.registerOverlay({
    exportAs: "ArrowFx",
    resolveSong,
    sync,
    destroy,
  });
})();
