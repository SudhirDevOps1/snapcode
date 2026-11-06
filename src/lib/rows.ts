import { isRecord } from "./guards";

/** Annotation state that the preview renders: highlights, diff markers, and focus mode. */
export interface LineAnnotations {
  highlight: Set<number>;
  added: Set<number>;
  removed: Set<number>;
  dimUnfocused: boolean;
  focusOnly: boolean;
  focusContext: number;
}

/** Raw user input for annotations, kept as text so the editor stays responsive while typing. */
export interface LineInputs {
  highlightSpec: string;
  addedSpec: string;
  removedSpec: string;
  dimUnfocused: boolean;
  focusOnly: boolean;
  focusContext: number;
}

export const EMPTY_LINE_INPUTS: LineInputs = {
  highlightSpec: "",
  addedSpec: "",
  removedSpec: "",
  dimUnfocused: false,
  focusOnly: false,
  focusContext: 1,
};

export interface LineRow {
  kind: "line";
  n: number;
  html: string;
  added: boolean;
  removed: boolean;
  highlighted: boolean;
  dimmed: boolean;
}

/** Marks a collapsed run of lines in focus mode. */
export interface GapRow {
  kind: "gap";
}

export type CodeRow = LineRow | GapRow;

/**
 * Turns highlighted lines into render rows. In focus mode only annotated lines (plus `focusContext`
 * neighbours) are kept, and a gap row marks every collapsed run.
 */
export function buildRows(lines: readonly string[], startLine: number, annotations: LineAnnotations): CodeRow[] {
  const annotated = annotations.highlight.size + annotations.added.size + annotations.removed.size > 0;
  const isMarked = (n: number) =>
    annotations.highlight.has(n) || annotations.added.has(n) || annotations.removed.has(n);
  const focusing = annotations.focusOnly && annotated;
  const context = Math.min(3, Math.max(0, Math.round(annotations.focusContext)));

  const rows: CodeRow[] = [];
  let previousIndex = -2;

  lines.forEach((html, index) => {
    const n = startLine + index;
    if (focusing) {
      let visible = false;
      for (let offset = -context; offset <= context; offset++) {
        if (isMarked(n + offset)) {
          visible = true;
          break;
        }
      }
      if (!visible) return;
      if (index !== previousIndex + 1 && rows.length > 0) rows.push({ kind: "gap" });
    }
    previousIndex = index;
    const marked = isMarked(n);
    rows.push({
      kind: "line",
      n,
      html,
      added: annotations.added.has(n),
      removed: annotations.removed.has(n),
      highlighted: annotations.highlight.has(n),
      dimmed: annotations.dimUnfocused && annotated && !marked,
    });
  });

  return rows;
}

/** Validates annotation input from an untrusted source (share links). */
export function sanitizeLineInputs(input: unknown): LineInputs {
  const raw = isRecord(input) ? input : {};
  const text = (value: unknown) => (typeof value === "string" ? value.slice(0, 120) : "");
  const context =
    typeof raw.focusContext === "number" && Number.isFinite(raw.focusContext)
      ? Math.min(3, Math.max(0, Math.round(raw.focusContext)))
      : EMPTY_LINE_INPUTS.focusContext;
  return {
    highlightSpec: text(raw.highlightSpec),
    addedSpec: text(raw.addedSpec),
    removedSpec: text(raw.removedSpec),
    dimUnfocused: raw.dimUnfocused === true,
    focusOnly: raw.focusOnly === true,
    focusContext: context,
  };
}
