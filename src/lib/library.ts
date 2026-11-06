import { LANGUAGES, MAX_CODE_CHARS } from "./data";
import { isRecord } from "./guards";
import { STORAGE_KEY } from "./settings";

/** Saved snippets live only in this browser's localStorage. Nothing is uploaded. */
export interface LibraryItem {
  id: string;
  name: string;
  code: string;
  language: string;
  title: string;
  savedAt: number;
}

export const LIBRARY_KEY = "snapcode.library.v1";
export const MAX_LIBRARY_ITEMS = 30;
const MAX_NAME_CHARS = 60;
const LANGUAGE_IDS = new Set(["auto", ...LANGUAGES.map((language) => language.id)]);
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function createItemId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Re-validates every stored item. Corrupt or oversized entries are dropped instead of crashing the app. */
export function sanitizeLibrary(input: unknown): LibraryItem[] {
  if (!Array.isArray(input)) return [];
  const items: LibraryItem[] = [];
  for (const entry of input) {
    if (items.length >= MAX_LIBRARY_ITEMS) break;
    if (!isRecord(entry) || typeof entry.code !== "string" || entry.code.length > MAX_CODE_CHARS) continue;
    items.push({
      id: typeof entry.id === "string" && ID_PATTERN.test(entry.id) ? entry.id : createItemId(),
      name: (typeof entry.name === "string" ? entry.name.trim().slice(0, MAX_NAME_CHARS) : "") || "Untitled",
      code: entry.code,
      language: typeof entry.language === "string" && LANGUAGE_IDS.has(entry.language) ? entry.language : "auto",
      title: typeof entry.title === "string" ? entry.title.slice(0, 100) : "snippet.txt",
      savedAt: typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt) ? entry.savedAt : 0,
    });
  }
  return items;
}

export function loadLibrary(storage?: Pick<Storage, "getItem">): LibraryItem[] {
  try {
    const raw = (storage ?? window.localStorage).getItem(LIBRARY_KEY);
    return raw ? sanitizeLibrary(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

/** Returns false when storage is unavailable or full, so the UI can explain instead of failing silently. */
export function saveLibrary(items: LibraryItem[], storage?: Pick<Storage, "setItem">): boolean {
  try {
    (storage ?? window.localStorage).setItem(LIBRARY_KEY, JSON.stringify(sanitizeLibrary(items)));
    return true;
  } catch {
    return false;
  }
}

/** Privacy control: removes every snippet and every saved preference from this browser. */
export function clearAllLocalData(storage?: Pick<Storage, "removeItem">): void {
  for (const key of [LIBRARY_KEY, STORAGE_KEY]) {
    try {
      (storage ?? window.localStorage).removeItem(key);
    } catch {
      /* storage blocked: nothing to clear */
    }
  }
}
