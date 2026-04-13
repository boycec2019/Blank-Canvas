# Real Canvas Playwright Suite

This suite is for inspecting the live Canvas page and catching regressions that fixture tests cannot see.

## What it covers

- dashboard header title/search/options state on the real page
- left-rail selected-state behavior on real Canvas routes
- targeted screenshot baselines for fragile UI areas such as the rail

## Install

```powershell
npm install
npx playwright install chromium
```

## Authentication

Create a Playwright storage state file after logging into your Canvas instance.

Recommended path:

```text
tests/real-canvas/.auth/canvas.json
```

Environment variable:

```powershell
$env:BLANK_CANVAS_STORAGE_STATE="tests/real-canvas/.auth/canvas.json"
```

You can generate it with:

```powershell
node tests\real-canvas\save-storage-state.mjs
```

## Environment variables

- `BLANK_CANVAS_BASE_URL`
  Example: `https://canvas.eee.uci.edu`
- `BLANK_CANVAS_STORAGE_STATE`
  Saved authenticated Playwright storage state
- `BLANK_CANVAS_EXTENSION_PATH`
  Optional override for the unpacked extension directory
- `BLANK_CANVAS_SCREENSHOTS`
  `on` or `off`

## Run

```powershell
npm run test:real
```

Update screenshot baselines:

```powershell
npm run test:real:update
```

## Notes

- This suite is intentionally small and focused on fragile UI surfaces.
- Keep fixture tests for fast regression coverage.
- Use this suite when a bug only appears on the real Canvas DOM or when visual verification matters.
- The real-page specs use a persistent Chromium context with the unpacked extension loaded, so screenshots and DOM probes should reflect the page with Blank Canvas enabled.
- If the suite opens Canvas logged out, regenerate the storage state and make sure `BLANK_CANVAS_BASE_URL` matches the exact Canvas domain used when the state file was created.
