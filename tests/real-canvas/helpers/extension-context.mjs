import fs from "node:fs/promises";
import os from "node:os";
import { chromium } from "@playwright/test";
import path from "node:path";

export async function launchExtensionContext(options = {}) {
  const {
    extensionPath,
    storageState,
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

  return {
    context,
    userDataDir
  };
}
