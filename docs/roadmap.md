# Blank Canvas Roadmap

## Product vision

Blank Canvas should make Canvas feel calmer, more legible, and less cognitively noisy for students who only want the essentials in front of them.

## Phase 1: Dashboard declutter

- Remove the dashboard right sidebar.
- Hide dashboard search and similar chrome.
- Simplify course cards.
- Trim low-value global nav items.
- Add popup toggles and options page.
- Add diagnostics, preview mode, and selector reporting.

## Phase 2: Page-specific focus modes

- Assignment page cleanup.
- Module page cleanup.
- Announcement page cleanup.
- Reading mode for content-heavy pages.
- Per-page presets instead of one global preset.

## Phase 3: Student assistant features

- Summarize announcements and assignments with an LLM.
- Extract due dates and generate study plans.
- Highlight missing submission details.
- Add a "focus summary" side panel that appears only on demand.

## Phase 4: Hardening and release

- Narrow extension host permissions to the real Canvas domain.
- Add browser-specific packaging.
- Add screenshot-based QA against live Canvas pages.
- Add versioned selector maps so DOM fixes are easier to ship.

## Debugging checklist

When a rule stops working:

1. Turn on `Preview mode`.
2. Run diagnostics from the popup.
3. Compare the matched selectors in DevTools.
4. Add a temporary selector to `Custom selectors`.
5. Promote the fix into `src/content/rules.js` once it is stable.
