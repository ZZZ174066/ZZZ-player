/**
 * Nice Try：UNO 翻牌频谱（随播放时间每 7 秒翻一张）
 */
(function () {
  const FX = () => window.SongRegistry?.FX || "./特效/";
  const DIR = "Nice Try";

  const FLIP_SEC = 7;
  let bound = false;
  let deckEl = null;

  function assets() {
    const base = `${FX()}${DIR}/`;
    return {
      back: `${base}UNO牌背.png`,
      faces: [
        "+8.png",
        "+2-绿色.png",
        "+2-绿色.png",
        "+2-黄色.png",
        "+2-黄色.png",
        "+2-蓝色.png",
        "+2-蓝色.png",
        "+2-红色.png",
        "+2-红色.png",
        "+4.png",
        "+4.png",
        "+4.png",
        "+4.png",
      ].map((n) => `${base}${n}`),
    };
  }

  function getWrap() {
    return document.getElementById("playerZoneViz") || document.querySelector(".player-zone-viz");
  }

  function getVideo() {
    return document.getElementById("videoElement");
  }

  function cards() {
    return deckEl ? deckEl.querySelectorAll(".uno-card") : [];
  }

  function resetCards() {
    cards().forEach((c) => {
      c.classList.remove("is-flipped");
      c.setAttribute("aria-hidden", "true");
    });
  }

  function sync(time) {
    const list = cards();
    const count = Math.min(
      list.length,
      Math.max(0, Math.floor(Math.max(0, time) / FLIP_SEC)),
    );
    list.forEach((card, i) => {
      const on = i < count;
      card.classList.toggle("is-flipped", on);
      card.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  function onTime() {
    if (!document.body.classList.contains("viz-uno-active")) return;
    const v = getVideo();
    if (v) sync(v.currentTime);
  }

  function stopSync() {
    if (!bound) return;
    const v = getVideo();
    v?.removeEventListener("timeupdate", onTime);
    v?.removeEventListener("seeked", onTime);
    bound = false;
  }

  function startSync() {
    stopSync();
    resetCards();
    const v = getVideo();
    if (!v) return;
    bound = true;
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("seeked", onTime);
    sync(v.currentTime || 0);
  }

  function destroy() {
    stopSync();
    deckEl?.remove();
    deckEl = null;
    document.body.classList.remove("viz-uno-active");
  }

  function ensure() {
    const wrap = getWrap();
    if (!wrap) return;
    const { preloadImages, createImg } = window.AppUtils || {};
    if (!createImg) return;

    document.body.classList.add("viz-uno-active");
    const { back, faces } = assets();
    preloadImages?.([back, ...faces]);

    if (!deckEl || !wrap.contains(deckEl)) {
      deckEl?.remove();
      const deck = document.createElement("div");
      deck.className = "uno-visualizer-deck";
      deck.setAttribute("role", "group");
      deck.setAttribute("aria-label", "UNO 卡牌可视化");
      for (let i = 0; i < faces.length; i++) {
        const card = document.createElement("div");
        card.className = "uno-card";
        card.dataset.index = String(i);
        card.setAttribute("role", "img");
        card.setAttribute("aria-label", `UNO 牌 ${i + 1}`);
        card.setAttribute("aria-hidden", "true");
        const inner = document.createElement("div");
        inner.className = "uno-card-inner";
        const backFace = document.createElement("div");
        backFace.className = "uno-card-face uno-card-face--back";
        backFace.appendChild(createImg(back, ""));
        const frontFace = document.createElement("div");
        frontFace.className = "uno-card-face uno-card-face--front";
        frontFace.appendChild(createImg(faces[i], ""));
        inner.append(backFace, frontFace);
        card.append(inner);
        deck.append(card);
      }
      wrap.appendChild(deck);
      deckEl = deck;
    }
    startSync();
  }

  function setActive(on) {
    if (on) ensure();
    else destroy();
  }

  function update() {
    if (!document.body.classList.contains("viz-uno-active")) return;
    const v = getVideo();
    if (v) sync(v.currentTime || 0);
  }

  window.UnoViz = { setActive, update, destroy, reset: resetCards };
})();
