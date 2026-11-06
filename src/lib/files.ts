import { EXT_TO_LANG, MAX_CODE_CHARS, MAX_FILE_BYTES } from "./data";

/** Files identified by their name rather than an extension. */
const NAME_TO_LANG: Record<string, string> = {
  dockerfile: "dockerfile",
  makefile: "makefile",
  gnumakefile: "makefile",
};

/**
 * Reads a text file for the editor. Rejects oversized and binary files explicitly; never truncates silently.
 */
export async function readCodeFile(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error("Please choose a text file smaller than 1 MB.");
  const code = (await file.text()).replace(/\r\n?/g, "\n");
  if (code.includes("\u0000")) throw new Error("That looks like a binary file. Please choose a code or text file.");
  if (code.length > MAX_CODE_CHARS) {
    throw new Error("This snippet exceeds 100,000 characters. Please use a smaller file.");
  }

  const name = file.name.trim().toLowerCase();
  const stem = name.split(".")[0];
  const ext = name.includes(".") ? (name.split(".").pop() ?? "") : "";
  const language = NAME_TO_LANG[name] ?? NAME_TO_LANG[stem] ?? EXT_TO_LANG[ext] ?? "auto";

  return {
    code,
    title: file.name.slice(0, 100),
    language,
  };
}
