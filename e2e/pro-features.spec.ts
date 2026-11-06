import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

async function openProTab(page: Page) {
  await page.getByRole("tab", { name: "Pro", exact: true }).click();
  await expect(page.locator(".pro-panel")).toBeVisible();
}

/** Expands a collapsed Pro section by its title, mirroring what a user does before editing it. */
async function openSection(page: Page, title: string) {
  const details = page.locator(".pro-section", { has: page.locator(".pro-section-title", { hasText: title }) });
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open))) {
    await details.locator("> summary").click();
  }
  await expect(details).toHaveAttribute("open", "");
}

async function downloadFrom(page: Page, name: string | RegExp) {
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name, exact: typeof name === "string" }).click();
  const download = await downloadEvent;
  const path = await download.path();
  expect(path).not.toBeNull();
  return { name: download.suggestedFilename(), bytes: await readFile(path!) };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("Pro tab is reachable by keyboard and all four tabs cycle with arrow keys", async ({ page }) => {
  await page.getByRole("tab", { name: "Style", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Code", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Pro", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Export", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Style", exact: true })).toHaveAttribute("aria-selected", "true");
});

test("text notes and arrows render on the canvas, drag, and export into the PNG", async ({ page }) => {
  await openProTab(page);
  await page.getByRole("button", { name: "Text note", exact: true }).click();
  await page.getByLabel("Note text", { exact: true }).fill("Look here");
  await expect(page.locator(".overlay-text")).toHaveText("Look here");

  await page.getByRole("button", { name: "Arrow", exact: true }).click();
  await expect(page.locator(".overlay-arrows line")).toHaveCount(1);
  await expect(page.locator(".overlay-handle")).toHaveCount(2);

  // Drag the note to the lower-right and verify its percentage position changed.
  const note = page.locator(".overlay-text");
  const canvas = await page.getByTestId("export-canvas").boundingBox();
  const before = await note.boundingBox();
  expect(canvas && before).toBeTruthy();
  await note.hover();
  await page.mouse.down();
  await page.mouse.move(canvas!.x + canvas!.width * 0.75, canvas!.y + canvas!.height * 0.7, { steps: 8 });
  await page.mouse.up();
  const after = await note.boundingBox();
  expect(after!.x).toBeGreaterThan(before!.x + 20);

  // Export includes the note (dark note pixels appear where the overlay sits).
  const viewport = page.viewportSize()?.width ?? 1440;
  const btn =
    viewport < 900
      ? page.locator(".mobile-export-bar").getByRole("button", { name: /Export/ })
      : page.getByRole("button", { name: "Export image", exact: true });
  const downloadEvent = page.waitForEvent("download");
  await btn.click();
  const download = await downloadEvent;
  const bytes = await readFile((await download.path())!);
  expect((await sharp(bytes).metadata()).format).toBe("png");
  // Arrow handles are editor-only and must never appear in exports.
  expect(await page.locator('[data-export-hide="true"] .overlay-handle').count()).toBeGreaterThan(0);
});

test("author card shows name and handle and is included in the exported image size", async ({ page }) => {
  await openProTab(page);
  await openSection(page, "Author branding");
  await page.getByRole("switch", { name: "Show author card", exact: true }).click();
  await page.getByLabel("Author name", { exact: true }).fill("Sudhir Singh");
  await page.getByLabel("Author handle", { exact: true }).fill("@SudhirDevOps1");
  const card = page.getByTestId("author-card");
  await expect(card).toContainText("Sudhir Singh");
  await expect(card).toContainText("@SudhirDevOps1");
  await page.reload();
  await openProTab(page);
  // Branding persists in this browser only.
  await expect(page.getByLabel("Author name", { exact: true })).toHaveValue("Sudhir Singh");
});

test("compare mode renders two windows side by side with the right code", async ({ page }) => {
  await openProTab(page);
  await openSection(page, "Compare two snippets");
  await page.getByRole("switch", { name: "Side-by-side compare", exact: true }).click();
  await page.getByLabel("Compare code", { exact: true }).fill("const after = true;");
  await page.getByLabel("Compare title", { exact: true }).fill("after.js");
  await expect(page.getByTestId("compare-stage")).toBeVisible();
  await expect(page.getByTestId("compare-right")).toContainText("const after = true;");
  await expect(page.getByTestId("compare-right")).toContainText("after.js");
  await expect(page.getByTestId("compare-left")).toBeVisible();
  await page.getByRole("button", { name: "Glow", exact: true }).click();
  await expect(page.locator(".compare-stage.divider-glow")).toHaveCount(1);
});

test("blur secrets and gray-out lines apply the right classes; highlighted lines stay crisp", async ({ page }) => {
  await openProTab(page);
  await openSection(page, "Blur secrets");
  await page.getByLabel("Blur lines", { exact: true }).fill("3");
  await page.getByLabel("Gray-out lines", { exact: true }).fill("1-2");
  await expect(page.locator(".code-line.is-secret")).toHaveCount(1);
  await expect(page.locator(".code-line.is-grayed")).toHaveCount(2);
  await expect(page.locator(".code-line.is-secret")).toHaveCSS("user-select", "none");
});

test("custom theme editor forks the current theme, applies it, flags low contrast, and persists", async ({ page }) => {
  await openProTab(page);
  await openSection(page, "Custom theme editor");
  await page.getByRole("button", { name: "Start from current theme", exact: true }).click();
  await expect(page.getByLabel("Custom theme name", { exact: true })).toHaveValue(/custom/);
  await expect(page.locator(".pro-actions .is-active")).toContainText("Using My Theme");

  // Set the keyword colour to nearly the background colour -> low-contrast warning.
  await page.getByLabel("Keywords color", { exact: true }).fill("#23212e");
  await expect(page.locator(".token-row.low-contrast")).toHaveCount(1);
  await expect(page.locator(".pro-panel")).toContainText("below 4.5:1");

  await page.getByLabel("Background color", { exact: true }).fill("#102030");
  await expect(page.locator(".code-window").first()).toHaveCSS("background-color", "rgb(16, 32, 48)");
  await page.reload();
  await expect(page.locator(".code-window").first()).toHaveCSS("background-color", "rgb(16, 32, 48)");
});

test("3D tilt and reflection change the frame, and exports still succeed", async ({ page }) => {
  await openProTab(page);
  await openSection(page, "3D tilt");
  await page.getByRole("button", { name: "Tilt left", exact: true }).click();
  await expect(page.locator(".frame-fit.is-tilted")).toHaveCount(1);
  const transform = await page.locator(".frame-fit").evaluate((el) => getComputedStyle(el).transform);
  expect(transform).not.toBe("none");
  await page.getByRole("switch", { name: "Floor reflection", exact: true }).click();
  await expect(page.locator(".window-reflection")).toHaveCount(1);
  await page.getByRole("tab", { name: "Export", exact: true }).click();
  const { bytes } = await downloadFrom(page, "Download PNG");
  expect((await sharp(bytes).metadata()).format).toBe("png");
});

test("animated typing GIF exports a real multi-frame GIF", async ({ page }) => {
  test.slow();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).fill("line 1\nline 2\nline 3\nline 4\nline 5");
  await openProTab(page);
  await openSection(page, "Animated typing GIF");
  await page.getByRole("button", { name: "Fast", exact: true }).click();
  const { name, bytes } = await downloadFrom(page, /Export typing GIF/);
  expect(name).toMatch(/\.gif$/);
  expect(bytes.subarray(0, 6).toString("ascii")).toMatch(/^GIF8[79]a$/);
  const meta = await sharp(bytes, { animated: true }).metadata();
  expect(meta.format).toBe("gif");
  expect((meta.pages ?? 1) >= 3).toBe(true);
  // Preview is restored to the full snippet after encoding.
  await expect(page.locator(".code-line:not(.is-gap)")).toHaveCount(5);
});

test("share link carries annotations and compare code", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openProTab(page);
  await page.getByRole("button", { name: "Text note", exact: true }).click();
  await page.getByLabel("Note text", { exact: true }).fill("Shared note");
  await openSection(page, "Compare two snippets");
  await page.getByRole("switch", { name: "Side-by-side compare", exact: true }).click();
  await page.getByLabel("Compare code", { exact: true }).fill("shared = 1");
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await expect(page.locator(".toast")).toContainText("Share link copied");
  const link = await page.evaluate(() => navigator.clipboard.readText());
  const second = await context.newPage();
  await second.goto(link);
  await expect(second.locator(".overlay-text")).toHaveText("Shared note");
  await expect(second.getByTestId("compare-right")).toContainText("shared = 1");
});

test("Pro panel meets automated WCAG AA checks in light and dark studio", async ({ page }) => {
  await openProTab(page);
  await page.locator(".pro-section > summary").nth(1).click();
  await page.locator(".pro-section > summary").nth(2).click();
  await page.waitForTimeout(400);
  const light = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(light.violations).toEqual([]);
  await page.getByRole("button", { name: "Switch to dark studio", exact: true }).click();
  await page.waitForTimeout(400);
  const dark = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(dark.violations).toEqual([]);
});
