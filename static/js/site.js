(() => {
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function initNavbarHeightVar() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const update = () => {
      document.documentElement.style.setProperty("--navbar-height", `${navbar.offsetHeight}px`);
    };

    update();
    window.addEventListener("resize", update);
  }

  function initScrollSpy() {
    const navbarLinks = qsa(".navbar-link");
    if (navbarLinks.length === 0) return;

    function updateActiveNav() {
      const sections = qsa("section[id]");
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute("id");

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          for (const link of navbarLinks) {
            link.classList.toggle("active", link.getAttribute("data-nav") === `/#${sectionId}`);
          }
          return;
        }
      }
    }

    window.addEventListener("scroll", updateActiveNav, { passive: true });
    updateActiveNav();
  }

  function initMobileMenu() {
    const navbar = document.getElementById("navbar");
    const toggle = qs("[data-mobile-menu-toggle]");
    const menu = qs("[data-mobile-menu]");
    if (!navbar || !toggle || !menu) return;

    let isOpen = false;

    function setOpen(nextOpen) {
      isOpen = Boolean(nextOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      toggle.classList.toggle("is-open", isOpen);
      menu.classList.toggle("is-open", isOpen);
    }

    toggle.addEventListener("click", () => setOpen(!isOpen));

    menu.addEventListener("click", (e) => {
      const anchor = e.target.closest("a");
      if (anchor) setOpen(false);
    });

    document.addEventListener("click", (e) => {
      if (!isOpen) return;
      if (!navbar.contains(e.target)) setOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
    });
  }

  function navigateToHash(href, behavior) {
    const targetId = href.replace("/#", "").replace("#", "");
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return false;

    targetElement.scrollIntoView({ behavior, block: "start" });
    history.pushState(null, null, `#${targetId}`);
    return true;
  }

  function initSmoothAnchors() {
    document.addEventListener("click", (e) => {
      const anchor = e.target.closest('a[href^="/#"], a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href === "/#") return;

      if (href.startsWith("#") || href.startsWith("/#")) {
        if (navigateToHash(href, "smooth")) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener("load", () => {
      const hash = window.location.hash;
      if (!hash) return;
      const targetElement = document.getElementById(hash.replace("#", ""));
      if (!targetElement) return;

      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: "auto", block: "start" });
      }, 100);
    });
  }

  function initRevealAnimations() {
    const animatedElements = qsa(".fade-in, .seq");
    if (animatedElements.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of animatedElements) el.dataset.reveal = "visible";
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    for (const el of animatedElements) {
      const rect = el.getBoundingClientRect();
      const isVisibleNow = rect.top < viewportHeight && rect.bottom > 0;
      el.dataset.reveal = isVisibleNow ? "visible" : "pending";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.dataset.reveal = "visible";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    for (const el of animatedElements) {
      if (el.dataset.reveal === "pending") observer.observe(el);
    }
  }

  function init() {
    initNavbarHeightVar();
    initScrollSpy();
    initMobileMenu();
    initSmoothAnchors();
    initRevealAnimations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

