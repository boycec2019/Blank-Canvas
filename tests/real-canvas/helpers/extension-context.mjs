import fs from "node:fs/promises";
import os from "node:os";
import { chromium } from "@playwright/test";
import path from "node:path";

export async function launchExtensionContext(options = {}) {
  const {
    extensionPath,
    storageState,
    extensionSettings = null,
    headless = false,
    args = []
  } = options;
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), "blank-canvas-real-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      ...args
    ],
  });

  if (storageState) {
    await context.setStorageState(storageState);
  }

  if (extensionSettings && Object.keys(extensionSettings).length > 0) {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent("serviceworker");
    await worker.evaluate(async (settings) => {
      const storageArea = chrome.storage.sync || chrome.storage.local;
      await storageArea.set(settings);
    }, extensionSettings);
  }

  return {
    context,
    userDataDir
  };
}
