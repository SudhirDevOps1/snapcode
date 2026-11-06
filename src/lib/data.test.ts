import { describe, expect, it } from "vitest";
import {
  FRAMES,
  BACKGROUNDS,
  DEFAULT_TITLES,
  EXT_TO_LANG,
  FONTS,
  LANGUAGES,
  SAMPLES,
  SHADOWS,
  STYLE_PRESETS,
  THEMES,
} from "./data";
import { HLJS_LANGS } from "./highlight";

const ids = (list: { id: string }[]) => list.map((i) => i.id);
const unique = (list: string[]) => new Set(list).size === list.length;

describe("data integrity", () => {
  it("has unique ids in every catalogue", () => {
    for (const list of [LANGUAGES, THEMES, FONTS, BACKGROUNDS, SHADOWS, STYLE_PRESETS, FRAMES]) {
      expect(unique(ids(list))).toBe(true);
    }
  });

  it("provides a sample, default filename and registered grammar for every language", () => {
    for (const { id } of LANGUAGES) {
      expect(SAMPLES[id], `sample for ${id}`).toBeTruthy();
      expect(DEFAULT_TITLES[id], `title for ${id}`).toBeTruthy();
      expect(HLJS_LANGS, `grammar for ${id}`).toContain(id);
    }
  });

  it("includes both dark and light themes and templates", () => {
    expect(THEMES.filter((t) => t.dark).length).toBeGreaterThanOrEqual(10);
    expect(THEMES.filter((t) => !t.dark).length).toBeGreaterThanOrEqual(6);
    expect(STYLE_PRESETS.some((p) => p.mode === "dark")).toBe(true);
    expect(STYLE_PRESETS.some((p) => p.mode === "light")).toBe(true);
  });

  it("supports the languages promised in the README", () => {
    const names = LANGUAGES.map((l) => l.name);
    for (const required of ["JavaScript", "Python", "Rust", "Go", "Java", "HTML", "CSS", "SQL"]) {
      expect(names).toContain(required);
    }
  });

  it("maps every file extension to a known language", () => {
    for (const lang of Object.values(EXT_TO_LANG)) {
      expect(ids(LANGUAGES)).toContain(lang);
    }
  });

  it("style presets only reference existing options and match polarity", () => {
    for (const p of STYLE_PRESETS) {
      const theme = THEMES.find((t) => t.id === p.theme);
      expect(theme, `theme ${p.theme}`).toBeDefined();
      expect(theme!.dark ? "dark" : "light").toBe(p.mode);
      expect(ids(BACKGROUNDS)).toContain(p.bg);
      expect(ids(FONTS)).toContain(p.font);
      expect(ids(SHADOWS)).toContain(p.shadow);
    }
  });

  it("themes define valid colours and meet >= 4.5:1 WCAG AA contrast on their background", () => {
    const color = /^(#[0-9A-Fa-f]{6}|rgba?\([^)]+\))$/;
    const luminance = (hex: string) => {
      const rgb = [1, 3, 5].map((i) => {
        const c = parseInt(hex.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };
    const contrast = (a: string, b: string) => {
      const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    for (const t of THEMES) {
      for (const key of [
        "bg",
        "header",
        "border",
        "text",
        "lineNumber",
        "keyword",
        "string",
        "comment",
        "number",
        "fn",
      ] as const) {
        expect(t[key], `${t.id}.${key}`).toMatch(color);
      }
      for (const token of [
        "text",
        "lineNumber",
        "keyword",
        "string",
        "comment",
        "number",
        "fn",
        "builtin",
        "type",
        "attr",
        "tag",
        "operator",
      ] as const) {
        expect(contrast(t.bg, t[token]), `${t.id}.${token} contrast`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});
