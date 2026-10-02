/**
 * 超主人公：音律下蹲小人行
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const FRAMES = () =>
    ["站立帧.png", "半蹲帧.png", "下蹲帧.png", "半蹲帧.png"].map(
      (n) => `${FX()}超主人公/${n}`,
    );

  const STEP_MS = 75;
  const MIN_DELAY = 700;
  const MAX_DELAY = 3200;
  const COUNT = 8;

  let rowEl = null;
  let spriteState = null;

  function getWrap() {
    return document.getElementById("playerZoneViz") || document.querySelector(".player-zone-viz");
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  function delay() {
    return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
  }

  function sprites() {
    return rowEl ? rowEl.querySelectorAll(".hero-sprite") : [];
  }

  function resetSprites() {
    if (!spriteState) return;
    const now = performance.now();
    const frames = FRAMES();
    sprites().forEach((sp, i) => {
      const st = spriteState[i];
      if (!st) return;
      st.frameIndex = 0;
      st.animating = false;
      st.nextSquatAtMs = now + delay();
      const img = sp.querySelector("img");
      if (img) img.src = frames[0];
    });
  }

  function destroy() {
    spriteState = null;
    rowEl?.remove();
    rowEl = null;
    document.body.classList.remove("viz-hero-active");
  }

  function ensure() {
    const wrap = getWrap();
    if (!wrap) return;
    const { preloadImages, createImg } = window.AppUtils || {};
    if (!createImg) return;

    document.body.classList.add("viz-hero-active");
    const frames = FRAMES();
    preloadImages?.(frames);

    if (!rowEl || !wrap.contains(rowEl) || rowEl.querySelectorAll(".hero-sprite").length !== COUNT) {
      rowEl?.remove();
      const row = document.createElement("div");
      row.className = "hero-visualizer-row";
      row.setAttribute("aria-hidden", "true");
      for (let i = 0; i < COUNT; i++) {
        const sp = document.createElement("div");
        sp.className = "hero-sprite";
        sp.appendChild(createImg(frames[0], ""));
        row.appendChild(sp);
      }
      wrap.appendChild(row);
      rowEl = row;
    }

    const now = performance.now();
    spriteState = Array.from({ length: COUNT }, (_, i) => ({
      frameIndex: 0,
      animating: false,
      lastFrameAdvanceMs: 0,
      nextSquatAtMs: now + delay() + (i / COUNT) * 900,
    }));
    resetSprites();
  }

  function setActive(on) {
    if (on) ensure();
    else destroy();
  }

  function update() {
    if (!document.body.classList.contains("viz-hero-active")) return;
    if (!spriteState) ensure();
    const v = getVideo();
    if (!v || v.paused || v.ended) {
      resetSprites();
      return;
    }
    const now = performance.now();
    const frames = FRAMES();
    sprites().forEach((sp, i) => {
      const st = spriteState[i];
      if (!st) return;
      const img = sp.querySelector("img");
      if (st.animating) {
        if (now - st.lastFrameAdvanceMs < STEP_MS) return;
        if (st.frameIndex >= frames.length - 1) {
          st.frameIndex = 0;
          st.animating = false;
          if (img) img.src = frames[0];
          st.nextSquatAtMs = now + delay();
        } else {
          st.frameIndex++;
          if (img) img.src = frames[st.frameIndex];
        }
        st.lastFrameAdvanceMs = now;
        return;
      }
      if (st.frameIndex !== 0 && img) img.src = frames[0];
      st.frameIndex = 0;
      if (now >= st.nextSquatAtMs) {
        st.animating = true;
        st.frameIndex = 1;
        if (img) img.src = frames[1];
        st.lastFrameAdvanceMs = now;
      }
    });
  }

  window.HeroViz = { setActive, update, destroy, reset: resetSprites };
})();
