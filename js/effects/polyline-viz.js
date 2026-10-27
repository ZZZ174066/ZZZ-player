/**
 * 止损家：折线频谱（左右对称，贴边无空白）
 */
(function () {
  /** 半边点数（含中心）：与常规柱状频谱类似的中心→外侧能量 */
  const HALF = 8;
  const TOTAL = HALF * 2 - 1;
  const SMOOTH = 0.38;

  let half = null;
  let displayHalf = null;

  function reset() {
    half = null;
    displayHalf = null;
  }

  function ensure() {
    if (!half || half.length !== HALF) {
      half = new Float32Array(HALF);
      displayHalf = new Float32Array(HALF);
      displayHalf.fill(0.12);
    }
  }

  function sample(freqData) {
    ensure();
    if (window.VizSample) {
      VizSample.fillMirrored(freqData, half);
      return;
    }
    const n = freqData?.length || 0;
    if (!n) {
      half.fill(0);
      return;
    }
    for (let i = 0; i < HALF; i++) {
      const t = HALF <= 1 ? 0 : i / (HALF - 1);
      const lo = Math.max(2, Math.floor(n * 0.02));
      const hi = Math.max(lo + HALF, Math.floor(n * 0.58));
      const ratio = hi / lo;
      const a = Math.floor(lo * Math.pow(ratio, t));
      const b = Math.max(a + 1, Math.ceil(lo * Math.pow(ratio, Math.min(1, (i + 1) / HALF))));
      let peak = 0;
      let sum = 0;
      for (let j = a; j < b && j < n; j++) {
        const v = (freqData[j] || 0) / 255;
        sum += v;
        if (v > peak) peak = v;
      }
      let v = peak * 0.8 + (sum / Math.max(1, b - a)) * 0.2;
      v = Math.max(0, (v - 0.1) / 0.9);
      half[i] = Math.min(1, Math.pow(v, 1.35));
    }
  }

  /** i: 0..TOTAL-1 → 半边索引（0=中心，HALF-1=最外侧） */
  function halfIndex(i) {
    const mid = HALF - 1;
    return i <= mid ? mid - i : i - mid;
  }

  function draw(ctx, canvas, freqData, rgb) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ensure();
    sample(freqData);

    for (let i = 0; i < HALF; i++) {
      displayHalf[i] += (half[i] - displayHalf[i]) * SMOOTH;
    }

    const { r, g, b } = rgb || { r: 0, g: 0, b: 0 };
    const padTop = h * 0.1;
    const padBot = h * 0.08;
    const usableH = Math.max(1, h - padTop - padBot);
    const span = Math.max(1, TOTAL - 1);

    const cs = getComputedStyle(document.documentElement);
    const ox = parseFloat(cs.getPropertyValue("--ui-shadow-x")) || 5;
    const oy = parseFloat(cs.getPropertyValue("--ui-shadow-y")) || 5;
    const lineW = Math.max(6, Math.min(12, Math.round(Math.min(w, h) * 0.048)));

    function pointAt(i) {
      const x = (w * i) / span;
      const y = padTop + usableH * (1 - displayHalf[halfIndex(i)]);
      return { x, y };
    }

    ctx.save();
    ctx.lineJoin = "miter";
    ctx.miterLimit = 3;
    ctx.lineCap = "butt";
    ctx.lineWidth = lineW;
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.45)`;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = ox;
    ctx.shadowOffsetY = oy;

    ctx.beginPath();
    for (let i = 0; i < TOTAL; i++) {
      const { x, y } = pointAt(i);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.shadowColor = "transparent";
    ctx.beginPath();
    for (let i = 0; i < TOTAL; i++) {
      const { x, y } = pointAt(i);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  window.PolylineViz = { draw, reset };
})();
