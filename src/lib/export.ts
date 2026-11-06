import { toBlob, toSvg } from "html-to-image";
import { exportFontCSS } from "./fonts";

export function exportDimensions(width: number, height: number, scale: number) {
  const w = Math.ceil(width) * scale;
  const h = Math.ceil(height) * scale;
  if (![w, h, scale].every(Number.isFinite) || w < 1 || h < 1 || ![2, 3, 4].includes(scale)) {
    throw new Error("The preview is not ready yet. Please try again.");
  }
  if (w > 16_384 || h > 16_384 || w * h > 32_000_000) {
    throw new Error("This image is too large. Use 2x resolution or a shorter snippet.");
  }
  return { width: w, height: h };
}

export function imageFilename(title: string, ext: "png" | "svg" = "png") {
  const base = title
    .trim()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "snippet"}.${ext}`;
}

export async function renderImage(node: HTMLElement, scale: number, fontId: string): Promise<Blob> {
  await document.fonts.ready;
  exportDimensions(node.offsetWidth, node.offsetHeight, scale);
  const blob = await toBlob(node, {
    pixelRatio: scale,
    fontEmbedCSS: exportFontCSS(fontId),
    width: node.offsetWidth,
    height: node.offsetHeight,
    skipAutoScale: true,
    filter: (child) => !(child instanceof HTMLElement && child.dataset.exportHide === "true"),
  });
  if (!blob || blob.size === 0) throw new Error("The image could not be rendered. Try a shorter snippet.");
  return blob;
}

export async function renderSvgBlob(node: HTMLElement, fontId: string): Promise<Blob> {
  await document.fonts.ready;
  exportDimensions(node.offsetWidth, node.offsetHeight, 2);
  const dataUrl = await toSvg(node, {
    fontEmbedCSS: exportFontCSS(fontId),
    width: node.offsetWidth,
    height: node.offsetHeight,
    filter: (child) => !(child instanceof HTMLElement && child.dataset.exportHide === "true"),
  });
  const comma = dataUrl.indexOf(",");
  if (comma === -1) throw new Error("The SVG could not be rendered.");
  const svgMarkup = decodeURIComponent(dataUrl.slice(comma + 1));
  return new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
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
