import { describe, expect, it } from "vitest";
import { buildRows, EMPTY_LINE_INPUTS, sanitizeLineInputs, type LineAnnotations } from "./rows";

const lines = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const base: LineAnnotations = {
  highlight: new Set(),
  added: new Set(),
  removed: new Set(),
  dimUnfocused: false,
  focusOnly: false,
  focusContext: 1,
};
const labels = (rows: ReturnType<typeof buildRows>) => rows.map((row) => (row.kind === "gap" ? "gap" : row.n));

describe("buildRows", () => {
  it("renders every line when nothing is annotated", () => {
    const rows = buildRows(lines, 1, base);
    expect(rows).toHaveLength(10);
    expect(rows.every((row) => row.kind === "line")).toBe(true);
  });

  it("numbers lines from the configured starting line", () => {
    expect(buildRows(lines, 40, base)[0]).toMatchObject({ kind: "line", n: 40 });
  });

  it("flags added, removed, and highlighted lines", () => {
    const rows = buildRows(lines, 1, {
      ...base,
      highlight: new Set([2]),
      added: new Set([4]),
      removed: new Set([3]),
    });
    const byNumber = new Map(rows.map((row) => [row.kind === "line" ? row.n : -1, row]));
    expect(byNumber.get(2)).toMatchObject({ highlighted: true, added: false, removed: false });
    expect(byNumber.get(3)).toMatchObject({ removed: true });
    expect(byNumber.get(4)).toMatchObject({ added: true });
  });

  it("dims unfocused lines only when annotations exist", () => {
    const annotated = buildRows(lines, 1, { ...base, highlight: new Set([2]), dimUnfocused: true });
    expect(annotated.find((row) => row.kind === "line" && row.n === 1)).toMatchObject({ dimmed: true });
    expect(annotated.find((row) => row.kind === "line" && row.n === 2)).toMatchObject({ dimmed: false });

    const plain = buildRows(lines, 1, { ...base, dimUnfocused: true });
    expect(plain.some((row) => row.kind === "line" && row.dimmed)).toBe(false);
  });

  it("focus mode keeps annotated lines and inserts a gap between separate runs", () => {
    const rows = buildRows(lines, 1, { ...base, highlight: new Set([2, 8]), focusOnly: true, focusContext: 0 });
    expect(labels(rows)).toEqual([2, "gap", 8]);
  });

  it("focus context widens every kept run", () => {
    const rows = buildRows(lines, 1, { ...base, highlight: new Set([2, 8]), focusOnly: true, focusContext: 1 });
    expect(labels(rows)).toEqual([1, 2, 3, "gap", 7, 8, 9]);
  });

  it("focus mode without annotations keeps everything", () => {
    expect(buildRows(lines, 1, { ...base, focusOnly: true })).toHaveLength(10);
  });

  it("clamps focus context to three lines", () => {
    const rows = buildRows(lines, 1, { ...base, highlight: new Set([5]), focusOnly: true, focusContext: 99 });
    expect(labels(rows)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });
});

describe("sanitizeLineInputs", () => {
  it("returns defaults for non-object input", () => {
    expect(sanitizeLineInputs(null)).toEqual(EMPTY_LINE_INPUTS);
    expect(sanitizeLineInputs("nope")).toEqual(EMPTY_LINE_INPUTS);
  });

  it("bounds text length and focus context", () => {
    const clean = sanitizeLineInputs({
      highlightSpec: "x".repeat(500),
      focusOnly: "yes",
      focusContext: 42,
      dimUnfocused: true,
    });
    expect(clean.highlightSpec).toHaveLength(120);
    expect(clean.focusOnly).toBe(false);
    expect(clean.focusContext).toBe(3);
    expect(clean.dimUnfocused).toBe(true);
  });
});
