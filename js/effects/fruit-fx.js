/**
 * 角色T：底部行进水果图（顺序轮播 + 同频底轴摇晃）
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const DIR = "角色T";
  const FRUIT_NAMES = [
    "梨",
    "榴莲",
    "樱桃",
    "橘子",
    "苹果",
    "草莓",
    "菠萝",
    "葡萄",
    "西瓜",
    "香蕉",
  ];
  const SRCS = () => FRUIT_NAMES.map((n) => `${FX()}${DIR}/${n}.png`);

  let nextFruit = 0;

  const api = BottomMarch.create({
    exportAs: "FruitFx",
    overlayId: "fruitMarch",
    layerId: "fruitMarchLayer",
    layerClass: "fruit-march-layer",
    itemClass: "fruit-march-item",
    bodyClass: "fruit-march-active",
    pickSrc: () => {
      const list = SRCS();
      const src = list[nextFruit % list.length];
      nextFruit += 1;
      return src;
    },
    speed: 52,
    spawnInterval: 4.0,
    bottomNudge: -22,
    sway: { amp: 5.5, speed: 6.2 },
    onStart() {
      nextFruit = 0;
      window.AppUtils?.preloadImages?.(SRCS());
    },
  });

  window.EffectHub?.registerOverlay(api);
})();
