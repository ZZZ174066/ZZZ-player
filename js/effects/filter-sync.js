/**
 * 全局滤镜特效
 * - chroma（奇境）：色散起伏，可在时段内强制关闭
 * - neonDesat（霓虹）：指定时段去色 + 高斯模糊（视频区除外）
 * - bwDesat（即刻轮回等）：指定时段纯黑白，无模糊（视频区除外）
 * - voyeur（视奸）：持续扭曲 + 色散（视频区除外）
 */
(function () {
  const BODY_CLASS = {
    chroma: "wonderland-chroma-active",
    neonDesat: "neon-desat-active",
    bwDesat: "neon-desat-active",
    voyeur: "voyeur-distort-active",
  };

  /** 色散：完整周期（秒）——更长、更缓 */
  const CHROMA_PERIOD_SEC = 11.5;
  const CHROMA_MAX_DX = 4.5;
  const CHROMA_SMOOTH_TAU_SEC = 0.72;
  const MUTE_EDGE_SEC = 1.2;
  const SMOOTH_TAU_SEC = 0.28;

  /** 视奸：持续色散 + 扭曲（始终保持可见强度，仅轻微蠕动） */
  const VOYEUR_CHROMA_DX = 4.8;
  const VOYEUR_CHROMA_WOBBLE = 0.7;
  const VOYEUR_DISP_BASE = 11;
  const VOYEUR_DISP_AMP = 2.2;

  /** 霓虹：窗口边缘淡入淡出、峰值模糊 */
  const WINDOW_EDGE_SEC = 0.85;
  const NEON_MAX_BLUR_PX = 1;
  /** 纯黑白：更快切段，适配开场短闪 */
  const BW_EDGE_SEC = 0.05;
  const BW_SMOOTH_TAU_SEC = 0.04;

  let activeId = "";
  let activeSong = null;
  let raf = 0;
  let lastTs = 0;
  let displayDx = 0;
  let displayNeon = 0;
  let redOffset = null;
  let blueOffset = null;
  let voyeurNoise = null;
  let voyeurDisp = null;

  function resolveFilterSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => !!s.filter);
  }

  function ensureOffsets() {
    if (!redOffset) redOffset = document.getElementById("fxChromaRed");
    if (!blueOffset) blueOffset = document.getElementById("fxChromaBlue");
    return !!(redOffset && blueOffset);
  }

  function ensureVoyeur() {
    if (!voyeurNoise) voyeurNoise = document.getElementById("fxVoyeurNoise");
    if (!voyeurDisp) voyeurDisp = document.getElementById("fxVoyeurDisp");
    return !!(voyeurNoise && voyeurDisp);
  }

  function setChromaDx(dx) {
    if (!ensureOffsets()) return;
    const v = Math.round(dx * 100) / 100;
    redOffset.setAttribute("dx", String(-v));
    blueOffset.setAttribute("dx", String(v));
  }

  function setVoyeurWarp(timeSec) {
    if (!ensureVoyeur()) return;
    // 噪声场持续漂移，幅度始终够高，不会回到「正常」
    const fx = timeSec * 0.55;
    const fy = timeSec * 0.72 + 1.7;
    const bx = 0.014 + Math.sin(fx) * 0.003;
    const by = 0.017 + Math.sin(fy) * 0.0035;
    voyeurNoise.setAttribute("baseFrequency", `${bx.toFixed(4)} ${by.toFixed(4)}`);
    const scale =
      VOYEUR_DISP_BASE +
      Math.sin(timeSec * 0.62) * VOYEUR_DISP_AMP +
      Math.sin(timeSec * 0.28 + 2.1) * (VOYEUR_DISP_AMP * 0.4);
    voyeurDisp.setAttribute("scale", Math.max(VOYEUR_DISP_BASE - VOYEUR_DISP_AMP, scale).toFixed(2));
  }

  function resetVoyeurWarp() {
    if (!ensureVoyeur()) return;
    voyeurNoise.setAttribute("baseFrequency", "0.014 0.018");
    voyeurDisp.setAttribute("scale", "0");
  }

  function setNeonIntensity(intensity, blurMaxPx) {
    const t = Math.min(1, Math.max(0, intensity));
    const blurMax = Number.isFinite(blurMaxPx) ? blurMaxPx : NEON_MAX_BLUR_PX;
    document.body.style.setProperty("--neon-gray", t.toFixed(3));
    document.body.style.setProperty("--neon-blur", `${(t * blurMax).toFixed(2)}px`);
    document.body.classList.toggle("neon-desat-on", t > 0.01);
  }

  function clearNeonVars() {
    document.body.style.removeProperty("--neon-gray");
    document.body.style.removeProperty("--neon-blur");
    document.body.classList.remove("neon-desat-on");
    displayNeon = 0;
  }

  function smoothstep(x) {
    const t = Math.min(1, Math.max(0, x));
    return t * t * (3 - 2 * t);
  }

  /** 静默段内为 0；边缘淡入淡出 */
  function muteFactor(timeSec, ranges) {
    if (!ranges?.length) return 1;
    let factor = 1;
    for (const r of ranges) {
      const start = Number(r.start);
      const end = Number(r.end);
      if (!(end > start)) continue;
      if (timeSec >= start && timeSec <= end) return 0;
      if (timeSec > start - MUTE_EDGE_SEC && timeSec < start) {
        factor = Math.min(factor, smoothstep((start - timeSec) / MUTE_EDGE_SEC));
      } else if (timeSec > end && timeSec < end + MUTE_EDGE_SEC) {
        factor = Math.min(factor, smoothstep((timeSec - end) / MUTE_EDGE_SEC));
      }
    }
    return factor;
  }

  /** 窗口内为 1；外侧为 0；边缘 smoothstep */
  function windowFactor(timeSec, ranges, edgeSec = WINDOW_EDGE_SEC) {
    if (!ranges?.length) return 0;
    const edge = Math.max(0, Number(edgeSec) || 0);
    let factor = 0;
    for (const r of ranges) {
      const start = Number(r.start);
      const end = Number(r.end);
      if (!(end > start)) continue;
      if (timeSec >= start && timeSec <= end) return 1;
      if (edge <= 0) continue;
      if (timeSec > start - edge && timeSec < start) {
        factor = Math.max(factor, smoothstep((timeSec - (start - edge)) / edge));
      } else if (timeSec > end && timeSec < end + edge) {
        factor = Math.max(factor, smoothstep((end + edge - timeSec) / edge));
      }
    }
    return factor;
  }

  function chromaWave(timeSec, period) {
    const phase = (((timeSec % period) + period) % period) / period;
    return (1 - Math.cos(phase * Math.PI * 2)) / 2;
  }

  function chromaTargetIntensity(timeSec, song) {
    return chromaWave(timeSec, CHROMA_PERIOD_SEC) * muteFactor(timeSec, song?.filterMute);
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  function stopAnim() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    lastTs = 0;
    displayDx = 0;
    setChromaDx(0);
    resetVoyeurWarp();
    clearNeonVars();
  }

  function tick(ts) {
    if (!activeId) {
      raf = 0;
      return;
    }
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0.016;
    lastTs = ts;

    const video = getVideo();
    const timeSec = Number.isFinite(video?.currentTime) ? video.currentTime : 0;

    if (activeId === "chroma") {
      const alpha = 1 - Math.exp(-dt / CHROMA_SMOOTH_TAU_SEC);
      const targetDx = CHROMA_MAX_DX * chromaTargetIntensity(timeSec, activeSong);
      displayDx += (targetDx - displayDx) * alpha;
      if (Math.abs(displayDx) < 0.01) displayDx = 0;
      setChromaDx(displayDx);
    } else if (activeId === "voyeur") {
      // 色散持续开启，仅轻微抖动，不会回到无色散
      const mute = muteFactor(timeSec, activeSong?.filterMute);
      const wobble = Math.sin(timeSec * 0.55) * VOYEUR_CHROMA_WOBBLE;
      const targetDx = (VOYEUR_CHROMA_DX + wobble) * mute;
      displayDx += (targetDx - displayDx) * Math.min(1, dt * 6);
      setChromaDx(displayDx);
      setVoyeurWarp(timeSec);
    } else if (activeId === "neonDesat" || activeId === "bwDesat") {
      const isBw = activeId === "bwDesat";
      const tau = isBw ? BW_SMOOTH_TAU_SEC : SMOOTH_TAU_SEC;
      const edge = isBw ? BW_EDGE_SEC : WINDOW_EDGE_SEC;
      const blurMax = isBw ? 0 : NEON_MAX_BLUR_PX;
      const alpha = 1 - Math.exp(-dt / tau);
      const target = windowFactor(timeSec, activeSong?.filterWindows, edge);
      displayNeon += (target - displayNeon) * alpha;
      if (displayNeon < 0.01) displayNeon = 0;
      setNeonIntensity(displayNeon, blurMax);
    }

    raf = requestAnimationFrame(tick);
  }

  function startAnim() {
    if (raf) cancelAnimationFrame(raf);
    lastTs = 0;
    if ((activeId === "chroma" || activeId === "voyeur") && !ensureOffsets()) return;
    if (activeId === "voyeur" && !ensureVoyeur()) return;
    // 纯黑白开场短闪：切入时直接对齐当前窗口，避免短窗口内冲不到峰值
    if (activeId === "bwDesat") {
      const video = getVideo();
      const t = Number.isFinite(video?.currentTime) ? video.currentTime : 0;
      displayNeon = windowFactor(t, activeSong?.filterWindows, BW_EDGE_SEC);
      setNeonIntensity(displayNeon, 0);
    }
    raf = requestAnimationFrame(tick);
  }

  function sync(v) {
    const song = resolveFilterSong(v);
    const nextId = song?.filter || "";
    if (nextId === activeId && song === activeSong) return;

    for (const cls of Object.values(BODY_CLASS)) {
      document.body.classList.remove(cls);
    }
    stopAnim();

    activeId = nextId;
    activeSong = song;
    const cls = BODY_CLASS[nextId];
    if (cls) document.body.classList.add(cls);
    if (nextId) startAnim();
  }

  window.FilterSync = { sync, resolveFilterSong };
})();
