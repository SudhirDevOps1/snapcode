const MAX_LOGO_BYTES = 2_000_000;
const MAX_LOGO_EDGE = 144;
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/**
 * Prepares an on-device brand mark for embedding in the exported image. The logo is decoded,
 * downscaled to a small square, re-encoded as PNG, and returned as a data URL so it persists in
 * localStorage and exports offline. SVG logos are intentionally not accepted to avoid embedded scripts.
 */
export async function prepareLogo(file: File): Promise<string> {
  if (!(LOGO_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Please choose a PNG, JPEG, or WebP logo. SVG logos are not accepted for security.");
  }
  if (file.size > MAX_LOGO_BYTES) throw new Error("Please choose a logo under 2 MB.");

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_LOGO_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This logo could not be processed in this browser.");
    context.clearRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/png");
    if (!dataUrl.startsWith("data:image/png;base64,")) throw new Error("This logo could not be encoded.");
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
