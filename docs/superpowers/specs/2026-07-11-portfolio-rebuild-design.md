# Portfolio Rebuild — Design

## Context

The previous Jekyll-based site in this repo (`rj-1234.github.io`) has been deleted from the working tree. The user designed a replacement portfolio on a separate machine using Claude, and produced three spec documents there. Those specs were transferred to this repo as WhatsApp screenshots (`content_data/`, `build_instructions/`, 22 images total) and transcribed here into:

- [`CONTENT_DATA.md`](../../../CONTENT_DATA.md) — all factual content (personal info, metrics, 5 project case studies, career timeline, skills, publications, 6 terminal code snippets), verbatim, not to be invented or altered.
- [`BUILD_INSTRUCTIONS.md`](../../../BUILD_INSTRUCTIONS.md) — how to build: stack, file structure, component behaviors, animation specs, deployment.
- [`DESIGN.md`](../../../DESIGN.md) — visual design system (Anthropic/Claude.com-style: cream canvas, coral CTAs, dark navy product-mockup surfaces, Copernicus/StyreneB type with Cormorant Garamond/Inter substitutes). Added directly as a file (not screenshots) after the other two were transcribed.

These three files are the source of truth. This design doc records how they combine into a build plan and the two decisions made to resolve gaps between them; it does not restate their content.

## Architecture

**Stack**: Astro (static output, `output: 'static'`) with React islands, Tailwind v4 (`@tailwindcss/vite`, tokens in `@theme` in `global.css`, no `tailwind.config.js`), GSAP + Lenis for scroll-linked animation, Vanta.js (pinned to `three@0.134.0`) for per-section WebGL backgrounds, `@lottiefiles/dotlottie-react` for the executive/technical view-toggle mascot.

**Cross-island state**: Astro islands are isolated React roots. A `nanostores` atom (`viewStore`, `src/lib/store.ts`) holds `'executive' | 'technical'` and is read via `useStore()` in every island that needs to react to the toggle.

**Section flow** (`src/pages/index.astro`): Hero → MetricsDashboard → ProjectsGrid → TechDepth → Timeline → Publications → Contact, alternating cream (`#faf9f5`) and card (`#efe9de`) backgrounds, each with a distinct Vanta effect (BIRDS, CLOUDS, NET, DOTS, WAVES, CELLS respectively) per the table in `BUILD_INSTRUCTIONS.md` §9.

**Centerpiece component**: `HeroTerminal.tsx` — a draggable, resizable, diagonally-stacked deck of 6 terminal cards (real code snippets from `CONTENT_DATA.md`), auto-cycling on load and click-to-cycle thereafter, with inline syntax highlighting and a simulated "Run" output for snippets that have a `runLabel`. This is the most complex component per `BUILD_INSTRUCTIONS.md` §6 and gets built/verified first among the interactive pieces.

**Design tokens**: `DESIGN.md`'s YAML frontmatter (colors, typography scale, spacing, radii, component specs) maps directly into the Tailwind v4 `@theme` block. Copernicus/StyreneB (licensed Anthropic faces, unavailable) are substituted with Cormorant Garamond Variable / Inter Variable per `BUILD_INSTRUCTIONS.md` §2, which already anticipated this substitution — no conflict between the two docs.

## Decisions

1. **Deployment**: GitHub Pages source is already set to "GitHub Actions" on this repo (confirmed by user). Proceed with the `.github/workflows/deploy.yml` described in `BUILD_INSTRUCTIONS.md` §12 (Node 22, `astro build`, `upload-pages-artifact`, `deploy-pages`).
2. **Resume file**: The spec's file checklist names `public/assets/RajeevJoshi-Resume.pdf`; the actual file in the repo is `Rajeev_Joshi_Resume.pdf`. Keep the existing file as-is (no rename), move it to `public/assets/`, and point the Contact section's resume link at its real filename.

## Testing / Verification

- `npm run build` must succeed with no type errors before considering any milestone done.
- Dev server checked in-browser for: hero terminal drag/resize/cycle/run behavior, executive↔technical view toggle (content swap + Vanta resize), section scroll-slide transitions, responsive collapse at the documented breakpoints (mobile <768px, tablet 768–1024px).
- `prefers-reduced-motion` verified to disable Vanta backgrounds and GSAP animation durations.
- Final GitHub Pages deploy verified live after push to main.

## Out of scope

- Rewriting or fact-checking the content in `CONTENT_DATA.md` — it's used verbatim.
- Any work-computer/proprietary material — none was included in the transferred spec, and none should be added.
