import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

async function downloadNamed(page: Page, buttonName: string) {
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: buttonName, exact: true }).click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).not.toBeNull();
  return { name: download.suggestedFilename(), bytes: await readFile(path!) };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("exports JPEG, WebP, and SVG files with the right formats", async ({ page }) => {
  await page.getByRole("tab", { name: "Export", exact: true }).click();

  await page.getByRole("button", { name: "JPEG", exact: true }).click();
  const jpeg = await downloadNamed(page, "Download JPEG");
  expect(jpeg.name).toBe("hello-world.jpg");
  expect((await sharp(jpeg.bytes).metadata()).format).toBe("jpeg");

  await page.getByRole("button", { name: "WebP", exact: true }).click();
  const webp = await downloadNamed(page, "Download WebP");
  expect(webp.name).toBe("hello-world.webp");
  expect((await sharp(webp.bytes).metadata()).format).toBe("webp");

  await page.getByRole("button", { name: "SVG", exact: true }).click();
  const svg = await downloadNamed(page, "Download SVG");
  expect(svg.name).toBe("hello-world.svg");
  const text = svg.bytes.toString("utf8");
  expect(text).toContain("<svg");
  expect(text).toContain("@font-face");
});

test("social card frame exports an exact 2x size and keeps the code inside the frame", async ({ page }) => {
  await page.getByRole("tab", { name: "Export", exact: true }).click();
  await page.getByLabel("Frame", { exact: true }).selectOption("og");

  const exported = await downloadNamed(page, "Download PNG");
  const meta = await sharp(exported.bytes).metadata();
  expect(meta.width).toBe(2400);
  expect(meta.height).toBe(1260);

  const root = await page.getByTestId("export-canvas").boundingBox();
  const fitted = await page.locator(".frame-fit").boundingBox();
  expect(root && fitted).toBeTruthy();
  expect(fitted!.x).toBeGreaterThanOrEqual(root!.x - 1);
  expect(fitted!.x + fitted!.width).toBeLessThanOrEqual(root!.x + root!.width + 1);
  expect(fitted!.y + fitted!.height).toBeLessThanOrEqual(root!.y + root!.height + 1);
});

test("copy link restores the exact snippet when opened in a new session", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).fill("const shared = 42;\nconsole.log(shared);");
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("Share link copied");

  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toContain("#s=");

  const second = await context.newPage();
  await second.goto(link);
  await expect(second.locator(".highlighted-code")).toContainText("const shared = 42;");
  await expect(second.locator(".toast")).toContainText("Shared snippet loaded");
});

test("saved snippets persist in the browser and can be loaded again", async ({ page }) => {
  page.on("dialog", (dialog) => void dialog.accept());
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).fill("print('library works')");
  await page.locator("details.library-box > summary").click();
  await page.getByLabel("Snippet name", { exact: true }).fill("Python demo");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("Saved");

  await page.reload();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.locator(".library-load", { hasText: "Python demo" }).click();
  await expect(page.getByLabel("Your code", { exact: true })).toHaveValue("print('library works')");
});

test("focus mode keeps highlighted lines with context and gap markers", async ({ page }) => {
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).fill("one\ntwo\nthree\nfour\nfive\nsix");
  await page.getByLabel("Focus lines", { exact: true }).fill("2, 6");
  await page.getByRole("switch", { name: "Show only highlighted lines", exact: true }).click();
  // Default context is one line: lines 1-3 and 5-6 remain, with one gap between them.
  await expect(page.locator(".code-line:not(.is-gap)")).toHaveCount(5);
  await expect(page.locator(".code-line.is-gap")).toHaveCount(1);
});

test("photo background is processed on-device, exports, and reports no CSP violations", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) violations.push(message.text());
  });
  page.on("pageerror", (error) => violations.push(error.message));

  const photo = await sharp({
    create: { width: 640, height: 400, channels: 3, background: { r: 30, g: 120, b: 200 } },
  })
    .png()
    .toBuffer();

  await page.getByRole("tab", { name: "Style", exact: true }).click();
  await page.getByRole("button", { name: "Photo", exact: true }).click();
  await page.getByLabel("Choose background photo", { exact: true }).setInputFiles({
    name: "sunset.png",
    mimeType: "image/png",
    buffer: photo,
  });
  await expect(page.locator(".bg-photo")).toHaveCount(1);
  await expect(page.locator(".photo-name")).toHaveText("sunset.png");

  await page.getByRole("tab", { name: "Export", exact: true }).click();
  const exported = await downloadNamed(page, "Download PNG");
  expect((await sharp(exported.bytes).metadata()).format).toBe("png");
  expect(violations).toEqual([]);
});

test("new code and export panels meet automated WCAG AA checks", async ({ page }) => {
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  const codeTab = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(codeTab.violations).toEqual([]);

  await page.getByRole("tab", { name: "Export", exact: true }).click();
  const exportTab = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(exportTab.violations).toEqual([]);
});
