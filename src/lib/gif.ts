import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { toCanvas } from "html-to-image";
import { exportFontCSS } from "./fonts";

export const GIF_MAX_FRAMES = 60;
export const GIF_MAX_EDGE = 1400;
export const GIF_SPEEDS = [
  { id: "fast", label: "Fast", msPerFrame: 60 },
  { id: "normal", label: "Normal", msPerFrame: 110 },
  { id: "slow", label: "Slow", msPerFrame: 180 },
] as const;
export type GifSpeedId = (typeof GIF_SPEEDS)[number]["id"];

export interface GifOptions {
  fontId: string;
  speed: GifSpeedId;
  /** Called with 0..1 so the UI can show progress. */
  onProgress?: (fraction: number) => void;
  /** Reveals the code line by line through this callback; must trigger a synchronous DOM update. */
  setVisibleLines: (count: number) => Promise<void>;
  totalLines: number;
  holdLastMs?: number;
}

const skipExportOnly = (node: HTMLElement) => !(node instanceof HTMLElement && node.dataset.exportHide === "true");

/**
 * Builds an animated "typing" GIF by revealing the snippet line by line, snapshotting each state.
 * Runs entirely in the browser. Frame count is capped to keep memory and time bounded.
 */
export async function renderTypingGif(node: HTMLElement, options: GifOptions): Promise<Blob> {
  await document.fonts.ready;
  const speed = GIF_SPEEDS.find((item) => item.id === options.speed) ?? GIF_SPEEDS[1];
  const total = Math.max(1, options.totalLines);
  const step = Math.max(1, Math.ceil(total / GIF_MAX_FRAMES));
  const fontEmbedCSS = exportFontCSS(options.fontId);

  // Render the full snippet once to lock the frame size, so lines "appear" inside a stable window.
  await options.setVisibleLines(total);
  const scale = Math.min(1, GIF_MAX_EDGE / Math.max(node.offsetWidth, node.offsetHeight));
  const width = node.offsetWidth;
  const height = node.offsetHeight;

  const gif = GIFEncoder();
  const frames: number[] = [];
  for (let count = step; count < total; count += step) frames.push(count);
  frames.push(total);

  let first = true;
  for (let i = 0; i < frames.length; i++) {
    await options.setVisibleLines(frames[i]);
    const canvas = await toCanvas(node, {
      pixelRatio: scale,
      width,
      height,
      skipAutoScale: true,
      fontEmbedCSS,
      filter: skipExportOnly,
      backgroundColor: "#ffffff",
    });
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable for GIF encoding.");
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    const isLast = i === frames.length - 1;
    const delay = isLast ? Math.max(speed.msPerFrame, options.holdLastMs ?? 1800) : speed.msPerFrame;
    if (first) {
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay, repeat: 0 });
      first = false;
    } else {
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });
    }
    options.onProgress?.((i + 1) / frames.length);
  }
  gif.finish();
  await options.setVisibleLines(total);
  const bytes = gif.bytes();
  const copy = new Uint8Array(new ArrayBuffer(bytes.byteLength));
  copy.set(bytes);
  return new Blob([copy], { type: "image/gif" });
}
