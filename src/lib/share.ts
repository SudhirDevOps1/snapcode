import { LANGUAGES, MAX_CODE_CHARS } from "./data";
import { isRecord } from "./guards";
import { sanitizeLineInputs, type LineInputs } from "./rows";
import { sanitizeSettings, type Settings } from "./settings";

/**
 * Share links keep the whole snippet inside the URL fragment (`#s=...`). Browsers never send fragments
 * to a server, so the code stays on the device. Payload: JSON -> gzip -> base64url.
 */
export interface SharedSnippet {
  code: string;
  title: string;
  language: string;
  lineInputs: LineInputs;
  settings: Settings;
}

export const SHARE_HASH_PREFIX = "#s=";
/** Keeps links within common chat, email, and browser URL limits. */
export const MAX_SHARE_TOKEN_CHARS = 60_000;
/** Decompression limit that prevents "zip bomb" style links from exhausting memory. */
export const MAX_INFLATED_BYTES = 400_000;

const LANGUAGE_IDS = new Set(["auto", ...LANGUAGES.map((language) => language.id)]);

type Bytes = Uint8Array<ArrayBuffer>;

function toBase64Url(bytes: Bytes): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): Bytes {
  const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function assertCompressionSupport(): void {
  if (typeof CompressionStream === "undefined" || typeof DecompressionStream === "undefined") {
    throw new Error("This browser cannot create share links. Save the snippet to your library or export an image.");
  }
}

async function gzip(bytes: Bytes): Promise<Bytes> {
  assertCompressionSupport();
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gunzipLimited(bytes: Bytes, limit: number): Promise<Bytes> {
  assertCompressionSupport();
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
  const chunks: Bytes[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > limit) {
      await reader.cancel();
      throw new Error("This share link expands to more data than Snapcode allows.");
    }
    chunks.push(value as Bytes);
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    output.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return output;
}

export async function encodeShare(snippet: SharedSnippet): Promise<string> {
  const payload = JSON.stringify({
    v: 1,
    code: snippet.code.slice(0, MAX_CODE_CHARS),
    title: snippet.title.slice(0, 100),
    language: LANGUAGE_IDS.has(snippet.language) ? snippet.language : "auto",
    lineInputs: sanitizeLineInputs(snippet.lineInputs),
    settings: sanitizeSettings(snippet.settings),
  });
  const token = toBase64Url(await gzip(new TextEncoder().encode(payload)));
  if (token.length > MAX_SHARE_TOKEN_CHARS) {
    throw new Error(
      `This snippet is too large for a link (${Math.round(token.length / 1000)} KB). Save it to your library or export an image instead.`,
    );
  }
  return token;
}

export async function decodeShare(token: string): Promise<SharedSnippet> {
  if (!token || token.length > MAX_SHARE_TOKEN_CHARS || !/^[A-Za-z0-9_-]+$/.test(token)) {
    throw new Error("This share link is not valid.");
  }
  const json = new TextDecoder().decode(await gunzipLimited(fromBase64Url(token), MAX_INFLATED_BYTES));
  const raw: unknown = JSON.parse(json);
  if (!isRecord(raw) || raw.v !== 1) throw new Error("This share link uses an unsupported format.");
  if (typeof raw.code !== "string" || raw.code.length > MAX_CODE_CHARS) {
    throw new Error("This share link contains too much code.");
  }
  return {
    code: raw.code.replace(/\r\n?/g, "\n"),
    title: typeof raw.title === "string" ? raw.title.slice(0, 100) : "snippet.txt",
    language: typeof raw.language === "string" && LANGUAGE_IDS.has(raw.language) ? raw.language : "auto",
    lineInputs: sanitizeLineInputs(raw.lineInputs),
    settings: sanitizeSettings(raw.settings),
  };
}

/** Returns the share token when the URL fragment carries one, otherwise null. */
export function readShareToken(hash: string): string | null {
  return hash.startsWith(SHARE_HASH_PREFIX) ? hash.slice(SHARE_HASH_PREFIX.length) : null;
}

export function buildShareUrl(token: string, location: Pick<Location, "origin" | "pathname">): string {
  return `${location.origin}${location.pathname}${SHARE_HASH_PREFIX}${token}`;
}
