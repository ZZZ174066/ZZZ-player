/**
 * 进度条滑块替换：按曲目注册表切换 ProgressThumbEffect
 */
(function () {
  let effects = null;

  function ensureEffects() {
    if (effects) return effects;
    if (!window.SongRegistry || !window.EffectBase?.ProgressThumbEffect) {
      effects = [];
      return effects;
    }
    effects = SongRegistry.SONGS.filter((s) => s.progress).map((s) => ({
      id: s.id,
      match: (v) => SongRegistry.matchSong(v, s),
      fx: new EffectBase.ProgressThumbEffect(s.progress),
    }));
    return effects;
  }

  function resolveProgressSong(v) {
    if (!v || !window.SongRegistry) return null;
    return SongRegistry.findSong(v, (s) => !!s.progress);
  }

  function sync(v) {
    const list = ensureEffects();
    for (const { match, fx } of list) {
      fx.setActive(!!v && match(v));
    }
  }

  window.ProgressSync = { sync, resolveProgressSong };
})();
