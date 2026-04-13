import { expect, test } from "./fixtures.mjs";
import { collectHeaderSnapshot, collectRailSnapshot } from "./helpers/canvas-probes.mjs";
import { REAL_CANVAS_ROUTES, resolveCanvasUrl } from "./helpers/routes.mjs";

const EDITORIAL_RAIL_SURFACE = "rgba(58, 76, 85, 0.98)";

test.describe("Real Canvas dashboard smoke", () => {
  test("keeps the dashboard header title while hiding header chrome", async ({ page, canvasBaseURL }) => {
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });

    const snapshot = await collectHeaderSnapshot(page);

    expect(snapshot.titleText).toBe("Dashboard");
    expect(snapshot.titleStatus).toBe("visible");
    expect(snapshot.searchStatus).not.toBe("visible");
    expect(snapshot.optionsStatus).not.toBe("visible");
  });

  test("renders a single selected rail cue on the dashboard tab", async ({ page, canvasBaseURL }) => {
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });

      const snapshot = await collectRailSnapshot(page);

      expect(snapshot.extensionMounted).toBe(true);
      expect(snapshot.activeLinkId).toBe("global_nav_dashboard_link");
      expect(snapshot.railBackground).toBe(EDITORIAL_RAIL_SURFACE);
      expect(snapshot.activeBorderLeftWidth).toBe("2px");
      expect(snapshot.visibleLabelCount).toBe(0);
    });

  test("matches the saved dashboard rail screenshot", async ({ page, canvasBaseURL }, testInfo) => {
    test.skip(
      testInfo.project.metadata.screenshotMode !== "on",
      "Set BLANK_CANVAS_SCREENSHOTS=on to keep screenshot baselines active."
    );

    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });

    await expect(page.locator("#menu")).toHaveScreenshot("dashboard-left-rail.png");
  });
});
