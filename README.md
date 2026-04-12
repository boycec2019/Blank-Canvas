# Blank Canvas

Blank Canvas is a Chrome Manifest V3 extension that reduces clutter inside Canvas with a minimalist, student-friendly dashboard. The first MVP focuses on the homepage you shared: it removes noisy sidebar widgets, trims course card chrome, and gives you a clean surface to expand from.

## MVP goals

- Hide the dashboard right sidebar (`To Do`, `Recent Feedback`, grades block).
- Remove dashboard search chrome when it is not helpful.
- Simplify course cards by hiding images, action rows, extra metadata, and menu buttons.
- Hide secondary global navigation items that usually add noise.
- Let the user toggle every cleanup rule from the popup or options page.
- Include diagnostics so selector failures are easier to debug when Canvas changes its DOM.

## Project structure

```text
manifest.json
src/
  background/
    service-worker.js
  content/
    assignment-api.js
    assignment-dom.js
    assignment-formatters.js
    assignment-utils.js
    diagnostics.js
    dashboard-styles.js
    dashboard-view.js
    main.js
    renderer.js
    rules.js
    selectors.js
  tests/
    browser-tests.html
    browser-tests.js
    run_browser_tests.py
  options/
    options.css
    options.html
    options.js
  popup/
    popup.css
    popup.html
    popup.js
  shared/
    core.js
    debug.js
    defaults.js
    storage.js
docs/
  roadmap.md
```

## How it works

The content script injects a small stylesheet for selector-based cleanup rules and uses DOM-managed rules for items that are easier to target programmatically, like the Canvas search bar and selected global nav items. A debounced observer keeps the declutter rules applied as Canvas rerenders.

The extension is intentionally modular:

- `shared/` contains defaults, storage helpers, and logger utilities.
- `content/selectors.js` isolates Canvas DOM lookup logic.
- `content/rules.js` defines cleanup rules in one place.
- `content/renderer.js` applies or previews the active rules.
- `content/diagnostics.js` produces selector and DOM match reports.

## Debugging methods

- Enable `Debug mode` from the popup or options page to turn on structured console logs.
- Enable `Preview mode` to outline matched elements instead of hiding them.
- Use `Run diagnostics` in the popup to inspect which rules matched on the current tab.
- Add fallback selectors in `Custom selectors` if your school's Canvas theme changes the DOM.
- Run `python tests/run_browser_tests.py` to execute the browser-based local test suite for assignment scraping, formatting, state handling, and dashboard card rendering.

## Load locally

1. Open `chrome://extensions`.
2. Turn on `Developer mode`.
3. Choose `Load unpacked`.
4. Select this project folder.
5. Open your Canvas dashboard and use the Blank Canvas popup.

## Notes

- The manifest currently matches all HTTP(S) pages, then exits early unless a page looks like Canvas. This makes local testing easier across custom university Canvas domains. Before publishing, tighten `matches` to your exact Canvas hostname if possible.
- The first pass is Chrome-first, but the code is structured so we can adapt it for Edge or Firefox later.

## Next steps

See [docs/roadmap.md](/c:/Users/boyce/OneDrive/Desktop/Blank%20Canvas/docs/roadmap.md) for a practical build roadmap, including a later phase for LLM-assisted study features.
