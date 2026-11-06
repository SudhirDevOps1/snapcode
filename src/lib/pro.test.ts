import { describe, expect, it } from "vitest";
import { sanitizeAuthor, DEFAULT_AUTHOR } from "./author";
import {
  CUSTOM_THEME_ID,
  contrastRatio,
  forkTheme,
  lowContrastTokens,
  sanitizeCustomTheme,
  DEFAULT_CUSTOM_THEME,
} from "./custom-theme";
import { THEMES } from "./data";
import { createArrowOverlay, createTextOverlay, MAX_OVERLAYS, MAX_OVERLAY_TEXT, sanitizeOverlays } from "./overlays";
import { sanitizeSettings, DEFAULT_SETTINGS } from "./settings";

describe("overlay annotations", () => {
  it("creates text and arrow overlays with safe defaults", () => {
    const text = createTextOverlay();
    const arrow = createArrowOverlay();
    expect(text.kind).toBe("text");
    expect(arrow.kind).toBe("arrow");
    expect(text.id).not.toBe(arrow.id);
  });

  it("sanitizes hostile overlay payloads", () => {
    const clean = sanitizeOverlays([
      {
        kind: "text",
        x: 500,
        y: -20,
        text: "x".repeat(1000),
        color: "red; url(x)",
        bg: "#111827",
        size: 999,
        id: "<img>",
      },
      { kind: "arrow", x: 10, y: 10, x2: 1e9, y2: NaN, color: "#F59E0B", width: 99 },
      { kind: "iframe", src: "evil" },
      "not an object",
    ]);
    expect(clean).toHaveLength(2);
    const text = clean[0];
    expect(text.kind).toBe("text");
    if (text.kind === "text") {
      expect(text.x).toBe(100);
      expect(text.y).toBe(0);
      expect(text.text).toHaveLength(MAX_OVERLAY_TEXT);
      expect(text.color).toBe("#FFFFFF");
      expect(text.size).toBe(32);
      expect(text.id).toMatch(/^[A-Za-z0-9_-]+$/);
    }
    const arrow = clean[1];
    if (arrow.kind === "arrow") {
      expect(arrow.x2).toBe(100);
      expect(arrow.y2).toBe(45);
      expect(arrow.width).toBe(8);
    }
  });

  it("caps the number of overlays", () => {
    const many = Array.from({ length: MAX_OVERLAYS + 10 }, () => createTextOverlay());
    expect(sanitizeOverlays(many)).toHaveLength(MAX_OVERLAYS);
  });

  it("returns an empty list for non-arrays", () => {
    expect(sanitizeOverlays({ kind: "text" })).toEqual([]);
    expect(sanitizeOverlays(null)).toEqual([]);
  });
});

describe("author profile", () => {
  it("returns defaults for garbage", () => {
    expect(sanitizeAuthor(null)).toEqual(DEFAULT_AUTHOR);
  });

  it("trims, strips control chars and leading @, and bounds lengths", () => {
    const a = sanitizeAuthor({
      enabled: true,
      name: "  Sudhir\u0000 Singh  ",
      handle: "@@SudhirDevOps1",
      platform: "github",
      position: "top-right",
    });
    expect(a.name).toBe("Sudhir Singh");
    expect(a.handle).toBe("SudhirDevOps1");
    expect(a.platform).toBe("github");
    expect(a.position).toBe("top-right");
    expect(sanitizeAuthor({ name: "x".repeat(200) }).name).toHaveLength(40);
  });

  it("only accepts bounded JPEG data-URL avatars", () => {
    expect(sanitizeAuthor({ avatarUrl: "https://evil.example/a.png" }).avatarUrl).toBeNull();
    expect(sanitizeAuthor({ avatarUrl: "data:text/html;base64,PHNjcmlwdD4=" }).avatarUrl).toBeNull();
    expect(sanitizeAuthor({ avatarUrl: "data:image/jpeg;base64,/9j/4AAQ" }).avatarUrl).toBe(
      "data:image/jpeg;base64,/9j/4AAQ",
    );
    expect(sanitizeAuthor({ avatarUrl: `data:image/jpeg;base64,${"A".repeat(200_000)}` }).avatarUrl).toBeNull();
  });
});

describe("custom theme editor", () => {
  it("computes WCAG contrast and flags low-contrast tokens", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 0);
    const bad = sanitizeCustomTheme({ ...DEFAULT_CUSTOM_THEME, comment: "#22242e" });
    expect(lowContrastTokens(bad)).toContain("comment");
    expect(lowContrastTokens(DEFAULT_CUSTOM_THEME)).toEqual([]);
  });

  it("rejects invalid colours and derives dark/light from the background", () => {
    const t = sanitizeCustomTheme({ bg: "#FFFFFF", keyword: "javascript:alert(1)", name: "" });
    expect(t.bg).toBe("#FFFFFF");
    expect(t.dark).toBe(false);
    expect(t.keyword).toBe(DEFAULT_CUSTOM_THEME.keyword);
    expect(t.name).toBe("My Theme");
    expect(t.id).toBe(CUSTOM_THEME_ID);
  });

  it("forks any built-in theme into an editable copy", () => {
    const forked = forkTheme(THEMES[2]);
    expect(forked.id).toBe(CUSTOM_THEME_ID);
    expect(forked.bg).toBe(THEMES[2].bg);
    expect(forked.name).toContain("(custom)");
  });
});

describe("v1.3 settings", () => {
  it("accepts the custom theme id so the Pro theme editor can be applied", () => {
    expect(sanitizeSettings({ themeId: CUSTOM_THEME_ID }).themeId).toBe(CUSTOM_THEME_ID);
    expect(sanitizeSettings({ themeId: "not-a-theme" }).themeId).toBe(DEFAULT_SETTINGS.themeId);
  });

  it("validates tilt, compare divider, gif speed, opacity, and grayscale mode", () => {
    const s = sanitizeSettings({
      tilt: "left",
      compareMode: true,
      compareDivider: "glow",
      gifSpeed: "fast",
      unfocusedOpacity: 0.5,
      unfocusedMode: "grayscale",
      reflection: true,
    });
    expect(s.tilt).toBe("left");
    expect(s.compareMode).toBe(true);
    expect(s.compareDivider).toBe("glow");
    expect(s.gifSpeed).toBe("fast");
    expect(s.unfocusedOpacity).toBe(0.5);
    expect(s.unfocusedMode).toBe("grayscale");
    expect(s.reflection).toBe(true);
  });

  it("falls back for unknown values", () => {
    const s = sanitizeSettings({ tilt: "spin", compareDivider: "neon", gifSpeed: "warp", unfocusedOpacity: 5 });
    expect(s.tilt).toBe(DEFAULT_SETTINGS.tilt);
    expect(s.compareDivider).toBe(DEFAULT_SETTINGS.compareDivider);
    expect(s.gifSpeed).toBe(DEFAULT_SETTINGS.gifSpeed);
    expect(s.unfocusedOpacity).toBe(0.8);
  });
});
