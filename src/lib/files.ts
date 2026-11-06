import { EXT_TO_LANG, MAX_CODE_CHARS, MAX_FILE_BYTES } from "./data";

export async function readCodeFile(file: File) {
  if (file.size > MAX_FILE_BYTES) throw new Error("Please choose a text file smaller than 1 MB.");
  const code = (await file.text()).replace(/\r\n?/g, "\n");
  if (code.includes("\u0000")) throw new Error("That looks like a binary file. Please choose a code or text file.");
  if (code.length > MAX_CODE_CHARS)
    throw new Error("This snippet exceeds 100,000 characters. Please use a smaller file.");
  const baseName = file.name.trim().toLowerCase();
  const ext =
    baseName === "dockerfile" || baseName.startsWith("dockerfile.") ? "dockerfile" : (baseName.split(".").pop() ?? "");
  return {
    code,
    title: file.name.slice(0, 100),
    language: EXT_TO_LANG[ext] ?? "auto",
  };
}
