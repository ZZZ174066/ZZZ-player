/**
 * 覆写：播放器左下 1.png、右下 2.png，持续卡片翻转
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const DIR = "覆写";
  const assets = () => {
    const base = `${FX()}${DIR}/`;
    return {
      left: `${base}1.png`,
      right: `${base}2.png`,
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
    preloadImages?.([a.left, a.right]);

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "overwriteCornerFx";
      wrap.className = "overwrite-corner-fx";
      wrap.setAttribute("aria-hidden", "true");
      wrap.append(
        createImg(a.left, "overwrite-player-fx overwrite-player-fx--left"),
        createImg(a.right, "overwrite-player-fx overwrite-player-fx--right"),
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
    document.body.classList.add("overwrite-active");
  }

  function stop() {
    active = false;
    document.body.classList.remove("overwrite-active");
    wrap?.remove();
    wrap = null;
  }

  function resolveSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => s.overlay === "overwrite");
  }

  window.EffectHub?.registerOverlay({
    exportAs: "OverwriteFx",
    resolveSong,
    sync(v) {
      if (resolveSong(v)) start();
      else stop();
    },
    destroy: stop,
  });
})();
