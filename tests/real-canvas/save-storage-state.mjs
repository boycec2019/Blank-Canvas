import { chromium } from "@playwright/test";
import readline from "node:readline/promises";
import { stdin as input, stdout as output, env } from "node:process";
import path from "node:path";

const baseURL = env.BLANK_CANVAS_BASE_URL || "https://canvas.example.com";
const outputPath = env.BLANK_CANVAS_STORAGE_STATE || path.join("tests", "real-canvas", ".auth", "canvas.json");

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

await page.goto(baseURL, { waitUntil: "domcontentloaded" });

const rl = readline.createInterface({ input, output });
await rl.question(`Log into Canvas at ${baseURL}, then press Enter here to save storage state. `);
rl.close();

await context.storageState({ path: outputPath });
await browser.close();

console.log(`Saved storage state to ${outputPath}`);
