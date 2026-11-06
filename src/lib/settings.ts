import { ASPECT_RATIOS, BACKGROUNDS, FONTS, SHADOWS, THEMES } from "./data";

export type WindowStyle = "mac" | "mac-outline" | "win" | "terminal" | "none";
export type WindowBorder = "subtle" | "crisp" | "glass" | "glow";
export type AspectRatioId = "auto" | "16:9" | "2:1" | "4:5" | "1:1";
export type UiTheme = "light" | "dark";

export interface Settings {
  uiTheme: UiTheme;
  themeId: string;
  fontId: string;
  fontSize: number;
  lineHeight: number;
  ligatures: boolean;
  padding: number;
  radius: number;
  shadowId: string;
  bgId: string;
  solidColor: string;
  customFrom: string;
  customTo: string;
  customAngle: number;
  showLineNumbers: boolean;
  lineStart: number;
  showHeader: boolean;
  showBadge: boolean;
  windowStyle: WindowStyle;
  windowBorder: WindowBorder;
  aspectRatio: AspectRatioId;
  showWatermark: boolean;
  exportScale: number;
}

export const STORAGE_KEY = "snapcode.settings.v1";

export const DEFAULT_SETTINGS: Settings = {
  uiTheme: "light",
  themeId: "midnight",
  fontId: "jetbrains",
  fontSize: 15,
  lineHeight: 1.75,
  ligatures: true,
  padding: 64,
  radius: 12,
  shadowId: "large",
  bgId: "aurora",
  solidColor: "#E8DFF5",
  customFrom: "#667EEA",
  customTo: "#764BA2",
  customAngle: 135,
  showLineNumbers: true,
  lineStart: 1,
  showHeader: true,
  showBadge: false,
  windowStyle: "mac",
  windowBorder: "subtle",
  aspectRatio: "auto",
  showWatermark: false,
  exportScale: 2,
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
};

const clampFloat = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const clamped = Math.min(max, Math.max(min, value));
  return Math.round(clamped * 100) / 100;
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;

/**
 * Validates untrusted input (e.g. localStorage or imported JSON presets that may be
 * stale, corrupted or tampered with) and always returns a fully valid Settings object.
 */
export function sanitizeSettings(input: unknown): Settings {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;

  return {
    uiTheme: oneOf(raw.uiTheme, ["light", "dark"] as const, d.uiTheme),
    themeId: oneOf(
      raw.themeId,
      THEMES.map((t) => t.id),
      d.themeId,
    ),
    fontId: oneOf(
      raw.fontId,
      FONTS.map((f) => f.id),
      d.fontId,
    ),
    fontSize: clampNumber(raw.fontSize, 11, 24, d.fontSize),
    lineHeight: clampFloat(raw.lineHeight, 1.4, 2.2, d.lineHeight),
    ligatures: typeof raw.ligatures === "boolean" ? raw.ligatures : d.ligatures,
    padding: clampNumber(raw.padding, 0, 120, d.padding),
    radius: clampNumber(raw.radius, 0, 36, d.radius),
    shadowId: oneOf(
      raw.shadowId,
      SHADOWS.map((s) => s.id),
      d.shadowId,
    ),
    bgId: oneOf(raw.bgId, [...BACKGROUNDS.map((b) => b.id), "custom", "solid", "transparent"], d.bgId),
    solidColor: typeof raw.solidColor === "string" && HEX_COLOR.test(raw.solidColor) ? raw.solidColor : d.solidColor,
    customFrom: typeof raw.customFrom === "string" && HEX_COLOR.test(raw.customFrom) ? raw.customFrom : d.customFrom,
    customTo: typeof raw.customTo === "string" && HEX_COLOR.test(raw.customTo) ? raw.customTo : d.customTo,
    customAngle: clampNumber(raw.customAngle, 0, 360, d.customAngle),
    showLineNumbers: typeof raw.showLineNumbers === "boolean" ? raw.showLineNumbers : d.showLineNumbers,
    lineStart: clampNumber(raw.lineStart, 1, 9999, d.lineStart),
    showHeader: typeof raw.showHeader === "boolean" ? raw.showHeader : d.showHeader,
    showBadge: typeof raw.showBadge === "boolean" ? raw.showBadge : d.showBadge,
    windowStyle: oneOf(raw.windowStyle, ["mac", "mac-outline", "win", "terminal", "none"] as const, d.windowStyle),
    windowBorder: oneOf(raw.windowBorder, ["subtle", "crisp", "glass", "glow"] as const, d.windowBorder),
    aspectRatio: oneOf(
      raw.aspectRatio,
      ASPECT_RATIOS.map((a) => a.id),
      d.aspectRatio,
    ),
    showWatermark: typeof raw.showWatermark === "boolean" ? raw.showWatermark : d.showWatermark,
    exportScale: [2, 3, 4].includes(raw.exportScale as number) ? (raw.exportScale as number) : d.exportScale,
  };
}

export function loadSettings(storage?: Pick<Storage, "getItem">): Settings {
  try {
    const raw = (storage ?? window.localStorage).getItem(STORAGE_KEY);
    return raw ? sanitizeSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings, storage?: Pick<Storage, "setItem">): void {
  try {
    (storage ?? window.localStorage).setItem(STORAGE_KEY, JSON.stringify(sanitizeSettings(settings)));
  } catch {
    /* storage unavailable or quota exceeded — settings simply won't persist */
  }
}

export function clearSettings(storage?: Pick<Storage, "removeItem">): void {
  try {
    (storage ?? window.localStorage).removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
