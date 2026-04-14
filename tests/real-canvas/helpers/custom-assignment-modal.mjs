import { expect } from "../fixtures.mjs";

const MODAL_SELECTOR = "#blank-canvas-custom-assignment-modal";

export function getCustomAssignmentModal(page) {
  return page.locator(MODAL_SELECTOR);
}

export async function openCustomAssignmentModal(page) {
  await page.locator("#blank-canvas-dashboard-todo").getByRole("button", { name: "New custom" }).click();
  const modal = getCustomAssignmentModal(page);
  await expect(modal).toBeVisible();
  return modal;
}

export async function setCustomAssignmentSchedule(modal, { dateValue, hour, minute, meridiem }) {
  await modal.locator("#blank-canvas-custom-assignment-modal-date-button").click();
  await modal.locator(`button[data-date-value='${dateValue}']`).click();
  await modal.locator("#blank-canvas-custom-assignment-modal-time-hour").fill(hour);
  await modal.locator("#blank-canvas-custom-assignment-modal-time-minute").fill(minute);
  await modal.locator("#blank-canvas-custom-assignment-modal-time-meridiem").selectOption(meridiem);
}

export async function collectCustomAssignmentModalSnapshot(page) {
  return page.evaluate(() => {
    const modal = document.getElementById("blank-canvas-custom-assignment-modal");
    const hour = document.getElementById("blank-canvas-custom-assignment-modal-time-hour");
    const minute = document.getElementById("blank-canvas-custom-assignment-modal-time-minute");
    const meridiem = document.getElementById("blank-canvas-custom-assignment-modal-time-meridiem");
    const dateButton = document.getElementById("blank-canvas-custom-assignment-modal-date-button");
    const calendar = modal ? modal.querySelector(".blank-canvas__custom-modal-calendar-days") : null;

    return {
      mounted: Boolean(modal),
      open: Boolean(modal && !modal.hidden),
      hasCalendarGrid: Boolean(calendar),
      hasDateButton: Boolean(dateButton),
      hourTagName: hour ? hour.tagName : "",
      minuteTagName: minute ? minute.tagName : "",
      meridiemTagName: meridiem ? meridiem.tagName : "",
      meridiemValue: meridiem ? meridiem.value : "",
      separatorCount: modal ? modal.querySelectorAll(".blank-canvas__custom-modal-time-separator").length : 0
    };
  });
}
