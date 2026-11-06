import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS, STORAGE_KEY, loadSettings, sanitizeSettings, saveSettings } from "./settings";

describe("sanitizeSettings", () => {
  it("returns defaults for garbage input", () => {
    for (const bad of [null, undefined, 42, "str", [], {}]) {
      expect(sanitizeSettings(bad)).toEqual(DEFAULT_SETTINGS);
    }
  });

  it("keeps valid values", () => {
    const valid = {
      ...DEFAULT_SETTINGS,
      uiTheme: "dark" as const,
      themeId: "catppuccin-mocha",
      fontId: "cascadia",
      fontSize: 18,
      lineHeight: 1.9,
      ligatures: false,
      lineStart: 42,
      showBadge: true,
      windowBorder: "glow" as const,
      aspectRatio: "16:9" as const,
      exportScale: 4,
      windowStyle: "terminal" as const,
    };
    expect(sanitizeSettings(valid)).toEqual(valid);
  });

  it("clamps out-of-range numbers", () => {
    const s = sanitizeSettings({
      fontSize: 999,
      lineHeight: 9.5,
      lineStart: -10,
      padding: -50,
      radius: 1e9,
      customAngle: 720,
    });
    expect(s.fontSize).toBe(24);
    expect(s.lineHeight).toBe(2.2);
    expect(s.lineStart).toBe(1);
    expect(s.padding).toBe(0);
    expect(s.radius).toBe(36);
    expect(s.customAngle).toBe(360);
  });

  it("rejects unknown ids and non-hex colours (prevents CSS injection)", () => {
    const s = sanitizeSettings({
      themeId: "evil",
      bgId: "url(javascript:alert(1))",
      customFrom: "red; background: url(x)",
      customTo: "#12345",
      exportScale: 99,
      windowStyle: "<script>",
    });
    expect(s.themeId).toBe(DEFAULT_SETTINGS.themeId);
    expect(s.bgId).toBe(DEFAULT_SETTINGS.bgId);
    expect(s.customFrom).toBe(DEFAULT_SETTINGS.customFrom);
    expect(s.customTo).toBe(DEFAULT_SETTINGS.customTo);
    expect(s.exportScale).toBe(DEFAULT_SETTINGS.exportScale);
    expect(s.windowStyle).toBe(DEFAULT_SETTINGS.windowStyle);
  });
});

describe("load/save settings", () => {
  it("survives browsers that throw when the storage property itself is accessed", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("SecurityError");
      },
    });
    try {
      expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
      expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });
  const memory = () => {
    const store = new Map<string, string>();
    return {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    };
  };

  it("round-trips through storage", () => {
    const storage = memory();
    const next = { ...DEFAULT_SETTINGS, themeId: "tokyo", padding: 32 };
    saveSettings(next, storage);
    expect(loadSettings(storage)).toEqual(next);
  });

  it("survives corrupted JSON", () => {
    const storage = memory();
    storage.setItem(STORAGE_KEY, "{not json");
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });

  it("never throws when storage is unavailable", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
    };
    expect(loadSettings(broken)).toEqual(DEFAULT_SETTINGS);
    expect(() => saveSettings(DEFAULT_SETTINGS, broken)).not.toThrow();
  });
});
