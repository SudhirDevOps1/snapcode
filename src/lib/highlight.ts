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
import scala from "highlight.js/lib/languages/scala";
import elixir from "highlight.js/lib/languages/elixir";
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
import nginx from "highlight.js/lib/languages/nginx";
import bash from "highlight.js/lib/languages/bash";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import lua from "highlight.js/lib/languages/lua";
import markdown from "highlight.js/lib/languages/markdown";
import diff from "highlight.js/lib/languages/diff";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("rust", rust);
hljs.registerLanguage("go", go);
hljs.registerLanguage("java", java);
hljs.registerLanguage("csharp", csharp);
hljs.registerLanguage("cpp", cpp);
hljs.registerLanguage("kotlin", kotlin);
hljs.registerLanguage("scala", scala);
hljs.registerLanguage("elixir", elixir);
hljs.registerLanguage("dart", dart);
hljs.registerLanguage("swift", swift);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("graphql", graphql);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("ini", ini);
hljs.registerLanguage("dockerfile", dockerfile);
hljs.registerLanguage("nginx", nginx);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("php", php);
hljs.registerLanguage("ruby", ruby);
hljs.registerLanguage("lua", lua);
hljs.registerLanguage("markdown", markdown);
hljs.registerLanguage("diff", diff);

export const HLJS_LANGS = [
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "csharp",
  "cpp",
  "kotlin",
  "scala",
  "elixir",
  "dart",
  "swift",
  "xml",
  "css",
  "sql",
  "graphql",
  "json",
  "yaml",
  "ini",
  "dockerfile",
  "nginx",
  "bash",
  "php",
  "ruby",
  "lua",
  "markdown",
  "diff",
];

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function highlightCode(code: string, langId: string): string {
  try {
    if (langId === "auto") {
      return hljs.highlightAuto(code, HLJS_LANGS).value;
    }
    if (hljs.getLanguage(langId)) {
      return hljs.highlight(code, { language: langId }).value;
    }
  } catch {
    /* fall through */
  }
  return escapeHtml(code);
}

/**
 * Splits syntax-highlighted HTML into per-line HTML fragments while balancing any
 * open <span> tags that span multiple lines (such as block comments or template strings).
 */
export function highlightCodeLines(code: string, langId: string): string[] {
  const html = highlightCode(code, langId);
  const rawLines = html.split("\n");
  const openTags: string[] = [];

  return rawLines.map((line) => {
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
    const suffix = "</span>".repeat(openTags.length);
    return `${prefix}${line}${suffix}`;
  });
}

export function detectLanguage(code: string): string | null {
  try {
    const result = hljs.highlightAuto(code, HLJS_LANGS);
    return result.language ?? null;
  } catch {
    return null;
  }
}
