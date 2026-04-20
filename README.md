# Blank Canvas

Blank Canvas is a Chrome extension that reduces clutter inside Canvas with a minimalist, student-friendly dashboard.

## React scaffold

React is scaffolded for extension-owned UI, but no live surfaces have been migrated yet.

The bridge source lives in [src/react/bridge.js](src/react/bridge.js) and the bundled runtime loaded by the extension is generated at [src/generated/react-bridge.js](src/generated/react-bridge.js).

Rebuild the bundled bridge with:

```powershell
cmd /c npm run build:react
```

The current bridge exposes `BlankCanvas.react` for future dashboard/modal migrations while leaving the existing Canvas scraping and DOM patching code in plain JavaScript.

## Testing

Run the browser fixture suite with:

```powershell
python tests\run_browser_tests.py
```

The suite covers DOM helpers plus UI smoke tests for fragile Canvas-specific behavior such as dashboard header chrome, left-rail selection treatment, and collapsed-nav label hiding.

## Real Canvas smoke tests

A Playwright scaffold for inspecting the real logged-in Canvas page lives in [tests/real-canvas/SETUP.md](tests/real-canvas/SETUP.md).

It is meant for:

- checking the live Canvas DOM instead of fixtures
- verifying computed styles on real routes
- comparing screenshots of fragile UI regions like the left rail
