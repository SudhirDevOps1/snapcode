import {
  BACKGROUNDS,
  EXPORT_FORMAT_IDS,
  FONTS,
  FRAMES,
  HIGHLIGHT_COLOR_IDS,
  SHADOWS,
  THEMES,
  WINDOW_WIDTH_IDS,
  type ExportFormatId,
  type FrameId,
  type HighlightColorId,
  type WindowWidthId,
} from "./data";
import { isRecord } from "./guards";

export type WindowStyle = "mac" | "mac-outline" | "win" | "terminal" | "none";
export type WindowBorder = "subtle" | "crisp" | "glass" | "glow";
export type UiTheme = "light" | "dark";
export type UnfocusedMode = "dim" | "blur";
export type TabSize = 2 | 4 | 8;
export type ExportScale = 2 | 3 | 4;

/** Every user-facing style preference. Code and imported files are never part of these settings. */
export interface Settings {
  uiTheme: UiTheme;
  themeId: string;
  fontId: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  tabSize: TabSize;
  ligatures: boolean;
  wrapLines: boolean;
  windowWidth: WindowWidthId;
  padding: number;
  radius: number;
  shadowId: string;
  bgId: string;
  solidColor: string;
  customFrom: string;
  customTo: string;
  customAngle: number;
  photoDim: number;
  photoBlur: number;
  grain: boolean;
  showLineNumbers: boolean;
  lineStart: number;
  highlightColor: HighlightColorId;
  unfocusedMode: UnfocusedMode;
  showHeader: boolean;
  showBadge: boolean;
  windowStyle: WindowStyle;
  windowBorder: WindowBorder;
  aspectRatio: FrameId;
  showWatermark: boolean;
  watermarkText: string;
  exportScale: ExportScale;
  exportFormat: ExportFormatId;
  exportQuality: number;
}

export const STORAGE_KEY = "snapcode.settings.v1";

export const DEFAULT_SETTINGS: Settings = {
  uiTheme: "light",
  themeId: "midnight",
  fontId: "jetbrains",
  fontSize: 15,
  lineHeight: 1.75,
  letterSpacing: 0,
  tabSize: 2,
  ligatures: true,
  wrapLines: false,
  windowWidth: "auto",
  padding: 64,
  radius: 12,
  shadowId: "large",
  bgId: "aurora",
  solidColor: "#E8DFF5",
  customFrom: "#667EEA",
  customTo: "#764BA2",
  customAngle: 135,
  photoDim: 25,
  photoBlur: 0,
  grain: false,
  showLineNumbers: true,
  lineStart: 1,
  highlightColor: "violet",
  unfocusedMode: "dim",
  showHeader: true,
  showBadge: false,
  windowStyle: "mac",
  windowBorder: "subtle",
  aspectRatio: "auto",
  showWatermark: false,
  watermarkText: "made with snapcode.",
  exportScale: 2,
  exportFormat: "png",
  exportQuality: 0.92,
};

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const clampInt = (value: unknown, min: number, max: number, fallback: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
};

const clampDecimal = (value: unknown, min: number, max: number, fallback: number, digits: number): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  const factor = 10 ** digits;
  return Math.min(max, Math.max(min, Math.round(value * factor) / factor));
};

const oneOf = <T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const bool = (value: unknown, fallback: boolean): boolean => (typeof value === "boolean" ? value : fallback);

const hex = (value: unknown, fallback: string): string =>
  typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;

/**
 * Validates untrusted input (stale or tampered localStorage, imported JSON, share links) and always
 * returns a complete, safe Settings object. Unknown keys are ignored; invalid values fall back to defaults.
 */
export function sanitizeSettings(input: unknown): Settings {
  const raw = isRecord(input) ? input : {};
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
    fontSize: clampInt(raw.fontSize, 11, 24, d.fontSize),
    lineHeight: clampDecimal(raw.lineHeight, 1.4, 2.2, d.lineHeight, 2),
    letterSpacing: clampDecimal(raw.letterSpacing, -0.5, 2, d.letterSpacing, 1),
    tabSize: oneOf(raw.tabSize, [2, 4, 8] as const, d.tabSize),
    ligatures: bool(raw.ligatures, d.ligatures),
    wrapLines: bool(raw.wrapLines, d.wrapLines),
    windowWidth: oneOf(raw.windowWidth, WINDOW_WIDTH_IDS, d.windowWidth),
    padding: clampInt(raw.padding, 0, 120, d.padding),
    radius: clampInt(raw.radius, 0, 36, d.radius),
    shadowId: oneOf(
      raw.shadowId,
      SHADOWS.map((s) => s.id),
      d.shadowId,
    ),
    bgId: oneOf(raw.bgId, [...BACKGROUNDS.map((b) => b.id), "custom", "solid", "transparent", "photo"], d.bgId),
    solidColor: hex(raw.solidColor, d.solidColor),
    customFrom: hex(raw.customFrom, d.customFrom),
    customTo: hex(raw.customTo, d.customTo),
    customAngle: clampInt(raw.customAngle, 0, 360, d.customAngle),
    photoDim: clampInt(raw.photoDim, 0, 80, d.photoDim),
    photoBlur: clampInt(raw.photoBlur, 0, 24, d.photoBlur),
    grain: bool(raw.grain, d.grain),
    showLineNumbers: bool(raw.showLineNumbers, d.showLineNumbers),
    lineStart: clampInt(raw.lineStart, 1, 50_000, d.lineStart),
    highlightColor: oneOf(raw.highlightColor, HIGHLIGHT_COLOR_IDS, d.highlightColor),
    unfocusedMode: oneOf(raw.unfocusedMode, ["dim", "blur"] as const, d.unfocusedMode),
    showHeader: bool(raw.showHeader, d.showHeader),
    showBadge: bool(raw.showBadge, d.showBadge),
    windowStyle: oneOf(raw.windowStyle, ["mac", "mac-outline", "win", "terminal", "none"] as const, d.windowStyle),
    windowBorder: oneOf(raw.windowBorder, ["subtle", "crisp", "glass", "glow"] as const, d.windowBorder),
    aspectRatio: oneOf(
      raw.aspectRatio,
      FRAMES.map((f) => f.id),
      d.aspectRatio,
    ),
    showWatermark: bool(raw.showWatermark, d.showWatermark),
    watermarkText:
      typeof raw.watermarkText === "string" && raw.watermarkText.trim().length > 0
        ? raw.watermarkText.trim().slice(0, 36)
        : d.watermarkText,
    exportScale: oneOf(raw.exportScale, [2, 3, 4] as const, d.exportScale),
    exportFormat: oneOf(raw.exportFormat, EXPORT_FORMAT_IDS, d.exportFormat),
    exportQuality: clampDecimal(raw.exportQuality, 0.5, 1, d.exportQuality, 2),
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
    /* storage unavailable or quota exceeded: settings simply won't persist */
  }
}

export function clearSettings(storage?: Pick<Storage, "removeItem">): void {
  try {
    (storage ?? window.localStorage).removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
