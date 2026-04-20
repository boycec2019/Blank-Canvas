import { expect, test } from "./fixtures.mjs";
import { assertCanvasAuthenticated } from "./helpers/auth-guards.mjs";
import {
  collectCustomAssignmentModalSnapshot,
  openCustomAssignmentModal
} from "./helpers/custom-assignment-modal.mjs";
import {
  collectDashboardLayoutSnapshot,
  collectDashboardTodoSnapshot,
  collectHeaderSnapshot,
  collectRailSnapshot
} from "./helpers/canvas-probes.mjs";
import { REAL_CANVAS_ROUTES, resolveCanvasUrl } from "./helpers/routes.mjs";

const EDITORIAL_RAIL_SURFACE = "rgb(255, 250, 247)";

test.describe("Real Canvas dashboard smoke", () => {
  test("keeps the dashboard header title while hiding header chrome", async ({ page, canvasBaseURL }) => {
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

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
    await assertCanvasAuthenticated(page, canvasBaseURL);

      const snapshot = await collectRailSnapshot(page);

      expect(snapshot.extensionMounted).toBe(true);
      expect(snapshot.activeNavKey).toBe("dashboard");
      expect(snapshot.railBackground).toBe(EDITORIAL_RAIL_SURFACE);
      expect(snapshot.activeBorderLeftWidth).toBe("2px");
      expect(snapshot.visibleLabelCount).toBe(0);
    });

  test("renders assignment rows with split hierarchy and stable course titles", async ({
    page,
    canvasBaseURL
  }) => {
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

    const snapshot = await collectDashboardTodoSnapshot(page);

    expect(snapshot.rendered).toBe(true);
    expect(snapshot.layoutVariant).toBe("agenda");
    expect(snapshot.rowVariant).toBe("hierarchy");
    expect(snapshot.itemCount).toBeGreaterThan(0);
    expect(snapshot.hasLauncher).toBe(true);
    expect(snapshot.hasStructuredRows).toBe(true);
    expect(snapshot.summaryInsideWidget).toBe(false);
    expect(snapshot.widgetBeforeClasses).toBe(true);
    expect(snapshot.duplicateHeadlineCount).toBe(0);
    expect(snapshot.fallbackRows).toEqual([]);
  });

  test("uses the compact two-column dashboard layout on desktop widths", async ({
    page,
    canvasBaseURL
  }) => {
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

    const layoutSnapshot = await collectDashboardLayoutSnapshot(page);
    expect(layoutSnapshot.rendered).toBe(true);
    expect(layoutSnapshot.sectionOrder).toEqual(["assignments", "classes-anchor"]);
    expect(layoutSnapshot.layoutMode).toBe("split");
    expect(layoutSnapshot.leftColumnMounted).toBe(true);
    expect(layoutSnapshot.rightColumnMounted).toBe(true);
    expect(layoutSnapshot.classesInRightColumn).toBe(true);
    expect(layoutSnapshot.titleInLeftColumn).toBe(true);
    expect(layoutSnapshot.widgetBeforeClasses).toBe(true);
  });

  test("returns to a stacked dashboard layout on narrower widths", async ({
    page,
    canvasBaseURL
  }) => {
    await page.setViewportSize({
      width: 1024,
      height: 1200
    });
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

    const layoutSnapshot = await collectDashboardLayoutSnapshot(page);
    expect(layoutSnapshot.rendered).toBe(true);
    expect(layoutSnapshot.layoutMode).toBe("stacked");
    expect(layoutSnapshot.classesInRightColumn).toBe(false);
    expect(layoutSnapshot.rightColumnMounted).toBe(false);
  });

  test("opens the custom-assignment modal with structured schedule controls", async ({
    page,
    canvasBaseURL
  }) => {
    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

    await openCustomAssignmentModal(page);
    const snapshot = await collectCustomAssignmentModalSnapshot(page);

    expect(snapshot.mounted).toBe(true);
    expect(snapshot.open).toBe(true);
    expect(snapshot.hasDateButton).toBe(true);
    expect(snapshot.hasCalendarGrid).toBe(true);
    expect(snapshot.hourTagName).toBe("INPUT");
    expect(snapshot.minuteTagName).toBe("INPUT");
    expect(snapshot.meridiemTagName).toBe("SELECT");
    expect(snapshot.meridiemValue).toBe("PM");
    expect(snapshot.separatorCount).toBe(1);
  });

  test("matches the saved dashboard rail screenshot", async ({ page, canvasBaseURL }, testInfo) => {
    test.skip(
      testInfo.project.metadata.screenshotMode !== "on",
      "Set BLANK_CANVAS_SCREENSHOTS=on to keep screenshot baselines active."
    );

    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

    await expect(page.locator("#menu")).toHaveScreenshot("dashboard-left-rail.png");
  });
});
