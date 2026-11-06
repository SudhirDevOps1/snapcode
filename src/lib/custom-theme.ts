import type { EditorTheme } from "./data";
import { isRecord } from "./guards";

/** A user-built colour theme. Stored locally; selectable alongside the built-in catalogue. */
export const CUSTOM_THEME_ID = "custom-theme";
export const CUSTOM_THEME_STORAGE_KEY = "snapcode.custom-theme.v1";

const HEX = /^#[0-9a-fA-F]{6}$/;

export const TOKEN_KEYS = [
  "bg",
  "header",
  "text",
  "lineNumber",
  "keyword",
  "string",
  "comment",
  "number",
  "fn",
  "variable",
  "builtin",
  "type",
  "attr",
  "tag",
  "operator",
] as const;

export type TokenKey = (typeof TOKEN_KEYS)[number];

export const TOKEN_LABELS: Record<TokenKey, string> = {
  bg: "Background",
  header: "Header",
  text: "Text",
  lineNumber: "Line numbers",
  keyword: "Keywords",
  string: "Strings",
  comment: "Comments",
  number: "Numbers",
  fn: "Functions",
  variable: "Variables",
  builtin: "Built-ins",
  type: "Types",
  attr: "Attributes",
  tag: "Tags",
  operator: "Operators",
};

export const DEFAULT_CUSTOM_THEME: EditorTheme = {
  id: CUSTOM_THEME_ID,
  name: "My Theme",
  dark: true,
  bg: "#1B1E2B",
  header: "#161925",
  border: "rgba(255,255,255,0.12)",
  text: "#E6E9F0",
  lineNumber: "#8A90A8",
  keyword: "#C792EA",
  string: "#C3E88D",
  comment: "#8A90A8",
  number: "#F78C6C",
  fn: "#82AAFF",
  variable: "#E6E9F0",
  builtin: "#89DDFF",
  type: "#FFCB6B",
  attr: "#FFCB6B",
  tag: "#F07178",
  operator: "#89DDFF",
};

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** WCAG contrast ratio between two hex colours. */
export function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Returns token keys whose contrast against the background is below WCAG AA (4.5:1). */
export function lowContrastTokens(theme: EditorTheme): TokenKey[] {
  return TOKEN_KEYS.filter((key) => key !== "bg" && key !== "header" && contrastRatio(theme.bg, theme[key]) < 4.5);
}

export function sanitizeCustomTheme(input: unknown): EditorTheme {
  const raw = isRecord(input) ? input : {};
  const d = DEFAULT_CUSTOM_THEME;
  const pick = (key: TokenKey) =>
    typeof raw[key] === "string" && HEX.test(raw[key] as string) ? (raw[key] as string) : d[key];
  const theme: EditorTheme = {
    id: CUSTOM_THEME_ID,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim().slice(0, 32) : d.name,
    dark: typeof raw.dark === "boolean" ? raw.dark : luminance(pick("bg")) < 0.4,
    border: d.border,
    bg: pick("bg"),
    header: pick("header"),
    text: pick("text"),
    lineNumber: pick("lineNumber"),
    keyword: pick("keyword"),
    string: pick("string"),
    comment: pick("comment"),
    number: pick("number"),
    fn: pick("fn"),
    variable: pick("variable"),
    builtin: pick("builtin"),
    type: pick("type"),
    attr: pick("attr"),
    tag: pick("tag"),
    operator: pick("operator"),
  };
  theme.border = theme.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";
  return theme;
}

export function loadCustomTheme(storage?: Pick<Storage, "getItem">): EditorTheme {
  try {
    const raw = (storage ?? window.localStorage).getItem(CUSTOM_THEME_STORAGE_KEY);
    return raw ? sanitizeCustomTheme(JSON.parse(raw)) : DEFAULT_CUSTOM_THEME;
  } catch {
    return DEFAULT_CUSTOM_THEME;
  }
}

export function saveCustomTheme(theme: EditorTheme, storage?: Pick<Storage, "setItem">): void {
  try {
    (storage ?? window.localStorage).setItem(CUSTOM_THEME_STORAGE_KEY, JSON.stringify(sanitizeCustomTheme(theme)));
  } catch {
    /* ignore */
  }
}

/** Derives a custom theme from any built-in theme as a starting point. */
export function forkTheme(base: EditorTheme): EditorTheme {
  return sanitizeCustomTheme({ ...base, name: `${base.name} (custom)` });
}
