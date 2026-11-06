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
});
