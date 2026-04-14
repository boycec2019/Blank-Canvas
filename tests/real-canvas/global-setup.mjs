import path from "node:path";
import { chromium } from "@playwright/test";
import { assertCanvasAuthenticated } from "./helpers/auth-guards.mjs";

export default async function globalSetup(config) {
  const baseURL = process.env.BLANK_CANVAS_BASE_URL || config.projects[0]?.use?.baseURL;
  const storageState =
    process.env.BLANK_CANVAS_STORAGE_STATE ||
    config.projects[0]?.use?.storageState ||
    path.join(process.cwd(), "tests", "real-canvas", ".auth", "canvas.json");

  const browser = await chromium.launch({
    headless: true
  });
  const context = await browser.newContext({
    storageState
  });
  const page = await context.newPage();

  try {
    await page.goto(baseURL, {
      waitUntil: "networkidle"
    });
    await assertCanvasAuthenticated(page, baseURL);
  } finally {
    await context.close();
    await browser.close();
  }
}
