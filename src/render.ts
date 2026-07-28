import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Specs } from "./components/specs";
import { Contributors } from "./components/contributors";
import { Footer } from "./components/footer";
import { DownloadsPage } from "./components/downloads-page";
import { ReleaseNotesPage } from "./components/release-notes-page";

export type AppRoute = "home" | "downloads" | "release-notes";

function pageMarkup(route: AppRoute): string {
  if (route === "release-notes") return ReleaseNotesPage();
  if (route === "downloads") return DownloadsPage();
  return `${Hero()}${Features()}${Specs()}${Contributors()}`;
}

export function renderPage(route: AppRoute): string {
  return `${Navbar(route)}${pageMarkup(route)}${Footer(route)}`;
}

export function routeFromPath(pathname: string): AppRoute {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/release-notes") return "release-notes";
  if (path === "/downloads") return "downloads";
  return "home";
}

export const SITE_ORIGIN = "https://flick-player.site";

export type RouteMeta = {
  title: string;
  description: string;
  path: string;
};

const META: Record<AppRoute, RouteMeta> = {
  home: {
    title: "Flick — Bit-Perfect Audiophile Music Player",
    description:
      "Flick is a high-performance audiophile music player for Android, built with Flutter and Rust. Bit-perfect PCM and native DSD via UAC 2.0 DACs, with DAP bit-perfect through Oboe/AAudio exclusive mode.",
    path: "/",
  },
  downloads: {
    title: "Download Flick — Latest Android APK & Releases",
    description:
      "Download the latest Flick release for Android — a bit-perfect audiophile music player APK. Get bit-perfect PCM and native DSD playback through UAC 2.0 DACs.",
    path: "/downloads",
  },
  "release-notes": {
    title: "Flick Release Notes — Changelog & Updates",
    description:
      "Flick release notes and changelog. Track every update to the bit-perfect audiophile Android music player — new features, fixes, and contributors per release.",
    path: "/release-notes",
  },
};

export function routeMeta(route: AppRoute): RouteMeta {
  return META[route];
}
