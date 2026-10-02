/**
 * 恋爱帕拉舞：分段方块频谱（块顶高光，左右对称）
 */
(function () {
  const HALF = 20;
  const SMOOTH = 0.38;
  const FALL = 0.22;

  let heights = new Float32Array(HALF);
  let targets = new Float32Array(HALF);

  function reset() {
    heights.fill(0);
    targets.fill(0);
  }

  function sample(freq) {
    if (window.VizSample) {
      VizSample.fillMirrored(freq, targets);
      return;
    }
    if (!freq?.length) {
      targets.fill(0);
      return;
    }
    const n = freq.length;
    for (let i = 0; i < HALF; i++) {
      const t0 = i / HALF;
      const t1 = (i + 1) / HALF;
      const a = Math.floor(Math.pow(t0, 0.85) * n * 0.5);
      const b = Math.max(a + 1, Math.floor(Math.pow(t1, 0.85) * n * 0.5));
      let sum = 0;
      for (let j = a; j < b && j < n; j++) sum += freq[j];
      const avg = sum / (b - a);
      const boost = 1 + Math.pow(t0, 0.8) * 3.2;
      targets[i] = Math.min(1, Math.pow((avg / 255) * boost, 0.65));
    }
  }

  function smooth() {
    for (let i = 0; i < HALF; i++) {
      const t = targets[i];
      if (t > heights[i]) heights[i] += (t - heights[i]) * SMOOTH;
      else heights[i] += (t - heights[i]) * FALL;
      if (heights[i] < 0.01) heights[i] = 0;
    }
  }

  function lighten(r, g, b, t) {
    return {
      r: Math.min(255, Math.round(r + (255 - r) * t)),
      g: Math.min(255, Math.round(g + (255 - g) * t)),
      b: Math.min(255, Math.round(b + (255 - b) * t)),
    };
  }

  function draw(ctx, canvas, freqData, rgb) {
    const w = canvas.width;
    const h = canvas.height;
    if (w < 2 || h < 2) return;

    sample(freqData);
    smooth();
    ctx.clearRect(0, 0, w, h);

    const midX = w / 2;
    const SKIP = 4;
    const drawCount = HALF - SKIP;
    const barW = w / 2 / drawCount;
    const gapX = Math.max(1, Math.min(2, barW * 0.14));
    const bw = Math.max(2, barW - gapX * 2);

    const gapY = Math.max(2, Math.round(h * 0.028));
    const blockH = Math.max(3, Math.round(h * 0.07));
    const cellH = blockH + gapY;
    const maxBlocks = Math.max(1, Math.floor((h - gapY) / cellH));

    const r0 = rgb?.r ?? 0;
    const g0 = rgb?.g ?? 0;
    const b0 = rgb?.b ?? 0;
    const hi = lighten(r0, g0, b0, 0.62);
    const hiH = Math.max(1, Math.round(blockH * 0.22));
    const fill = `rgb(${r0}, ${g0}, ${b0})`;
    const highlight = `rgb(${hi.r}, ${hi.g}, ${hi.b})`;

    const paintCol = (x0, n) => {
      if (n <= 0) return;
      const x = Math.round(x0 + gapX);
      const width = Math.round(bw);
      for (let k = 0; k < n; k++) {
        const y = Math.round(h - gapY - (k + 1) * cellH + gapY);
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, width, blockH);
        ctx.fillStyle = highlight;
        ctx.fillRect(x, y, width, hiH);
      }
    };

    for (let j = 0; j < drawCount; j++) {
      const i = j + SKIP;
      const n = Math.round(heights[i] * maxBlocks);
      paintCol(midX - (j + 1) * barW, n);
      paintCol(midX + j * barW, n);
    }
  }

  reset();
  window.BlocksViz = { draw, reset };
})();
