# Flick — Website

Marketing site for [Flick](https://github.com/moss-apps/Flick), a bit-perfect
audiophile music player for Android.

Vanilla TypeScript SPA with pushState routing, built with Vite, styled with
Tailwind CSS v4, animated with Motion, and prerendered to static HTML at build
time.

## Pages

All routes are defined once in `src/routes.ts` — it drives navigation,
prerendering, SEO metadata and the sitemap.

| Route             | Content                                   |
| ----------------- | ----------------------------------------- |
| `/`               | Hero, features, specs, contributors       |
| `/downloads`      | Release downloads, QR code, stats         |
| `/release-notes`  | Full release history from GitHub          |
| `/supported-dacs` | USB DAC and DAP compatibility list        |
| `/faq`            | Frequently asked questions                |
| `/community`      | Contributing guide and project principles |
| `/about`          | Project background and architecture docs  |
| `/privacy`        | Privacy policy                            |
| `/terms`          | Terms of use                              |
| `/licenses`       | Open source license inventory             |

Unknown paths serve a prerendered, `noindex` 404 page. Platform errors fall
back to `public/500.html`.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Optionally copy `.env.example` to `.env` and set `GITHUB_TOKEN` to raise GitHub
API rate limits during builds. The token is only used server-side (proxy and
build-time feed generation) and is never shipped to the client.

## Scripts

| Script                   | What it does                                            |
| ------------------------ | ------------------------------------------------------- |
| `npm run dev`            | Vite dev server                                         |
| `npm run build`          | `tsc` then `vite build` (includes prerender plugin)     |
| `npm run preview`        | Serve the production build locally                      |
| `npm run typecheck`      | `tsc --noEmit`                                          |
| `npm run lint`           | ESLint                                                  |
| `npm run format`         | Prettier write                                          |
| `npm run format:check`   | Prettier check (used in CI)                             |
| `npm run licenses:sync`  | Regenerate `src/generated/licenses.json` from lockfiles |
| `npm run licenses:check` | Verify the license inventory is in sync                 |

## How it works

```
src/
  main.ts            Routing, boot, page-level init
  render.ts          Route -> page markup
  routes.ts          Route manifest (paths, SEO meta, sitemap)
  site.ts            Site-wide constants (origin, repo, contact)
  structured-data.ts Per-page JSON-LD graph builder
  animations.ts      Motion in-view animations
  style.css          Tailwind v4 + self-hosted variable fonts
  components/        Navbar, hero, features, specs, contributors,
                     downloads, release notes, legal/content pages, footer
  api/github.ts      GitHub API client (charts, markdown, releases)
  generated/         licenses.json (generated, do not edit by hand)
api/
  github-proxy.ts    Serverless proxy for the GitHub API
prerender.ts         Vite plugin: static HTML for every route, sitemap,
                     Atom feed, per-page JSON-LD, 404 page
scripts/
  sync-licenses.mjs  License inventory generator
public/              Static assets, 500 page, robots.txt, security.txt
```

### Data and proxy

The site reads releases, contributors and commit data from GitHub through
`api/github-proxy.ts`. The proxy is GET-only, validates paths and query
parameters against allowlists, blocks known scrapers, applies a per-IP rate
limit and locks CORS to the production origin. Responses are cached in
`localStorage` for 10 minutes to keep API traffic low.

### Build-time generation

`prerender.ts` renders all routes to static HTML, injects per-page metadata and
JSON-LD, writes `dist/sitemap.xml`, generates an Atom feed at `/feed.xml` from
GitHub releases (falling back to a valid empty feed if the API is
unreachable), and emits `dist/404.html`.

## Deployment

Deployed on Vercel from `main`. `vercel.json` defines long-lived caching for
hashed assets and security headers (HSTS, CSP, COOP/CORP, Referrer-Policy,
Permissions-Policy) on every route. The GitHub proxy runs as a serverless
function. There is no SPA catch-all rewrite: every valid path is prerendered,
and anything else gets a real 404.

CI (`.github/workflows/ci.yml`) runs `format:check`, `lint`, `typecheck` and
`build` on every push and pull request.

## License

MIT — see [LICENSE](LICENSE) and the [/licenses](https://flick-player.site/licenses)
page for third-party notices.

## Security

See [SECURITY.md](SECURITY.md) for the security policy and implemented
controls.
