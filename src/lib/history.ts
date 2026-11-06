/**
 * Immutable undo/redo history for style settings. Rapid changes (for example dragging a slider)
 * within `coalesceMs` are merged into one step, and the stack is capped at MAX_HISTORY entries.
 */
export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  lastAt: number;
}

export const MAX_HISTORY = 50;

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [], lastAt: 0 };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function commit<T>(history: History<T>, next: T, now: number, coalesceMs = 0): History<T> {
  if (same(history.present, next)) return history;
  const coalesce = coalesceMs > 0 && history.past.length > 0 && now - history.lastAt < coalesceMs;
  const past = coalesce ? history.past : [...history.past, history.present].slice(-MAX_HISTORY);
  return { past, present: next, future: [], lastAt: now };
}

export function undo<T>(history: History<T>): History<T> {
  if (history.past.length === 0) return history;
  const previous = history.past[history.past.length - 1];
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
    lastAt: 0,
  };
}

export function redo<T>(history: History<T>): History<T> {
  if (history.future.length === 0) return history;
  const [next, ...rest] = history.future;
  return {
    past: [...history.past, history.present].slice(-MAX_HISTORY),
    present: next,
    future: rest,
    lastAt: 0,
  };
}

/** True when keyboard focus is in a field that already provides its own native undo. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as HTMLElement).tagName !== "string") return false;
  const element = target as HTMLElement;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable === true;
}
