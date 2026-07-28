// In-process bot heuristics + sliding-window rate limiter for
// /api/github-proxy. Pure stdlib (Date, Map, RegExp) — no runtime types needed.
//
// ponytail: state lives in module scope, so on Vercel serverless it is
// per-warm-instance (soft limit). Stops one client hammering a single instance,
// which is the common case. For hard cross-region/cross-instance enforcement,
// swap the Map for @upstash/ratelimit (Redis) or Vercel Edge Config; the
// exported signatures stay the same.

const WINDOW_MS = 60_000;
const MAX_HITS = 60;
const SWEEP_AT = 2_000;

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

export function isBlockedBot(userAgent: string): boolean {
  if (userAgent.trim().length === 0) return true;
  return SCRAPER_UA.some((re) => re.test(userAgent));
}

type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

export function rateLimited(key: string, now: number = Date.now()): boolean {
  const cutoff = now - WINDOW_MS;
  const existing = buckets.get(key);
  let hits: number[] = [];
  if (existing) {
    let i = 0;
    while (i < existing.hits.length && existing.hits[i] <= cutoff) i++;
    hits = i === 0 ? existing.hits : existing.hits.slice(i);
  }
  if (hits.length >= MAX_HITS) {
    buckets.set(key, { hits });
    return true;
  }
  hits.push(now);
  buckets.set(key, { hits });
  if (buckets.size > SWEEP_AT) sweep(now);
  return false;
}

function sweep(now: number): void {
  const cutoff = now - WINDOW_MS;
  for (const [key, b] of buckets) {
    let i = 0;
    while (i < b.hits.length && b.hits[i] <= cutoff) i++;
    if (i === b.hits.length) buckets.delete(key);
    else if (i > 0) b.hits = b.hits.slice(i);
  }
}

export function clientIp(headers: Record<string, string | undefined>): string {
  const xff = headers["x-forwarded-for"];
  if (xff) {
    const first = xff.split(",")[0];
    if (first) return first.trim();
  }
  return headers["x-real-ip"] ?? "unknown";
}

export function protectionStats(): { buckets: number } {
  return { buckets: buckets.size };
}
