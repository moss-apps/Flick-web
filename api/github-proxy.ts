import { clientIp, isBlockedBot, rateLimited } from "../src/lib/protection";

declare const process: { env: Record<string, string | undefined> };

const SITE_ORIGIN = "https://flick-player.site";

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
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (isBlockedBot(req.headers["user-agent"] ?? "")) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (rateLimited(clientIp(req.headers))) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "Too many requests" });
  }

  const path = req.query.path as string | undefined;
  if (!path) {
    return res.status(400).json({ error: "Missing path parameter" });
  }

  const decodedPath = decodeURIComponent(path);

  // Reject double-encoded paths
  if (decodedPath !== decodeURIComponent(decodedPath)) {
    return res.status(400).json({ error: "Invalid path encoding" });
  }

  if (!ALLOWED_PATHS.some((pattern) => pattern.test(decodedPath))) {
    return res.status(403).json({ error: "Path not allowed" });
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

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=600, stale-while-revalidate=60",
    );
    return res.status(upstream.status).send(body);
  } catch {
    return res.status(502).json({ error: "Failed to reach GitHub API" });
  }
}
