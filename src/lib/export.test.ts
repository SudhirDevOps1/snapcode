import { describe, expect, it } from "vitest";
import { exportDimensions, imageFilename } from "./export";

describe("image export boundaries", () => {
  it("reports exact retina dimensions", () => {
    expect(exportDimensions(720, 480, 3)).toEqual({ width: 2160, height: 1440 });
  });
  it("rejects oversized canvases instead of silently lowering quality", () => {
    expect(() => exportDimensions(2000, 5000, 4)).toThrow("too large");
  });
  it("rejects empty and invalid dimensions", () => {
    for (const n of [0, NaN, Infinity, -1]) expect(() => exportDimensions(n, 500, 2)).toThrow();
  });
  it("rejects invalid export resolutions", () => {
    expect(() => exportDimensions(100, 100, 9)).toThrow();
  });
  it("sanitizes output filenames", () => {
    expect(imageFilename("hello-world.js")).toBe("hello-world.png");
    expect(imageFilename("hello-world.js", "svg")).toBe("hello-world.svg");
    expect(imageFilename("../../secret.py")).toBe("secret.png");
    expect(imageFilename("   ")).toBe("snippet.png");
    expect(imageFilename("x".repeat(500)).length).toBeLessThanOrEqual(84);
  });
});
