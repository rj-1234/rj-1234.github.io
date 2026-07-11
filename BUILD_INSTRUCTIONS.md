# Build Instructions — Portfolio Reproduction Guide

Use this document + `CONTENT_DATA.md` + `DESIGN.md` to fully rebuild this portfolio. This describes HOW to build; CONTENT_DATA has WHAT content to use; DESIGN.md has the visual design system spec.

> **Note:** `DESIGN.md` was referenced by the original spec but was not among the screenshots provided, so it is not yet reconstructed in this repo. Colors, fonts, and a few spacing/utility values that appear directly in this document below are transcribed verbatim; anything else DESIGN.md would define (full type scale, spacing scale, shadows, button variants, etc.) still needs to be sourced or re-derived.

## 1. Project Setup

```
npm create astro@latest . -- --template minimal --install --no-git
npm install @astrojs/react react react-dom @types/react @types/react-dom tailwindcss @tailwindcss/vite gsap motion lenis nanostores @nanostores/react @fontsource-variable/inter @fontsource-variable/cormorant-garamond @astrojs/sitemap @lottiefiles/dotlottie-react three@0.134.0 vanta
```

### Critical Dependency Rules

- Three.js MUST be v0.134.0 — Vanta.js uses `PlaneBufferGeometry` and `VertexColors` which were removed in newer versions
- Do NOT install `@react-three/fiber` or `@react-three/drei` — incompatible with Three r134
- Motion v12+ uses import path `motion/react` (not `framer-motion`)
- Tailwind v4 uses `@tailwindcss/vite` plugin, NOT `@astrojs/tailwind` (that's v3)
- Vanta modules must be excluded from Vite optimizeDeps — they're UMD and break under ESM optimization

### astro.config.mjs

- `output: 'static'`
- `integrations: [react(), sitemap()]`
- `vite.plugins: [tailwindcss()]`
- `vite.optimizeDeps.include: ['three']`
- `vite.optimizeDeps.exclude: ['vanta/dist/vanta.birds.min', 'vanta/dist/vanta.net.min', 'vanta/dist/vanta.clouds.min', 'vanta/dist/vanta.dots.min', 'vanta/dist/vanta.waves.min', 'vanta/dist/vanta.cells.min']`

## 2. Design System (Tailwind v4 @theme)

See `DESIGN.md` for the full spec. Key mapping to Tailwind:

- All tokens in `@theme {}` block inside `src/styles/global.css` (no tailwind.config.js)
- Import fonts: `@import "@fontsource-variable/inter/index.css"` and `@import "@fontsource-variable/cormorant-garamond/index.css"`
- `--font-display` = Cormorant Garamond Variable (for h1/h2 headings)
- `--font-sans` = Inter Variable (body, nav, buttons)
- Canvas background on `html`, NOT `body`
- No `color-scheme: dark` — this is a light/cream theme
- Utility class `.font-display` maps to `font-family: var(--font-display); font-weight: 400`
- All section headings use `font-display tracking-[-1px]` (negative letter-spacing, weight 400, never bold)

## 3. Architecture Overview

### File Structure

```
src/
├── styles/global.css        (Tailwind v4 @theme tokens + utilities)
├── layouts/Layout.astro     (shell: grain overlay, nav, toggle, lenis)
├── pages/index.astro        (composes all sections)
├── lib/
│   ├── constants.ts         (ALL content data — copy from CONTENT_DATA.md)
│   ├── store.ts             (nanostores atom: 'executive' | 'technical')
│   ├── animations.ts        (GSAP: hero entry, section reveals, timeline, section slides)
│   └── vanta-loader.ts      (sets window.THREE before importing Vanta modules)
└── components/
    ├── [section components]
    ├── [utility components]
    └── backgrounds/[Vanta wrappers]
```

### Island Hydration Strategy

| Component | Directive | Reason |
|---|---|---|
| Navigation | `client:load` | Must be interactive immediately (above fold) |
| FloatingViewToggle | `client:load` | Always visible, needs Lottie |
| ViewToggleHint | `client:load` | Shows 2.5s after load |
| LenisProvider | `client:load` | Initializes smooth scroll + GSAP |
| HeroTerminal | `client:load` | Above fold, interactive card stack |
| MetricsDashboard | `client:visible` | Below fold |
| ProjectsGrid | `client:visible` | Below fold |
| TechDepth | `client:visible` | Below fold |
| All Vanta backgrounds | `client:visible` | Lazy-load heavy WebGL |

### Cross-Island State

Astro islands are isolated React roots — they CANNOT share React context. Use `nanostores`:

- `src/lib/store.ts` exports `viewStore = atom<'executive' | 'technical'>('executive')`
- Any island reads with `useStore(viewStore)` from `@nanostores/react`

## 4. Section Layout & Scroll Transitions

### Section Order (in index.astro)

Hero → MetricsDashboard → ProjectsGrid → TechDepth → Timeline → Publications → Contact

### Alternating Surfaces

- Hero: cream canvas (default `#faf9f5`)
- Metrics: `bg-surface-1` (`#efe9de`)
- Projects: cream canvas
- Skills: `bg-surface-1`
- Timeline: cream canvas
- Publications: `bg-surface-1`
- Contact: cream canvas

### GSAP Section Slides

Every section except Contact has `data-slide` attribute. Content wrapper has `data-slide-inner`.

Animation (in `animations.ts` → `createSectionSlides()`):

1. Get all `[data-slide]` panels, pop the last
2. For each: measure if content > viewport height
3. If taller: add marginBottom, create fake-scroll tween (`yPercent: -100, y: windowHeight`)
4. Pin section, scrub through: fake-scroll → scale 1→0.7 + opacity→0.5 → opacity→0
5. Uses `pinSpacing: false`

### Lenis + GSAP Bridge (in `animations.ts` → `initLenisGSAP()`)

```
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add(time => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```

## 5. Hero Section

Two-column grid: `lg:grid-cols-[1fr_1fr]`. Left = text, Right = terminal card stack.

Left column: role badge (pill with pulse dot), h1 (font-display), subtitle, stats line, two CTA buttons (coral primary + ghost secondary).

Right column: `<HeroTerminal client:load />` — the interactive card stack.

## 6. Terminal Card Stack (HeroTerminal.tsx)

This is the most complex component. Key behaviors:

### Card Stacking (GSAP Flip-style)

- All 6 terminal snippets render simultaneously
- Cards stack diagonally: each card behind offset +14px right, +14px down
- Front card (top of stack) = last element in render order (highest z-index)
- Non-active cards render only a 44px header bar (traffic lights + filename) — NO code content visible behind

### Click to Cycle

- Click anywhere on the stack → top card animates out (`yPercent: 8, xPercent: -8, opacity: 0`, ease: expo.out, 350ms)
- Card order rotates: top card moves to back
- Guards: `isAnimating`, `isDragging`, `isResizing` all prevent cycle

### Auto-flip on Load

- Initial delay: 4 seconds
- Subsequent flips: 2 seconds
- Stops when reaching first snippet with a non-empty `runLabel` (inference_gateway.py has empty runLabel = display-only)
- Initial order is reversed so inference_gateway.py shows first

### Draggable (Motion)

- `drag` prop on the outer `motion.div`
- Constraints: the entire `#hero` section (grabbed via `document.getElementById('hero')`)
- `dragListener={!isResizingState}` — uses STATE (not ref) so re-render disables drag during resize
- `dragScale` spring for slight scale-up on drag

### Resizable (diagonal proportional)

- L-shaped SVG handle at bottom-right corner: `<path d="M 40 16 L 40 30 Q 40 40 30 40 L 16 40" stroke="#cc785c" strokeWidth="5" />`
- Only the stroke is interactive: `style={{ pointerEvents: 'stroke' }}` on path, `pointerEvents: 'none'` on SVG and wrapper div
- Resize uses `transform: scale()` via `combinedScale = useTransform(dragScale, d => d * sizeScale)`
- Min scale: 0.6, Max scale: 1.2
- `transformOrigin: 'top right'` — anchors to right side of grid column
- `isResizingState` (useState) triggers re-render to disable dragListener
- `isResizingRef` (useRef) for synchronous guards in event handlers

### Syntax Highlighting (inline, no library)

- Python: keywords → `text-purple-400`, class names → `text-yellow-300`, function names → `text-blue-300`, strings → `text-green-300`, booleans/numbers → `text-orange-300`, self → `text-red-300/70`, comments → `text-[#a09d96]`
- Bash: commands → `text-yellow-300`, flags → `text-blue-300`, strings → `text-green-300`, $variables → `text-orange-300`
- Detection: lines starting with `#` = comment; lines containing `kubectl`/`--`/`#!` = bash; else = python

### Run Button

- Below code content (not absolute positioned)
- Only shows when card `isActive` and snippet has `runLabel`
- States: idle (coral circle, play icon) → running (spinner) → complete (green checkmark, resets on click)
- Output lines stagger in based on each line's `delay` property
- "Completed in Xms" badge after all lines
- `e.stopPropagation()` prevents triggering card cycle

## 7. Floating View Toggle (FloatingViewToggle.tsx)

- Lottie cat animations inside a draggable 80x80 circle
- Executive cat URL: `https://lottie.host/58d96d9b-94ca-4503-8922-08592d82d30f/L0toD2hoxg.lottie`
- Technical cat URL: `https://lottie.host/b4f060c0-c0d0-4ba5-9ea5-c48b0b90f09d/V7t826i9my.lottie`
- Uses `@lottiefiles/dotlottie-react` `<DotLottieReact>` component
- Fixed `bottom-6 right-6`, z-index 60
- Background: `bg-surface-1` (cream card tone)
- Click toggles `viewStore` between 'executive' and 'technical'
- Drag constrained to full viewport
- "Exec"/"Tech" label below, "click me · drag me" hint that disappears after first interaction
- Slight rotation on drag via `useTransform(x, [-200, 200], [-12, 12])`

## 8. View Toggle Hint (ViewToggleHint.tsx)

- Fixed tooltip at `bottom-[70px] right-6`
- Shows 2.5s after load (if not mobile, if not previously dismissed)
- Auto-dismisses after 7s
- Persists dismissal to `localStorage('portfolio-hint-dismissed')`
- Hidden on mobile (< 768px)
- Arrow pointing down toward floating toggle
- Motion AnimatePresence fade in/out

## 9. Section Backgrounds (Vanta.js)

### Vanta Loader Pattern (`src/lib/vanta-loader.ts`)

```
import * as THREE from 'three';
function ensureThree() { window.THREE = THREE; }
export async function loadBirds() { ensureThree(); await import('vanta/dist/vanta.birds.min'); return window.VANTA.BIRDS; }
// Same pattern for: loadNet, loadClouds, loadDots, loadWaves, loadCells
```

### Per-Section Assignment

| Section | Effect | Background color | Accent color | Opacity |
|---|---|---|---|---|
| Hero | BIRDS | 0xfaf9f5 | color1: 0xcc785c, color2: 0xe8a55a | 60% |
| Metrics | CLOUDS | 0xefe9de | cloudColor: 0xcc785c, sun/shadow: 0xe8a55a | 40% |
| Projects | NET | 0xfaf9f5 | color: 0xcc785c | 30% |
| Skills | DOTS | 0xefe9de | color: 0xcc785c, color2: 0xe8a55a, size: 3, showLines: false | 35% |
| Timeline | WAVES | 0xfaf9f5 | color: 0xe6dfd8, shininess: 85, waveHeight: 15, waveSpeed: 1.45 | 50% |
| Publications | CELLS | 0xefe9de | color1: 0xcc785c, color2: 0xe8a55a, size: 0.8, speed: 0.4 | 30% |

### MetricsBg Special: Resize on View Toggle

MetricsBg listens to `viewStore` and calls `effectRef.current.resize()` at 150ms, 500ms, and 1000ms after toggle (section height changes when metrics expand).

### Common Pattern (each background component)

- `client:visible` hydration
- Check `prefers-reduced-motion` — return null if reduced
- Async load effect via vanta-loader
- Render div: `absolute inset-0 pointer-events-none z-0 opacity-{X}`
- Cleanup: `effectRef.current.destroy()` on unmount

## 10. Other Sections (Brief)

### MetricsDashboard

- Bento grid (1/2/4 columns responsive), animated counters via requestAnimationFrame
- Executive view: 4 metrics. Technical: all 8 with detail text expansion
- Cards: `bg-surface-0` on `bg-surface-1` section for contrast

### ProjectsGrid + ProjectCard

- Domain filter pills (All, AI/ML, Infrastructure, Platform, Privacy)
- Cards: collapsed (title, tagline, domains, headline metric) + expandable (problem, approach, architecture, impact)
- Executive shows execSummary. Technical: shows tech stack + expand button
- Motion AnimatePresence for expand/collapse

### TechDepth

- Left: skill categories with filterable chips (click category to highlight)
- Right (Technical view only): architecture patterns cards with descriptions and tags

### Timeline

- Vertical line with alternating left/right cards (desktop), left-aligned (mobile)
- Each node: period, role, company, highlights, compounding theme
- GSAP `createTimelineAnimation()`: cards slide in from alternating sides on scroll

### Publications

- IEEE citation card (link to ieeexplore), awards with icons, mentorship grid

### Contact

- Centered: heading, subtitle, LinkedIn/GitHub/Resume buttons
- "Malvern, PA · Open to remote"

## 11. CSS Utilities & Ambient Effects

In `global.css`:

- `.container-main`: max-width 1200px, auto margin, 1.5rem padding
- `.section-padding`: padding-block 96px
- `.glass`: cream at 80% + backdrop-blur 12px + hairline border
- `.font-display`: serif font family at weight 400
- `[data-slide]`: border-radius 12px, transform-origin center, will-change transform/opacity
- `.ambient-grain`: fixed SVG noise overlay, opacity 0.015, mix-blend-mode multiply
- `.ambient-orb-*`: CSS-only fallback gradient orbs (kept but mostly superseded by Vanta)
- `@media (prefers-reduced-motion)`: kills all animation/transition durations

## 12. Deployment

`.github/workflows/deploy.yml`:

- Triggers on push to main + workflow_dispatch
- Node 22, npm ci, astro build, upload-pages-artifact, deploy-pages
- Permissions: contents read, pages write, id-token write

## 13. Files Checklist

After building, you should have these files:

- Config: package.json, astro.config.mjs, tsconfig.json, .gitignore
- Deploy: .github/workflows/deploy.yml
- Public: favicon.svg, robots.txt, assets/RajeevJoshi-Resume.pdf
- Styles: src/styles/global.css
- Layout: src/layouts/Layout.astro, src/pages/index.astro
- Lib: src/lib/constants.ts, store.ts, animations.ts, vanta-loader.ts
- Components: Hero.astro, HeroTerminal.tsx, Navigation.astro, MetricsDashboard.tsx, ProjectsGrid.tsx, ProjectCard.tsx, TechDepth.tsx, Timeline.astro, Publications.astro, Contact.astro, LenisProvider.tsx, FloatingViewToggle.tsx, ViewToggleHint.tsx, AmbientBackground.astro
- Backgrounds: backgrounds/HeroBg.tsx, MetricsBg.tsx, ProjectsBg.tsx, SkillsBg.tsx, TimelineBg.tsx, PublicationsBg.tsx
