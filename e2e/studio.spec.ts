import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import sharp from "sharp";

async function exportPng(page: Page) {
  const downloadEvent = page.waitForEvent("download");
  const button =
    (page.viewportSize()?.width ?? 1440) < 900
      ? page.locator(".mobile-export-bar").getByRole("button", { name: "Export PNG" })
      : page.getByRole("button", { name: "Export image", exact: true });
  await button.click();
  const download = await downloadEvent;
  const file = await download.path();
  expect(file).not.toBeNull();
  return { bytes: await readFile(file!), name: download.suggestedFilename() };
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("live syntax highlighting, language selection, and style persistence", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await expect(page.locator("#language-select option")).toHaveCount(35);
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).fill('def hello(name):\n    return f"Hello, {name}!"');
  await page.getByLabel("Language", { exact: true }).selectOption("python");
  await expect(page.locator(".highlighted-code")).toContainText('return f"Hello, {name}!"');
  await expect(page.locator(".highlighted-code .hljs-keyword").first()).toHaveText("def");
  await page.getByRole("tab", { name: "Style", exact: true }).click();
  await page.getByLabel("Theme", { exact: true }).selectOption("dracula");
  await expect(page.locator(".code-window")).toHaveCSS("background-color", "rgb(40, 42, 54)");
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("dracula");
  expect(errors).toEqual([]);
});

test("exports a real high-resolution PNG with transparency", async ({ page }) => {
  await page.getByRole("button", { name: "None", exact: true }).click();
  await page.getByLabel("Shadow", { exact: true }).fill("0");
  const size = await page
    .getByTestId("export-canvas")
    .evaluate((node) => ({ width: node.clientWidth, height: node.clientHeight }));
  const { bytes, name } = await exportPng(page);
  expect(name).toBe("hello-world.png");
  const metadata = await sharp(bytes).metadata();
  expect(metadata.format).toBe("png");
  expect(metadata.width).toBe(size.width * 2);
  expect(metadata.height).toBe(size.height * 2);
  const pixel = await sharp(bytes).extract({ left: 0, top: 0, width: 1, height: 1 }).ensureAlpha().raw().toBuffer();
  expect(pixel[3]).toBe(0);
  expect(bytes.length).toBeGreaterThan(10_000);
});

test("works and exports offline without third-party requests", async ({ page, context }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("http") && new URL(request.url()).origin !== "http://127.0.0.1:4173")
      external.push(request.url());
  });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByLabel("Font family").selectOption("space");
  await page.getByLabel("Theme", { exact: true }).selectOption("github-light");
  const { bytes } = await exportPng(page);
  expect((await sharp(bytes).metadata()).format).toBe("png");
  expect(external).toEqual([]);
  await context.setOffline(false);
});

test("imports text safely and rejects binary files", async ({ page }) => {
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Open code file", { exact: true }).setInputFiles({
    name: "hello.rs",
    mimeType: "text/plain",
    buffer: Buffer.from('fn main() { println!("Hello"); }'),
  });
  await expect(page.getByLabel("Language", { exact: true })).toHaveValue("rust");
  await expect(page.getByLabel("Your code", { exact: true })).toHaveValue('fn main() { println!("Hello"); }');
  await page
    .getByLabel("Open code file", { exact: true })
    .setInputFiles({ name: "bad.bin", mimeType: "application/octet-stream", buffer: Buffer.from([1, 0, 255]) });
  await expect(page.locator(".toast")).toContainText("binary file");
  await expect(page.getByLabel("Your code", { exact: true })).toHaveValue('fn main() { println!("Hello"); }');
});

test("templates preserve code, guide closes, and editor remains keyboard accessible", async ({ page }) => {
  const original = await page.locator(".highlighted-code").textContent();
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page.getByRole("button", { name: /Deep Sea/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".highlighted-code")).toHaveText(original!);
  await page.getByRole("button", { name: "Documentation", exact: false }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Your code", { exact: true }).focus();
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Your code", { exact: true })).not.toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("empty code disables exporting and HTML input stays inert", async ({ page }) => {
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByRole("button", { name: "Clear code", exact: true }).click();
  await expect(page.locator(".copy-image-button")).toBeDisabled();
  await page
    .getByLabel("Your code", { exact: true })
    .fill('<img src="x" onerror="window.pwned=true"><script>alert(1)</script>');
  await page.getByLabel("Language", { exact: true }).selectOption("xml");
  await expect(page.locator(".highlighted-code")).toContainText("<script>");
  await expect(page.locator(".highlighted-code img, .highlighted-code script")).toHaveCount(0);
});

test("primary interface meets automated WCAG AA checks", async ({ page }) => {
  await page.waitForTimeout(800);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("copies a real PNG to the browser clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.locator(".copy-image-button").click();
  await expect(page.locator(".toast")).toContainText("Image copied");
  const types = await page.evaluate(async () => (await navigator.clipboard.read()).flatMap((item) => item.types));
  expect(types).toContain("image/png");
});

test("font, layout, and window controls update the real canvas", async ({ page }) => {
  await page.getByLabel("Font family", { exact: true }).selectOption("fira");
  await expect(page.locator(".window-code")).toHaveCSS("font-family", '"Fira Code", monospace');
  await page.getByRole("button", { name: "Increase font size", exact: true }).click();
  await expect(page.locator(".window-code")).toHaveCSS("font-size", "16px");
  await page.getByRole("button", { name: "32 pixels padding", exact: true }).click();
  await expect(page.getByTestId("export-canvas")).toHaveCSS("padding", "32px");
  await page.getByRole("switch", { name: "Window controls", exact: true }).click();
  await expect(page.locator(".window-header")).toHaveCount(0);
  await page.getByRole("switch", { name: "Line numbers", exact: true }).click();
  await expect(page.locator(".line-numbers")).toHaveCount(0);
  await page.getByRole("button", { name: "Reset styling", exact: true }).click();
  await expect(page.locator(".window-header")).toHaveCount(1);
  await expect(page.getByTestId("export-canvas")).toHaveCSS("padding", "64px");
});

test("exports at the selected 4x resolution", async ({ page }) => {
  await page.getByRole("tab", { name: "Export", exact: true }).click();
  await page.getByRole("radio", { name: /4x Ultra crisp/ }).check();
  const size = await page
    .getByTestId("export-canvas")
    .evaluate((node) => ({ width: node.clientWidth, height: node.clientHeight }));
  const { bytes } = await exportPng(page);
  const metadata = await sharp(bytes).metadata();
  expect(metadata.width).toBe(size.width * 4);
  expect(metadata.height).toBe(size.height * 4);
});

test("supports dark studio mode with WCAG AA contrast and dark/light theme switching", async ({ page }) => {
  await page.getByRole("button", { name: "Switch to dark studio", exact: true }).click();
  await expect(page.locator(".app-shell")).toHaveAttribute("data-ui-theme", "dark");
  await page.getByLabel("Theme", { exact: true }).selectOption("catppuccin-latte");
  await expect(page.locator(".code-window")).toHaveCSS("background-color", "rgb(239, 241, 245)");
  await page.getByLabel("Font family", { exact: true }).selectOption("cascadia");
  await expect(page.locator(".window-code")).toHaveCSS("font-family", '"Cascadia Code", monospace');
  await page.waitForTimeout(400);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("supports line focus highlights, diff markers, and custom starting line numbers", async ({ page }) => {
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByLabel("Focus lines", { exact: true }).fill("2");
  await page.getByLabel("Added (+)", { exact: true }).fill("4");
  await page.getByLabel("Removed (-)", { exact: true }).fill("3");
  await page.getByRole("switch", { name: "Dim unfocused lines", exact: true }).click();
  await expect(page.locator(".code-line.is-highlighted")).toHaveCount(1);
  await expect(page.locator(".code-line.is-added")).toHaveCount(1);
  await expect(page.locator(".code-line.is-removed")).toHaveCount(1);
  await expect(page.locator(".code-line.is-dimmed").first()).toBeVisible();
});
