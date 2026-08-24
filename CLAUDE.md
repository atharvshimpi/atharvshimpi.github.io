# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio site for Atharv Shimpi, deployed to GitHub Pages at `atharvshimpi.github.io`. Single-page React app (Vite + TypeScript, no router library — pages are shown/hidden via state).

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — type-check (`tsc -b`) then build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run deploy` — publish `dist/` to the `gh-pages` branch via `gh-pages` package (run `build` first)

There is no test suite and no lint script configured.

## Architecture

**Single-page, multi-"page" app.** All "pages" (`Home`, `About`, `Experience`, `Projects`, `Skills`, `Contact`) are mounted simultaneously in `src/App.tsx`; only the active one is visible, controlled by `usePageRouter` (`src/hooks/usePageRouter.ts`), which just holds `currentPage` state in memory — there is no URL-based routing, so page state does not survive a reload and isn't reflected in the URL.

**Content/component split.** Page components under `src/pages/` render structure; the actual copy (experience entries, project descriptions, skills, awards) lives as typed data arrays in `src/data/*.ts`, shaped by interfaces in `src/types/index.ts`. When updating content (a new job, project, or award), edit the data files, not the page components. The `Projects` page (`src/pages/Projects/`) is itself tabbed (`ProjectsTab`, `RecognitionTab`, `AwardsTab`) under `Projects.tsx`.

**Overlay components in `App.tsx`** are independent of the page routing and toggled by local `useState` flags:
- `CodeBackground` — decorative animated background, always mounted.
- `LaserPointer` — cursor-follow effect; explicitly disabled while the slicer game is open (`!slicerOpen && <LaserPointer />`).
- `MobileDrawer` — mobile nav, mirrors `Nav`'s page list.
- `TypingGameModal` and `LaserSlicerGame` — easter-egg games triggered from small icon buttons next to the logo in `Nav` (`</>` and `⚡`).

**Styling** is plain CSS in `src/index.css` (no CSS modules/Tailwind/styled-components) using CSS custom properties for the teal/navy dark theme.

**`portfolio.html`** at the repo root is a legacy, fully self-contained static HTML/CSS/JS version of the site (pre-React). It is not part of the Vite build and is not referenced by `index.html` — treat it as a standalone artifact, not something to keep in sync with `src/`.
