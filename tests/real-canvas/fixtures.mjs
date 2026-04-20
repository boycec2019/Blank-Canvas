import fs from "node:fs/promises";
import path from "node:path";
import { test as base, expect } from "@playwright/test";
import { launchExtensionContext } from "./helpers/extension-context.mjs";

const extensionPath = process.env.BLANK_CANVAS_EXTENSION_PATH || path.resolve(process.cwd());
const storageState = process.env.BLANK_CANVAS_STORAGE_STATE || path.join(process.cwd(), "tests", "real-canvas", ".auth", "canvas.json");
const canvasBaseURL = process.env.BLANK_CANVAS_BASE_URL || "https://canvas.example.com";
const extensionSettings = process.env.BLANK_CANVAS_EXTENSION_SETTINGS
  ? JSON.parse(process.env.BLANK_CANVAS_EXTENSION_SETTINGS)
  : null;

export const test = base.extend({
  extensionContext: async ({}, use) => {
    const { context, userDataDir } = await launchExtensionContext({
      extensionPath,
      storageState,
      extensionSettings,
      headless: false
    });

    try {
      await use(context);
    } finally {
      await context.close();
      await fs.rm(userDataDir, {
        force: true,
        recursive: true
      });
    }
  },

  page: async ({ extensionContext }, use) => {
    const page = extensionContext.pages()[0] || await extensionContext.newPage();
    await use(page);
  },

  canvasBaseURL: async ({}, use) => {
    await use(canvasBaseURL);
  }
});

export { expect };
