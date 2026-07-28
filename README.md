# Flick

Marketing site for [Flick](https://github.com/imsosleepy/flick), a high-performance audiophile music player for Android.

## Stack

Vanilla TypeScript SPA — no framework. Built with Vite, styled with Tailwind CSS v4, animated with Motion.

## Getting started

```bash
npm install
npm run dev        # dev server on :3000
npm run build      # tsc + vite build + prerender
npm run preview    # serve production build locally
```

Copy `.env.example` to `.env` and set `GITHUB_TOKEN` to raise GitHub API rate limits (optional).

## How it works

Client-side routing via `pushState`. Three pages: Home, Downloads, Release Notes. All routes are prerendered at build time to static HTML for SEO. GitHub data (releases, contributors, stats) is fetched through a serverless proxy at `api/github-proxy.ts` with rate limiting and bot blocking.

## Project structure

```
src/
  main.ts              # routing, boot, meta
  render.ts            # route → HTML mapping
  animations.ts        # scroll-triggered Motion animations
  style.css            # Tailwind + Google Fonts
  api/github.ts        # GitHub API client, charts, markdown, tracking
  components/          # navbar, hero, features, specs, downloads-page, release-notes-page, footer
api/
  github-proxy.ts      # Vercel serverless proxy for GitHub API
prerender.ts           # Vite plugin for build-time SSR
vercel.json            # headers, caching, SPA rewrites
```

## Deploy

Deployed on Vercel. Static assets cached for 1 year. The API proxy runs as a serverless function.
