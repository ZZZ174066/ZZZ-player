/**
 * 特效基类：背景图、进度条滑块
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
      return document.getElementById("progressWrap") || document.getElementById("playerProgressWrap");
    }

    getTrack() {
      return document.getElementById("progressTrack") || document.getElementById("playerProgressTrack");
    }

    getThumbEl() {
      return document.querySelector(`.${this.thumbClass}`);
    }

    ensureThumb() {
      const host = this.getTrack() || this.getWrap();
      if (!host || this.getThumbEl()) return;
      host.appendChild(createImg(this.src, this.thumbClass));
    }

    removeThumb() {
      this.getThumbEl()?.remove();
    }

    clearThumbVar() {
      const wrap = this.getWrap();
      const track = this.getTrack();
      wrap?.style.removeProperty("--progress-fx-thumb");
      track?.style.removeProperty("--progress-fx-thumb");
    }

    syncLayout() {
      const wrap = this.getWrap();
      const track = this.getTrack();
      if (!wrap?.classList.contains(this.wrapClass)) return;
      const px = `${this.thumbPx}px`;
      // 仅放大特效图，不改 --progress-thumb，避免进度条布局跳动
      wrap.style.setProperty("--progress-fx-thumb", px);
      track?.style.setProperty("--progress-fx-thumb", px);
      const el = this.getThumbEl();
      if (el) {
        el.style.width = px;
        el.style.maxWidth = px;
        // 迪斯科为正方形；不对称性保持等比，高度由 CSS max-height 限制
        if (this.thumbClass === "asymmetry-progress-thumb") {
          el.style.height = "auto";
          el.style.maxHeight = `calc(${px} * 0.72)`;
        } else {
          el.style.height = px;
          el.style.maxHeight = px;
        }
      }
    }

    setActive(on) {
      const wrap = this.getWrap();
      this.active = on;
      document.body.classList.toggle(this.bodyClass, on);
      wrap?.classList.toggle(this.wrapClass, on);
      if (on) {
        this.ensureThumb();
        this.syncLayout();
        window.addEventListener("resize", this.onResize);
      } else {
        this.removeThumb();
        this.clearThumbVar();
        window.removeEventListener("resize", this.onResize);
      }
    }
  }

  window.EffectBase = {
    SPECIAL_BG_FADE_MS,
    SPECIAL_SONG_BG_BODY_CLASS,
    SPECIAL_SONG_BG_IMG_CLASS,
    BgEffect,
    ProgressThumbEffect,
  };
})();
