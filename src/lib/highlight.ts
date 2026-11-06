import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import csharp from "highlight.js/lib/languages/csharp";
import cpp from "highlight.js/lib/languages/cpp";
import kotlin from "highlight.js/lib/languages/kotlin";
import dart from "highlight.js/lib/languages/dart";
import swift from "highlight.js/lib/languages/swift";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import sql from "highlight.js/lib/languages/sql";
import graphql from "highlight.js/lib/languages/graphql";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import ini from "highlight.js/lib/languages/ini";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import bash from "highlight.js/lib/languages/bash";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import lua from "highlight.js/lib/languages/lua";
import markdown from "highlight.js/lib/languages/markdown";
import diff from "highlight.js/lib/languages/diff";
import scala from "highlight.js/lib/languages/scala";
import haskell from "highlight.js/lib/languages/haskell";
import elixir from "highlight.js/lib/languages/elixir";
import r from "highlight.js/lib/languages/r";
import powershell from "highlight.js/lib/languages/powershell";
import perl from "highlight.js/lib/languages/perl";
import scss from "highlight.js/lib/languages/scss";
import nginx from "highlight.js/lib/languages/nginx";
import makefile from "highlight.js/lib/languages/makefile";

const grammars: Record<string, Parameters<typeof hljs.registerLanguage>[1]> = {
  javascript,
  typescript,
  python,
  rust,
  go,
  java,
  csharp,
  cpp,
  kotlin,
  dart,
  swift,
  xml,
  css,
  sql,
  graphql,
  json,
  yaml,
  ini,
  dockerfile,
  bash,
  php,
  ruby,
  lua,
  markdown,
  diff,
  scala,
  haskell,
  elixir,
  r,
  powershell,
  perl,
  scss,
  nginx,
  makefile,
};

for (const [name, grammar] of Object.entries(grammars)) {
  hljs.registerLanguage(name, grammar);
}

/** Every language a user can pick explicitly. */
export const HLJS_LANGS = Object.keys(grammars);

/** Languages that are reliable to guess from a snippet; ambiguous ones are excluded from Auto-detect. */
const AUTO_EXCLUDED = new Set(["r", "perl", "makefile", "nginx"]);
export const AUTO_DETECT_LANGS = HLJS_LANGS.filter((id) => !AUTO_EXCLUDED.has(id));

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlightCode(code: string, langId: string): string {
  try {
    if (langId === "auto") {
      return hljs.highlightAuto(code, AUTO_DETECT_LANGS).value;
    }
    if (hljs.getLanguage(langId)) {
      return hljs.highlight(code, { language: langId }).value;
    }
  } catch {
    /* fall through to escaped plain text */
  }
  return escapeHtml(code);
}

/**
 * Splits highlighted HTML into one fragment per line. Spans that cross line breaks
 * (block comments, template strings) are closed at each line end and reopened on the next,
 * so every row renders with balanced markup and correct colours.
 */
export function highlightCodeLines(code: string, langId: string): string[] {
  const html = highlightCode(code, langId);
  const openTags: string[] = [];

  return html.split("\n").map((line) => {
    const prefix = openTags.join("");
    const tagRegex = /<\/?span\b[^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(line)) !== null) {
      const tag = match[0];
      if (tag.startsWith("</")) {
        openTags.pop();
      } else if (!tag.endsWith("/>")) {
        openTags.push(tag);
      }
    }
    return `${prefix}${line}${"</span>".repeat(openTags.length)}`;
  });
}

export function detectLanguage(code: string): string | null {
  try {
    const result = hljs.highlightAuto(code, AUTO_DETECT_LANGS);
    return result.language ?? null;
  } catch {
    return null;
  }
}
