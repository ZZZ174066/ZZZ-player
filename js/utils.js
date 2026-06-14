/**
 * 共享工具
 */
(function () {
  function getVideoSearchText(v) {
    return `${v?.title || ""}\u0000${v?.fileName || ""}\u0000${v?.relPath || ""}`;
  }

  function matchVideo(v, keywords, { lower } = {}) {
    if (!v || !keywords?.length) return false;
    const text = getVideoSearchText(v);
    const haystack = lower ? text.toLowerCase() : text;
    return keywords.some((kw) => {
      const needle = lower ? kw.toLowerCase() : kw;
      return haystack.includes(needle);
    });
  }

  function loadImageWithCandidates(img, urls, onReady) {
    let i = 0;
    const tryNext = () => {
      if (i >= urls.length) {
        onReady?.();
        return;
      }
      const url = urls[i++];
      img.onerror = () => tryNext();
      img.onload = () => {
        img.onerror = null;
        onReady?.();
      };
      img.src = url;
    };
    tryNext();
  }

  function preloadImages(urls) {
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }

  function parseHexColor(hex, fallback) {
    const s = String(hex || "").trim();
    const m = s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!m) return fallback;
    return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
  }

  function normalizeHexColor(val) {
    const s = String(val ?? "").trim();
    if (/^#[0-9a-f]{6}$/i.test(s)) return s.toLowerCase();
    if (/^[0-9a-f]{6}$/i.test(s)) return `#${s.toLowerCase()}`;
    return null;
  }

  function createImg(src, className) {
    const img = document.createElement("img");
    img.src = src;
    img.className = className;
    img.alt = "";
    img.decoding = "async";
    img.draggable = false;
    return img;
  }

  function bindVideoEvents(video, events, handler) {
    if (!video) return;
    events.forEach((ev) => video.addEventListener(ev, handler));
    return () => events.forEach((ev) => video.removeEventListener(ev, handler));
  }

  function bindPointerSlider(el, { onMove, onKeydown } = {}) {
    if (!el) return;
    const release = (e) => {
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      onMove?.(e);
    });
    el.addEventListener("pointermove", (e) => {
      if (!el.hasPointerCapture(e.pointerId)) return;
      onMove?.(e);
    });
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
    if (onKeydown) el.addEventListener("keydown", onKeydown);
  }

  window.AppUtils = {
    getVideoSearchText,
    matchVideo,
    preloadImages,
    loadImageWithCandidates,
    parseHexColor,
    rgbToHex,
    normalizeHexColor,
    createImg,
    bindVideoEvents,
    bindPointerSlider,
  };
})();
