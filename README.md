# Rajeev Joshi — Portfolio Site

Personal portfolio for Rajeev Joshi, Principal ML Engineer. A static Astro site with React islands for interactive pieces (view-mode toggle, hero terminal, animated backgrounds).

**Live site:** https://rj-1234.github.io

## Tech stack

- [Astro](https://astro.build) (static output) with [React](https://react.dev) islands
- [Tailwind CSS v4](https://tailwindcss.com)
- [GSAP](https://gsap.com) / [Motion](https://motion.dev) for animation
- [Vanta](https://www.vantajs.com) / [Three.js](https://threejs.org) for section background effects
- [nanostores](https://github.com/nanostores/nanostores) for cross-island state (the executive/technical view toggle)

## Getting started

Requires Node >= 22.12.0.

```sh
npm install
npm run dev
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Astro dev server |
| `npm run build` | Type-check + build the static site to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run the vitest suite (`tests/`) |
| `npm run typecheck` | Run `astro check` |

## Project structure

```
src/
  components/            Page sections (Hero, MetricsDashboard, TechDepth, Timeline, Contact, ...)
  components/backgrounds/  Per-section animated backgrounds (mostly Vanta wrappers, one custom Three.js scene)
  lib/                   Shared logic: view-mode store, content constants, animation helpers, Vanta loader, syntax highlighter
  pages/                 Astro routes
  styles/                Global CSS / Tailwind theme
tests/                   Vitest specs, mirroring src/lib/
```

## Architecture notes

- **Executive / technical view toggle** — a single `nanostores` atom (`src/lib/store.ts`) holds the current view mode. Any island that needs to react to it reads it via `useStore()` from `@nanostores/react`; there's no React context, since islands are otherwise isolated React roots.
- **Section backgrounds** — each page section has a matching `src/components/backgrounds/*Bg.tsx` component. Most are thin wrappers around a Vanta effect loaded lazily through `src/lib/vanta-loader.ts`. The Contact section instead uses a bespoke Three.js particle scene (`ContactBg.tsx`) for an effect Vanta doesn't offer.

## Testing & CI

`npm run test` and `npm run typecheck` both run in CI (`.github/workflows/deploy.yml`) before every deploy — a failing test or type error blocks the build.

## Deployment

Pushing to `master` triggers `.github/workflows/deploy.yml`, which installs, tests, builds, and publishes `dist/` to GitHub Pages. `.github/workflows/undeploy.yml` is a manual, on-demand workflow to take the site down.

## Content & design source docs

This repo's actual content and visual system are defined in a few docs outside the source tree, kept for reference during development (not tracked in git — see `.gitignore`):

- `CONTENT_DATA.md` — factual content (bio, project case studies, timeline, skills, publications, terminal code snippets)
- `DESIGN.md` — the visual design system (colors, typography, component specs)
- `BUILD_INSTRUCTIONS.md` — the original build plan (stack, file structure, component behaviors)
