import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Plugin } from "vite";

type Route = "home" | "downloads" | "release-notes";

const ROUTES: { path: string; route: Route }[] = [
  { path: "/", route: "home" },
  { path: "/downloads", route: "downloads" },
  { path: "/release-notes", route: "release-notes" },
];

const APP_MARKER = '<div id="app"></div>';

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
        const { renderPage, routeMeta, SITE_ORIGIN } = await server.ssrLoadModule("/src/render.ts");
        const template = await readFile(join(dist, "index.html"), "utf8");
        const assetMap = await readAssetMap(join(dist, ".vite", "manifest.json"));

        for (const { path, route } of ROUTES) {
          const body = rewriteAssets(renderPage(route), assetMap);
          let html = template.replace(
            APP_MARKER,
            `<div id="app">\n${body}\n</div>`,
          );
          html = applyRouteMeta(html, routeMeta(route), SITE_ORIGIN);
          const outDir = path === "/" ? dist : join(dist, path);
          await mkdir(outDir, { recursive: true });
          await writeFile(join(outDir, "index.html"), html);
        }
        this.logger?.info(`prerendered ${ROUTES.length} routes`);
      } finally {
        await server.close();
      }
    },
  };
}

async function readAssetMap(
  manifestPath: string,
): Promise<Map<string, string>> {
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
    // no manifest — leave urls untouched; client hydrates anyway
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

function applyRouteMeta(
  html: string,
  meta: { title: string; description: string; path: string },
  origin: string,
): string {
  const url = origin + (meta.path === "/" ? "/" : meta.path);
  const set = (
    s: string,
    re: RegExp,
    val: string,
  ) => s.replace(re, `$1${val}$2`);
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
  out = set(
    out,
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    meta.description,
  );
  out = out.replace(
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${url}$2`,
  );
  out = set(out, /(<meta\s+property="og:title"\s+content=")[^"]*(")/, meta.title);
  out = set(
    out,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    meta.description,
  );
  out = set(out, /(<meta\s+property="og:url"\s+content=")[^"]*(")/, url);
  out = set(
    out,
    /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
    meta.title,
  );
  out = set(
    out,
    /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
    meta.description,
  );
  return out;
}
