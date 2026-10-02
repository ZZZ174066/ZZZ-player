/**
 * 说的就是你啊！：播放器框左右对称小人
 * 播放：帧1 / 帧2 交替；暂停：帧0
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const DIR = "说的就是你啊！";
  const assets = () => {
    const base = `${FX()}${DIR}/`;
    return {
      frame0: `${base}帧0.png`,
      frame1: `${base}帧1.png`,
      frame2: `${base}帧2.png`,
    };
  };
  const FPS_MS = 1000 / 3;

  let active = false;
  let cornerWrap = null;
  let cornerTimer = null;
  let cornerFrameIndex = 0;
  let cornerAnimState = null;
  let unbindPlayback = null;

  function panelEl() {
    return document.querySelector(".panel-player");
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  function playFrames() {
    const a = assets();
    return [a.frame1, a.frame2];
  }

  function cornerImages() {
    return cornerWrap
      ? [...cornerWrap.querySelectorAll(".about-you-player-fx")]
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
    setCornerSrc(assets().frame0);
  }

  function syncCornerAnimation() {
    if (!active) return;
    const video = getVideo();
    if (!video) return;
    if (video.paused || video.ended) enterCornerPaused();
    else enterCornerPlaying();
  }

  function ensureDom() {
    const panel = panelEl();
    const { createImg, preloadImages } = window.AppUtils || {};
    if (!panel || !createImg) return false;

    const a = assets();
    preloadImages?.([a.frame0, a.frame1, a.frame2]);

    if (!cornerWrap) {
      cornerWrap = document.createElement("div");
      cornerWrap.id = "aboutYouCornerFx";
      cornerWrap.className = "about-you-corner-fx";
      cornerWrap.setAttribute("aria-hidden", "true");
      cornerWrap.append(
        createImg(a.frame0, "about-you-player-fx about-you-player-fx--left"),
        createImg(a.frame0, "about-you-player-fx about-you-player-fx--right"),
      );
      panel.appendChild(cornerWrap);
    } else if (!panel.contains(cornerWrap)) {
      panel.appendChild(cornerWrap);
    }

    cornerWrap.hidden = false;
    return true;
  }

  function destroyDom() {
    stopCornerAnimation();
    unbindPlayback?.();
    unbindPlayback = null;
    cornerFrameIndex = 0;
    cornerAnimState = null;
    cornerWrap?.remove();
    cornerWrap = null;
  }

  function start() {
    if (active) return;
    if (!ensureDom()) return;
    active = true;
    document.body.classList.add("about-you-active");

    const video = getVideo();
    if (video && window.AppUtils?.bindVideoEvents) {
      unbindPlayback = AppUtils.bindVideoEvents(
        video,
        ["play", "pause", "ended"],
        syncCornerAnimation,
      );
    }

    syncCornerAnimation();
  }

  function stop() {
    active = false;
    document.body.classList.remove("about-you-active");
    destroyDom();
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "aboutYou");
  }

  window.EffectHub?.registerOverlay({
    exportAs: "AboutYouFx",
    resolveSong,
    sync(v) {
      if (resolveSong(v)) start();
      else stop();
    },
    destroy: stop,
  });
})();
