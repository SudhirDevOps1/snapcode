import { isRecord } from "./guards";

/**
 * Overlay annotations rendered on top of the exported canvas: free text callouts and arrows.
 * Positions are percentages of the canvas so they survive resolution and frame changes.
 */
export type OverlayKind = "text" | "arrow";

export interface TextOverlay {
  id: string;
  kind: "text";
  x: number;
  y: number;
  text: string;
  color: string;
  bg: string;
  size: number;
}

export interface ArrowOverlay {
  id: string;
  kind: "arrow";
  x: number;
  y: number;
  x2: number;
  y2: number;
  color: string;
  width: number;
}

export type Overlay = TextOverlay | ArrowOverlay;

export const MAX_OVERLAYS = 20;
export const MAX_OVERLAY_TEXT = 140;
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export const OVERLAY_COLORS = ["#FFFFFF", "#111827", "#F59E0B", "#EC4899", "#22D3EE", "#A3E635", "#A78BFA", "#F43F5E"];

const pct = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(100, Math.max(0, Math.round(value * 10) / 10))
    : fallback;

export function newOverlayId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createTextOverlay(partial: Partial<TextOverlay> = {}): TextOverlay {
  return {
    id: newOverlayId(),
    kind: "text",
    x: 50,
    y: 12,
    text: "Your note here",
    color: "#FFFFFF",
    bg: "#111827",
    size: 14,
    ...partial,
  };
}

export function createArrowOverlay(partial: Partial<ArrowOverlay> = {}): ArrowOverlay {
  return {
    id: newOverlayId(),
    kind: "arrow",
    x: 70,
    y: 20,
    x2: 50,
    y2: 45,
    color: "#F59E0B",
    width: 3,
    ...partial,
  };
}

/** Validates overlay data from untrusted sources (share links, storage). Invalid entries are dropped. */
export function sanitizeOverlays(input: unknown): Overlay[] {
  if (!Array.isArray(input)) return [];
  const result: Overlay[] = [];
  for (const raw of input) {
    if (result.length >= MAX_OVERLAYS || !isRecord(raw)) continue;
    const id = typeof raw.id === "string" && ID_PATTERN.test(raw.id) ? raw.id : newOverlayId();
    if (raw.kind === "text") {
      result.push({
        id,
        kind: "text",
        x: pct(raw.x, 50),
        y: pct(raw.y, 12),
        text: typeof raw.text === "string" ? raw.text.slice(0, MAX_OVERLAY_TEXT) : "Note",
        color: typeof raw.color === "string" && HEX.test(raw.color) ? raw.color : "#FFFFFF",
        bg: typeof raw.bg === "string" && HEX.test(raw.bg) ? raw.bg : "#111827",
        size:
          typeof raw.size === "number" && Number.isFinite(raw.size)
            ? Math.min(32, Math.max(10, Math.round(raw.size)))
            : 14,
      });
    } else if (raw.kind === "arrow") {
      result.push({
        id,
        kind: "arrow",
        x: pct(raw.x, 70),
        y: pct(raw.y, 20),
        x2: pct(raw.x2, 50),
        y2: pct(raw.y2, 45),
        color: typeof raw.color === "string" && HEX.test(raw.color) ? raw.color : "#F59E0B",
        width:
          typeof raw.width === "number" && Number.isFinite(raw.width)
            ? Math.min(8, Math.max(1, Math.round(raw.width)))
            : 3,
      });
    }
  }
  return result;
}
