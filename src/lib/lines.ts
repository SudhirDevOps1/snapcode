const MAX_LINE_INDEX = 10_000;
const MAX_RANGE_SPAN = 1_000;

/**
 * Parses a human-entered line specification like "1, 3-5, 9" into a Set of 1-based line numbers.
 * Ignores invalid tokens and bounds range expansion so malformed input cannot stall the UI.
 */
export function parseLineSpec(spec: string): Set<number> {
  const result = new Set<number>();
  if (!spec || typeof spec !== "string") return result;

  const parts = spec.slice(0, 500).split(",");
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;

    const rangeMatch = /^(\d{1,5})\s*-\s*(\d{1,5})$/.exec(part);
    if (rangeMatch) {
      const a = Number(rangeMatch[1]);
      const b = Number(rangeMatch[2]);
      if (a >= 1 && b >= 1 && a <= MAX_LINE_INDEX && b <= MAX_LINE_INDEX) {
        const start = Math.min(a, b);
        const end = Math.min(Math.max(a, b), start + MAX_RANGE_SPAN);
        for (let line = start; line <= end; line++) {
          result.add(line);
        }
      }
      continue;
    }

    const singleMatch = /^(\d{1,5})$/.exec(part);
    if (singleMatch) {
      const line = Number(singleMatch[1]);
      if (line >= 1 && line <= MAX_LINE_INDEX) {
        result.add(line);
      }
    }
  }

  return result;
}

/**
 * Cleans trailing whitespace on each line and normalizes leading tabs to spaces.
 */
export function formatCodeSnippet(code: string, spacesPerTab = 2): string {
  const indent = " ".repeat(spacesPerTab);
  return code
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\t/g, indent).replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}
