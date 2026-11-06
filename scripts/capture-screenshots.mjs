// Regenerates the README screenshots from the production build. Run `npm run build` first.
import { spawn } from "node:child_process";
import { get } from "node:http";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const PORT = 4190;
const BASE_URL = `http://127.0.0.1:${PORT}/`;
const OUT_DIR = fileURLToPath(new URL("../docs/screenshots/", import.meta.url));

const server = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"],
  { stdio: "ignore" },
);
process.on("exit", () => server.kill("SIGTERM"));

// Core http is used for the readiness probe; it is the most portable client across CI and sandboxes.
function ping() {
  return new Promise((resolve) => {
    get(BASE_URL, (response) => {
      response.resume();
      resolve(response.statusCode === 200);
    }).on("error", () => resolve(false));
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      if (await ping()) return;
    } catch {
      /* server still starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Preview server did not start. Run `npm run build` first.");
}

await waitForServer();
await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ args: ["--no-sandbox"] });

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await desktop.newPage();
  await page.goto(BASE_URL);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT_DIR}studio-light.png` });

  await page.getByRole("button", { name: "Switch to dark studio", exact: true }).click();
  await page.getByLabel("Theme", { exact: true }).selectOption("catppuccin-mocha");
  await page.getByLabel("Font family", { exact: true }).selectOption("geist");
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT_DIR}studio-dark.png` });

  await page.getByRole("tab", { name: "Export", exact: true }).click();
  await page.getByLabel("Frame", { exact: true }).selectOption("og");
  await page.waitForTimeout(700);
  await page.getByTestId("export-canvas").screenshot({ path: `${OUT_DIR}social-frame.png` });

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const phone = await mobile.newPage();
  await phone.goto(BASE_URL);
  await phone.waitForTimeout(1200);
  await phone.screenshot({ path: `${OUT_DIR}mobile.png` });
  console.log(`Screenshots written to ${OUT_DIR}`);
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
