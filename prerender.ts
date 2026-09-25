import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";
import { NOT_FOUND_META, ROUTES, SITEMAP_PATHS, type RouteMeta } from "./src/routes.ts";
import {
  FEED_PATH,
  REPO_NAME,
  REPO_OWNER,
  SITE_AUTHOR,
  SITE_NAME,
  SITE_ORIGIN,
} from "./src/site.ts";
import { buildStructuredData } from "./src/structured-data.ts";

const APP_MARKER = '<div id="app"></div>';

const SITEMAP_PRIORITIES: Record<string, string> = {
  "/": "1.0",
  "/downloads": "0.8",
  "/release-notes": "0.7",
};

const SITEMAP_CHANGEFREQ: Record<string, string> = {
  "/": "weekly",
  "/downloads": "weekly",
  "/release-notes": "weekly",
};

interface GitHubRelease {
  name: string | null;
  tag_name: string;
  html_url: string;
  published_at: string | null;
  body: string | null;
  prerelease: boolean;
  draft: boolean;
}

export function prerender(): Plugin {
  return {
    name: "flick-prerender",
    apply: "build",
    async closeBundle() {
      const root = process.cwd();
      const dist = join(root, "dist");
      const vite = await import("vite");
      const server = await vite.createServer({
        configFile: false,
        root,
        server: { middlewareMode: true },
        appType: "custom",
        logLevel: "error",
      });

      try {
        const { renderPage } = await server.ssrLoadModule("/src/render.ts");
        const template = await readFile(join(dist, "index.html"), "utf8");
        const assetMap = await readAssetMap(join(dist, ".vite", "manifest.json"));

        for (const { path, route } of ROUTES) {
          const body = rewriteAssets(renderPage(route), assetMap);
          let html = template.replace(APP_MARKER, `<div id="app">\n${body}\n</div>`);
          html = applyRouteMeta(html, routeMeta(route), SITE_ORIGIN);
          const outDir = path === "/" ? dist : join(dist, path);
          await mkdir(outDir, { recursive: true });
          await writeFile(join(outDir, "index.html"), html);
        }

        const notFoundBody = rewriteAssets(renderPage("not-found"), assetMap);
        let notFoundHtml = template.replace(
          APP_MARKER,
          `<div id="app">\n${notFoundBody}\n</div>`,
        );
        notFoundHtml = applyRouteMeta(notFoundHtml, NOT_FOUND_META, SITE_ORIGIN);
        await writeFile(join(dist, "404.html"), notFoundHtml);

        const today = new Date().toISOString().slice(0, 10);
        await writeFile(join(dist, "sitemap.xml"), buildSitemap(SITE_ORIGIN, today));

        const releases = await fetchReleases();
        const feedUpdated = releases[0]?.published_at ?? new Date().toISOString();
        await writeFile(
          join(dist, "feed.xml"),
          buildFeed(SITE_ORIGIN, releases, feedUpdated),
        );

        console.log(
          `prerendered ${ROUTES.length} routes + 404, sitemap (${SITEMAP_PATHS.length} urls), feed (${releases.length} entries)`,
        );
      } finally {
        await server.close();
      }
    },
  };
}

function routeMeta(route: RouteMeta["route"]): RouteMeta {
  return ROUTES.find((entry) => entry.route === route) ?? NOT_FOUND_META;
}

async function readAssetMap(manifestPath: string): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const raw = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
      string,
      { file?: string }
    >;
    for (const [key, val] of Object.entries(raw)) {
      if (val?.file && /\.(png|jpe?g|svg|gif|webp|avif|ico)$/i.test(key)) {
        map.set(key, "/" + val.file);
      }
    }
  } catch {
    // no manifest — leave urls untouched
  }
  return map;
}

function rewriteAssets(body: string, assetMap: Map<string, string>): string {
  let out = body;
  for (const [src, hashed] of assetMap) {
    out = out.split("/" + src).join(hashed);
    out = out.split(src).join(hashed);
  }
  return out;
}

function applyRouteMeta(html: string, meta: RouteMeta, origin: string): string {
  const url = origin + (meta.path === "/" ? "/" : meta.path);
  const set = (s: string, re: RegExp, val: string) => s.replace(re, `$1${val}$2`);
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
  out = set(out, /(<meta\s+name="description"\s+content=")[^"]*(")/, meta.description);
  out = out.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`);
  out = set(out, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, meta.title);
  out = set(
    out,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    meta.description,
  );
  out = set(out, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, url);
  out = set(out, /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, meta.title);
  out = set(
    out,
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    meta.description,
  );
  if (meta.noindex) {
    out = set(out, /(<meta\s+name="robots"\s+content=")[^"]*(")/, "noindex, nofollow");
  }
  return applyStructuredData(out, meta.route);
}

function applyStructuredData(html: string, route: RouteMeta["route"]): string {
  const pattern = /<script type="application\/ld\+json" id="ld-json">[\s\S]*?<\/script>/;
  const json = buildStructuredData(route);
  if (!json) return html.replace(pattern, "");
  const safe = json.replace(/</g, "\\u003c");
  const script = `<script type="application/ld+json" id="ld-json">\n${safe}\n</script>`;
  return html.replace(pattern, () => script);
}

function buildSitemap(origin: string, lastmod: string): string {
  const urls = SITEMAP_PATHS.map((path) => {
    const loc = origin + (path === "/" ? "/" : path);
    const changefreq = SITEMAP_CHANGEFREQ[path] ?? "monthly";
    const priority = SITEMAP_PRIORITIES[path] ?? "0.5";
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmod}</lastmod>`,
      `    <changefreq>${changefreq}</changefreq>`,
      `    <priority>${priority}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function fetchReleases(): Promise<GitHubRelease[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Flick-Web-Build",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases?per_page=20`,
      { headers },
    );
    if (!response.ok) throw new Error(`GitHub responded ${response.status}`);
    const data = (await response.json()) as GitHubRelease[];
    return data.filter((release) => !release.draft);
  } catch (error) {
    console.warn(`feed: falling back to empty feed (${(error as Error).message})`);
    return [];
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildFeed(origin: string, releases: GitHubRelease[], updated: string): string {
  const feedUrl = origin + FEED_PATH;
  const entries = releases
    .map((release) => {
      const title =
        (release.name || release.tag_name) + (release.prerelease ? " (pre-release)" : "");
      const publishedAt = release.published_at ?? updated;
      const summary = escapeXml((release.body ?? "").trim().slice(0, 400));
      return [
        "  <entry>",
        `    <title>${escapeXml(title)}</title>`,
        `    <link href="${escapeXml(release.html_url)}"/>`,
        `    <id>${escapeXml(release.html_url)}</id>`,
        `    <updated>${escapeXml(publishedAt)}</updated>`,
        `    <summary>${summary}</summary>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escapeXml(`${SITE_NAME} Releases`)}</title>`,
    "  <subtitle>Release notes and downloads for the Flick audiophile music player.</subtitle>",
    `  <link href="${escapeXml(feedUrl)}" rel="self"/>`,
    `  <link href="${escapeXml(origin + "/")}"/>`,
    `  <id>${escapeXml(origin + "/")}</id>`,
    `  <updated>${escapeXml(updated)}</updated>`,
    `  <author><name>${escapeXml(SITE_AUTHOR)}</name></author>`,
    entries,
    "</feed>",
    "",
  ].join("\n");
}
