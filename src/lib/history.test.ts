import { describe, expect, it } from "vitest";
import { commit, createHistory, isEditableTarget, MAX_HISTORY, redo, undo } from "./history";

describe("style history", () => {
  it("undoes and redoes discrete changes", () => {
    let h = createHistory({ theme: "a" });
    h = commit(h, { theme: "b" }, 1000);
    h = commit(h, { theme: "c" }, 5000);
    h = undo(h);
    expect(h.present.theme).toBe("b");
    h = undo(h);
    expect(h.present.theme).toBe("a");
    h = redo(h);
    expect(h.present.theme).toBe("b");
  });

  it("ignores commits that do not change anything", () => {
    const h = createHistory({ size: 15 });
    expect(commit(h, { size: 15 }, 10)).toBe(h);
  });

  it("merges rapid changes into a single undo step", () => {
    let h = createHistory({ padding: 64 });
    h = commit(h, { padding: 60 }, 1000, 500);
    h = commit(h, { padding: 50 }, 1100, 500);
    h = commit(h, { padding: 40 }, 1200, 500);
    expect(h.past).toHaveLength(1);
    expect(undo(h).present.padding).toBe(64);
  });

  it("starts a new step once the coalescing window has passed", () => {
    let h = createHistory({ padding: 64 });
    h = commit(h, { padding: 60 }, 1000, 500);
    h = commit(h, { padding: 40 }, 2000, 500);
    expect(h.past).toHaveLength(2);
  });

  it("clears redo after a new change", () => {
    let h = createHistory({ v: 1 });
    h = commit(h, { v: 2 }, 1000);
    h = undo(h);
    h = commit(h, { v: 3 }, 9000);
    expect(h.future).toHaveLength(0);
    expect(redo(h)).toBe(h);
  });

  it("caps history length", () => {
    let h = createHistory({ v: 0 });
    for (let i = 1; i <= MAX_HISTORY + 20; i++) h = commit(h, { v: i }, i * 1000);
    expect(h.past).toHaveLength(MAX_HISTORY);
  });

  it("is a no-op at either end", () => {
    const h = createHistory({ v: 1 });
    expect(undo(h)).toBe(h);
    expect(redo(h)).toBe(h);
  });

  it("detects editable targets that own native undo", () => {
    expect(isEditableTarget({ tagName: "TEXTAREA" } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: "BUTTON" } as unknown as EventTarget)).toBe(false);
    expect(isEditableTarget(null)).toBe(false);
  });
});
