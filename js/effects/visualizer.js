/**
 * 频谱可视化特效（canvas + DOM 叠加）
 */
(function () {
  const FX = SongRegistry.FX;
  const { preloadImages, createImg } = AppUtils;

  let mode = "bars";
  let ecgState = null;
  let unoBound = false;
  let heroState = null;

  const UNO = {
    back: `${FX}みむかｩわナイストライ（Nice Try）/UNO牌背.png`,
    faces: [
      "+8.png", "+2-绿色.png", "+2-绿色.png", "+2-黄色.png", "+2-黄色.png",
      "+2-蓝色.png", "+2-蓝色.png", "+2-红色.png", "+2-红色.png",
      "+4.png", "+4.png", "+4.png", "+4.png",
    ].map((n) => `${FX}みむかｩわナイストライ（Nice Try）/${n}`),
    flipSec: 7,
  };

  const HERO = {
    frames: ["站立帧.png", "半蹲帧.png", "下蹲帧.png", "半蹲帧.png"].map(
      (n) => `${FX}超主人公/${n}`,
    ),
    stepMs: 75,
    minDelay: 700,
    maxDelay: 3200,
    count: 8,
  };

  const ANALYSER_SMOOTH = { ecg: 0.28, default: 0.7 };

  function hooks() {
    return SpecialHooks.get();
  }

  function ensureEcgState(width) {
    if (!ecgState || ecgState.width !== width) {
      ecgState = { width, points: new Float32Array(width), timeRead: 0, lastBass: 0, qrsBoost: 0 };
      ecgState.points.fill(0.5);
    }
    return ecgState;
  }

  function ecgMetrics(freqData, timeData) {
    const len = freqData.length;
    const bassEnd = Math.max(4, Math.floor(len * 0.08));
    const midEnd = Math.max(bassEnd + 1, Math.floor(len * 0.45));
    let bass = 0, mid = 0;
    for (let i = 0; i < len; i++) {
      const v = freqData[i] / 255;
      if (i < bassEnd) bass += v;
      else if (i < midEnd) mid += v;
    }
    bass /= bassEnd;
    mid /= midEnd - bassEnd;
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

  function paintEcg(ctx, rgb, w, h, state) {
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
      const y = topPad + (1 - state.points[x]) * traceH;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.lineWidth = 2.25;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();
    const dotY = topPad + (1 - state.points[w - 1]) * traceH;
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(w - 2, dotY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawEcg(ctx, canvas, rgb, freqData, timeData) {
    const w = canvas.width;
    const h = canvas.height;
    if (w < 2 || !timeData?.length) return;
    const state = ensureEcgState(w);
    const m = ecgMetrics(freqData, timeData);
    const energy = Math.min(1, m.rms * 1.15 + m.bass * 0.35 + m.mid * 0.2);
    const amplitude = 0.18 + energy * 0.62;
    const scrollSteps = 1 + Math.min(4, Math.floor(energy * 5));
    const bassJump = m.bass - state.lastBass;
    state.lastBass = m.bass * 0.65 + state.lastBass * 0.35;
    for (let step = 0; step < scrollSteps; step++) {
      state.points.copyWithin(0, 1);
      state.timeRead = (state.timeRead + 1) % timeData.length;
      let yNorm = 0.5 - ((timeData[state.timeRead] - 128) / 128) * amplitude;
      if (state.qrsBoost > 0) {
        yNorm -= Math.sin((state.qrsBoost / 6) * Math.PI) * 0.28 * (state.qrsBoost / 6);
        state.qrsBoost--;
      } else if (m.bass > 0.48 && bassJump > 0.12) {
        state.qrsBoost = 6;
      }
      state.points[w - 1] = Math.max(0.04, Math.min(0.96, yNorm));
    }
    ctx.clearRect(0, 0, w, h);
    const split = window.SplitColor?.getVisualizerSplitState?.(canvas) || { active: false };
    if (!split.active) {
      paintEcg(ctx, rgb, w, h, state);
      return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, split.splitX, h);
    ctx.clip();
    paintEcg(ctx, split.rgbLeft, w, h, state);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(split.splitX, 0, w - split.splitX, h);
    ctx.clip();
    paintEcg(ctx, split.rgbRight, w, h, state);
    ctx.restore();
  }

  function unoCards() {
    return document.querySelectorAll(".uno-visualizer-deck .uno-card");
  }

  function resetUnoCards() {
    unoCards().forEach((c) => {
      c.classList.remove("is-flipped");
      c.setAttribute("aria-hidden", "true");
    });
  }

  function syncUno(time) {
    const count = Math.min(
      UNO.faces.length,
      Math.max(0, Math.floor(Math.max(0, time) / UNO.flipSec)),
    );
    unoCards().forEach((card, i) => {
      card.classList.toggle("is-flipped", i < count);
      card.setAttribute("aria-hidden", i < count ? "false" : "true");
    });
  }

  function onUnoTime() {
    if (!document.querySelector(".player-visualizer.is-uno-mode")) return;
    const v = hooks()?.getVideo?.();
    if (v) syncUno(v.currentTime);
  }

  function stopUnoSync() {
    if (!unoBound) return;
    const v = hooks()?.getVideo?.();
    v?.removeEventListener("timeupdate", onUnoTime);
    v?.removeEventListener("seeked", onUnoTime);
    unoBound = false;
  }

  function startUnoSync() {
    stopUnoSync();
    resetUnoCards();
    const v = hooks()?.getVideo?.();
    if (!v) return;
    unoBound = true;
    v.addEventListener("timeupdate", onUnoTime);
    v.addEventListener("seeked", onUnoTime);
    syncUno(v.currentTime);
  }

  function destroyUno() {
    stopUnoSync();
    document.querySelector(".player-visualizer")?.querySelector(".uno-visualizer-deck")?.remove();
  }

  function ensureUno() {
    const wrap = document.querySelector(".player-visualizer");
    if (!wrap) return;
    if (!wrap.querySelector(".uno-visualizer-deck")) {
      preloadImages([UNO.back, ...UNO.faces]);
      const deck = document.createElement("div");
      deck.className = "uno-visualizer-deck";
      deck.setAttribute("role", "group");
      deck.setAttribute("aria-label", "UNO 卡牌可视化");
      for (let i = 0; i < UNO.faces.length; i++) {
        const card = document.createElement("div");
        card.className = "uno-card";
        card.dataset.index = String(i);
        card.setAttribute("role", "img");
        card.setAttribute("aria-label", `UNO 牌 ${i + 1}`);
        card.setAttribute("aria-hidden", "true");
        const inner = document.createElement("div");
        inner.className = "uno-card-inner";
        const back = document.createElement("div");
        back.className = "uno-card-face uno-card-face--back";
        back.appendChild(createImg(UNO.back, ""));
        const front = document.createElement("div");
        front.className = "uno-card-face uno-card-face--front";
        front.appendChild(createImg(UNO.faces[i], ""));
        inner.append(back, front);
        card.append(inner);
        deck.append(card);
      }
      wrap.appendChild(deck);
    }
    startUnoSync();
  }

  function heroSprites() {
    return document.querySelectorAll(".hero-visualizer-row .hero-sprite");
  }

  function heroDelay() {
    return HERO.minDelay + Math.random() * (HERO.maxDelay - HERO.minDelay);
  }

  function resetHero() {
    if (!heroState?.sprites) return;
    const now = performance.now();
    heroSprites().forEach((sp, i) => {
      const st = heroState.sprites[i];
      if (!st) return;
      st.frameIndex = 0;
      st.animating = false;
      st.nextSquatAtMs = now + heroDelay();
      const img = sp.querySelector("img");
      if (img) img.src = HERO.frames[0];
    });
  }

  function destroyHero() {
    heroState = null;
    document.querySelector(".player-visualizer")?.querySelector(".hero-visualizer-row")?.remove();
  }

  function ensureHero() {
    const wrap = document.querySelector(".player-visualizer");
    if (!wrap) return;
    preloadImages(HERO.frames);
    let row = wrap.querySelector(".hero-visualizer-row");
    if (row && row.querySelectorAll(".hero-sprite").length !== HERO.count) {
      row.remove();
      row = null;
    }
    if (!row) {
      row = document.createElement("div");
      row.className = "hero-visualizer-row";
      row.setAttribute("aria-hidden", "true");
      for (let i = 0; i < HERO.count; i++) {
        const sp = document.createElement("div");
        sp.className = "hero-sprite";
        sp.appendChild(createImg(HERO.frames[0], ""));
        row.appendChild(sp);
      }
      wrap.appendChild(row);
    }
    const now = performance.now();
    heroState = {
      sprites: Array.from({ length: HERO.count }, (_, i) => ({
        frameIndex: 0,
        animating: false,
        lastFrameAdvanceMs: 0,
        nextSquatAtMs: now + heroDelay() + (i / HERO.count) * 900,
      })),
    };
    resetHero();
  }

  function updateHero() {
    if (!document.querySelector(".player-visualizer.is-hero-mode")) return;
    if (!heroState) ensureHero();
    const v = hooks()?.getVideo?.();
    if (!v || v.paused || v.ended) {
      resetHero();
      return;
    }
    const now = performance.now();
    heroSprites().forEach((sp, i) => {
      const st = heroState.sprites[i];
      if (!st) return;
      const img = sp.querySelector("img");
      if (st.animating) {
        if (now - st.lastFrameAdvanceMs < HERO.stepMs) return;
        if (st.frameIndex >= HERO.frames.length - 1) {
          st.frameIndex = 0;
          st.animating = false;
          if (img) img.src = HERO.frames[0];
          st.nextSquatAtMs = now + heroDelay();
        } else {
          st.frameIndex++;
          if (img) img.src = HERO.frames[st.frameIndex];
        }
        st.lastFrameAdvanceMs = now;
        return;
      }
      if (st.frameIndex !== 0 && img) img.src = HERO.frames[0];
      st.frameIndex = 0;
      if (now >= st.nextSquatAtMs) {
        st.animating = true;
        st.frameIndex = 1;
        if (img) img.src = HERO.frames[1];
        st.lastFrameAdvanceMs = now;
      }
    });
  }

  function setModeClasses(next) {
    const wrap = document.querySelector(".player-visualizer");
    if (!wrap) return;
    wrap.classList.toggle("is-ecg-mode", next === "ecg");
    wrap.classList.toggle("is-uno-mode", next === "uno");
    wrap.classList.toggle("is-hero-mode", next === "hero");
  }

  function applyDomMode(next) {
    if (next === "uno") {
      destroyHero();
      ensureUno();
    } else if (next === "hero") {
      destroyUno();
      ensureHero();
    } else {
      destroyUno();
      destroyHero();
    }
  }

  window.VisualizerEffects = {
    getMode: () => mode,

    sync(v, opts = {}) {
      const { analyser, resizeVisualizerCanvas } = opts;
      const next = SongRegistry.resolveVisualizerMode(v);
      const changed = mode !== next;
      if (changed) {
        mode = next;
        ecgState = null;
      }
      if (analyser) {
        analyser.smoothingTimeConstant = ANALYSER_SMOOTH[next] ?? ANALYSER_SMOOTH.default;
      }
      setModeClasses(next);
      applyDomMode(next);
      if (changed && resizeVisualizerCanvas) requestAnimationFrame(resizeVisualizerCanvas);
    },

    drawEcg,
    updateUno() {
      const v = hooks()?.getVideo?.();
      if (v) syncUno(v.currentTime);
    },
    updateHero,
    resetEcgOnResize: () => {
      ecgState = null;
    },
    resetUnoOnResize: resetUnoCards,
    resetHeroOnResize: () => {
      destroyHero();
      if (document.querySelector(".player-visualizer.is-hero-mode")) ensureHero();
    },
  };
})();
