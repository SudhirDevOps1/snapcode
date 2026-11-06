import { describe, expect, it } from "vitest";
import { readCodeFile } from "./files";

describe("code file import", () => {
  it("normalizes line endings and identifies extensions", async () => {
    const result = await readCodeFile(new File(["fn main() {\r\n}\r"], "hello.RS"));
    expect(result).toEqual({ code: "fn main() {\n}\n", title: "hello.RS", language: "rust" });
    const docker = await readCodeFile(new File(["FROM alpine\n"], "Dockerfile"));
    expect(docker.language).toBe("dockerfile");
  });
  it("auto-detects unknown extensions", async () => {
    expect((await readCodeFile(new File(["hello"], "notes.txt"))).language).toBe("auto");
  });
  it("rejects binary input", async () => {
    await expect(readCodeFile(new File([new Uint8Array([1, 0, 2])], "a.bin"))).rejects.toThrow("binary");
  });
  it("never silently truncates a file", async () => {
    await expect(readCodeFile(new File(["x".repeat(100_001)], "a.txt"))).rejects.toThrow("100,000");
  });
  it("checks file size before reading", async () => {
    await expect(readCodeFile(new File(["x".repeat(1_000_001)], "a.txt"))).rejects.toThrow("1 MB");
  });
});
