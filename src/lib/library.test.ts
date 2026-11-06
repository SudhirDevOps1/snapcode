import { describe, expect, it } from "vitest";
import {
  clearAllLocalData,
  LIBRARY_KEY,
  loadLibrary,
  MAX_LIBRARY_ITEMS,
  sanitizeLibrary,
  saveLibrary,
  type LibraryItem,
} from "./library";
import { STORAGE_KEY } from "./settings";

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
  };
}

const item = (overrides: Partial<LibraryItem> = {}): LibraryItem => ({
  id: "item-1",
  name: "Demo",
  code: "print('hi')",
  language: "python",
  title: "demo.py",
  savedAt: 1,
  ...overrides,
});

describe("sanitizeLibrary", () => {
  it("drops entries without valid code and keeps the rest", () => {
    const clean = sanitizeLibrary([item(), { name: "no code" }, null, item({ code: "x".repeat(500_001) })]);
    expect(clean).toHaveLength(1);
    expect(clean[0].name).toBe("Demo");
  });

  it("replaces unsafe ids and unknown languages with safe values", () => {
    const [entry] = sanitizeLibrary([{ ...item(), id: "<bad id>", language: "cobol", name: "  " }]);
    expect(entry.id).toMatch(/^[A-Za-z0-9_-]{1,64}$/);
    expect(entry.language).toBe("auto");
    expect(entry.name).toBe("Untitled");
  });

  it("caps the library size", () => {
    const many = Array.from({ length: MAX_LIBRARY_ITEMS + 10 }, (_, i) => item({ id: `id-${i}` }));
    expect(sanitizeLibrary(many)).toHaveLength(MAX_LIBRARY_ITEMS);
  });

  it("returns an empty list for non-array input", () => {
    expect(sanitizeLibrary({ not: "an array" })).toEqual([]);
  });
});

describe("library storage", () => {
  it("round-trips snippets through storage", () => {
    const storage = memoryStorage();
    expect(saveLibrary([item()], storage)).toBe(true);
    expect(loadLibrary(storage)).toEqual([expect.objectContaining({ id: "item-1", code: "print('hi')" })]);
  });

  it("survives corrupted storage", () => {
    const storage = memoryStorage();
    storage.setItem(LIBRARY_KEY, "{broken");
    expect(loadLibrary(storage)).toEqual([]);
  });

  it("reports a full or blocked storage instead of throwing", () => {
    const full = {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(saveLibrary([item()], full)).toBe(false);
  });

  it("clears snippets and preferences together", () => {
    const storage = memoryStorage();
    storage.setItem(LIBRARY_KEY, "[]");
    storage.setItem(STORAGE_KEY, "{}");
    clearAllLocalData(storage);
    expect(storage.store.size).toBe(0);
  });
});
