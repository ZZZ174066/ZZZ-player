/**
 * 小小的我：播放器左下「大大的我」、右下「小小的我」
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const DIR = "小小的我";
  const assets = () => {
    const base = `${FX()}${DIR}/`;
    return {
      big: `${base}大大的我.gif`,
      small: `${base}小小的我.gif`,
    };
  };

  let active = false;
  let wrap = null;

  function panelEl() {
    return document.querySelector(".panel-player");
  }

  function ensureDom() {
    const panel = panelEl();
    const { createImg, preloadImages } = window.AppUtils || {};
    if (!panel || !createImg) return false;

    const a = assets();
    preloadImages?.([a.big, a.small]);

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "tinyMeCornerFx";
      wrap.className = "tiny-me-corner-fx";
      wrap.setAttribute("aria-hidden", "true");
      wrap.append(
        createImg(a.big, "tiny-me-player-fx tiny-me-player-fx--left"),
        createImg(a.small, "tiny-me-player-fx tiny-me-player-fx--right"),
      );
      panel.appendChild(wrap);
    } else if (!panel.contains(wrap)) {
      panel.appendChild(wrap);
    }
    wrap.hidden = false;
    return true;
  }

  function start() {
    if (active) return;
    if (!ensureDom()) return;
    active = true;
    document.body.classList.add("tiny-me-active");
  }

  function stop() {
    active = false;
    document.body.classList.remove("tiny-me-active");
    wrap?.remove();
    wrap = null;
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "tinyMe");
  }

  window.EffectHub?.registerOverlay({
    exportAs: "TinyMeFx",
    resolveSong,
    sync(v) {
      if (resolveSong(v)) start();
      else stop();
    },
    destroy: stop,
  });
})();
