export const PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_PHOTO_BYTES = 8_000_000;
const MAX_PHOTO_EDGE = 2400;

export interface BackgroundPhoto {
  url: string;
  name: string;
}

/**
 * Prepares a user photo for use as a background entirely on-device. The image is decoded, downscaled to
 * a sensible maximum, and re-encoded as JPEG, which also strips EXIF metadata such as GPS location.
 */
export async function preparePhoto(file: File): Promise<BackgroundPhoto> {
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Please choose a PNG, JPEG, or WebP image.");
  }
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Please choose an image under 8 MB.");

  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_PHOTO_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This image could not be processed in this browser.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) throw new Error("This image could not be processed in this browser.");
    return { url: URL.createObjectURL(blob), name: file.name.slice(0, 100) };
  } finally {
    bitmap.close();
  }
}
