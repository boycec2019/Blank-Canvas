# Blank Canvas Roadmap

## Product vision

Blank Canvas should make Canvas feel calmer, more legible, and less cognitively noisy for students who only want the essentials in front of them.

The design direction is editorial rather than dashboard-like:

- one strong visual system
- generous whitespace
- restrained color
- disciplined typography
- progressive disclosure instead of constant chrome

## Rollout principles

- Ship UI changes behind explicit phase flags.
- Keep layout, component styling, and DOM-hiding logic modular.
- Prefer exact selectors over broad header/container rules.
- Add diagnostics for every risky DOM-dependent surface.
- Make every phase easy to disable independently during debugging.

## Phase 0: UI scaffolding and diagnostics

Goal: build the rollout foundation before visible redesign work.

Scope:

- Add shared UI tokens and layout mode support.
- Add temporary phase flags for staged rollout.
- Centralize settings storage for layout mode and phases.
- Add diagnostics for active layout mode, phases, rules, and mounted surfaces.
- Keep default behavior close to existing Canvas while scaffolding lands.

Implementation notes:

- Shared theme and phase definitions live in `src/shared/ui.js`.
- Default phase state lives in `src/shared/defaults.js`.
- Root-class and theme CSS orchestration lives in `src/content/theme-styles.js` and `src/content/renderer.js`.
- Popup and options controls should stay in sync through shared settings UI helpers.

Done when:

- We can switch layout mode cleanly.
- We can toggle phases independently.
- Diagnostics clearly report active rollout state.

## Phase 1: Typography and color reset

Goal: establish the editorial visual language without changing structure too aggressively.

Scope:

- Warm the page background and surface tones.
- Normalize body/UI text onto one sans system.
- Reserve serif usage for major page headings only.
- Soften borders, shadows, and contrast.
- Make dashboard cards, links, and inputs feel like one system.

Implementation notes:

- This phase should fix obvious type inconsistency now, not later.
- Serif should be selective and intentional, never scattered through utility UI.
- Search and form controls should inherit the same tone as the rest of the dashboard.

Done when:

- The dashboard feels visually calmer.
- Fonts are consistent.
- The page title stands out without introducing font clutter.

## Phase 2: Dashboard shell and spacing

Goal: make the dashboard feel like a composed workspace instead of a stretched application page.

Scope:

- Constrain the main content column.
- Increase vertical rhythm and section spacing.
- Clean up the header shell.
- Remove distracting dashboard header chrome when safe.
- Keep the layout readable on narrower screens.

Implementation notes:

- This phase should alter shell structure and spacing, not assignment-row detail yet.
- Header chrome removal must use precise selectors.
- Title protection should be explicit so `Dashboard` cannot be hidden by accident.

Done when:

- The dashboard reads as one intentional column.
- The search widget and options button can be removed safely.
- The page title remains stable across rerenders and DOM mutations.

## Phase 3: Left rail simplification

Goal: reduce the visual weight of the global navigation without breaking Canvas navigation.

Scope:

- De-emphasize the left rail visually.
- Keep only core nav items prominent.
- Reduce redundant chrome and visual noise.
- Preserve recognizability and accessibility of Canvas navigation.

Implementation notes:

- Prefer styling simplification before structural DOM removal.
- Any hidden nav items should remain easy to restore via settings.
- This phase should avoid risky rewrites of Canvas navigation behavior.

Done when:

- The left rail supports the page instead of dominating it.
- Navigation remains clear and stable.

## Phase 4: Agenda list layout

Goal: turn the dashboard assignments widget into a reading list rather than a small card grid.

Scope:

- Replace multi-card assignment layout with one stacked agenda list.
- Put assignment title on the left and due summary on the right where space allows.
- Keep mobile behavior simple and vertical.
- Expose the widget presentation state for diagnostics and debugging.

Implementation notes:

- The widget should support `classic` and `agenda` variants cleanly.
- Phase logic should live in view/state wiring, not only in CSS.
- The agenda layout should remain easy to revert independently.

Done when:

- The assignments surface scans top-to-bottom like an agenda.
- The variant is visible in diagnostics.

## Phase 5: Assignment row hierarchy

Goal: make each assignment row clearer and more readable with stronger metadata hierarchy.

Status: implemented.

Scope:

- Refine title, course name, date, and status emphasis.
- Improve overdue, missing, and due-soon treatments.
- Reduce ambiguity in repeated course names and long titles.
- Tune row spacing and alignment for fast scanning.

Implementation notes:

- This phase should improve information hierarchy, not rework the shell.
- Status emphasis should stay restrained and readable.

Done when:

- Each row communicates priority at a glance.
- Titles, dates, and status are easy to scan without extra decoration.

## Phase 6: Today strip and focus summary

Goal: add a compact top-level summary without reintroducing dashboard clutter.

Scope:

- Add a minimal “today” or “this week” strip.
- Surface next due item and short workload context.
- Keep it quiet, compact, and secondary to the assignment list.

Implementation notes:

- This should support progressive disclosure rather than constant detail.
- The strip should be removable independently if it adds noise.

Done when:

- The user can orient quickly without feeling like the page became busy again.

## Phase 7: Focused page variants

Goal: bring the same editorial minimalism to key non-dashboard Canvas pages.

Scope:

- Assignment page cleanup.
- Module page cleanup.
- Announcement page cleanup.
- Reading mode for content-heavy pages.

Implementation notes:

- Each page variant should be modular and independently debuggable.
- Per-page selectors should stay isolated so regressions are easier to trace.

Done when:

- Non-dashboard pages feel consistent with the dashboard redesign.
- Page-specific fixes do not leak across unrelated surfaces.

## Phase 8: Mobile and narrow-width polish

Goal: keep the redesign readable and usable on smaller screens.

Scope:

- Adjust spacing and widths for smaller viewports.
- Stack agenda metadata cleanly.
- Reduce overflow and awkward wrapping.
- Preserve tap-friendly controls and readable text sizes.

Done when:

- Dashboard and focused pages remain calm and usable on narrower screens.

## Phase 9: Motion and final polish

Goal: add subtle finishing detail once structure is stable.

Scope:

- Add restrained reveal/transition effects.
- Smooth section and assignment-list updates.
- Tune hover/focus states.
- Finalize visual consistency across popup, options page, and content surfaces.

Implementation notes:

- Motion should never become decorative noise.
- Structural clarity matters more than polish.

Done when:

- The extension feels intentional and finished without becoming flashy.

## Recommended implementation order

1. Phase 0: scaffolding and diagnostics
2. Phase 1: typography and color reset
3. Phase 2: dashboard shell and spacing
4. Phase 3: left rail simplification
5. Phase 4: agenda list layout
6. Phase 5: assignment row hierarchy
7. Phase 6: today strip and focus summary
8. Phase 7: focused page variants
9. Phase 8: mobile and narrow-width polish
10. Phase 9: motion and final polish

## Current status

- Phase 0 is implemented.
- Phase 1 is implemented.
- Phase 2 is implemented.
- Phase 3 is implemented.
- Phase 4 is implemented.
- Later phases are planned but not fully rolled out yet.

## Known bugs

- Left-rail selected-state overlay is not yet consistent across all global navigation tabs.
  Dashboard can be styled reliably, but other tabs still use different active-state markup/classes in Canvas, so the subtle selected overlay does not always appear outside the dashboard view.

## Debugging checklist

When a UI rule stops working:

1. Turn on `Preview mode`.
2. Run diagnostics from the popup.
3. Check active layout mode and phase flags first.
4. Compare matched selectors in DevTools.
5. Prefer exact element selectors over broad container rules.
6. Protect critical headings and anchors from generic hide logic.
7. Add a temporary selector only long enough to verify the fix.
8. Promote the stable fix into the dedicated module for that surface.

## Dashboard header lessons

The dashboard header issue is the current reference example for how to debug risky DOM changes:

- keep exact selector ownership in a dedicated module
- keep heading-protection logic separate from generic renderer behavior
- expose header match counts in diagnostics
- avoid broad header-child hiding when a specific element can be targeted
