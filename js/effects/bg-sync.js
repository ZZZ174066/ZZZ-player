/**
 * 背景替换特效：按曲目注册表挂载/卸载 BgEffect
 */
(function () {
  let activeFx = null;
  let activeId = "";

  function resolveBgSong(v) {
    if (!v || !window.SongRegistry || !window.EffectBase?.BgEffect) return null;
    return SongRegistry.findSong(
      v,
      (s) => Array.isArray(s.bg) && s.bg.length > 0,
    );
  }

  function sync(v) {
    const song = resolveBgSong(v);
    const nextId = song?.id || "";
    if (nextId === activeId && (!nextId || activeFx)) return;

    if (activeFx) {
      activeFx.unmount();
      activeFx = null;
    }
    activeId = nextId;
    if (!song) return;

    const fx = new EffectBase.BgEffect({
      id: song.id,
      imgId: `${song.id}Bg`,
      bgCandidates: song.bg,
    });
    activeFx = fx;
    fx.mount({ activeEffectId: song.id });
  }

  window.BgSync = { sync, resolveBgSong };
})();
