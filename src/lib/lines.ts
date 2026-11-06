const MAX_LINE_INDEX = 50_000;
const MAX_RANGE_SPAN = 5_000;

/**
 * Parses a human-entered line specification like "1, 3-5, 9" into a Set of 1-based line numbers.
 * Ignores invalid tokens and bounds range expansion so malformed input cannot stall the UI.
 */
export function parseLineSpec(spec: string): Set<number> {
  const result = new Set<number>();
  if (!spec || typeof spec !== "string") return result;

  const parts = spec.slice(0, 1_000).split(",");
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
 * Serializes a set of 1-based line numbers into a compact, sorted range string like "2, 4-6, 9".
 */
export function formatLineSpec(lines: Iterable<number>): string {
  const sorted = [...new Set(lines)]
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= MAX_LINE_INDEX)
    .sort((a, b) => a - b);
  if (sorted.length === 0) return "";

  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    if (current === end + 1) {
      end = current;
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`);
      start = current;
      end = current;
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(", ");
}

/** Toggles a single 1-based line in a line specification string. */
export function toggleLineInSpec(spec: string, line: number): string {
  const set = parseLineSpec(spec);
  if (set.has(line)) set.delete(line);
  else if (line >= 1 && line <= MAX_LINE_INDEX) set.add(line);
  return formatLineSpec(set);
}

/** Adds an inclusive 1-based line range [a, b] to a line specification string. */
export function addRangeToSpec(spec: string, a: number, b: number): string {
  const set = parseLineSpec(spec);
  if (a >= 1 && b >= 1 && a <= MAX_LINE_INDEX && b <= MAX_LINE_INDEX) {
    const start = Math.min(a, b);
    const end = Math.min(Math.max(a, b), start + MAX_RANGE_SPAN);
    for (let line = start; line <= end; line++) {
      set.add(line);
    }
  }
  return formatLineSpec(set);
}

/** Removes a single 1-based line from a line specification string. */
export function removeLineFromSpec(spec: string, line: number): string {
  const set = parseLineSpec(spec);
  if (!set.has(line)) return spec.trim();
  set.delete(line);
  return formatLineSpec(set);
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
