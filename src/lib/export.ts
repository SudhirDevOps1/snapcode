import { toCanvas, toSvg } from "html-to-image";
import { EXPORT_FORMATS, type ExportFormatId } from "./data";
import { exportFontCSS } from "./fonts";

export const MAX_EDGE_PX = 16_384;
export const MAX_PIXELS = 32_000_000;

/** Pixel dimensions for a raster export, with guards against canvases browsers refuse to allocate. */
export function exportDimensions(width: number, height: number, scale: number) {
  const w = Math.ceil(width) * scale;
  const h = Math.ceil(height) * scale;
  if (![w, h, scale].every(Number.isFinite) || w < 1 || h < 1 || ![2, 3, 4].includes(scale)) {
    throw new Error("The preview is not ready yet. Please try again.");
  }
  if (w > MAX_EDGE_PX || h > MAX_EDGE_PX || w * h > MAX_PIXELS) {
    throw new Error("This image is too large. Use 2x resolution or a shorter snippet.");
  }
  return { width: w, height: h };
}

/** Safe, ASCII-only file name derived from the window title. */
export function imageFilename(title: string, ext = "png") {
  const base = title
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "snippet"}.${ext}`;
}

export interface RenderOptions {
  scale: number;
  fontId: string;
  format: ExportFormatId;
  quality: number;
  /** Used only for formats without transparency (JPEG). */
  background: string;
}

export interface RenderResult {
  blob: Blob;
  format: ExportFormatId;
}

const skipExportOnly = (node: HTMLElement) => !(node instanceof HTMLElement && node.dataset.exportHide === "true");

/**
 * Clones the preview off-screen and removes code rows whose display line number is not in `keep`.
 * Used for exporting only highlighted/diff lines or a custom range. The live preview is never modified.
 */
export function cloneWithExportRange(node: HTMLElement, keep: ReadonlySet<number>): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement;
  clone.querySelectorAll<HTMLElement>(".code-line:not(.is-gap)").forEach((row) => {
    const line = Number(row.dataset.line ?? "");
    if (!keep.has(line)) row.remove();
  });
  clone.querySelectorAll<HTMLElement>(".code-line.is-gap").forEach((row) => row.remove());
  if (clone.querySelectorAll(".code-line:not(.is-gap)").length === 0) {
    throw new Error("No lines selected for export. Choose a range with lines present.");
  }
  clone.style.position = "fixed";
  clone.style.left = "-100000px";
  clone.style.top = "0";
  clone.style.margin = "0";
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);
  return clone;
}

/** Converts html-to-image's SVG data URL to a Blob without a network request (CSP-safe). */
function svgDataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(",");
  if (!dataUrl.startsWith("data:") || comma < 0) throw new Error("The SVG could not be created.");
  const meta = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  if (meta.endsWith(";base64")) {
    const binary = atob(payload);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new Blob([bytes], { type: "image/svg+xml" });
  }
  return new Blob([decodeURIComponent(payload)], { type: "image/svg+xml" });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, quality));
}

/**
 * Renders the preview node in the requested format. Fonts are embedded from the bundle so exports work
 * offline. If a browser cannot encode WebP, the result falls back to lossless PNG and reports that format.
 */
export async function renderImage(node: HTMLElement, options: RenderOptions): Promise<RenderResult> {
  await document.fonts.ready;
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const fontEmbedCSS = exportFontCSS(options.fontId);

  if (options.format === "svg") {
    const dataUrl = await toSvg(node, { width, height, fontEmbedCSS, filter: skipExportOnly });
    return { blob: svgDataUrlToBlob(dataUrl), format: "svg" };
  }

  exportDimensions(width, height, options.scale);
  const canvas = await toCanvas(node, {
    pixelRatio: options.scale,
    width,
    height,
    skipAutoScale: true,
    fontEmbedCSS,
    filter: skipExportOnly,
    backgroundColor: options.format === "jpeg" ? options.background : undefined,
  });

  const meta = EXPORT_FORMATS.find((item) => item.id === options.format) ?? EXPORT_FORMATS[0];
  const encoded = await canvasToBlob(canvas, meta.mime, meta.lossy ? options.quality : undefined);
  if (encoded && encoded.type === meta.mime) return { blob: encoded, format: meta.id };

  const png = await canvasToBlob(canvas, "image/png");
  if (!png) throw new Error("The image could not be rendered. Try a shorter snippet.");
  return { blob: png, format: "png" };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
