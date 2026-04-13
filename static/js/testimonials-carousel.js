(() => {
  function initCarousel(root) {
    const track = root.querySelector("[data-carousel-track]");
    const slides = Array.from(root.querySelectorAll("[data-carousel-slide]"));
    const prevButton = root.querySelector("[data-carousel-prev]");
    const nextButton = root.querySelector("[data-carousel-next]");
    if (!track || slides.length === 0) return;

    function getNearestSlideIndex() {
      const left = track.scrollLeft;
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      slides.forEach((slide, i) => {
        const distance = Math.abs(slide.offsetLeft - left);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      });
      return bestIndex;
    }

    function scrollToIndex(index) {
      const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
      track.scrollTo({ left: slides[safeIndex].offsetLeft, behavior: "smooth" });
    }

    function updateButtons() {
      if (!prevButton && !nextButton) return;
      const atStart = track.scrollLeft <= 1;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

      if (prevButton) prevButton.disabled = atStart;
      if (nextButton) nextButton.disabled = atEnd;
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        const i = getNearestSlideIndex();
        scrollToIndex(i - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        const i = getNearestSlideIndex();
        scrollToIndex(i + 1);
      });
    }

    track.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    updateButtons();
  }

  function initAll() {
    const carousels = Array.from(document.querySelectorAll("[data-carousel='testimonials']"));
    carousels.forEach(initCarousel);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll, { once: true });
  } else {
    initAll();
  }
})();

