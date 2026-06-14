/**
 * 特效基类：背景图、进度条滑块、横向滚动层
 */
(function () {
  const { preloadImages, loadImageWithCandidates, createImg } = AppUtils;

  const SPECIAL_BG_FADE_MS = 1200;
  const SPECIAL_SONG_BG_BODY_CLASS = "special-song-bg-active";
  const SPECIAL_SONG_BG_IMG_CLASS = "special-song-bg";

  class BgEffect {
    constructor({ id, imgId, bgCandidates }) {
      this.id = id;
      this.imgId = imgId;
      this.bgCandidates = bgCandidates;
      this.bgEl = null;
      this.hideTimer = null;
      this.hideOnEnd = null;
    }

    cancelHide() {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      if (this.bgEl && this.hideOnEnd) {
        this.bgEl.removeEventListener("transitionend", this.hideOnEnd);
        this.hideOnEnd = null;
      }
      this.bgEl?.classList.remove("is-hiding");
    }

    revealBg() {
      const el = this.bgEl;
      if (!el) return;
      this.cancelHide();
      el.hidden = false;
      void el.offsetWidth;
      el.classList.add("is-visible");
      el.classList.remove("is-hiding");
    }

    concealBg(onDone) {
      const el = this.bgEl;
      if (!el) {
        onDone?.();
        return;
      }
      this.cancelHide();
      if (!el.classList.contains("is-visible")) {
        el.hidden = true;
        onDone?.();
        return;
      }
      el.classList.add("is-hiding");
      el.classList.remove("is-visible");
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        this.hideTimer = null;
        this.hideOnEnd = null;
        el.classList.remove("is-hiding");
        el.hidden = true;
        onDone?.();
      };
      this.hideTimer = setTimeout(finish, SPECIAL_BG_FADE_MS + 50);
      this.hideOnEnd = (e) => {
        if (e.target !== el) return;
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.hideTimer = null;
        el.removeEventListener("transitionend", this.hideOnEnd);
        this.hideOnEnd = null;
        finish();
      };
      el.addEventListener("transitionend", this.hideOnEnd);
    }

    ensureDom(onReady) {
      const backdrop = document.getElementById("appThemeBackdrop");
      if (!backdrop) return;
      if (!this.bgEl) {
        preloadImages(this.bgCandidates);
        const img = document.createElement("img");
        img.id = this.imgId;
        img.className = SPECIAL_SONG_BG_IMG_CLASS;
        img.alt = "";
        img.decoding = "async";
        img.draggable = false;
        img.hidden = true;
        backdrop.insertBefore(img, backdrop.firstChild);
        this.bgEl = img;
      }
      const primary = this.bgCandidates[0];
      const needsLoad =
        !primary ||
        this.bgEl.dataset.loadedSrc !== primary ||
        !this.bgEl.complete ||
        !this.bgEl.naturalWidth;
      if (needsLoad) {
        loadImageWithCandidates(this.bgEl, this.bgCandidates, () => {
          if (primary) this.bgEl.dataset.loadedSrc = primary;
          onReady?.();
        });
      } else {
        onReady?.();
      }
    }

    destroyDom() {
      this.cancelHide();
      this.bgEl?.remove();
      this.bgEl = null;
    }

    mount(ctx) {
      ctx.activeEffectId = this.id;
      document.body.classList.add(SPECIAL_SONG_BG_BODY_CLASS);
      this.ensureDom(() => this.revealBg());
    }

    unmount() {
      document.body.classList.remove(SPECIAL_SONG_BG_BODY_CLASS);
      const el = this.bgEl;
      if (!el) return;
      this.concealBg(() => this.destroyDom());
    }

    tick() {}
  }

  class ProgressThumbEffect {
    constructor({ bodyClass, wrapClass, thumbClass, src, thumbPx }) {
      this.bodyClass = bodyClass;
      this.wrapClass = wrapClass;
      this.thumbClass = thumbClass;
      this.src = src;
      this.thumbPx = thumbPx;
      this.active = false;
      this.onResize = () => this.syncLayout();
    }

    getWrap() {
      return document.getElementById("playerProgressWrap");
    }

    getThumbEl() {
      return document.querySelector(`.${this.thumbClass}`);
    }

    ensureThumb() {
      const wrap = this.getWrap();
      if (!wrap || this.getThumbEl()) return;
      wrap.appendChild(createImg(this.src, this.thumbClass));
    }

    removeThumb() {
      this.getThumbEl()?.remove();
    }

    syncLayout() {
      const wrap = this.getWrap();
      if (!wrap?.classList.contains(this.wrapClass)) return;
      wrap.style.setProperty("--player-progress-thumb", `${this.thumbPx}px`);
    }

    setActive(on) {
      const wrap = this.getWrap();
      this.active = on;
      document.body.classList.toggle(this.bodyClass, on);
      wrap?.classList.toggle(this.wrapClass, on);
      if (on) {
        this.syncLayout();
        this.ensureThumb();
        window.addEventListener("resize", this.onResize);
      } else {
        this.removeThumb();
        window.removeEventListener("resize", this.onResize);
      }
    }
  }

  class HorizontalScrollLayer {
    constructor({
      layerId,
      layerClass,
      itemClass,
      scrollPxS,
      zBase,
      spawnIntervalS,
      getSpawnIntervalSec,
      pickSrc,
      onItemTick,
    }) {
      this.layerId = layerId;
      this.layerClass = layerClass;
      this.itemClass = itemClass;
      this.scrollPxS = scrollPxS;
      this.zBase = zBase;
      this.spawnIntervalS = spawnIntervalS;
      this.getSpawnIntervalSec = getSpawnIntervalSec;
      this.pickSrc = pickSrc;
      this.onItemTick = onItemTick;
      this.layerEl = null;
      this.items = [];
      this.spawnAccum = 0;
      this.spawnCounter = 0;
    }

    ensureLayer() {
      const backdrop = document.getElementById("appThemeBackdrop");
      if (!backdrop || this.layerEl) return;
      const layer = document.createElement("div");
      layer.id = this.layerId;
      layer.className = this.layerClass;
      layer.setAttribute("aria-hidden", "true");
      backdrop.appendChild(layer);
      this.layerEl = layer;
    }

    destroyLayer() {
      this.items.forEach((item) => item.el.remove());
      this.items = [];
      this.spawnAccum = 0;
      this.spawnCounter = 0;
      this.layerEl?.remove();
      this.layerEl = null;
    }

    spawnItem() {
      const layer = this.layerEl;
      if (!layer) return;
      const img = createImg(this.pickSrc(), this.itemClass);
      const order = ++this.spawnCounter;
      img.style.zIndex = String(this.zBase - order);
      img.style.left = `${layer.clientWidth}px`;
      layer.appendChild(img);
      this.items.push({ el: img, x: layer.clientWidth, order, swayPhase: Math.random() * Math.PI * 2 });
    }

    tick(dt, hooks) {
      const layer = this.layerEl;
      const video = hooks?.getVideo?.();
      if (!layer || !video || video.paused || video.ended) return;

      const interval = this.getSpawnIntervalSec?.() ?? this.spawnIntervalS;
      this.spawnAccum += dt;
      while (this.spawnAccum >= interval) {
        this.spawnAccum -= interval;
        this.spawnItem();
      }

      const remove = [];
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        item.x -= this.scrollPxS * dt;
        item.el.style.left = `${item.x}px`;
        this.onItemTick?.(item, dt);
        const w = item.el.offsetWidth || 0;
        if (w > 0 && item.x + w < 0) remove.push(i);
      }
      for (let j = remove.length - 1; j >= 0; j--) {
        const idx = remove[j];
        this.items[idx].el.remove();
        this.items.splice(idx, 1);
      }
    }
  }

  window.EffectBase = {
    SPECIAL_BG_FADE_MS,
    SPECIAL_SONG_BG_BODY_CLASS,
    SPECIAL_SONG_BG_IMG_CLASS,
    BgEffect,
    ProgressThumbEffect,
    HorizontalScrollLayer,
  };
})();
