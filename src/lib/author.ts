import { isRecord } from "./guards";

/** Optional author/branding card rendered under the code window (name, handle, avatar). */
export interface AuthorProfile {
  enabled: boolean;
  name: string;
  handle: string;
  platform: AuthorPlatform;
  position: "bottom-left" | "bottom-right" | "top-right";
  avatarUrl: string | null;
}

export const AUTHOR_PLATFORMS = ["x", "github", "linkedin", "youtube", "instagram", "none"] as const;
export type AuthorPlatform = (typeof AUTHOR_PLATFORMS)[number];

export const AUTHOR_PLATFORM_LABELS: Record<AuthorPlatform, string> = {
  x: "X / Twitter",
  github: "GitHub",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  instagram: "Instagram",
  none: "No platform",
};

export const DEFAULT_AUTHOR: AuthorProfile = {
  enabled: false,
  name: "",
  handle: "",
  platform: "x",
  position: "bottom-left",
  avatarUrl: null,
};

export const AUTHOR_STORAGE_KEY = "snapcode.author.v1";
export const MAX_AVATAR_BYTES = 2_000_000;
const AVATAR_EDGE = 128;

/** Strips ASCII control characters (code points 0–31) that could break layout or exports. */
const stripControl = (value: string): string =>
  Array.from(value)
    .filter((ch) => ch.charCodeAt(0) > 31)
    .join("");

const text = (value: unknown, max: number): string =>
  typeof value === "string" ? stripControl(value).trim().slice(0, max) : "";

/** Validates author data from storage or share links. Avatar data URLs are capped in size. */
export function sanitizeAuthor(input: unknown): AuthorProfile {
  const raw = isRecord(input) ? input : {};
  const avatar = typeof raw.avatarUrl === "string" ? raw.avatarUrl : null;
  const avatarOk = avatar !== null && avatar.startsWith("data:image/jpeg;base64,") && avatar.length < 120_000;
  return {
    enabled: raw.enabled === true,
    name: text(raw.name, 40),
    handle: text(raw.handle, 40).replace(/^@+/, ""),
    platform: (AUTHOR_PLATFORMS as readonly string[]).includes(raw.platform as string)
      ? (raw.platform as AuthorPlatform)
      : "x",
    position: raw.position === "bottom-right" || raw.position === "top-right" ? raw.position : "bottom-left",
    avatarUrl: avatarOk ? avatar : null,
  };
}

export function loadAuthor(storage?: Pick<Storage, "getItem">): AuthorProfile {
  try {
    const raw = (storage ?? window.localStorage).getItem(AUTHOR_STORAGE_KEY);
    return raw ? sanitizeAuthor(JSON.parse(raw)) : DEFAULT_AUTHOR;
  } catch {
    return DEFAULT_AUTHOR;
  }
}

export function saveAuthor(author: AuthorProfile, storage?: Pick<Storage, "setItem">): void {
  try {
    (storage ?? window.localStorage).setItem(AUTHOR_STORAGE_KEY, JSON.stringify(sanitizeAuthor(author)));
  } catch {
    /* storage unavailable: branding simply won't persist */
  }
}

/**
 * Downscales an avatar to 128px and re-encodes it as a JPEG data URL (strips EXIF, bounded size).
 * Data URLs are used (not blob URLs) so the avatar survives export and share links.
 */
export async function prepareAvatar(file: File): Promise<string> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Please choose a PNG, JPEG, or WebP avatar.");
  }
  if (file.size > MAX_AVATAR_BYTES) throw new Error("Please choose an avatar under 2 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_EDGE;
    canvas.height = AVATAR_EDGE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This image could not be processed.");
    const scale = Math.max(AVATAR_EDGE / bitmap.width, AVATAR_EDGE / bitmap.height);
    const w = bitmap.width * scale;
    const h = bitmap.height * scale;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, AVATAR_EDGE, AVATAR_EDGE);
    ctx.drawImage(bitmap, (AVATAR_EDGE - w) / 2, (AVATAR_EDGE - h) / 2, w, h);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    if (url.length > 120_000) throw new Error("This avatar is too detailed to embed. Try a simpler image.");
    return url;
  } finally {
    bitmap.close();
  }
}
