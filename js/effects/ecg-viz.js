/**
 * 次元通信：心电图频谱
 */
(function () {
  let state = null;

  function reset() {
    state = null;
  }

  function ensure(width) {
    if (!state || state.width !== width) {
      state = {
        width,
        points: new Float32Array(width),
        timeRead: 0,
        lastBass: 0,
        qrsBoost: 0,
      };
      state.points.fill(0.5);
    }
    return state;
  }

  function metrics(freqData, timeData) {
    const len = freqData?.length || 0;
    const bassEnd = Math.max(4, Math.floor(len * 0.08));
    const midEnd = Math.max(bassEnd + 1, Math.floor(len * 0.45));
    let bass = 0;
    let mid = 0;
    for (let i = 0; i < len; i++) {
      const v = (freqData[i] || 0) / 255;
      if (i < bassEnd) bass += v;
      else if (i < midEnd) mid += v;
    }
    if (len) {
      bass /= bassEnd;
      mid /= Math.max(1, midEnd - bassEnd);
    }
    let rms = 0;
    if (timeData?.length) {
      let sumSq = 0;
      for (let i = 0; i < timeData.length; i++) {
        const d = (timeData[i] - 128) / 128;
        sumSq += d * d;
      }
      rms = Math.sqrt(sumSq / timeData.length);
    }
    return { bass, mid, rms };
  }

  function paint(ctx, rgb, w, h, st) {
    const { r, g, b } = rgb;
    const stepX = w / Math.max(1, Math.round(w / Math.max(24, Math.floor(w / 10))));
    const stepY = h / Math.max(1, Math.round(h / Math.max(16, Math.floor(h / 5))));
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
    ctx.lineWidth = 2;
    for (let x = 0; x <= w; x += stepX) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += stepY) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    const midY = h * 0.5;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.22)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    const topPad = h * 0.1;
    const traceH = h * 0.8;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = topPad + (1 - st.points[x]) * traceH;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = 2.25;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    const dotY = topPad + (1 - st.points[w - 1]) * traceH;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(w - 2, dotY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function draw(ctx, canvas, freqData, timeData, rgb) {
    const w = canvas.width;
    const h = canvas.height;
    if (w < 2 || !timeData?.length) {
      ctx.clearRect(0, 0, w, h);
      return;
    }
    const st = ensure(w);
    const m = metrics(freqData, timeData);
    const energy = Math.min(1, m.rms * 1.15 + m.bass * 0.35 + m.mid * 0.2);
    const amplitude = 0.18 + energy * 0.62;
    const scrollSteps = 1 + Math.min(4, Math.floor(energy * 5));
    const bassJump = m.bass - st.lastBass;
    st.lastBass = m.bass * 0.65 + st.lastBass * 0.35;

    for (let step = 0; step < scrollSteps; step++) {
      st.points.copyWithin(0, 1);
      st.timeRead = (st.timeRead + 1) % timeData.length;
      let yNorm = 0.5 - ((timeData[st.timeRead] - 128) / 128) * amplitude;
      if (st.qrsBoost > 0) {
        yNorm -= Math.sin((st.qrsBoost / 6) * Math.PI) * 0.28 * (st.qrsBoost / 6);
        st.qrsBoost--;
      } else if (m.bass > 0.48 && bassJump > 0.12) {
        st.qrsBoost = 6;
      }
      st.points[w - 1] = Math.max(0.04, Math.min(0.96, yNorm));
    }

    ctx.clearRect(0, 0, w, h);
    paint(ctx, rgb, w, h, st);
  }

  window.EcgViz = { draw, reset };
})();
