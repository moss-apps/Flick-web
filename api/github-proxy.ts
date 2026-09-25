declare const process: { env: Record<string, string | undefined> };

const SITE_ORIGIN = "https://flick-player.site";

// ponytail: inlined from src/lib/protection — cross-dir import broke Vercel bundling.
// Per-warm-instance state; swap for @upstash/ratelimit if cross-instance enforcement matters.
const WINDOW_MS = 60_000;
const MAX_HITS = 60;
const SCRAPER_UA: readonly RegExp[] = [
  /gptbot/i,
  /oai-searchbot/i,
  /claudebot/i,
  /claude-web/i,
  /anthropic-ai/i,
  /ccbot/i,
  /google-extended/i,
  /bytespider/i,
  /facebookbot/i,
  /meta-externalagent/i,
  /perplexitybot/i,
  /amazonbot/i,
  /semrush/i,
  /ahrefs/i,
  /dotbot/i,
  /petalbot/i,
  /mj12bot/i,
  /yandex/i,
  /baiduspider/i,
  /scrapy/i,
  /\bcurl\b/i,
  /\bwget\b/i,
  /python-requests/i,
  /python-urllib/i,
  /httpx/i,
  /node-fetch/i,
  /axios\/[\d.]+/i,
  /go-http-client/i,
  /java\/[\d.]+/i,
  /okhttp/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /webdriver/i,
  /chrome-lighthouse/i,
];

function isBlockedBot(userAgent: string): boolean {
  if (userAgent.trim().length === 0) return true;
  return SCRAPER_UA.some((re) => re.test(userAgent));
}

const buckets = new Map<string, number[]>();

function rateLimited(key: string, now: number = Date.now()): boolean {
  const cutoff = now - WINDOW_MS;
  const existing = buckets.get(key);
  let hits: number[] = [];
  if (existing) {
    let i = 0;
    while (i < existing.length && existing[i] <= cutoff) i++;
    hits = i === 0 ? existing : existing.slice(i);
  }
  if (hits.length >= MAX_HITS) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}

function clientIp(headers: Record<string, string | undefined>): string {
  const xff = headers["x-forwarded-for"];
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  return headers["x-real-ip"] ?? "unknown";
}

interface VercelRequest {
  query: Record<string, string | string[] | undefined>;
  method?: string;
  headers: Record<string, string | undefined>;
}

interface VercelResponse {
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
  send(body: string): VercelResponse;
}

const HOME_URL = `${SITE_ORIGIN}/`;
const ISSUES_URL = "https://github.com/moss-apps/Flick/issues";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

function wantsHtml(req: VercelRequest): boolean {
  return (req.headers["accept"] ?? "").includes("text/html");
}

function htmlErrorPage(status: number, title: string, message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${status} — ${escapeHtml(title)}</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: grid;
    place-items: center;
    background: #101010;
    color: #e5e5e5;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
  }
  main { max-width: 34rem; padding: 2.5rem 1.5rem; text-align: center; }
  .code { color: #737373; font-size: .8125rem; letter-spacing: .3em; text-transform: uppercase; margin: 0 0 .75rem; }
  h1 { font-size: 1.75rem; margin: 0 0 .75rem; letter-spacing: -.02em; }
  p { color: #a3a3a3; margin: 0 0 2rem; }
  nav { display: flex; gap: .75rem; justify-content: center; flex-wrap: wrap; }
  a {
    color: #fff;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, .2);
    border-radius: .75rem;
    padding: .75rem 1.5rem;
    font-weight: 600;
    font-size: .9375rem;
  }
  a:hover { background: rgba(255, 255, 255, .06); }
</style>
</head>
<body>
<main>
  <p class="code">Error ${status}</p>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
  <nav>
    <a href="${HOME_URL}">Back to Flick</a>
    <a href="${ISSUES_URL}">Report a problem</a>
  </nav>
</main>
</body>
</html>`;
}

function fail(
  req: VercelRequest,
  res: VercelResponse,
  status: number,
  message: string,
  title = "Something went wrong",
): VercelResponse {
  if (wantsHtml(req)) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    return res.status(status).send(htmlErrorPage(status, title, message));
  }
  return res.status(status).json({ error: message });
}

// Only allow safe characters in owner/repo segments (alphanumeric, hyphens, dots, underscores)
const ALLOWED_PATHS = [
  /^\/repos\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/releases$/,
  /^\/repos\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/,
  /^\/repos\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/contributors$/,
  /^\/repos\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/commits$/,
  /^\/repos\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/stats\/contributors$/,
];

const ALLOWED_QS_KEYS = new Set(["page", "per_page"]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", SITE_ORIGIN);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  if (req.method !== "GET") {
    return fail(req, res, 405, "Method not allowed", "Method not allowed");
  }

  if (isBlockedBot(req.headers["user-agent"] ?? "")) {
    return fail(req, res, 403, "Forbidden", "Access denied");
  }

  if (rateLimited(clientIp(req.headers))) {
    res.setHeader("Retry-After", "60");
    return fail(req, res, 429, "Too many requests", "Too many requests");
  }

  const path = req.query.path as string | undefined;
  if (!path) {
    return fail(req, res, 400, "Missing path parameter", "Bad request");
  }

  const decodedPath = decodeURIComponent(path);

  // Reject double-encoded paths
  if (decodedPath !== decodeURIComponent(decodedPath)) {
    return fail(req, res, 400, "Invalid path encoding", "Bad request");
  }

  if (!ALLOWED_PATHS.some((pattern) => pattern.test(decodedPath))) {
    return fail(req, res, 403, "Path not allowed", "Access denied");
  }

  // Whitelist query string parameters
  const rawQs = req.query.qs as string | undefined;
  let sanitizedQs = "";
  if (rawQs) {
    const params = new URLSearchParams(rawQs);
    const safe = new URLSearchParams();
    params.forEach((value, key) => {
      if (ALLOWED_QS_KEYS.has(key)) safe.set(key, value);
    });
    sanitizedQs = safe.toString();
  }

  const url = `https://api.github.com${decodedPath}${sanitizedQs ? `?${sanitizedQs}` : ""}`;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Flick-Web",
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstream = await fetch(url, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const body = await upstream.text();

    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=60");
    return res.status(upstream.status).send(body);
  } catch {
    return fail(req, res, 502, "Failed to reach GitHub API", "Upstream unavailable");
  }
}
