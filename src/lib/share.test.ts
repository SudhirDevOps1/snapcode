import { describe, expect, it } from "vitest";
import { EMPTY_LINE_INPUTS } from "./rows";
import { DEFAULT_SETTINGS } from "./settings";
import {
  buildShareUrl,
  decodeShare,
  encodeShare,
  MAX_SHARE_TOKEN_CHARS,
  readShareToken,
  type SharedSnippet,
} from "./share";

const snippet: SharedSnippet = {
  code: "const a = 1;\nconsole.log(a);",
  title: "demo.js",
  language: "javascript",
  lineInputs: { ...EMPTY_LINE_INPUTS, highlightSpec: "2" },
  settings: { ...DEFAULT_SETTINGS, themeId: "nord", bgId: "mesh-violet", exportFormat: "webp" },
};

/** Builds a token from arbitrary JSON, the way an attacker or an old client might. */
async function craft(payload: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  return Buffer.from(new Uint8Array(await new Response(stream).arrayBuffer())).toString("base64url");
}

describe("share links", () => {
  it("round-trips code, title, language, annotations, and settings", async () => {
    const token = await encodeShare(snippet);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    const back = await decodeShare(token);
    expect(back.code).toBe(snippet.code);
    expect(back.title).toBe("demo.js");
    expect(back.language).toBe("javascript");
    expect(back.lineInputs.highlightSpec).toBe("2");
    expect(back.settings.themeId).toBe("nord");
    expect(back.settings.exportFormat).toBe("webp");
  });

  it("rejects tokens with characters outside base64url", async () => {
    await expect(decodeShare("not valid!")).rejects.toThrow("not valid");
  });

  it("rejects tokens above the length limit before decoding them", async () => {
    await expect(decodeShare("A".repeat(MAX_SHARE_TOKEN_CHARS + 1))).rejects.toThrow("not valid");
  });

  it("rejects corrupted compressed data", async () => {
    await expect(decodeShare("AAAAAAAAAAAA")).rejects.toThrow();
  });

  it("rejects unsupported payload versions", async () => {
    await expect(decodeShare(await craft({ v: 2, code: "x" }))).rejects.toThrow("unsupported format");
  });

  it("rejects payloads that inflate beyond the safety limit (zip-bomb guard)", async () => {
    const bomb = await craft({ v: 1, code: "a".repeat(650_000) });
    await expect(decodeShare(bomb)).rejects.toThrow("expands to more data");
  });

  it("rejects code longer than the editor allows", async () => {
    await expect(decodeShare(await craft({ v: 1, code: "x".repeat(500_001) }))).rejects.toThrow("too much code");
  });

  it("sanitizes hostile settings and language values instead of trusting them", async () => {
    const back = await decodeShare(
      await craft({
        v: 1,
        code: "ok",
        language: "<script>",
        settings: { themeId: "evil", bgId: "url(javascript:alert(1))", fontSize: 9999 },
      }),
    );
    expect(back.language).toBe("auto");
    expect(back.settings.themeId).toBe(DEFAULT_SETTINGS.themeId);
    expect(back.settings.bgId).toBe(DEFAULT_SETTINGS.bgId);
    expect(back.settings.fontSize).toBe(24);
  });

  it("refuses to create a link that exceeds the URL budget", async () => {
    const noisy = Array.from({ length: 90_000 }, () => String.fromCharCode(33 + Math.floor(Math.random() * 90))).join(
      "",
    );
    await expect(encodeShare({ ...snippet, code: noisy })).rejects.toThrow("too large for a link");
  });

  it("reads and builds fragment URLs", () => {
    expect(readShareToken("#s=abc_-9")).toBe("abc_-9");
    expect(readShareToken("#other")).toBeNull();
    expect(readShareToken("")).toBeNull();
    expect(buildShareUrl("abc", { origin: "https://snapcode.example", pathname: "/" })).toBe(
      "https://snapcode.example/#s=abc",
    );
  });
});
