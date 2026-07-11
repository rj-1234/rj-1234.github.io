# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `rj-1234.github.io` from scratch as a static Astro + React portfolio site matching the specs in `CONTENT_DATA.md`, `BUILD_INSTRUCTIONS.md`, and `DESIGN.md`, deployed via GitHub Pages (Actions source, already enabled).

**Architecture:** Astro static site (`output: 'static'`) with React islands for interactive pieces (terminal card stack, view toggle, dashboards), Tailwind v4 tokens driving a cream/coral/dark-navy design system, GSAP+Lenis for scroll choreography, Vanta.js for per-section WebGL backgrounds, nanostores for cross-island state.

**Tech Stack:** Astro, React 18, TypeScript, Tailwind v4 (`@tailwindcss/vite`), GSAP + ScrollTrigger, Lenis, `motion` (v12, `motion/react` import path), `three@0.134.0`, `vanta`, `@lottiefiles/dotlottie-react`, `nanostores` + `@nanostores/react`, `@fontsource-variable/inter`, `@fontsource-variable/cormorant-garamond`, Vitest (pure-logic unit tests only — see note below).

## Global Constraints

- Three.js MUST be pinned to `0.134.0` — Vanta.js uses `PlaneBufferGeometry` and `VertexColors`, removed in later Three versions.
- Do NOT install `@react-three/fiber` or `@react-three/drei` — incompatible with Three r134.
- `motion` v12+ imports from `motion/react`, not `framer-motion`.
- Tailwind v4 uses the `@tailwindcss/vite` plugin, NOT `@astrojs/tailwind`. All design tokens live in an `@theme {}` block in `src/styles/global.css` — no `tailwind.config.js`.
- Vanta modules must be listed in `vite.optimizeDeps.exclude` (they're UMD and break under ESM pre-bundling); `three` must be in `vite.optimizeDeps.include`.
- All copy (metrics, project descriptions, timeline, skills, terminal code, publications, contact info) comes verbatim from `CONTENT_DATA.md` — never rephrase or invent facts.
- Copernicus/StyreneB (licensed Anthropic fonts named in `DESIGN.md`) are unavailable — substitute Cormorant Garamond Variable (display) and Inter Variable (body/sans), per `BUILD_INSTRUCTIONS.md` §2. `DESIGN.md`'s JetBrains Mono for code blocks is not in the approved install list — substitute the system `ui-monospace` stack instead of adding a new font dependency.
- Canvas background goes on `html`, not `body`. No `color-scheme: dark` — this is a light/cream theme only.
- Resume file is `Rajeev_Joshi_Resume.pdf` (existing filename kept, not renamed to the spec's `RajeevJoshi-Resume.pdf`).
- `prefers-reduced-motion` must disable Vanta backgrounds (component returns `null`) and zero out animation/transition durations in CSS.
- **Testing note:** this is a content/presentation site with no server logic. Vitest unit tests are used only for the handful of pure, extractable functions (data shape, syntax-highlight classification, card-stack/counter math, view-store transitions) where TDD adds real value. Visual/interactive component behavior (drag, resize, Vanta rendering, GSAP scroll choreography) is verified by building and driving the dev server in-browser per the plan's final verification task, not by component/unit tests — jsdom cannot meaningfully exercise WebGL or pointer-drag physics.

---

## File Structure

```
package.json
astro.config.mjs
tsconfig.json
vitest.config.ts
public/
  favicon.svg
  robots.txt
  assets/Rajeev_Joshi_Resume.pdf
src/
  styles/global.css              # Tailwind v4 @theme tokens + utility classes
  layouts/Layout.astro            # <html>/<head> shell, fonts, grain overlay, nav, Lenis
  pages/index.astro               # composes all sections in order
  lib/
    constants.ts                  # ALL content data (from CONTENT_DATA.md), typed
    store.ts                      # nanostores viewStore ('executive' | 'technical')
    vanta-loader.ts                # lazy Vanta effect loaders, sets window.THREE first
    syntax-highlight.ts            # pure: classify code line -> token spans
    hero-terminal-logic.ts         # pure: stack ordering, offsets, auto-flip stop rule
    counter-animation.ts           # pure: eased counter progress math
    animations.ts                  # GSAP: Lenis bridge, section slides, timeline reveal
  components/
    Navigation.tsx
    Hero.astro
    HeroTerminal.tsx
    FloatingViewToggle.tsx
    ViewToggleHint.tsx
    MetricsDashboard.tsx
    ProjectsGrid.tsx
    ProjectCard.tsx
    TechDepth.tsx
    Timeline.astro
    Publications.astro
    Contact.astro
    LenisProvider.tsx
    AmbientBackground.astro
    backgrounds/
      HeroBg.tsx
      MetricsBg.tsx
      ProjectsBg.tsx
      SkillsBg.tsx
      TimelineBg.tsx
      PublicationsBg.tsx
.github/workflows/deploy.yml
tests/
  constants.test.ts
  store.test.ts
  syntax-highlight.test.ts
  hero-terminal-logic.test.ts
  counter-animation.test.ts
```

---

### Task 1: Project Scaffold, Dependencies, and Config

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`

**Interfaces:**
- Produces: a buildable, empty Astro project (`npm run build` succeeds) that later tasks add pages/components/styles into.

- [ ] **Step 1: Scaffold Astro**

```bash
npm create astro@latest . -- --template minimal --install --no-git
```

- [ ] **Step 2: Install exact dependencies**

```bash
npm install @astrojs/react react react-dom @types/react @types/react-dom tailwindcss @tailwindcss/vite gsap motion lenis nanostores @nanostores/react @fontsource-variable/inter @fontsource-variable/cormorant-garamond @astrojs/sitemap @lottiefiles/dotlottie-react three@0.134.0 vanta
npm install -D vitest
```

- [ ] **Step 3: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://rj-1234.github.io',
  output: 'static',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ['three'],
      exclude: [
        'vanta/dist/vanta.birds.min',
        'vanta/dist/vanta.net.min',
        'vanta/dist/vanta.clouds.min',
        'vanta/dist/vanta.dots.min',
        'vanta/dist/vanta.waves.min',
        'vanta/dist/vanta.cells.min',
      ],
    },
  },
});
```

- [ ] **Step 4: Write `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Add test script to `package.json`**

Add to `"scripts"`: `"test": "vitest run"`.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: exits 0, `dist/` created.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts src public
git commit -m "chore: scaffold Astro project with React, Tailwind v4, and pinned Three/Vanta deps"
```

---

### Task 2: Design Tokens (`src/styles/global.css`)

**Files:**
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: Tailwind utilities `bg-canvas`, `bg-surface-0`, `bg-surface-1`, `bg-primary`, `text-ink`, `text-body`, `text-muted`, `border-hairline`, `font-display`, `font-sans`, `rounded-{xs,sm,md,lg,xl,pill}`, and composed classes `.text-display-xl/lg/md/sm`, `.text-title-lg/md/sm`, `.text-body-md/sm`, `.text-caption`, `.text-caption-uppercase`, `.container-main`, `.section-padding`, `.glass`, `.ambient-grain`, `[data-slide]`.

- [ ] **Step 1: Write global.css**

```css
@import "tailwindcss";
@import "@fontsource-variable/inter/index.css";
@import "@fontsource-variable/cormorant-garamond/index.css";

@theme {
  /* Colors — from DESIGN.md */
  --color-canvas: #faf9f5;
  --color-surface-0: #faf9f5;
  --color-surface-1: #efe9de;
  --color-surface-soft: #f5f0e8;
  --color-surface-cream-strong: #e8e0d2;
  --color-surface-dark: #181715;
  --color-surface-dark-elevated: #252320;
  --color-surface-dark-soft: #1f1e1b;
  --color-primary: #cc785c;
  --color-primary-active: #a9583e;
  --color-primary-disabled: #e6dfd8;
  --color-ink: #141413;
  --color-body: #3d3d3a;
  --color-body-strong: #252523;
  --color-muted: #6c6a64;
  --color-muted-soft: #8e8b82;
  --color-hairline: #e6dfd8;
  --color-hairline-soft: #ebe6df;
  --color-on-primary: #ffffff;
  --color-on-dark: #faf9f5;
  --color-on-dark-soft: #a09d96;
  --color-accent-teal: #5db8a6;
  --color-accent-amber: #e8a55a;
  --color-success: #5db872;
  --color-warning: #d4a017;
  --color-error: #c64545;

  /* Fonts */
  --font-display: "Cormorant Garamond Variable", "Times New Roman", serif;
  --font-sans: "Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;

  /* Radius */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  /* Spacing extension */
  --spacing-section: 96px;
}

html {
  background-color: var(--color-canvas);
  font-family: var(--font-sans);
  color: var(--color-ink);
}

body {
  margin: 0;
}

.font-display {
  font-family: var(--font-display);
  font-weight: 400;
}

.text-display-xl { font-family: var(--font-display); font-weight: 400; font-size: 64px; line-height: 1.05; letter-spacing: -1.5px; }
.text-display-lg { font-family: var(--font-display); font-weight: 400; font-size: 48px; line-height: 1.1; letter-spacing: -1px; }
.text-display-md { font-family: var(--font-display); font-weight: 400; font-size: 36px; line-height: 1.15; letter-spacing: -0.5px; }
.text-display-sm { font-family: var(--font-display); font-weight: 400; font-size: 28px; line-height: 1.2; letter-spacing: -0.3px; }
.text-title-lg { font-family: var(--font-sans); font-weight: 500; font-size: 22px; line-height: 1.3; }
.text-title-md { font-family: var(--font-sans); font-weight: 500; font-size: 18px; line-height: 1.4; }
.text-title-sm { font-family: var(--font-sans); font-weight: 500; font-size: 16px; line-height: 1.4; }
.text-body-md { font-family: var(--font-sans); font-weight: 400; font-size: 16px; line-height: 1.55; }
.text-body-sm { font-family: var(--font-sans); font-weight: 400; font-size: 14px; line-height: 1.55; }
.text-caption { font-family: var(--font-sans); font-weight: 500; font-size: 13px; line-height: 1.4; }
.text-caption-uppercase { font-family: var(--font-sans); font-weight: 500; font-size: 12px; line-height: 1.4; letter-spacing: 1.5px; text-transform: uppercase; }
.text-code { font-family: var(--font-mono); font-weight: 400; font-size: 14px; line-height: 1.6; }

.container-main {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.section-padding {
  padding-block: 96px;
}

.glass {
  background-color: color-mix(in srgb, var(--color-canvas) 80%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-hairline);
}

[data-slide] {
  border-radius: var(--radius-lg);
  transform-origin: center;
  will-change: transform, opacity;
}

.ambient-grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.015;
  mix-blend-mode: multiply;
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Import global.css in the (still empty) Layout placeholder**

Create `src/layouts/Layout.astro` temporarily with just:

```astro
---
import '../styles/global.css';
---
<html lang="en"><head><meta charset="utf-8" /></head><body><slot /></body></html>
```

(Task 10 replaces this with the full shell.)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/layouts/Layout.astro
git commit -m "feat: add Tailwind v4 design tokens from DESIGN.md"
```

---

### Task 3: Constants Data

**Files:**
- Create: `src/lib/constants.ts`
- Test: `tests/constants.test.ts`

**Interfaces:**
- Produces: `METRICS: Metric[]`, `PROJECTS: Project[]`, `TIMELINE: TimelineEntry[]`, `SKILLS: SkillCategory[]`, `NAV_ITEMS`, `TERMINAL_SNIPPETS: TerminalSnippet[]`, plus the `Metric`, `Project`, `TimelineEntry`, `SkillCategory`, `TerminalSnippet`, `OutputLine`, `MetricSize` types — all consumed by every later component task.

- [ ] **Step 1: Write the failing test**

```ts
// tests/constants.test.ts
import { describe, it, expect } from 'vitest';
import { METRICS, PROJECTS, TIMELINE, SKILLS, NAV_ITEMS, TERMINAL_SNIPPETS } from '../src/lib/constants';

describe('constants data shape', () => {
  it('has 8 metrics, 4 of them executive', () => {
    expect(METRICS).toHaveLength(8);
    expect(METRICS.filter(m => m.executive)).toHaveLength(4);
  });

  it('has 5 projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(5);
    expect(new Set(PROJECTS.map(p => p.id)).size).toBe(5);
  });

  it('has 4 timeline entries in chronological order ending Present', () => {
    expect(TIMELINE).toHaveLength(4);
    expect(TIMELINE[TIMELINE.length - 1].period).toContain('Present');
  });

  it('has 6 skill categories', () => {
    expect(SKILLS).toHaveLength(6);
  });

  it('has 7 nav items', () => {
    expect(NAV_ITEMS).toHaveLength(7);
  });

  it('has 6 terminal snippets, inference-gateway first with empty runLabel', () => {
    expect(TERMINAL_SNIPPETS).toHaveLength(6);
    expect(TERMINAL_SNIPPETS[0].id).toBe('inference-gateway');
    expect(TERMINAL_SNIPPETS[0].runLabel).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — `src/lib/constants.ts` does not exist.

- [ ] **Step 3: Write `src/lib/constants.ts`**

Copy the entire TypeScript block from [`CONTENT_DATA.md`](../../../CONTENT_DATA.md) §"Constants Data" verbatim (types `MetricSize`, `Metric`, `METRICS`, `Project`, `PROJECTS`, `TimelineEntry`, `TIMELINE`, `SkillCategory`, `SKILLS`, `NAV_ITEMS`, `OutputLine`, `TerminalSnippet`, `TERMINAL_SNIPPETS`) into `src/lib/constants.ts` unmodified — that file is already the authoritative transcription, this step is a direct copy-paste, not a rewrite.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS (6 tests).

- [ ] **Step 5: Typecheck**

Run: `npx astro check` (or `npx tsc --noEmit` if `astro check` isn't configured yet)
Expected: no errors in `constants.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/constants.ts tests/constants.test.ts
git commit -m "feat: add typed content constants from CONTENT_DATA.md"
```

---

### Task 4: View Store

**Files:**
- Create: `src/lib/store.ts`
- Test: `tests/store.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `viewStore: WritableAtom<'executive' | 'technical'>`, `toggleView(): void` — consumed by every component that branches on view (MetricsDashboard, ProjectsGrid, TechDepth, FloatingViewToggle, MetricsBg).

- [ ] **Step 1: Write the failing test**

```ts
// tests/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { viewStore, toggleView } from '../src/lib/store';

describe('viewStore', () => {
  beforeEach(() => viewStore.set('executive'));

  it('defaults to executive', () => {
    expect(viewStore.get()).toBe('executive');
  });

  it('toggleView flips executive -> technical -> executive', () => {
    toggleView();
    expect(viewStore.get()).toBe('technical');
    toggleView();
    expect(viewStore.get()).toBe('executive');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — `src/lib/store.ts` does not exist.

- [ ] **Step 3: Write `src/lib/store.ts`**

```ts
import { atom } from 'nanostores';

export type ViewMode = 'executive' | 'technical';

export const viewStore = atom<ViewMode>('executive');

export function toggleView(): void {
  viewStore.set(viewStore.get() === 'executive' ? 'technical' : 'executive');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS (2 tests, 8 total).

- [ ] **Step 5: Commit**

```bash
git add src/lib/store.ts tests/store.test.ts
git commit -m "feat: add cross-island view-mode store"
```

---

### Task 5: Vanta Loader

**Files:**
- Create: `src/lib/vanta-loader.ts`

**Interfaces:**
- Consumes: nothing at import time (dynamic imports only).
- Produces: `loadBirds`, `loadNet`, `loadClouds`, `loadDots`, `loadWaves`, `loadCells` — each `async () => VantaEffectConstructor`, consumed by the 6 background components in Task 12.

- [ ] **Step 1: Write `src/lib/vanta-loader.ts`**

```ts
import * as THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE;
    VANTA: Record<string, any>;
  }
}

function ensureThree() {
  if (typeof window !== 'undefined') {
    window.THREE = THREE;
  }
}

export async function loadBirds() {
  ensureThree();
  await import('vanta/dist/vanta.birds.min');
  return window.VANTA.BIRDS;
}

export async function loadNet() {
  ensureThree();
  await import('vanta/dist/vanta.net.min');
  return window.VANTA.NET;
}

export async function loadClouds() {
  ensureThree();
  await import('vanta/dist/vanta.clouds.min');
  return window.VANTA.CLOUDS;
}

export async function loadDots() {
  ensureThree();
  await import('vanta/dist/vanta.dots.min');
  return window.VANTA.DOTS;
}

export async function loadWaves() {
  ensureThree();
  await import('vanta/dist/vanta.waves.min');
  return window.VANTA.WAVES;
}

export async function loadCells() {
  ensureThree();
  await import('vanta/dist/vanta.cells.min');
  return window.VANTA.CELLS;
}
```

No unit test here — this module only wires dynamic imports to a browser global; there is no pure logic to assert against in a node test environment. It's exercised by the in-browser verification in the final task.

- [ ] **Step 2: Typecheck**

Run: `npx astro check`
Expected: no errors (the `vanta` package ships no types; if `tsc` complains about missing declarations for `vanta/dist/*.min`, add a `src/vanta.d.ts` with `declare module 'vanta/dist/*.min';`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/vanta-loader.ts src/vanta.d.ts 2>/dev/null; git add src/lib/vanta-loader.ts
git commit -m "feat: add lazy Vanta effect loader with pinned THREE global"
```

---

### Task 6: Syntax Highlighter (pure logic)

**Files:**
- Create: `src/lib/syntax-highlight.ts`
- Test: `tests/syntax-highlight.test.ts`

**Interfaces:**
- Produces: `detectLanguage(line: string): 'python' | 'bash'`, `highlightLine(line: string): { text: string; className: string }[]` — consumed by `HeroTerminal.tsx` (Task 13) to render code with inline color classes instead of a highlighting library.

Per `BUILD_INSTRUCTIONS.md` §6: Python keywords → `text-purple-400`, class names → `text-yellow-300`, function names → `text-blue-300`, strings → `text-green-300`, booleans/numbers → `text-orange-300`, `self` → `text-red-300/70`, comments → `text-[#a09d96]`. Bash: commands → `text-yellow-300`, flags → `text-blue-300`, strings → `text-green-300`, `$variables` → `text-orange-300`. Detection: lines starting with `#` = comment; lines containing `kubectl`/`--`/`#!` = bash; else = python.

- [ ] **Step 1: Write the failing test**

```ts
// tests/syntax-highlight.test.ts
import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../src/lib/syntax-highlight';

describe('detectLanguage', () => {
  it('detects bash from kubectl', () => {
    expect(detectLanguage('kubectl scale deployment/inference-gateway \\')).toBe('bash');
  });

  it('detects bash from shebang', () => {
    expect(detectLanguage('#!/bin/bash')).toBe('bash');
  });

  it('detects bash from a flag', () => {
    expect(detectLanguage('  --replicas=∞ \\')).toBe('bash');
  });

  it('treats a comment line as python by default (not bash) unless it has a bash marker', () => {
    expect(detectLanguage('# Unified Inference Gateway')).toBe('python');
  });

  it('defaults unmatched lines to python', () => {
    expect(detectLanguage('class InferenceGateway:')).toBe('python');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write `src/lib/syntax-highlight.ts`**

```ts
export type Language = 'python' | 'bash';

const BASH_MARKERS = ['kubectl', '#!'];

export function detectLanguage(line: string): Language {
  const trimmed = line.trim();
  if (BASH_MARKERS.some(marker => trimmed.includes(marker))) return 'bash';
  if (/^--\S/.test(trimmed)) return 'bash';
  return 'python';
}

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'import', 'from', 'return', 'if', 'else', 'elif', 'for', 'while',
  'try', 'except', 'with', 'as', 'in', 'is', 'not', 'and', 'or', 'True', 'False', 'None',
]);

interface Token {
  text: string;
  className: string;
}

function highlightPython(line: string): Token[] {
  if (line.trim().startsWith('#')) {
    return [{ text: line, className: 'text-[#a09d96]' }];
  }

  const tokens: Token[] = [];
  const parts = line.split(/(\s+|"[^"]*"|'[^']*'|\b\w+\b|[^\w\s]+)/g).filter(Boolean);

  for (const part of parts) {
    if (/^["'].*["']$/.test(part)) {
      tokens.push({ text: part, className: 'text-green-300' });
    } else if (PYTHON_KEYWORDS.has(part)) {
      tokens.push({ text: part, className: 'text-purple-400' });
    } else if (part === 'self') {
      tokens.push({ text: part, className: 'text-red-300/70' });
    } else if (/^\d+(\.\d+)?$/.test(part)) {
      tokens.push({ text: part, className: 'text-orange-300' });
    } else if (/^[A-Z]\w*$/.test(part)) {
      tokens.push({ text: part, className: 'text-yellow-300' });
    } else if (/^\w+$/.test(part) && /^\w+\s*\(/.test(line.slice(line.indexOf(part)))) {
      tokens.push({ text: part, className: 'text-blue-300' });
    } else {
      tokens.push({ text: part, className: '' });
    }
  }
  return tokens;
}

function highlightBash(line: string): Token[] {
  const tokens: Token[] = [];
  const parts = line.split(/(\s+|"[^"]*"|'[^']*'|\$\w+|--?[\w-]+|\b\w+\b)/g).filter(Boolean);

  let first = true;
  for (const part of parts) {
    if (/^["'].*["']$/.test(part)) {
      tokens.push({ text: part, className: 'text-green-300' });
    } else if (/^\$\w+/.test(part)) {
      tokens.push({ text: part, className: 'text-orange-300' });
    } else if (/^--?[\w-]+/.test(part)) {
      tokens.push({ text: part, className: 'text-blue-300' });
    } else if (first && /^\w+$/.test(part)) {
      tokens.push({ text: part, className: 'text-yellow-300' });
      first = false;
    } else {
      tokens.push({ text: part, className: '' });
    }
    if (!/^\s+$/.test(part)) first = false;
  }
  return tokens;
}

export function highlightLine(line: string): Token[] {
  return detectLanguage(line) === 'bash' ? highlightBash(line) : highlightPython(line);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/syntax-highlight.ts tests/syntax-highlight.test.ts
git commit -m "feat: add pure syntax-highlight classifier for terminal code"
```

---

### Task 7: Hero Terminal Logic (pure logic)

**Files:**
- Create: `src/lib/hero-terminal-logic.ts`
- Test: `tests/hero-terminal-logic.test.ts`

**Interfaces:**
- Consumes: `TerminalSnippet[]` shape from Task 3.
- Produces: `getInitialOrder(ids: string[]): string[]`, `cycleToBack(order: string[]): string[]`, `stackOffset(indexFromTop: number): { x: number; y: number }`, `shouldStopAutoFlip(snippet: { runLabel: string }): boolean`, `clampScale(scale: number): number` — consumed by `HeroTerminal.tsx` (Task 13).

Per `BUILD_INSTRUCTIONS.md` §6: cards stack diagonally, +14px right / +14px down per card behind the front; initial order is reversed so `inference_gateway.py` (index 0 in `TERMINAL_SNIPPETS`) shows first; auto-flip stops at the first snippet with a non-empty `runLabel`; resize scale clamps to [0.6, 1.2].

- [ ] **Step 1: Write the failing test**

```ts
// tests/hero-terminal-logic.test.ts
import { describe, it, expect } from 'vitest';
import { getInitialOrder, cycleToBack, stackOffset, shouldStopAutoFlip, clampScale } from '../src/lib/hero-terminal-logic';

describe('getInitialOrder', () => {
  it('reverses the ids so the first snippet renders on top of the stack', () => {
    expect(getInitialOrder(['a', 'b', 'c'])).toEqual(['c', 'b', 'a']);
  });
});

describe('cycleToBack', () => {
  it('moves the front (last) card to the back (first)', () => {
    expect(cycleToBack(['c', 'b', 'a'])).toEqual(['b', 'a', 'c']);
  });
});

describe('stackOffset', () => {
  it('front card (0 from top) has no offset', () => {
    expect(stackOffset(0)).toEqual({ x: 0, y: 0 });
  });

  it('offsets 14px diagonally per card behind the front', () => {
    expect(stackOffset(1)).toEqual({ x: 14, y: 14 });
    expect(stackOffset(2)).toEqual({ x: 28, y: 28 });
  });
});

describe('shouldStopAutoFlip', () => {
  it('stops on a snippet with a non-empty runLabel', () => {
    expect(shouldStopAutoFlip({ runLabel: 'Run Training' })).toBe(true);
  });

  it('does not stop on a snippet with an empty runLabel', () => {
    expect(shouldStopAutoFlip({ runLabel: '' })).toBe(false);
  });
});

describe('clampScale', () => {
  it('clamps below 0.6 up to 0.6', () => {
    expect(clampScale(0.3)).toBe(0.6);
  });

  it('clamps above 1.2 down to 1.2', () => {
    expect(clampScale(2)).toBe(1.2);
  });

  it('passes through in-range values', () => {
    expect(clampScale(0.9)).toBe(0.9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write `src/lib/hero-terminal-logic.ts`**

```ts
export function getInitialOrder(ids: string[]): string[] {
  return [...ids].reverse();
}

export function cycleToBack(order: string[]): string[] {
  const [front, ...rest] = order.slice().reverse();
  return [...rest.reverse(), front];
}

export function stackOffset(indexFromTop: number): { x: number; y: number } {
  return { x: indexFromTop * 14, y: indexFromTop * 14 };
}

export function shouldStopAutoFlip(snippet: { runLabel: string }): boolean {
  return snippet.runLabel !== '';
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.2;

export function clampScale(scale: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/hero-terminal-logic.ts tests/hero-terminal-logic.test.ts
git commit -m "feat: add pure card-stack ordering/offset/scale logic for hero terminal"
```

---

### Task 8: Counter Animation Logic (pure logic)

**Files:**
- Create: `src/lib/counter-animation.ts`
- Test: `tests/counter-animation.test.ts`

**Interfaces:**
- Produces: `counterValue(elapsedMs: number, durationMs: number, target: number): number` — consumed by `MetricsDashboard.tsx` (Task 15) inside a `requestAnimationFrame` loop.

- [ ] **Step 1: Write the failing test**

```ts
// tests/counter-animation.test.ts
import { describe, it, expect } from 'vitest';
import { counterValue } from '../src/lib/counter-animation';

describe('counterValue', () => {
  it('returns 0 at elapsed=0', () => {
    expect(counterValue(0, 1000, 100)).toBe(0);
  });

  it('returns the target once elapsed >= duration', () => {
    expect(counterValue(1000, 1000, 100)).toBe(100);
    expect(counterValue(2000, 1000, 100)).toBe(100);
  });

  it('eases — value at the midpoint is greater than half the target (ease-out)', () => {
    const mid = counterValue(500, 1000, 100);
    expect(mid).toBeGreaterThan(50);
    expect(mid).toBeLessThan(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Write `src/lib/counter-animation.ts`**

```ts
function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function counterValue(elapsedMs: number, durationMs: number, target: number): number {
  const t = Math.min(1, Math.max(0, elapsedMs / durationMs));
  return easeOutQuad(t) * target;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/counter-animation.ts tests/counter-animation.test.ts
git commit -m "feat: add pure eased counter-animation math"
```

---

### Task 9: GSAP / Lenis Animation Bridge

**Files:**
- Create: `src/lib/animations.ts`

**Interfaces:**
- Consumes: a `Lenis` instance (from Task 11's `LenisProvider`).
- Produces: `initLenisGSAP(lenis: Lenis): void`, `createSectionSlides(): void`, `createTimelineAnimation(): void` — called from `LenisProvider.tsx` (Task 11) and `Timeline.astro` (Task 18).

- [ ] **Step 1: Write `src/lib/animations.ts`**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function initLenisGSAP(lenis: Lenis): void {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function createSectionSlides(): void {
  const panels = gsap.utils.toArray<HTMLElement>('[data-slide]');
  panels.pop(); // last section (Contact) is not pinned/slid

  panels.forEach((panel) => {
    const inner = panel.querySelector<HTMLElement>('[data-slide-inner]');
    if (!inner) return;

    const isTaller = inner.getBoundingClientRect().height > window.innerHeight;
    if (isTaller) {
      panel.style.marginBottom = `${inner.getBoundingClientRect().height - window.innerHeight}px`;
    }

    const fakeScroll = { y: 0 };
    gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: 'top top',
        end: () => `+=${window.innerHeight}`,
        scrub: true,
        pin: true,
        pinSpacing: false,
      },
    })
      .to(fakeScroll, { y: window.innerHeight, yPercent: -100, ease: 'none' }, 0)
      .to(panel, { scale: 0.7, opacity: 0.5, ease: 'none' }, 0)
      .to(panel, { opacity: 0, ease: 'none' }, 0.5);
  });
}

export function createTimelineAnimation(): void {
  const cards = gsap.utils.toArray<HTMLElement>('[data-timeline-card]');
  cards.forEach((card, i) => {
    const fromLeft = i % 2 === 0;
    gsap.from(card, {
      x: fromLeft ? -60 : 60,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
      },
    });
  });
}
```

- [ ] **Step 2: Typecheck**

Run: `npx astro check`
Expected: no errors (if `lenis` ships no default-export types cleanly, adjust the import to `import type { default as Lenis } from 'lenis'` — confirm against the installed package's `.d.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/animations.ts
git commit -m "feat: add GSAP/Lenis scroll animation bridge"
```

---

### Task 10: Layout Shell + Navigation

**Files:**
- Modify: `src/layouts/Layout.astro` (replace the Task 2 placeholder)
- Create: `src/components/Navigation.tsx`, `src/components/AmbientBackground.astro`

**Interfaces:**
- Consumes: `NAV_ITEMS` from `constants.ts` (Task 3).
- Produces: the page shell every section (Tasks 13–19) renders inside via `<slot />`.

- [ ] **Step 1: Write `src/components/AmbientBackground.astro`**

```astro
<div class="ambient-grain" aria-hidden="true"></div>
```

- [ ] **Step 2: Write `src/components/Navigation.tsx`**

```tsx
import { NAV_ITEMS } from '../lib/constants';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container-main flex h-16 items-center justify-between">
        <a href="#hero" className="font-display text-lg">Rajeev Joshi</a>
        <ul className="hidden md:flex gap-6 text-caption">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-body hover:text-ink transition-colors">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Replace `src/layouts/Layout.astro`**

```astro
---
import '../styles/global.css';
import Navigation from '../components/Navigation';
import AmbientBackground from '../components/AmbientBackground.astro';
import LenisProvider from '../components/LenisProvider';
import FloatingViewToggle from '../components/FloatingViewToggle';
import ViewToggleHint from '../components/ViewToggleHint';

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <AmbientBackground />
    <Navigation client:load />
    <LenisProvider client:load />
    <slot />
    <FloatingViewToggle client:load />
    <ViewToggleHint client:load />
  </body>
</html>
```

(`LenisProvider`, `FloatingViewToggle`, `ViewToggleHint` are built in Tasks 11 and 14 — this task references them so the shell is complete; the build won't succeed until those files exist. Proceed to Task 11 before verifying this task's build.)

- [ ] **Step 4: Commit** (after Task 11 and Task 14 exist and build passes — see Task 14 Step 6)

```bash
git add src/layouts/Layout.astro src/components/Navigation.tsx src/components/AmbientBackground.astro
git commit -m "feat: add page shell, navigation, and ambient grain overlay"
```

---

### Task 11: LenisProvider

**Files:**
- Create: `src/components/LenisProvider.tsx`

**Interfaces:**
- Consumes: `initLenisGSAP`, `createSectionSlides` from `animations.ts` (Task 9).
- Produces: side-effect-only component (renders nothing), mounted once in `Layout.astro` (Task 10).

- [ ] **Step 1: Write `src/components/LenisProvider.tsx`**

```tsx
import { useEffect } from 'react';
import Lenis from 'lenis';
import { initLenisGSAP, createSectionSlides } from '../lib/animations';

export default function LenisProvider() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({ autoRaf: false });
    initLenisGSAP(lenis);
    createSectionSlides();

    return () => lenis.destroy();
  }, []);

  return null;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0 (Layout.astro from Task 10 now resolves this import; FloatingViewToggle/ViewToggleHint from Task 14 still need to exist — build will fail until Task 14 Step 5, that's expected at this point).

- [ ] **Step 3: Commit**

```bash
git add src/components/LenisProvider.tsx
git commit -m "feat: add Lenis smooth-scroll + GSAP bridge provider"
```

---

### Task 12: Vanta Background Components

**Files:**
- Create: `src/components/backgrounds/HeroBg.tsx`, `MetricsBg.tsx`, `ProjectsBg.tsx`, `SkillsBg.tsx`, `TimelineBg.tsx`, `PublicationsBg.tsx`

**Interfaces:**
- Consumes: `loadBirds`/`loadClouds`/`loadNet`/`loadDots`/`loadWaves`/`loadCells` from `vanta-loader.ts` (Task 5); `viewStore` from `store.ts` (Task 4, `MetricsBg` only).
- Produces: 6 components, each rendered with `client:visible` inside its section (Tasks 13, 15–18).

All six share one pattern (per `BUILD_INSTRUCTIONS.md` §9: `client:visible` hydration, `prefers-reduced-motion` check, async Vanta load, `absolute inset-0 pointer-events-none z-0 opacity-{X}` div, destroy on unmount). Config values are from the "Per-Section Assignment" table.

- [ ] **Step 1: Write `src/components/backgrounds/HeroBg.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { loadBirds } from '../../lib/vanta-loader';

export default function HeroBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadBirds().then((BIRDS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = BIRDS({
        el: ref.current,
        backgroundColor: 0xfaf9f5,
        color1: 0xcc785c,
        color2: 0xe8a55a,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
}
```

- [ ] **Step 2: Write `src/components/backgrounds/ProjectsBg.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { loadNet } from '../../lib/vanta-loader';

export default function ProjectsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadNet().then((NET) => {
      if (cancelled || !ref.current) return;
      effectRef.current = NET({
        el: ref.current,
        backgroundColor: 0xfaf9f5,
        color: 0xcc785c,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-30" />;
}
```

- [ ] **Step 3: Write `src/components/backgrounds/SkillsBg.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { loadDots } from '../../lib/vanta-loader';

export default function SkillsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadDots().then((DOTS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = DOTS({
        el: ref.current,
        backgroundColor: 0xefe9de,
        color: 0xcc785c,
        color2: 0xe8a55a,
        size: 3,
        showLines: false,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-35" />;
}
```

- [ ] **Step 4: Write `src/components/backgrounds/TimelineBg.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { loadWaves } from '../../lib/vanta-loader';

export default function TimelineBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadWaves().then((WAVES) => {
      if (cancelled || !ref.current) return;
      effectRef.current = WAVES({
        el: ref.current,
        backgroundColor: 0xfaf9f5,
        color: 0xe6dfd8,
        shininess: 85,
        waveHeight: 15,
        waveSpeed: 1.45,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-50" />;
}
```

- [ ] **Step 5: Write `src/components/backgrounds/PublicationsBg.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { loadCells } from '../../lib/vanta-loader';

export default function PublicationsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadCells().then((CELLS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = CELLS({
        el: ref.current,
        color1: 0xcc785c,
        color2: 0xe8a55a,
        size: 0.8,
        speed: 0.4,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-30" />;
}
```

- [ ] **Step 6: Write `src/components/backgrounds/MetricsBg.tsx`** (special: resizes on view toggle)

```tsx
import { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { loadClouds } from '../../lib/vanta-loader';
import { viewStore } from '../../lib/store';

export default function MetricsBg() {
  const ref = useRef<HTMLDivElement>(null);
  const effectRef = useRef<any>(null);
  const view = useStore(viewStore);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;

    loadClouds().then((CLOUDS) => {
      if (cancelled || !ref.current) return;
      effectRef.current = CLOUDS({
        el: ref.current,
        backgroundColor: 0xefe9de,
        cloudColor: 0xcc785c,
        sunColor: 0xe8a55a,
        sunGlareColor: 0xe8a55a,
        sunlightColor: 0xe8a55a,
      });
    });

    return () => {
      cancelled = true;
      effectRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const timers = [150, 500, 1000].map((delay) =>
      setTimeout(() => effectRef.current?.resize(), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [view]);

  return <div ref={ref} className="absolute inset-0 pointer-events-none z-0 opacity-40" />;
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: still fails only on the still-missing FloatingViewToggle/ViewToggleHint (Task 14) — confirm no new errors from the backgrounds themselves by running `npx astro check` and confirming it reports errors only in files not yet created.

- [ ] **Step 8: Commit**

```bash
git add src/components/backgrounds
git commit -m "feat: add per-section Vanta.js background components"
```

---

### Task 13: Hero Section + Hero Terminal

**Files:**
- Create: `src/components/Hero.astro`, `src/components/HeroTerminal.tsx`

**Interfaces:**
- Consumes: `TERMINAL_SNIPPETS` from `constants.ts`, `getInitialOrder`/`cycleToBack`/`stackOffset`/`shouldStopAutoFlip`/`clampScale` from `hero-terminal-logic.ts`, `highlightLine` from `syntax-highlight.ts`, `HeroBg` from `backgrounds/HeroBg.tsx`.
- Produces: the `#hero` section, first in `index.astro` (Task 20).

- [ ] **Step 1: Write `src/components/HeroTerminal.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { TERMINAL_SNIPPETS } from '../lib/constants';
import { getInitialOrder, cycleToBack, stackOffset, shouldStopAutoFlip, clampScale } from '../lib/hero-terminal-logic';
import { highlightLine } from '../lib/syntax-highlight';

type RunState = 'idle' | 'running' | 'complete';

export default function HeroTerminal() {
  const [order, setOrder] = useState<string[]>(() => getInitialOrder(TERMINAL_SNIPPETS.map((s) => s.id)));
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingState, setIsResizingState] = useState(false);
  const isResizingRef = useRef(false);
  const [runState, setRunState] = useState<RunState>('idle');
  const [visibleLines, setVisibleLines] = useState(0);

  const dragScale = useMotionValue(1);
  const sizeScale = useMotionValue(1);
  const combinedScale = useTransform([dragScale, sizeScale], ([d, s]: number[]) => clampScale(d * s));

  const cycle = () => {
    if (isAnimating || isDragging || isResizingRef.current) return;
    setIsAnimating(true);
    setRunState('idle');
    setVisibleLines(0);
    setTimeout(() => {
      setOrder((prev) => cycleToBack(prev));
      setIsAnimating(false);
    }, 350);
  };

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const flip = (delay: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;
        const frontId = order[order.length - 1];
        const frontSnippet = TERMINAL_SNIPPETS.find((s) => s.id === frontId)!;
        if (shouldStopAutoFlip(frontSnippet)) return;
        setOrder((prev) => cycleToBack(prev));
        flip(2000);
      }, delay);
    };

    flip(4000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const handleResizeDrag = (delta: number) => {
    isResizingRef.current = true;
    setIsResizingState(true);
    sizeScale.set(clampScale(sizeScale.get() + delta / 200));
  };

  const stopResize = () => {
    isResizingRef.current = false;
    setIsResizingState(false);
  };

  const runSnippet = (e: React.MouseEvent, snippetId: string) => {
    e.stopPropagation();
    if (runState === 'complete') {
      setRunState('idle');
      setVisibleLines(0);
      return;
    }
    if (runState !== 'idle') return;
    setRunState('running');
    const snippet = TERMINAL_SNIPPETS.find((s) => s.id === snippetId)!;
    snippet.output.lines.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay);
    });
    setTimeout(() => setRunState('complete'), snippet.output.totalDelay + 100);
  };

  return (
    <motion.div
      drag
      dragListener={!isResizingState}
      dragConstraints={typeof document !== 'undefined' ? { current: document.getElementById('hero') } : undefined}
      style={{ scale: combinedScale, transformOrigin: 'top right' }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        dragScale.set(1);
      }}
      className="relative w-full max-w-lg aspect-[4/3]"
    >
      {order.map((id, i) => {
        const snippet = TERMINAL_SNIPPETS.find((s) => s.id === id)!;
        const indexFromTop = order.length - 1 - i;
        const isActive = indexFromTop === 0;
        const offset = stackOffset(indexFromTop);

        return (
          <div
            key={id}
            onClick={cycle}
            className="absolute inset-0 rounded-lg overflow-hidden shadow-lg cursor-pointer bg-surface-dark text-on-dark"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px)`,
              zIndex: i,
            }}
          >
            <div className="h-11 flex items-center gap-2 px-4 bg-surface-dark-elevated">
              <span className="w-3 h-3 rounded-full bg-error/70" />
              <span className="w-3 h-3 rounded-full bg-warning/70" />
              <span className="w-3 h-3 rounded-full bg-success/70" />
              <span className="text-code text-on-dark-soft ml-2">{snippet.filename}</span>
            </div>

            {isActive && (
              <div className="p-4 text-code overflow-auto h-[calc(100%-44px)]">
                <pre className="whitespace-pre-wrap">
                  {snippet.code.map((line, li) => (
                    <div key={li}>
                      {highlightLine(line).map((tok, ti) => (
                        <span key={ti} className={tok.className}>{tok.text}</span>
                      ))}
                    </div>
                  ))}
                </pre>

                {snippet.runLabel && (
                  <button onClick={(e) => runSnippet(e, id)} className="mt-3 flex items-center gap-2 text-caption text-primary">
                    {runState === 'idle' && <span>▶ {snippet.runLabel}</span>}
                    {runState === 'running' && <span>◌ Running…</span>}
                    {runState === 'complete' && <span>✓ Completed in {snippet.output.latencyMs}ms</span>}
                  </button>
                )}

                {runState !== 'idle' && (
                  <div className="mt-2 text-code space-y-1">
                    {snippet.output.lines.slice(0, visibleLines).map((line, li) => (
                      <div key={li} className={{
                        info: 'text-on-dark-soft',
                        success: 'text-success',
                        warning: 'text-warning',
                        error: 'text-error',
                        muted: 'text-on-dark-soft/70',
                      }[line.type]}>{line.text}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isActive && (
              <svg
                className="absolute bottom-2 right-2 w-10 h-10"
                style={{ pointerEvents: 'none' }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const startY = e.clientY;
                  const onMove = (ev: PointerEvent) => handleResizeDrag(ev.clientY - startY);
                  const onUp = () => {
                    stopResize();
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
              >
                <path
                  d="M 40 16 L 40 30 Q 40 40 30 40 L 16 40"
                  stroke="#cc785c"
                  strokeWidth="5"
                  fill="none"
                  style={{ pointerEvents: 'stroke' }}
                />
              </svg>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `src/components/Hero.astro`**

```astro
---
import HeroBg from './backgrounds/HeroBg';
import HeroTerminal from './HeroTerminal';
---
<section id="hero" data-slide class="relative section-padding overflow-hidden bg-canvas">
  <HeroBg client:visible />
  <div data-slide-inner class="container-main relative z-10 grid lg:grid-cols-[1fr_1fr] gap-12 items-center">
    <div>
      <span class="inline-flex items-center gap-2 rounded-pill border border-hairline px-4 py-1.5 text-caption">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
        Principal ML Engineer · Vanguard
      </span>
      <h1 class="font-display text-display-xl mt-6">Rajeev Joshi</h1>
      <p class="text-title-md text-body mt-4">Building AI infrastructure that operates at enterprise scale.</p>
      <p class="text-body-sm text-muted mt-3">6+ years shipping production ML systems — 6B+ API calls/year, 99.9% uptime, 3M+ requests/day.</p>
      <div class="flex gap-3 mt-8">
        <a href="#contact" class="inline-flex items-center rounded-md bg-primary text-on-primary px-5 py-3 text-body-md">Get in touch</a>
        <a href="#projects" class="inline-flex items-center rounded-md border border-hairline px-5 py-3 text-body-md">View projects</a>
      </div>
    </div>
    <HeroTerminal client:load />
  </div>
</section>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: still blocked on `FloatingViewToggle`/`ViewToggleHint` imports in `Layout.astro` (Task 14 resolves this) — confirm no *new* errors from Hero.astro/HeroTerminal.tsx via `npx astro check`.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/components/HeroTerminal.tsx
git commit -m "feat: add hero section with draggable/resizable terminal card stack"
```

---

### Task 14: Floating View Toggle + Hint

**Files:**
- Create: `src/components/FloatingViewToggle.tsx`, `src/components/ViewToggleHint.tsx`

**Interfaces:**
- Consumes: `viewStore`, `toggleView` from `store.ts` (Task 4).
- Produces: mounted in `Layout.astro` (Task 10) — this is the last piece `Layout.astro` needs, so this task's Step 5 is where the full build first succeeds.

- [ ] **Step 1: Write `src/components/FloatingViewToggle.tsx`**

```tsx
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useStore } from '@nanostores/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { viewStore, toggleView } from '../lib/store';

const EXECUTIVE_CAT_URL = 'https://lottie.host/58d96d9b-94ca-4503-8922-08592d82d30f/L0toD2hoxg.lottie';
const TECHNICAL_CAT_URL = 'https://lottie.host/b4f060c0-c0d0-4ba5-9ea5-c48b0b90f09d/V7t826i9my.lottie';

export default function FloatingViewToggle() {
  const view = useStore(viewStore);
  const [hasInteracted, setHasInteracted] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={{ top: -window.innerHeight, bottom: window.innerHeight, left: -window.innerWidth, right: window.innerWidth }}
      style={{ x, y, rotate }}
      onClick={() => {
        setHasInteracted(true);
        toggleView();
      }}
      className="fixed bottom-6 right-6 z-[60] w-20 h-20 rounded-full bg-surface-1 shadow-lg flex flex-col items-center justify-center cursor-pointer select-none"
    >
      <DotLottieReact src={view === 'executive' ? EXECUTIVE_CAT_URL : TECHNICAL_CAT_URL} autoplay loop style={{ width: 48, height: 48 }} />
      <span className="text-caption-uppercase">{view === 'executive' ? 'Exec' : 'Tech'}</span>
      {!hasInteracted && <span className="absolute -top-6 text-caption text-muted whitespace-nowrap">click me · drag me</span>}
    </motion.div>
  );
}
```

- [ ] **Step 2: Write `src/components/ViewToggleHint.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'portfolio-hint-dismissed';

export default function ViewToggleHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (isMobile || dismissed) return;

    const showTimer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => dismiss(), 7000);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          onClick={dismiss}
          className="fixed z-[60] glass rounded-lg px-4 py-2 text-body-sm cursor-pointer"
          style={{ bottom: '70px', right: '24px' }}
        >
          Toggle executive / technical view ↓
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx astro check`
Expected: no errors.

- [ ] **Step 4: Verify full build now succeeds**

Run: `npm run build`
Expected: exits 0 — this is the first point in the plan where `Layout.astro`'s full import graph resolves.

- [ ] **Step 5: Commit Tasks 10, 11, 14 together (they were interdependent)**

```bash
git add src/layouts/Layout.astro src/components/Navigation.tsx src/components/AmbientBackground.astro src/components/LenisProvider.tsx src/components/FloatingViewToggle.tsx src/components/ViewToggleHint.tsx
git commit -m "feat: complete page shell — nav, Lenis provider, floating view toggle, hint"
```

---

### Task 15: Metrics Dashboard

**Files:**
- Create: `src/components/MetricsDashboard.tsx`

**Interfaces:**
- Consumes: `METRICS` from `constants.ts`, `viewStore` from `store.ts`, `counterValue` from `counter-animation.ts`, `MetricsBg` from `backgrounds/MetricsBg.tsx`.
- Produces: the `#impact` section, mounted in `index.astro` (Task 20).

- [ ] **Step 1: Write `src/components/MetricsDashboard.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { METRICS, type Metric } from '../lib/constants';
import { viewStore } from '../lib/store';
import { counterValue } from '../lib/counter-animation';
import MetricsBg from './backgrounds/MetricsBg';

function AnimatedMetric({ metric }: { metric: Metric }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const value = counterValue(now - start, 1200, metric.value);
        setDisplay(metric.value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1));
        if (now - start < 1200) requestAnimationFrame(tick);
        else setDisplay(String(metric.value));
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [metric.value]);

  const sizeClass = {
    hero: 'col-span-2 row-span-2 text-display-lg',
    large: 'col-span-2 text-display-md',
    medium: 'text-display-sm',
    small: 'text-title-lg',
  }[metric.size];

  return (
    <div ref={ref} className={`bg-surface-0 rounded-lg p-6 ${sizeClass}`}>
      <div className="font-display">{display}{metric.suffix}</div>
      <div className="text-title-sm mt-2">{metric.label}</div>
      <div className="text-body-sm text-muted mt-1">{metric.sublabel}</div>
      {useStore(viewStore) === 'technical' && (
        <div className="text-caption text-muted-soft mt-2">{metric.detail}</div>
      )}
    </div>
  );
}

export default function MetricsDashboard() {
  const view = useStore(viewStore);
  const shown = view === 'executive' ? METRICS.filter((m) => m.executive) : METRICS;

  return (
    <section id="impact" data-slide className="relative section-padding bg-surface-1 overflow-hidden">
      <MetricsBg client:visible />
      <div data-slide-inner className="container-main relative z-10">
        <h2 className="font-display text-display-lg">Impact at Scale</h2>
        <p className="text-body-md text-body mt-2">Production systems processing billions of requests with enterprise-grade reliability.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {shown.map((metric) => <AnimatedMetric key={metric.id} metric={metric} />)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/MetricsDashboard.tsx
git commit -m "feat: add metrics dashboard with animated counters and executive/technical views"
```

---

### Task 16: Projects Grid + Project Card

**Files:**
- Create: `src/components/ProjectsGrid.tsx`, `src/components/ProjectCard.tsx`

**Interfaces:**
- Consumes: `PROJECTS` from `constants.ts`, `viewStore` from `store.ts`, `ProjectsBg` from `backgrounds/ProjectsBg.tsx`.
- Produces: the `#projects` section, mounted in `index.astro` (Task 20).

- [ ] **Step 1: Write `src/components/ProjectCard.tsx`**

```tsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '@nanostores/react';
import type { Project } from '../lib/constants';
import { viewStore } from '../lib/store';

export default function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const view = useStore(viewStore);

  return (
    <div className="rounded-lg border border-hairline bg-surface-0 p-6">
      <div className="flex flex-wrap gap-2">
        {project.domains.map((d) => (
          <span key={d} className="text-caption-uppercase rounded-pill bg-surface-1 px-3 py-1">{d}</span>
        ))}
      </div>
      <h3 className="font-display text-display-sm mt-3">{project.title}</h3>
      <p className="text-body-md text-body mt-2">{project.tagline}</p>
      <p className="text-title-sm text-primary mt-3">{project.headlineMetric}</p>

      {view === 'executive' && <p className="text-body-sm text-muted mt-3">{project.execSummary}</p>}

      {view === 'technical' && (
        <div className="flex flex-wrap gap-2 mt-3">
          {project.techStack.map((t) => (
            <span key={t} className="text-code rounded-sm bg-surface-1 px-2 py-0.5">{t}</span>
          ))}
        </div>
      )}

      <button onClick={() => setExpanded((v) => !v)} className="mt-4 text-body-sm text-primary">
        {expanded ? 'Show less' : 'Show more'}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-title-sm">Problem</h4>
                <p className="text-body-sm text-muted">{project.problem}</p>
              </div>
              <div>
                <h4 className="text-title-sm">Approach</h4>
                <p className="text-body-sm text-muted">{project.approach}</p>
              </div>
              <div>
                <h4 className="text-title-sm">Architecture</h4>
                <p className="text-code text-muted">{project.architecture}</p>
              </div>
              <div>
                <h4 className="text-title-sm">Impact</h4>
                <ul className="list-disc list-inside text-body-sm text-muted">
                  {project.impact.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Write `src/components/ProjectsGrid.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { PROJECTS } from '../lib/constants';
import ProjectCard from './ProjectCard';
import ProjectsBg from './backgrounds/ProjectsBg';

const DOMAINS = ['All', 'AI/ML', 'Infrastructure', 'Platform', 'Privacy'];

export default function ProjectsGrid() {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.domains.includes(filter))),
    [filter]
  );

  return (
    <section id="projects" data-slide className="relative section-padding bg-canvas overflow-hidden">
      <ProjectsBg client:visible />
      <div data-slide-inner className="container-main relative z-10">
        <h2 className="font-display text-display-lg">Signature Projects</h2>
        <p className="text-body-md text-body mt-2">Enterprise AI systems built for scale, reliability, and measurable business impact.</p>

        <div className="flex flex-wrap gap-2 mt-6">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`text-caption rounded-md px-3.5 py-2 ${filter === d ? 'bg-surface-1 text-ink' : 'text-muted'}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {filtered.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectsGrid.tsx src/components/ProjectCard.tsx
git commit -m "feat: add filterable, expandable projects grid"
```

---

### Task 17: Tech Depth (Skills)

**Files:**
- Create: `src/components/TechDepth.tsx`

**Interfaces:**
- Consumes: `SKILLS`, `PROJECTS` (for architecture patterns) from `constants.ts`, `viewStore` from `store.ts`, `SkillsBg` from `backgrounds/SkillsBg.tsx`.
- Produces: the `#skills` section, mounted in `index.astro` (Task 20).

- [ ] **Step 1: Write `src/components/TechDepth.tsx`**

```tsx
import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { SKILLS, PROJECTS } from '../lib/constants';
import { viewStore } from '../lib/store';
import SkillsBg from './backgrounds/SkillsBg';

export default function TechDepth() {
  const [active, setActive] = useState<string | null>(null);
  const view = useStore(viewStore);

  return (
    <section id="skills" data-slide className="relative section-padding bg-surface-1 overflow-hidden">
      <SkillsBg client:visible />
      <div data-slide-inner className="container-main relative z-10">
        <h2 className="font-display text-display-lg">Technical Depth</h2>
        <p className="text-body-md text-body mt-2">Full-stack ML engineering from model development through production serving and governance.</p>

        <div className={`grid gap-10 mt-8 ${view === 'technical' ? 'lg:grid-cols-2' : ''}`}>
          <div className="space-y-6">
            {SKILLS.map((cat) => (
              <div key={cat.name}>
                <button
                  onClick={() => setActive(active === cat.name ? null : cat.name)}
                  className={`text-title-sm ${active === cat.name ? 'text-primary' : 'text-ink'}`}
                >
                  {cat.name}
                </button>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cat.skills.map((s) => (
                    <span
                      key={s}
                      className={`text-caption rounded-pill px-3 py-1 ${active === cat.name ? 'bg-primary text-on-primary' : 'bg-surface-0 text-body'}`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {view === 'technical' && (
            <div className="space-y-4">
              {PROJECTS.map((p) => (
                <div key={p.id} className="rounded-lg bg-surface-0 p-5">
                  <h4 className="text-title-sm">{p.title}</h4>
                  <p className="text-code text-muted mt-1">{p.architecture}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/TechDepth.tsx
git commit -m "feat: add tech depth section with filterable skill chips"
```

---

### Task 18: Timeline

**Files:**
- Create: `src/components/Timeline.astro`

**Interfaces:**
- Consumes: `TIMELINE` from `constants.ts`, `createTimelineAnimation` from `animations.ts`, `TimelineBg` from `backgrounds/TimelineBg.tsx`.
- Produces: the `#timeline` section, mounted in `index.astro` (Task 20).

- [ ] **Step 1: Write `src/components/Timeline.astro`**

```astro
---
import { TIMELINE } from '../lib/constants';
import TimelineBg from './backgrounds/TimelineBg';
---
<section id="timeline" data-slide class="relative section-padding bg-canvas overflow-hidden">
  <TimelineBg client:visible />
  <div data-slide-inner class="container-main relative z-10">
    <h2 class="font-display text-display-lg">Career Arc</h2>
    <p class="text-body-md text-body mt-2">Progressive ownership from ML pipelines to enterprise AI governance.</p>

    <div class="relative mt-10 space-y-10 md:space-y-0">
      <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-hairline"></div>
      {TIMELINE.map((entry, i) => (
        <div data-timeline-card class={`md:grid md:grid-cols-2 md:gap-10 ${i % 2 === 0 ? '' : 'md:[&>*:first-child]:order-2'}`}>
          <div class={i % 2 === 0 ? 'md:text-right' : ''}>
            <p class="text-caption text-muted">{entry.period}</p>
            <h3 class="text-title-lg mt-1">{entry.role}</h3>
            <p class="text-body-sm text-muted">{entry.company}</p>
          </div>
          <div class="rounded-lg bg-surface-1 p-5 mt-3 md:mt-0">
            <ul class="list-disc list-inside text-body-sm text-body space-y-1">
              {entry.highlights.map((h) => <li>{h}</li>)}
            </ul>
            <p class="text-caption text-primary mt-3">{entry.compounding}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

<script>
  import { createTimelineAnimation } from '../lib/animations';
  createTimelineAnimation();
</script>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/Timeline.astro
git commit -m "feat: add career timeline with alternating scroll-in cards"
```

---

### Task 19: Publications + Contact

**Files:**
- Create: `src/components/Publications.astro`, `src/components/Contact.astro`

**Interfaces:**
- Consumes: publication/award/mentorship copy and personal-info copy from `CONTENT_DATA.md` (hardcoded, not in `constants.ts` — that file only holds the array-shaped data types), `PublicationsBg` from `backgrounds/PublicationsBg.tsx`.
- Produces: the `#publications` and `#contact` sections, mounted in `index.astro` (Task 20).

- [ ] **Step 1: Write `src/components/Publications.astro`**

```astro
---
import PublicationsBg from './backgrounds/PublicationsBg';
---
<section id="publications" data-slide class="relative section-padding bg-surface-1 overflow-hidden">
  <PublicationsBg client:visible />
  <div data-slide-inner class="container-main relative z-10">
    <h2 class="font-display text-display-lg">Publications &amp; Recognition</h2>

    <div class="rounded-lg bg-surface-0 p-6 mt-8">
      <p class="text-caption-uppercase text-muted">IEEE Paper</p>
      <h3 class="text-title-lg mt-2">Cost-Efficient, Model-Agnostic, Low-Latency LLM Deployment</h3>
      <p class="text-body-sm text-muted mt-1">Bansal, A., Joshi, R., et al. · IEEE AAIML 2026 — February 2026</p>
      <a href="https://ieeexplore.ieee.org/abstract/document/11498121/" class="text-body-sm text-primary mt-2 inline-block">Read on IEEE Xplore →</a>
    </div>

    <div class="grid md:grid-cols-3 gap-6 mt-8">
      <div class="rounded-lg bg-surface-0 p-5">
        <h4 class="text-title-sm">IT Peer Recognition Award</h4>
        <p class="text-body-sm text-muted mt-1">Vanguard IT Division (2025) — Quarterly award selected by a panel of past recipients from all IT division nominations.</p>
      </div>
      <div class="rounded-lg bg-surface-0 p-5">
        <h4 class="text-title-sm">Academic Achievement Award</h4>
        <p class="text-body-sm text-muted mt-1">NYU Tandon (2018) — MS Computer Science · GPA 3.77/4.0</p>
      </div>
      <div class="rounded-lg bg-surface-0 p-5">
        <h4 class="text-title-sm">MLH HackNYU — Third Place</h4>
        <p class="text-body-sm text-muted mt-1">(2018) — Built "Feed a Homeless" — real-time platform connecting food donors with nearby homeless individuals.</p>
      </div>
    </div>

    <div class="grid md:grid-cols-3 gap-6 mt-6">
      <div class="rounded-lg bg-surface-0 p-5">
        <h4 class="text-title-sm">Women in Data Science</h4>
        <p class="text-body-sm text-muted mt-1">Hackathon Mentor · Vanguard</p>
      </div>
      <div class="rounded-lg bg-surface-0 p-5">
        <h4 class="text-title-sm">FAST Hackathon</h4>
        <p class="text-body-sm text-muted mt-1">LLM Integration Patterns · Dec 2023</p>
      </div>
      <div class="rounded-lg bg-surface-0 p-5">
        <h4 class="text-title-sm">Engineer Mentorship</h4>
        <p class="text-body-sm text-muted mt-1">1-2 engineers annually · mentee achieved promotion</p>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Write `src/components/Contact.astro`**

```astro
<section id="contact" class="section-padding bg-canvas">
  <div class="container-main text-center">
    <h2 class="font-display text-display-lg">Let's build something significant.</h2>
    <p class="text-body-md text-muted mt-3">Open to principal/staff engineering roles, AI infrastructure consulting, and research collaboration.</p>
    <p class="text-body-sm text-muted mt-1">Malvern, PA · Open to remote</p>
    <div class="flex justify-center gap-3 mt-8">
      <a href="https://linkedin.com/in/rj1234" class="rounded-md bg-primary text-on-primary px-5 py-3 text-body-md">LinkedIn</a>
      <a href="https://github.com/rj-1234" class="rounded-md border border-hairline px-5 py-3 text-body-md">GitHub</a>
      <a href="/assets/Rajeev_Joshi_Resume.pdf" class="rounded-md border border-hairline px-5 py-3 text-body-md">Resume</a>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/Publications.astro src/components/Contact.astro
git commit -m "feat: add publications/recognition and contact sections"
```

---

### Task 20: Page Composition + Public Assets

**Files:**
- Create: `src/pages/index.astro`
- Create: `public/favicon.svg`, `public/robots.txt`
- Modify: move `Rajeev_Joshi_Resume.pdf` → `public/assets/Rajeev_Joshi_Resume.pdf`

**Interfaces:**
- Consumes: every section component from Tasks 13, 15–19, and `Layout.astro` from Task 10.
- Produces: the deployable homepage.

- [ ] **Step 1: Write `src/pages/index.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/Hero.astro';
import MetricsDashboard from '../components/MetricsDashboard';
import ProjectsGrid from '../components/ProjectsGrid';
import TechDepth from '../components/TechDepth';
import Timeline from '../components/Timeline.astro';
import Publications from '../components/Publications.astro';
import Contact from '../components/Contact.astro';
---
<Layout title="Rajeev Joshi — Principal ML Engineer">
  <Hero />
  <MetricsDashboard client:visible />
  <ProjectsGrid client:visible />
  <TechDepth client:visible />
  <Timeline />
  <Publications />
  <Contact />
</Layout>
```

- [ ] **Step 2: Move the resume**

```bash
mkdir -p public/assets
git mv Rajeev_Joshi_Resume.pdf public/assets/Rajeev_Joshi_Resume.pdf
```

- [ ] **Step 3: Write `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://rj-1234.github.io/sitemap-index.xml
```

- [ ] **Step 4: Write `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#faf9f5"/>
  <text x="16" y="22" font-family="Georgia, serif" font-size="18" text-anchor="middle" fill="#cc785c">R</text>
</svg>
```

- [ ] **Step 5: Verify full build**

Run: `npm run build`
Expected: exits 0, `dist/index.html` exists.

- [ ] **Step 6: Run full test suite**

Run: `npm run test`
Expected: all unit tests from Tasks 3, 4, 6, 7, 8 still PASS (no regressions from component work).

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro public/favicon.svg public/robots.txt public/assets/Rajeev_Joshi_Resume.pdf
git commit -m "feat: compose homepage from all sections and add public assets"
```

---

### Task 21: GitHub Actions Deploy Workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- Consumes: `npm run build` output (`dist/`).
- Produces: automatic deploy to GitHub Pages on push to `main`.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages deploy workflow"
```

Note: this repo's current default branch is `refresh-portfolio`, not `main` (confirmed via git status at session start). Before this workflow can trigger, either merge/rename this work onto `main`, or add `refresh-portfolio` to the `branches:` trigger list temporarily — flag this to the user rather than silently deciding.

---

### Task 22: Final Verification

**Files:** none (verification only)

- [ ] **Step 1: Full clean build**

```bash
rm -rf dist node_modules
npm install
npm run test
npm run build
```

Expected: install succeeds, all unit tests PASS, build exits 0.

- [ ] **Step 2: In-browser golden-path walkthrough**

Start the dev server and, in the Browser pane, verify:
- Hero terminal: cards auto-flip (4s then 2s intervals) and stop at `train_llm_fast.py`; clicking the stack cycles cards; dragging moves the stack within the hero section; the resize handle scales the stack between 0.6x–1.2x; clicking "Run Training" streams output lines and ends with a "Completed in 247ms" badge.
- Floating view toggle: clicking it swaps Metrics/Projects/Skills content between executive and technical views; Metrics section height changes and the Clouds background doesn't visibly glitch.
- View toggle hint: appears ~2.5s after load, auto-dismisses at 7s, and does not reappear on reload (localStorage).
- Each section's Vanta background renders (Birds/Clouds/Net/Dots/Waves/Cells) and section-slide scroll transitions run smoothly.
- Contact section's Resume/LinkedIn/GitHub links resolve to the correct URLs/file.

- [ ] **Step 3: Responsive check**

Resize the Browser pane to mobile (375px) and tablet (768px) presets; confirm hero collapses to single column, nav collapses appropriately, projects/feature grids reduce to 1-up/2-up, and the view-toggle hint is hidden on mobile per spec.

- [ ] **Step 4: Reduced-motion check**

Emulate `prefers-reduced-motion: reduce` (Browser pane `resize_window` `colorScheme`/emulation or OS-level toggle) and confirm Vanta backgrounds don't render and scroll/section animations are effectively instant.

- [ ] **Step 5: Report results to the user**

Summarize what was verified and any deviations found, before considering the plan complete. Do not claim "done" without having actually driven the browser per Steps 2–4 (per the verify skill).
