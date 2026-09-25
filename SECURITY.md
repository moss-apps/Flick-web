# Security Policy

Last updated: September 25, 2026

## Reporting a vulnerability

Please report suspected vulnerabilities privately:

- Email: [moss_apps@proton.me](mailto:moss_apps@proton.me)
- GitHub private advisory: https://github.com/moss-apps/Flick/security/advisories/new

Please do not open a public issue for security problems. You can expect an
acknowledgement within a few days. This policy also applies to the Flick
Android app; machine-readable contact details are published at
`/.well-known/security.txt`.

## Scope

- This website (`moss-apps/Flick-web`): static pages, prerender pipeline,
  serverless GitHub proxy.
- The Flick Android app (`moss-apps/Flick`).

## Implemented controls

- **Security headers** on every response: `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` (geolocation, microphone and camera disabled), HSTS
  (2 years, `includeSubDomains`, `preload`), COOP/CORP `same-origin`.
- **Content Security Policy**: `default-src 'self'` with scripts, styles and
  fonts restricted to the origin, `object-src 'none'`, `frame-ancestors
'none'`, `base-uri 'self'`. Markup contains no inline event handlers.
- **GitHub proxy**: GET only; method, path and query allowlists; known scraper
  and bot user agents blocked; per-IP rate limit (60 requests/minute, 429 with
  `Retry-After`); 8-second upstream timeout; CORS locked to
  `https://flick-player.site`; optional `GITHUB_TOKEN` used server-side only.
- **Output handling**: all GitHub-sourced strings are HTML-escaped and URLs
  are validated before rendering (contributor avatars, release assets, release
  notes).
- **Privacy**: no analytics, no telemetry, no cookies, no third-party fonts.
  GitHub API responses are cached in `localStorage` for 10 minutes.
- **Supply chain**: dependencies are locked by `package-lock.json`, installed
  with `npm ci` in CI, and inventoried on the `/licenses` page.

## Known limitations

- The proxy rate limiter is in-memory and per serverless instance, so it is
  best-effort and resets on cold starts. It is a courtesy layer, not an
  edge-level DDoS defence (Vercel provides platform-level protection).
- There is no third-party error monitoring by design. Platform-level errors
  are handled by Vercel's static `500.html` fallback.
- The Atom feed is generated at build time from the GitHub releases API; if
  the API is unreachable during a build, the feed falls back to a valid,
  empty feed.
