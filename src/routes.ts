export type AppRoute =
  | "home"
  | "downloads"
  | "release-notes"
  | "privacy"
  | "terms"
  | "licenses"
  | "community"
  | "about"
  | "faq"
  | "supported-dacs"
  | "not-found";

export interface RouteMeta {
  route: AppRoute;
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}

export const ROUTES: readonly RouteMeta[] = [
  {
    route: "home",
    path: "/",
    title: "Flick — Bit-Perfect Audiophile Music Player",
    description:
      "Flick is a high-performance audiophile music player for Android, built with Flutter and Rust. Bit-perfect PCM and native DSD via UAC 2.0 DACs, with DAP bit-perfect through Oboe/AAudio exclusive mode.",
  },
  {
    route: "downloads",
    path: "/downloads",
    title: "Download Flick — Latest Android APK & Releases",
    description:
      "Download the latest Flick release for Android — a bit-perfect audiophile music player APK. Get bit-perfect PCM and native DSD playback through UAC 2.0 DACs.",
  },
  {
    route: "release-notes",
    path: "/release-notes",
    title: "Flick Release Notes — Changelog & Updates",
    description:
      "Flick release notes and changelog. Track every update to the bit-perfect audiophile Android music player — new features, fixes, and contributors per release.",
  },
  {
    route: "supported-dacs",
    path: "/supported-dacs",
    title: "Supported DACs & DAPs — Flick",
    description:
      "USB DACs and Android digital audio players tested with Flick's bit-perfect UAC 2.0 and internal-DAC playback paths.",
  },
  {
    route: "faq",
    path: "/faq",
    title: "Frequently Asked Questions — Flick",
    description:
      "Answers about bit-perfect playback, supported DACs, DSD, Play Store versus APK builds, privacy, and building Flick from source.",
  },
  {
    route: "community",
    path: "/community",
    title: "Community & Contributing — Flick",
    description:
      "How to contribute to Flick: report bugs, propose features, test on your DAC, and open pull requests under the project's contribution rules.",
  },
  {
    route: "about",
    path: "/about",
    title: "About Flick — Moss",
    description:
      "Flick is an open-source audiophile music player for Android, built by Moss with Flutter and Rust.",
  },
  {
    route: "privacy",
    path: "/privacy",
    title: "Privacy Policy — Flick",
    description:
      "How Flick and flick-player.site handle data: no analytics, no tracking, no accounts. A local-first music player and its website.",
  },
  {
    route: "terms",
    path: "/terms",
    title: "Terms of Use — Flick",
    description:
      "The terms that apply to flick-player.site and the Flick Android app, including the MIT license, trademarks, and warranty disclaimer.",
  },
  {
    route: "licenses",
    path: "/licenses",
    title: "Licenses — Flick",
    description:
      "Open-source licenses for Flick Player and the third-party libraries it uses: Flutter and Dart packages, Rust crates, and bundled native codecs.",
  },
];

export const NOT_FOUND_META: RouteMeta = {
  route: "not-found",
  path: "/404",
  title: "Page Not Found — Flick",
  description: "The page you are looking for does not exist.",
  noindex: true,
};

const ROUTE_BY_PATH = new Map(ROUTES.map((meta) => [meta.path, meta]));
const ROUTE_BY_NAME = new Map(ROUTES.map((meta) => [meta.route, meta]));

export function normalizePath(pathname: string): string {
  const withLeading = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const trimmed = withLeading.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function routeFromPath(pathname: string): AppRoute {
  return ROUTE_BY_PATH.get(normalizePath(pathname))?.route ?? "not-found";
}

export function routeMeta(route: AppRoute): RouteMeta {
  return ROUTE_BY_NAME.get(route) ?? NOT_FOUND_META;
}

export const VALID_PATHS: ReadonlySet<string> = new Set(ROUTES.map((meta) => meta.path));

export const SITEMAP_PATHS: readonly string[] = ROUTES.map((meta) => meta.path);
