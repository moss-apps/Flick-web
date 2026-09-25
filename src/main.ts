import "./style.css";
import { initMobileNavbar, initNavbarScroll } from "./components/navbar";
import {
  fetchLatestRelease,
  fetchLatestCommit,
  fetchContributors,
  initReleaseNotesPage,
} from "./api/github";
import { initAnimations, initHeroAnimation, initNavbarAnimation } from "./animations";
import { initFooter } from "./components/footer";
import { renderPage } from "./render";
import {
  normalizePath,
  routeFromPath,
  routeMeta,
  VALID_PATHS,
  type AppRoute,
} from "./routes";
import { SITE_ORIGIN } from "./site";
import { buildStructuredData } from "./structured-data";

let releaseRefreshTimer: ReturnType<typeof setInterval> | null = null;

function getCurrentRoute(): AppRoute {
  return routeFromPath(window.location.pathname);
}

function navigate(path: string): void {
  const normalized = normalizePath(path);
  if (normalized === normalizePath(window.location.pathname)) return;
  if (!VALID_PATHS.has(normalized)) return;
  window.history.pushState({}, "", normalized);
  window.scrollTo(0, 0);
  renderApp();
}

function renderApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  if (releaseRefreshTimer !== null) {
    clearInterval(releaseRefreshTimer);
    releaseRefreshTimer = null;
  }

  const route = getCurrentRoute();
  applyMeta(route);
  app.innerHTML = renderPage(route);

  initMobileNavbar();
  initNavbarScroll();
  initNavbarAnimation();
  initAnimations();
  initFooter();
  fetchLatestCommit();

  if (route === "release-notes") {
    void initReleaseNotesPage();
    initImageModal();
    return;
  }

  if (route === "home") {
    fetchLatestRelease();
    initHeroAnimation();
    fetchContributors();
    return;
  }

  if (route === "downloads") {
    fetchLatestRelease();
    releaseRefreshTimer = setInterval(
      () => {
        void fetchLatestRelease();
      },
      5 * 60 * 1000,
    );
  }
}

window.addEventListener("popstate", () => {
  window.scrollTo(0, 0);
  renderApp();
});

document.addEventListener("click", (e) => {
  const anchor = (e.target as HTMLElement | null)?.closest("a");
  if (!anchor) return;
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const href = anchor.getAttribute("href");
  if (!href) return;
  let url: URL;
  try {
    url = new URL(href, window.location.origin);
  } catch {
    return;
  }
  if (url.origin !== window.location.origin) return;
  const path = normalizePath(url.pathname);
  if (!VALID_PATHS.has(path)) return;
  e.preventDefault();
  navigate(path);
});

renderApp();

function initImageModal(): void {
  const modal = document.getElementById("image-modal") as HTMLDialogElement | null;
  const modalImg = document.getElementById("image-modal-img") as HTMLImageElement | null;
  const closeBtn = document.getElementById("image-modal-close");
  if (!modal || !modalImg) return;

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG" && target.hasAttribute("data-release-img")) {
      modalImg.src = (target as HTMLImageElement).src;
      modal.showModal();
    }
  });

  modalImg.addEventListener("click", () => modal.close());
  closeBtn?.addEventListener("click", () => modal.close());

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });
}

function applyMeta(route: AppRoute): void {
  const meta = routeMeta(route);
  const url = meta.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${meta.path}`;
  document.title = meta.title;
  setAttr('meta[name="description"]', "content", meta.description);
  setAttr(
    'meta[name="robots"]',
    "content",
    meta.noindex ? "noindex, nofollow" : "index, follow",
  );
  setAttr('meta[property="og:title"]', "content", meta.title);
  setAttr('meta[property="og:description"]', "content", meta.description);
  setAttr('meta[property="og:url"]', "content", url);
  setAttr('meta[name="twitter:title"]', "content", meta.title);
  setAttr('meta[name="twitter:description"]', "content", meta.description);
  setAttr('link[rel="canonical"]', "href", url);

  const structuredData = buildStructuredData(route);
  const ldJson = document.getElementById("ld-json");
  if (ldJson) {
    if (structuredData) ldJson.textContent = structuredData;
    else ldJson.remove();
  }
}

function setAttr(selector: string, attr: string, value: string): void {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}
