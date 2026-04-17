(() => {
  "use strict";

  function freezeVideo(video) {
    if (!video) return;
    video.pause();
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    try { video.currentTime = Math.max(0, video.duration - 0.05); } catch (_) {}
  }

  function init() {
    const stack = document.querySelector(".video-hero-stack");
    if (!stack) return;

    const slides = Array.from(stack.querySelectorAll(".swiper-slide"));
    if (!slides.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = slides.map((s) => s.querySelector(".video-section__video"));
    const cards = slides.map((s) => s.querySelector(".video-section__card"));
    const floatingNotice = document.querySelector("[data-home-floating-notice]");
    const cardTimers = slides.map(() => 0);
    const state = slides.map(() => ({ played: false, cardShown: false }));
    const lastSlideIndex = slides.length - 1;
    const edgeGuardDuration = 550;
    const lastSlideReleaseThreshold = 320;
    let swiper = null;
    let guardedEdgeDirection = 0;
    let edgeGuardUntil = 0;
    let floatingNoticeVisible = false;
    let lastSlideReleaseDelta = 0;
    let lastSlideCanRelease = false;
    let nextSlidePrimed = false;

    function now() {
      return window.performance && typeof window.performance.now === "function"
        ? window.performance.now()
        : Date.now();
    }

    function armEdgeGuard(direction) {
      guardedEdgeDirection = direction;
      edgeGuardUntil = now() + edgeGuardDuration;
    }

    function clearEdgeGuard() {
      guardedEdgeDirection = 0;
      edgeGuardUntil = 0;
    }

    function resetLastSlideRelease() {
      lastSlideReleaseDelta = 0;
      lastSlideCanRelease = false;
    }

    function revealFloatingNotice() {
      if (!floatingNotice || floatingNoticeVisible) return;
      floatingNoticeVisible = true;

      window.requestAnimationFrame(() => {
        floatingNotice.classList.add("is-visible");
      });
    }

    function handleWheelEdgeGuard(event) {
      if (!swiper) return;

      const deltaY = event.deltaY || 0;
      const direction = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
      const currentTime = now();

      if (guardedEdgeDirection && currentTime < edgeGuardUntil) {
        const isGuardedDirection = direction === guardedEdgeDirection;
        const isAtBottomEdge = guardedEdgeDirection > 0 && swiper.isEnd;
        const isAtTopEdge = guardedEdgeDirection < 0 && swiper.isBeginning;

        if (isGuardedDirection && (isAtBottomEdge || isAtTopEdge)) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      } else if (guardedEdgeDirection && currentTime >= edgeGuardUntil) {
        clearEdgeGuard();
      }

      if (swiper.activeIndex !== lastSlideIndex || !swiper.isEnd) {
        resetLastSlideRelease();
        return;
      }

      if (direction < 0) {
        resetLastSlideRelease();
        return;
      }

      if (direction <= 0 || lastSlideCanRelease) return;

      lastSlideReleaseDelta += deltaY;

      if (lastSlideReleaseDelta < lastSlideReleaseThreshold) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      lastSlideCanRelease = true;
      event.preventDefault();
      event.stopPropagation();
    }

    // Mute all videos
    videos.forEach((v) => {
      if (!v) return;
      v.muted = true;
      v.playsInline = true;
    });

    if (reducedMotion) {
      cards.forEach((c) => { if (c) c.classList.add("is-visible"); });
      window.setTimeout(revealFloatingNotice, 400);
      return;
    }

    stack.addEventListener("wheel", handleWheelEdgeGuard, { passive: false });

    function clearCardTimer(index) {
      if (!cardTimers[index]) return;
      window.clearTimeout(cardTimers[index]);
      cardTimers[index] = 0;
    }

    function revealCard(index) {
      if (!cards[index] || state[index].cardShown) return;
      clearCardTimer(index);
      cardTimers[index] = window.setTimeout(() => {
        cardTimers[index] = 0;
        state[index].cardShown = true;
        cards[index].classList.add("is-visible");
        if (index === 0) {
          window.setTimeout(revealFloatingNotice, 250);
        }
      }, 1000);
    }

    function resetSection(index) {
      clearCardTimer(index);
      state[index].played = false;
      state[index].cardShown = false;
      if (videos[index]) {
        videos[index].pause();
        try { videos[index].currentTime = 0; } catch (_) {}
      }
      if (cards[index]) cards[index].classList.remove("is-visible");
    }

    function resolveVideoSrc(video) {
      if (!video) return "";
      const mobileSrc = video.dataset.mobileSrc || "";
      const desktopSrc = video.dataset.src || "";
      if (mobileSrc && window.matchMedia("(max-width: 767px)").matches) return mobileSrc;
      return desktopSrc;
    }

    function primeVideo(index, aggressive = false) {
      const video = videos[index];
      if (!video) return null;

      const resolvedSrc = resolveVideoSrc(video);
      if (!resolvedSrc) return video;

      if (aggressive) {
        video.preload = "auto";
      } else if (!video.preload || video.preload === "none") {
        video.preload = "metadata";
      }

      if (video.dataset.loadedSrc !== resolvedSrc) {
        video.src = resolvedSrc;
        video.dataset.loadedSrc = resolvedSrc;
        video.load();
      }

      return video;
    }

    function primeNextSlide(index) {
      const nextIndex = index + 1;
      if (nextIndex >= videos.length) return;
      primeVideo(nextIndex, false);
    }

    // When a video ends -> freeze on last frame, then reveal card
    videos.forEach((video, i) => {
      if (!video) return;
      if (i === 0) {
        video.addEventListener("loadeddata", () => {
          if (nextSlidePrimed) return;
          nextSlidePrimed = true;
          primeNextSlide(0);
        }, { once: true });
      }
      video.addEventListener("ended", () => {
        state[i].played = true;
        freezeVideo(video);
        revealCard(i);
      });
    });

    function activateSlide(index) {
      const activeVideo = primeVideo(index, true);
      if (index !== 0) {
        primeNextSlide(index);
      }

      // Start the new slide's video
      if (activeVideo && !state[index].played) {
        try { activeVideo.currentTime = 0; } catch (_) {}
        activeVideo.play().catch(() => {});
      }

      // Pause all other videos and reset non-active sections
      for (let i = 0; i < slides.length; i++) {
        if (i === index) continue;
        if (videos[i]) videos[i].pause();
        if (state[i].played || state[i].cardShown || cardTimers[i]) {
          resetSection(i);
        }
      }
    }

    // Mobile: unlock video playback
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      document.addEventListener(
        "touchstart",
        () => {
          videos.forEach((v) => {
            if (v && v.dataset.loadedSrc) {
              v.muted = true;
              v.play().then(() => v.pause()).catch(() => {});
            }
          });
        },
        { once: true, passive: true }
      );
    }

    function setup() {
      if (typeof Swiper === "undefined" || typeof EffectExpo === "undefined") {
        activateSlide(0);
        return;
      }

      swiper = new Swiper(stack, {
        direction: "vertical",
        modules: [EffectExpo],
        effect: "expo",
        expoEffect: {
          grayscale: false,
          scale: 1,
          rotate: 0,
        },
        slidesPerView: 1,
        grabCursor: true,
        speed: 400,
        mousewheel: {
          releaseOnEdges: true,
        },
        keyboard: {
          enabled: true,
        },
        on: {
          init() {
            activateSlide(0);
          },
          slideChangeTransitionStart(s) {
            if (s.activeIndex === lastSlideIndex) {
              armEdgeGuard(1);
              resetLastSlideRelease();
            } else if (s.activeIndex === 0) {
              armEdgeGuard(-1);
              resetLastSlideRelease();
            } else {
              clearEdgeGuard();
              resetLastSlideRelease();
            }
          },
          slideChange(s) {
            activateSlide(s.activeIndex);
          },
        },
      });
    }

    primeVideo(0, true);
    setup();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
