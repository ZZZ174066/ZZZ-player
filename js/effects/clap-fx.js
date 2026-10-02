/**
 * 处刑拍手：底部行进拍手 GIF（2:10 前频率减半）
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const SRC = () => `${FX()}处刑拍手/处刑拍手1.gif`;
  const HALF_RATE_UNTIL = 130;

  const api = BottomMarch.create({
    exportAs: "ClapFx",
    overlayId: "clapMarch",
    layerId: "clapMarchLayer",
    layerClass: "clap-march-layer",
    bodyClass: "clap-march-active",
    pickSrc: SRC,
    speed: 52,
    spawnInterval: 2.85,
    bottomNudge: 18,
    getInterval(base) {
      const t = Number(document.getElementById("videoElement")?.currentTime) || 0;
      return t < HALF_RATE_UNTIL ? base * 2 : base;
    },
  });

  window.EffectHub?.registerOverlay(api);
})();
