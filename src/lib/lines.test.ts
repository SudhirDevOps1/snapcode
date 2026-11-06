import { describe, expect, it } from "vitest";
import {
  addRangeToSpec,
  formatCodeSnippet,
  formatLineSpec,
  parseLineSpec,
  removeLineFromSpec,
  toggleLineInSpec,
} from "./lines";

describe("parseLineSpec & interactive helpers", () => {
  it("parses individual lines and ranges", () => {
    expect([...parseLineSpec("1, 3-5, 9")]).toEqual([1, 3, 4, 5, 9]);
  });

  it("handles reversed ranges and trims whitespace", () => {
    expect([...parseLineSpec(" 6 - 4 , 2 ")]).toEqual([4, 5, 6, 2]);
  });

  it("ignores invalid, negative, zero, or out-of-bounds values safely", () => {
    expect([...parseLineSpec("0, -3, abc, 1..4, 999999")]).toEqual([]);
  });

  it("caps large ranges to prevent runaway loops", () => {
    const set = parseLineSpec("1-9000");
    expect(set.size).toBe(5001);
  });

  it("formats sorted line numbers into compact range notation", () => {
    expect(formatLineSpec([7, 2, 4, 5, 6, 2, 10])).toBe("2, 4-7, 10");
    expect(formatLineSpec([])).toBe("");
  });

  it("toggles individual lines, adds ranges, and removes lines cleanly", () => {
    let spec = toggleLineInSpec("", 3);
    expect(spec).toBe("3");
    spec = addRangeToSpec(spec, 5, 7);
    expect(spec).toBe("3, 5-7");
    spec = toggleLineInSpec(spec, 6);
    expect(spec).toBe("3, 5, 7");
    spec = removeLineFromSpec(spec, 5);
    expect(spec).toBe("3, 7");
  });
});

describe("formatCodeSnippet", () => {
  it("normalizes tabs, trims trailing whitespace, and collapses extra blank lines", () => {
    const raw = "\tconst a = 1;   \r\n\r\n\r\n\t\treturn a;\t\n\n";
    expect(formatCodeSnippet(raw, 2)).toBe("  const a = 1;\n\n    return a;");
  });
});
