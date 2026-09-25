import { animate, inView, stagger } from "motion";

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initAnimations(): void {
  if (prefersReducedMotion()) return;

  // Scroll-triggered fade-up elements
  const fadeUpEls = document.querySelectorAll<HTMLElement>("[data-animate='fade-up']");
  fadeUpEls.forEach((el) => {
    const duration = parseFloat(el.dataset.animateDuration || "0.6");
    const delay = parseFloat(el.dataset.animateDelay || "0");
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";

    inView(
      el,
      () => {
        animate(el, { opacity: 1, y: 0 }, { duration, delay, ease: EASE_OUT });
      },
      { amount: 0.15 },
    );
  });

  // Scroll-triggered fade-in elements
  const fadeInEls = document.querySelectorAll<HTMLElement>("[data-animate='fade-in']");
  fadeInEls.forEach((el) => {
    const duration = parseFloat(el.dataset.animateDuration || "0.6");
    const delay = parseFloat(el.dataset.animateDelay || "0");
    el.style.opacity = "0";

    inView(
      el,
      () => {
        animate(el, { opacity: 1 }, { duration, delay, ease: EASE_OUT });
      },
      { amount: 0.15 },
    );
  });

  // Scroll-triggered fade-left elements
  const fadeLeftEls = document.querySelectorAll<HTMLElement>(
    "[data-animate='fade-left']",
  );
  fadeLeftEls.forEach((el) => {
    const duration = parseFloat(el.dataset.animateDuration || "0.6");
    const delay = parseFloat(el.dataset.animateDelay || "0");
    el.style.opacity = "0";
    el.style.transform = "translateX(40px)";

    inView(
      el,
      () => {
        animate(el, { opacity: 1, x: 0 }, { duration, delay, ease: EASE_OUT });
      },
      { amount: 0.15 },
    );
  });

  // Scroll-triggered fade-right elements
  const fadeRightEls = document.querySelectorAll<HTMLElement>(
    "[data-animate='fade-right']",
  );
  fadeRightEls.forEach((el) => {
    const duration = parseFloat(el.dataset.animateDuration || "0.6");
    const delay = parseFloat(el.dataset.animateDelay || "0");
    el.style.opacity = "0";
    el.style.transform = "translateX(-40px)";

    inView(
      el,
      () => {
        animate(el, { opacity: 1, x: 0 }, { duration, delay, ease: EASE_OUT });
      },
      { amount: 0.15 },
    );
  });

  // Scroll-triggered scale-in elements
  const scaleInEls = document.querySelectorAll<HTMLElement>("[data-animate='scale-in']");
  scaleInEls.forEach((el) => {
    const duration = parseFloat(el.dataset.animateDuration || "0.6");
    const delay = parseFloat(el.dataset.animateDelay || "0");
    el.style.opacity = "0";
    el.style.transform = "scale(0.9)";

    inView(
      el,
      () => {
        animate(el, { opacity: 1, scale: 1 }, { duration, delay, ease: EASE_OUT });
      },
      { amount: 0.15 },
    );
  });

  // Staggered children containers
  const staggerContainers = document.querySelectorAll<HTMLElement>(
    "[data-animate-stagger]",
  );
  staggerContainers.forEach((container) => {
    const childSelector = container.dataset.animateStagger || "[data-animate-child]";
    const children = Array.from(container.querySelectorAll<HTMLElement>(childSelector));
    const staggerDelay = parseFloat(container.dataset.animateStaggerDelay || "0.08");
    const duration = parseFloat(container.dataset.animateDuration || "0.5");

    children.forEach((child) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(20px)";
    });

    inView(
      container,
      () => {
        animate(
          children,
          { opacity: 1, y: 0 },
          {
            duration,
            delay: stagger(staggerDelay, { startDelay: 0.1 }),
            ease: EASE_OUT,
          },
        );
      },
      { amount: 0.1 },
    );
  });
}

export function initHeroAnimation(): void {
  const hero = document.querySelector<HTMLElement>("#hero-section");
  if (!hero || prefersReducedMotion()) return;

  const image = hero.querySelector<HTMLElement>("img");
  const heading = hero.querySelector<HTMLElement>("h1");
  const paragraph = hero.querySelector<HTMLElement>("p");
  const button = hero.querySelector<HTMLElement>("button");
  const stats = hero.querySelector<HTMLElement>("#download-stats");

  if (image) {
    animate(
      image,
      { opacity: [0, 1], scale: [1.05, 1] },
      { duration: 1.2, ease: EASE_OUT },
    );
  }

  if (heading) {
    animate(
      heading,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.7, delay: 0.2, ease: EASE_OUT },
    );
  }

  if (paragraph) {
    animate(
      paragraph,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.7, delay: 0.4, ease: EASE_OUT },
    );
  }

  if (button) {
    animate(
      button,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.7, delay: 0.6, ease: EASE_OUT },
    );
  }

  if (stats) {
    animate(
      stats,
      { opacity: [0, 1], y: [30, 0] },
      { duration: 0.7, delay: 0.75, ease: EASE_OUT },
    );
  }
}

export function initNavbarAnimation(): void {
  const nav = document.querySelector<HTMLElement>("#main-nav");
  if (!nav || prefersReducedMotion()) return;

  animate(
    nav,
    { opacity: [0, 1], y: [-20, 0] },
    { duration: 0.6, delay: 0.1, ease: EASE_OUT },
  );
}
