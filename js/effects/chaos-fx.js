/**
 * 混沌布吉：背景旋转圆环 + 左侧播放器框两角对称鼓掌小人
 * 播放：举手/鼓掌交替；暂停：暂停帧
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const DIR = "混沌布吉";
  const assets = () => {
    const base = `${FX()}${DIR}/`;
    return {
      ring: `${base}环.png`,
      handsUp: `${base}举手.png`,
      clap: `${base}鼓掌.png`,
      pause: `${base}暂停.png`,
    };
  };
  const FPS_MS = 1000 / 3;

  let active = false;
  let ringEl = null;
  let cornerWrap = null;
  let cornerTimer = null;
  let cornerFrameIndex = 0;
  let cornerAnimState = null;
  let unbindPlayback = null;
  let resizeObs = null;
  let raf = 0;

  function panelEl() {
    return document.querySelector(".panel-player");
  }

  function backdrop() {
    return document.getElementById("appThemeBackdrop");
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  function playFrames() {
    const a = assets();
    return [a.handsUp, a.clap];
  }

  function cornerImages() {
    return cornerWrap
      ? [...cornerWrap.querySelectorAll(".chaos-boogie-player-fx")]
      : [];
  }

  function setCornerSrc(src) {
    cornerImages().forEach((img) => {
      img.src = src;
    });
  }

  function stopCornerAnimation() {
    if (cornerTimer != null) {
      clearInterval(cornerTimer);
      cornerTimer = null;
    }
  }

  function tickCornerPlayFrame() {
    const frames = playFrames();
    setCornerSrc(frames[cornerFrameIndex]);
    cornerFrameIndex = (cornerFrameIndex + 1) % frames.length;
  }

  function enterCornerPlaying() {
    if (cornerAnimState === "playing" && cornerTimer != null) return;
    cornerAnimState = "playing";
    stopCornerAnimation();
    tickCornerPlayFrame();
    cornerTimer = setInterval(tickCornerPlayFrame, FPS_MS);
  }

  function enterCornerPaused() {
    if (cornerAnimState === "paused") return;
    cornerAnimState = "paused";
    stopCornerAnimation();
    setCornerSrc(assets().pause);
  }

  function syncCornerAnimation() {
    if (!active) return;
    const video = getVideo();
    if (!video) return;
    if (video.paused || video.ended) enterCornerPaused();
    else enterCornerPlaying();
  }

  function syncRingPosition() {
    const panel = panelEl();
    const host = backdrop();
    if (!ringEl || !panel || !host) return;
    const pr = panel.getBoundingClientRect();
    const br = host.getBoundingClientRect();
    // 垂直偏移由 CSS --chaos-boogie-ring-offset-y 处理（支持 vh）
    ringEl.style.left = `${pr.left + pr.width / 2 - br.left}px`;
    ringEl.style.top = `${pr.top + pr.height / 2 - br.top}px`;
  }

  function ensureDom() {
    const panel = panelEl();
    const host = backdrop();
    const { createImg, preloadImages } = window.AppUtils || {};
    if (!panel || !host || !createImg) return false;

    const a = assets();
    preloadImages?.([a.ring, a.handsUp, a.clap, a.pause]);

    if (!ringEl) {
      ringEl = createImg(a.ring, "chaos-boogie-bg-ring");
      ringEl.id = "chaosBoogieRing";
      ringEl.setAttribute("aria-hidden", "true");
      host.appendChild(ringEl);
    } else if (!host.contains(ringEl)) {
      host.appendChild(ringEl);
    }

    if (!cornerWrap) {
      cornerWrap = document.createElement("div");
      cornerWrap.id = "chaosBoogieCornerFx";
      cornerWrap.className = "chaos-boogie-corner-fx";
      cornerWrap.setAttribute("aria-hidden", "true");
      cornerWrap.append(
        createImg(a.pause, "chaos-boogie-player-fx chaos-boogie-player-fx--left"),
        createImg(a.pause, "chaos-boogie-player-fx chaos-boogie-player-fx--right"),
      );
      panel.appendChild(cornerWrap);
    } else if (!panel.contains(cornerWrap)) {
      panel.appendChild(cornerWrap);
    }

    ringEl.hidden = false;
    cornerWrap.hidden = false;
    return true;
  }

  function destroyDom() {
    stopCornerAnimation();
    unbindPlayback?.();
    unbindPlayback = null;
    cornerFrameIndex = 0;
    cornerAnimState = null;
    ringEl?.remove();
    cornerWrap?.remove();
    ringEl = null;
    cornerWrap = null;
  }

  function tickLayout() {
    if (!active) {
      raf = 0;
      return;
    }
    syncRingPosition();
    raf = requestAnimationFrame(tickLayout);
  }

  function start() {
    if (active) return;
    if (!ensureDom()) return;
    active = true;
    document.body.classList.add("chaos-boogie-active");

    const video = getVideo();
    if (video && window.AppUtils?.bindVideoEvents) {
      unbindPlayback = AppUtils.bindVideoEvents(
        video,
        ["play", "pause", "ended"],
        syncCornerAnimation,
      );
    }

    if (!resizeObs && typeof ResizeObserver !== "undefined") {
      resizeObs = new ResizeObserver(() => syncRingPosition());
      const panel = panelEl();
      const host = backdrop();
      if (panel) resizeObs.observe(panel);
      if (host) resizeObs.observe(host);
    }
    window.addEventListener("resize", syncRingPosition);

    syncRingPosition();
    syncCornerAnimation();
    if (!raf) raf = requestAnimationFrame(tickLayout);
  }

  function stop() {
    active = false;
    document.body.classList.remove("chaos-boogie-active");
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener("resize", syncRingPosition);
    destroyDom();
  }

  function destroy() {
    stop();
    resizeObs?.disconnect?.();
    resizeObs = null;
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "chaosBoogie");
  }

  function sync(v) {
    if (resolveSong(v)) start();
    else stop();
  }

  window.EffectHub?.registerOverlay({
    exportAs: "ChaosFx",
    resolveSong,
    sync,
    destroy,
  });
})();
