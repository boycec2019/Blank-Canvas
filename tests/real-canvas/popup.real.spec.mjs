import { expect, test } from "./fixtures.mjs";
import { assertCanvasAuthenticated } from "./helpers/auth-guards.mjs";
import {
  collectCustomAssignmentModalSnapshot,
  openCustomAssignmentModal,
  setCustomAssignmentSchedule
} from "./helpers/custom-assignment-modal.mjs";
import { openPopupPage } from "./helpers/extension-pages.mjs";
import { REAL_CANVAS_ROUTES, resolveCanvasUrl } from "./helpers/routes.mjs";

test.describe("Real Canvas dashboard custom assignments smoke", () => {
  test("creates, edits, and deletes a custom assignment from the dashboard modal", async ({
    extensionContext,
    page,
    canvasBaseURL
  }) => {
    const createdTitle = "Playwright custom assignment";
    const updatedTitle = "Playwright custom assignment updated";

    await page.goto(resolveCanvasUrl(canvasBaseURL, REAL_CANVAS_ROUTES.dashboard), {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, canvasBaseURL);

    const widget = page.locator("#blank-canvas-dashboard-todo");
    await expect(widget).toBeVisible();
    const modal = await openCustomAssignmentModal(page);
    await expect(modal.locator("select option")).toContainText(["General"]);

    const modalSnapshot = await collectCustomAssignmentModalSnapshot(page);
    expect(modalSnapshot.hasDateButton).toBe(true);
    expect(modalSnapshot.hasCalendarGrid).toBe(true);
    expect(modalSnapshot.hourTagName).toBe("INPUT");
    expect(modalSnapshot.minuteTagName).toBe("INPUT");
    expect(modalSnapshot.meridiemTagName).toBe("SELECT");
    expect(modalSnapshot.separatorCount).toBe(1);

    await modal.locator("#blank-canvas-custom-assignment-modal-title-input").fill(createdTitle);
    await setCustomAssignmentSchedule(modal, {
      dateValue: "2026-04-20",
      hour: "5",
      minute: "00",
      meridiem: "PM"
    });
    await modal.getByRole("button", { name: "Save" }).click();

    const createdRow = widget.locator(".blank-canvas__todo-item", {
      hasText: createdTitle
    });
    await expect(createdRow).toContainText("Edit");
    await expect(createdRow).toContainText("Delete");

    const popup = await openPopupPage(extensionContext, {
      canvasBaseURL
    });

    try {
      await expect(popup.locator("#new-custom-assignment")).toHaveCount(0);
      await expect(
        popup.locator(".todo-item", {
          hasText: createdTitle
        })
      ).toContainText("Custom");

      await createdRow.getByRole("button", { name: "Edit" }).click();
      await expect(modal).toBeVisible();
      await modal.locator("#blank-canvas-custom-assignment-modal-title-input").fill(updatedTitle);
      await setCustomAssignmentSchedule(modal, {
        dateValue: "2026-04-21",
        hour: "11",
        minute: "59",
        meridiem: "PM"
      });
      await modal.getByRole("button", { name: "Save" }).click();

      await expect(widget).toContainText(updatedTitle, {
        timeout: 15000
      });
      await popup.getByRole("button", { name: "Refresh" }).click();
      await expect(
        popup.locator(".todo-item", {
          hasText: updatedTitle
        })
      ).toContainText("Custom");

      page.once("dialog", (dialog) => dialog.accept());
      await widget
        .locator(".blank-canvas__todo-item", {
          hasText: updatedTitle
        })
        .getByRole("button", { name: "Delete" })
        .click();

      await expect(widget).not.toContainText(updatedTitle, {
        timeout: 15000
      });
      await popup.getByRole("button", { name: "Refresh" }).click();
      await expect(popup.locator("body")).not.toContainText(updatedTitle);
    } finally {
      await popup.close();
    }
  });
});
