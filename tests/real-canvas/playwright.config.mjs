import { defineConfig } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");
const extensionPath = process.env.BLANK_CANVAS_EXTENSION_PATH || repoRoot;
const storageState = process.env.BLANK_CANVAS_STORAGE_STATE || path.join(__dirname, ".auth", "canvas.json");
const baseURL = process.env.BLANK_CANVAS_BASE_URL || "https://canvas.example.com";
const screenshotMode = process.env.BLANK_CANVAS_SCREENSHOTS || "on";

export default defineConfig({
  testDir: __dirname,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: path.join(repoRoot, "test-results", "real-canvas"),
  snapshotPathTemplate: path.join(__dirname, "snapshots", "{testFilePath}", "{arg}{ext}"),
  timeout: 45_000,
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "real-canvas-chromium",
      use: {
        headless: false,
        storageState
      },
      metadata: {
        extensionPath,
        screenshotMode
      }
    }
  ]
});
