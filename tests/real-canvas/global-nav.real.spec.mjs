import { expect, test } from "./fixtures.mjs";
import { assertCanvasAuthenticated } from "./helpers/auth-guards.mjs";
import { collectRailSnapshot } from "./helpers/canvas-probes.mjs";
import { REAL_CANVAS_ROUTES, resolveCanvasUrl } from "./helpers/routes.mjs";

const EDITORIAL_RAIL_SURFACE = "rgba(58, 76, 85, 0.98)";

const SCENARIOS = [
  {
    key: "courses",
    route: REAL_CANVAS_ROUTES.courses,
    label: "Courses"
  },
  {
    key: "calendar",
    route: REAL_CANVAS_ROUTES.calendar,
    label: "Calendar"
  },
  {
    key: "inbox",
    route: REAL_CANVAS_ROUTES.inbox,
    label: "Inbox"
  }
];

test.describe("Real Canvas global navigation smoke", () => {
  for (const scenario of SCENARIOS) {
    test(`shows the shared selected overlay for ${scenario.label}`, async ({ page, canvasBaseURL }) => {
      await page.goto(resolveCanvasUrl(canvasBaseURL, scenario.route), {
        waitUntil: "networkidle"
      });
      await assertCanvasAuthenticated(page, canvasBaseURL);

      const snapshot = await collectRailSnapshot(page);

      expect(snapshot.extensionMounted).toBe(true);
      expect(snapshot.activeNavKey).toBe(scenario.key);
      expect(snapshot.railBackground).toBe(EDITORIAL_RAIL_SURFACE);
      expect(snapshot.activeBorderLeftWidth).toBe("2px");
      expect(snapshot.activeBackgroundImage).toContain("gradient");
      expect(snapshot.visibleLabelCount).toBe(0);
    });
  }
});
