/** Narrows unknown input to a plain object. Used to validate untrusted JSON (share links, storage). */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
