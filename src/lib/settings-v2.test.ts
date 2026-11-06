import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, sanitizeSettings } from "./settings";

describe("sanitizeSettings (v1.1 fields)", () => {
  it("clamps and rounds letter spacing", () => {
    expect(sanitizeSettings({ letterSpacing: 9 }).letterSpacing).toBe(2);
    expect(sanitizeSettings({ letterSpacing: -9 }).letterSpacing).toBe(-0.5);
    expect(sanitizeSettings({ letterSpacing: 0.46 }).letterSpacing).toBe(0.5);
  });

  it("accepts only supported tab widths", () => {
    expect(sanitizeSettings({ tabSize: 4 }).tabSize).toBe(4);
    expect(sanitizeSettings({ tabSize: 3 }).tabSize).toBe(DEFAULT_SETTINGS.tabSize);
  });

  it("accepts only supported export formats and clamps quality", () => {
    expect(sanitizeSettings({ exportFormat: "svg" }).exportFormat).toBe("svg");
    expect(sanitizeSettings({ exportFormat: "gif" }).exportFormat).toBe("png");
    expect(sanitizeSettings({ exportQuality: 0.1 }).exportQuality).toBe(0.5);
    expect(sanitizeSettings({ exportQuality: 2 }).exportQuality).toBe(1);
  });

  it("accepts the new social frames and rejects unknown ones", () => {
    expect(sanitizeSettings({ aspectRatio: "og" }).aspectRatio).toBe("og");
    expect(sanitizeSettings({ aspectRatio: "bogus" }).aspectRatio).toBe("auto");
  });

  it("bounds photo treatment values", () => {
    expect(sanitizeSettings({ photoDim: 500 }).photoDim).toBe(80);
    expect(sanitizeSettings({ photoBlur: -3 }).photoBlur).toBe(0);
  });

  it("accepts the photo background mode but rejects markup in background ids", () => {
    expect(sanitizeSettings({ bgId: "photo" }).bgId).toBe("photo");
    expect(sanitizeSettings({ bgId: "<img src=x>" }).bgId).toBe(DEFAULT_SETTINGS.bgId);
  });

  it("only accepts real booleans for toggles", () => {
    expect(sanitizeSettings({ grain: "yes" }).grain).toBe(false);
    expect(sanitizeSettings({ grain: true, wrapLines: true }).grain).toBe(true);
  });

  it("keeps every export scale that the UI offers", () => {
    for (const exportScale of [2, 3, 4]) {
      expect(sanitizeSettings({ exportScale }).exportScale).toBe(exportScale);
    }
  });

  it("validates highlight color, unfocused mode, window width, and watermark text", () => {
    const s = sanitizeSettings({
      highlightColor: "amber",
      unfocusedMode: "blur",
      windowWidth: "960",
      watermarkText: "  @SudhirDevOps1  ",
    });
    expect(s.highlightColor).toBe("amber");
    expect(s.unfocusedMode).toBe("blur");
    expect(s.windowWidth).toBe("960");
    expect(s.watermarkText).toBe("@SudhirDevOps1");

    const fallback = sanitizeSettings({
      highlightColor: "neon-pink",
      unfocusedMode: "invert",
      windowWidth: "9999",
      watermarkText: "   ",
    });
    expect(fallback.highlightColor).toBe("violet");
    expect(fallback.unfocusedMode).toBe("dim");
    expect(fallback.windowWidth).toBe("auto");
    expect(fallback.watermarkText).toBe(DEFAULT_SETTINGS.watermarkText);
  });

  it("validates export range, headline, and brand mark fields", () => {
    const s = sanitizeSettings({
      exportRange: "annotated",
      exportRangeSpec: " 2, 5-7 ",
      showHeadline: true,
      headlineText: "  Hello world  ",
      headlineTone: "dark",
      showBrandMark: true,
      brandMarkPosition: "top-right",
      brandMarkDataUrl: "data:image/png;base64,iVBORw0KGgo=",
    });
    expect(s.exportRange).toBe("annotated");
    expect(s.exportRangeSpec).toBe(" 2, 5-7 ");
    expect(s.showHeadline).toBe(true);
    expect(s.headlineText).toBe("Hello world");
    expect(s.headlineTone).toBe("dark");
    expect(s.showBrandMark).toBe(true);
    expect(s.brandMarkPosition).toBe("top-right");
    expect(s.brandMarkDataUrl).toBe("data:image/png;base64,iVBORw0KGgo=");

    const bad = sanitizeSettings({
      exportRange: "everything",
      headlineTone: "neon",
      brandMarkPosition: "centre",
      brandMarkDataUrl: "javascript:alert(1)",
    });
    expect(bad.exportRange).toBe("all");
    expect(bad.headlineTone).toBe("light");
    expect(bad.brandMarkPosition).toBe("bottom-right");
    expect(bad.brandMarkDataUrl).toBe("");
  });
});
