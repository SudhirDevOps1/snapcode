import { describe, expect, it } from "vitest";
import { LANGUAGES, SAMPLES } from "./data";
import { detectLanguage, highlightCode, highlightCodeLines } from "./highlight";

describe("highlightCode", () => {
  it.each(LANGUAGES.map((l) => l.id))("highlights the %s sample with token markup", (id) => {
    const html = highlightCode(SAMPLES[id], id);
    expect(html).toContain("hljs-");
  });

  it("escapes HTML so pasted markup can never execute (XSS safety)", () => {
    const payload = `<img src=x onerror="alert(1)"><script>alert(2)</script>`;
    for (const lang of ["javascript", "xml", "python", "auto", "unknown-lang"]) {
      const html = highlightCode(payload, lang);
      expect(html).not.toMatch(/<script/i);
      expect(html).not.toMatch(/<img/i);
    }
  });

  it("falls back to escaped plain text for unknown languages", () => {
    expect(highlightCode("a < b && c > d", "does-not-exist")).toBe("a &lt; b &amp;&amp; c &gt; d");
  });

  it("handles empty input", () => {
    expect(highlightCode("", "javascript")).toBe("");
  });
});

describe("highlightCodeLines", () => {
  it("balances multi-line spans across every line", () => {
    const multi = "/* line one\n   line two\n   line three */\nconst x = 1;";
    const lines = highlightCodeLines(multi, "javascript");
    expect(lines).toHaveLength(4);
    for (const line of lines) {
      const opens = (line.match(/<span\b/g) ?? []).length;
      const closes = (line.match(/<\/span>/g) ?? []).length;
      expect(opens).toBe(closes);
    }
  });
});

describe("detectLanguage", () => {
  it("detects obvious languages", () => {
    expect(detectLanguage(SAMPLES.python)).toBe("python");
    expect(detectLanguage(SAMPLES.sql)).toBe("sql");
    expect(detectLanguage(SAMPLES.rust)).toBe("rust");
  });
});
