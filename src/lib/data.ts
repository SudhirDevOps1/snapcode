import type { CSSProperties } from "react";

export interface Language {
  id: string; // hljs language id
  name: string;
  ext: string;
  color: string;
}

export const LANGUAGES: Language[] = [
  { id: "javascript", name: "JavaScript", ext: "js", color: "#F7DF1E" },
  { id: "typescript", name: "TypeScript", ext: "ts", color: "#3178C6" },
  { id: "python", name: "Python", ext: "py", color: "#3776AB" },
  { id: "rust", name: "Rust", ext: "rs", color: "#DEA584" },
  { id: "go", name: "Go", ext: "go", color: "#00ADD8" },
  { id: "java", name: "Java", ext: "java", color: "#ED8B00" },
  { id: "csharp", name: "C#", ext: "cs", color: "#68217A" },
  { id: "cpp", name: "C++", ext: "cpp", color: "#00599C" },
  { id: "kotlin", name: "Kotlin", ext: "kt", color: "#7F52FF" },
  { id: "scala", name: "Scala", ext: "scala", color: "#DC322F" },
  { id: "elixir", name: "Elixir", ext: "ex", color: "#6E4A7E" },
  { id: "dart", name: "Dart", ext: "dart", color: "#0175C2" },
  { id: "swift", name: "Swift", ext: "swift", color: "#F05138" },
  { id: "xml", name: "HTML", ext: "html", color: "#E34F26" },
  { id: "css", name: "CSS", ext: "css", color: "#1572B6" },
  { id: "sql", name: "SQL", ext: "sql", color: "#E38C00" },
  { id: "graphql", name: "GraphQL", ext: "graphql", color: "#E10098" },
  { id: "json", name: "JSON", ext: "json", color: "#A3A3A3" },
  { id: "yaml", name: "YAML", ext: "yml", color: "#CB171E" },
  { id: "ini", name: "TOML / INI", ext: "toml", color: "#9C4221" },
  { id: "dockerfile", name: "Dockerfile", ext: "dockerfile", color: "#2496ED" },
  { id: "nginx", name: "Nginx", ext: "conf", color: "#009639" },
  { id: "bash", name: "Bash", ext: "sh", color: "#4EAA25" },
  { id: "php", name: "PHP", ext: "php", color: "#777BB4" },
  { id: "ruby", name: "Ruby", ext: "rb", color: "#CC342D" },
  { id: "lua", name: "Lua", ext: "lua", color: "#2C2D72" },
  { id: "markdown", name: "Markdown", ext: "md", color: "#083FA1" },
  { id: "diff", name: "Diff", ext: "diff", color: "#2EA043" },
];

export const SAMPLES: Record<string, string> = {
  javascript: `// Good code deserves a great frame.
function createSomething(idea) {
  const ingredients = {
    curiosity: "a little more",
    coffee: true,
    possibilities: Infinity,
  };
  return { ...ingredients, ...idea };
}

createSomething({ name: "Something great" });`,
  typescript: `interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

const cart: Product[] = [];

function total(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

console.log(\`Total: $\${total(cart).toFixed(2)}\`);`,
  python: `# Find the most frequent word in a text
from collections import Counter
import re

def most_common(text: str, n: int = 3):
    words = re.findall(r"[a-z']+", text.lower())
    return Counter(words).most_common(n)

lyrics = "to be or not to be, that is the question"
print(most_common(lyrics))`,
  rust: `// Sum the squares of even numbers
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];

    let total: i32 = numbers
        .iter()
        .filter(|n| *n % 2 == 0)
        .map(|n| n * n)
        .sum();

    println!("Total: {total}");
}`,
  go: `package main

import "fmt"

// Fibonacci with memoization
func fib(n int, memo map[int]int) int {
  if val, ok := memo[n]; ok {
    return val
  }
  if n < 2 {
    return n
  }
  memo[n] = fib(n-1, memo) + fib(n-2, memo)
  return memo[n]
}

func main() {
  fmt.Println(fib(40, make(map[int]int)))
}`,
  java: `import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("ada", "grace", "linus");

        List<String> loud = names.stream()
            .map(String::toUpperCase)
            .collect(Collectors.toList());

        System.out.println(loud);
    }
}`,
  csharp: `using System;
using System.Linq;

record User(string Name, bool Active);

var users = new[] {
    new User("Ada", true),
    new User("Alan", false),
    new User("Grace", true)
};

var active = users.Where(u => u.Active).Select(u => u.Name);
Console.WriteLine(string.Join(", ", active));`,
  cpp: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::vector<int> values{1, 2, 3, 4, 5};

    int sum = std::accumulate(
        values.begin(), values.end(), 0);

    std::cout << "Sum = " << sum << "\\n";
    return 0;
}`,
  kotlin: `data class Snippet(val title: String, val language: String, val lines: Int)

fun main() {
    val snippets = listOf(
        Snippet("hello-world.kt", "Kotlin", 12),
        Snippet("query.sql", "SQL", 14),
    )

    val summary = snippets.joinToString(" • ") { "\${it.title} (\${it.lines}L)" }
    println(summary)
}`,
  scala: `case class Release(tag: String, checksPassed: Boolean)

object Pipeline extends App {
  val releases = List(
    Release("v1.0.0", checksPassed = true),
    Release("v1.1.0", checksPassed = true),
  )

  val ready = releases.filter(_.checksPassed).map(_.tag)
  println(s"Ready to publish: \${ready.mkString(", ")}")
}`,
  elixir: `defmodule Snapcode.Pipeline do
  def summarize(snippets) do
    snippets
    |> Enum.filter(& &1.ready)
    |> Enum.map(&String.upcase(&1.language))
    |> Enum.frequencies()
  end
end

IO.inspect(Snapcode.Pipeline.summarize([%{language: "elixir", ready: true}]))`,
  dart: `class FrameConfig {
  final String theme;
  final int scale;

  const FrameConfig({this.theme = 'midnight', this.scale = 2});
}

void main() {
  const config = FrameConfig(theme: 'catppuccin-mocha', scale: 3);
  print('Exporting \${config.theme} at \${config.scale}x');
}`,
  swift: `import Foundation

struct Task: Identifiable {
    let id = UUID()
    let title: String
    var done: Bool = false
}

let tasks = [
    Task(title: "Paste code", done: true),
    Task(title: "Pick theme", done: true),
    Task(title: "Export PNG")
]

print("Remaining:", tasks.filter { !$0.done }.count)`,
  xml: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Hello, world</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <main class="hero">
      <h1>Build something lovely</h1>
      <button id="cta">Get started</button>
    </main>
  </body>
</html>`,
  css: `/* A soft, modern card */
.card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.2);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-4px) scale(1.02);
}`,
  sql: `-- Top customers by total spend this year
SELECT
    c.name,
    COUNT(o.id)    AS orders,
    SUM(o.total)   AS revenue
FROM customers AS c
JOIN orders AS o ON o.customer_id = c.id
WHERE o.created_at >= DATE '2026-01-01'
GROUP BY c.name
HAVING SUM(o.total) > 1000
ORDER BY revenue DESC
LIMIT 10;`,
  graphql: `query GetFeaturedSnippets($limit: Int = 5) {
  snippets(first: $limit, orderBy: POPULAR) {
    id
    title
    language
    author {
      handle
      avatarUrl
    }
  }
}`,
  json: `{
  "name": "snapcode",
  "version": "1.0.0",
  "private": true,
  "features": {
    "themes": 20,
    "fonts": 11,
    "languages": 25,
    "export": ["png@2x", "png@3x", "png@4x"]
  },
  "offline": true
}`,
  yaml: `name: Deploy Production
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build`,
  ini: `[package]
name = "snapcode"
version = "1.0.0"
edition = "2024"

[export]
default_scale = 2
transparent = false
formats = ["png"]`,
  dockerfile: `FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080`,
  nginx: `server {
  listen 8080;
  root /usr/share/nginx/html;
  server_tokens off;

  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;

  location = /healthz {
    return 200 "ok";
  }
}`,
  bash: `#!/usr/bin/env bash
# Back up a project folder with a timestamp

set -euo pipefail

SOURCE="$HOME/projects/app"
STAMP=$(date +"%Y-%m-%d_%H%M")
DEST="$HOME/backups/app-$STAMP.tar.gz"

mkdir -p "$(dirname "$DEST")"
tar -czf "$DEST" "$SOURCE"

echo "Backup saved to $DEST"`,
  php: `<?php
declare(strict_types=1);

function slugify(string $text): string {
    $clean = preg_replace('/[^a-z0-9]+/i', '-', trim($text));
    return strtolower(trim($clean ?? '', '-'));
}

echo slugify("Hello, SnapCode Studio!");`,
  ruby: `# Group words by their first character
words = %w[amber cedar birch aspen cypress]

grouped = words
  .sort
  .group_by { |word| word[0].upcase }

grouped.each { |letter, list| puts "#{letter}: #{list.join(', ')}" }`,
  lua: `local function fibonacci(n)
  local a, b = 0, 1
  for _ = 1, n do
    a, b = b, a + b
  end
  return a
end

print("Fib(12) =", fibonacci(12))`,
  markdown: `# Snapcode Studio

Turn pasted code into **crisp, shareable PNGs** in seconds.

- **25+ languages** with automatic detection
- **20 dark & light themes** + **11 coding fonts**
- **100% private** — runs locally and offline`,
  diff: `--- a/src/render.ts
+++ b/src/render.ts
@@ -12,6 +12,7 @@ export function exportPng(node: HTMLElement) {
-  return toPng(node, { pixelRatio: 1 });
+  return toBlob(node, {
+    pixelRatio: 3,
+    skipAutoScale: true,
+  });
 }`,
};

export const DEFAULT_TITLES: Record<string, string> = {
  javascript: "app.js",
  typescript: "app.ts",
  python: "main.py",
  rust: "main.rs",
  go: "main.go",
  java: "Main.java",
  csharp: "Program.cs",
  cpp: "main.cpp",
  kotlin: "Main.kt",
  scala: "Pipeline.scala",
  elixir: "pipeline.ex",
  dart: "main.dart",
  swift: "main.swift",
  xml: "index.html",
  css: "style.css",
  sql: "query.sql",
  graphql: "schema.graphql",
  json: "data.json",
  yaml: "deploy.yml",
  ini: "Cargo.toml",
  dockerfile: "Dockerfile",
  nginx: "nginx.conf",
  bash: "script.sh",
  php: "index.php",
  ruby: "app.rb",
  lua: "init.lua",
  markdown: "README.md",
  diff: "changes.diff",
};

/** Maximum characters accepted from a loaded file (keeps rendering fast). */
export const MAX_CODE_CHARS = 100_000;
/** Maximum file size (bytes) accepted via Open / drag & drop. */
export const MAX_FILE_BYTES = 1_000_000;

export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const FONTS: FontOption[] = [
  { id: "jetbrains", name: "JetBrains Mono", family: "'JetBrains Mono', monospace" },
  { id: "fira", name: "Fira Code", family: "'Fira Code', monospace" },
  { id: "cascadia", name: "Cascadia Code", family: "'Cascadia Code', monospace" },
  { id: "commit", name: "Commit Mono", family: "'Commit Mono', monospace" },
  { id: "plex", name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace" },
  { id: "source-code", name: "Source Code Pro", family: "'Source Code Pro', monospace" },
  { id: "victor", name: "Victor Mono", family: "'Victor Mono', monospace" },
  { id: "martian", name: "Martian Mono", family: "'Martian Mono', monospace" },
  { id: "inconsolata", name: "Inconsolata", family: "'Inconsolata', monospace" },
  { id: "anonymous", name: "Anonymous Pro", family: "'Anonymous Pro', monospace" },
  { id: "space", name: "Space Mono", family: "'Space Mono', monospace" },
  { id: "roboto", name: "Roboto Mono", family: "'Roboto Mono', monospace" },
  { id: "ubuntu", name: "Ubuntu Mono", family: "'Ubuntu Mono', monospace" },
];

export interface EditorTheme {
  id: string;
  name: string;
  dark: boolean;
  bg: string;
  header: string;
  border: string;
  text: string;
  lineNumber: string;
  keyword: string;
  string: string;
  comment: string;
  number: string;
  fn: string;
  variable: string;
  builtin: string;
  type: string;
  attr: string;
  tag: string;
  operator: string;
}

export const THEMES: EditorTheme[] = [
  /* ---------- Dark Themes (13) ---------- */
  {
    id: "midnight",
    name: "Midnight",
    dark: true,
    bg: "#22212E",
    header: "#22212E",
    border: "rgba(148,163,184,0.16)",
    text: "#E4E1ED",
    lineNumber: "#9992A9",
    keyword: "#C4A1F0",
    string: "#B9DCAA",
    comment: "#9B94AB",
    number: "#EBC68C",
    fn: "#9CC3FA",
    variable: "#D6DEEB",
    builtin: "#7FDBCA",
    type: "#FFCB6B",
    attr: "#E2DEF0",
    tag: "#7FDBCA",
    operator: "#89DDFF",
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    dark: true,
    bg: "#1E1E2E",
    header: "#181825",
    border: "rgba(205,214,244,0.12)",
    text: "#CDD6F4",
    lineNumber: "#8C91AA",
    keyword: "#CBA6F7",
    string: "#A6E3A1",
    comment: "#9399B2",
    number: "#FAB387",
    fn: "#89B4FA",
    variable: "#CDD6F4",
    builtin: "#94E2D5",
    type: "#F9E2AF",
    attr: "#89DCEB",
    tag: "#F38BA8",
    operator: "#89DCEB",
  },
  {
    id: "dracula",
    name: "Dracula",
    dark: true,
    bg: "#282A36",
    header: "#21222C",
    border: "rgba(248,248,242,0.10)",
    text: "#F8F8F2",
    lineNumber: "#8694C2",
    keyword: "#FF79C6",
    string: "#F1FA8C",
    comment: "#8694C2",
    number: "#BD93F9",
    fn: "#50FA7B",
    variable: "#F8F8F2",
    builtin: "#8BE9FD",
    type: "#8BE9FD",
    attr: "#50FA7B",
    tag: "#FF79C6",
    operator: "#FF79C6",
  },
  {
    id: "nord",
    name: "Nord",
    dark: true,
    bg: "#2E3440",
    header: "#272C36",
    border: "rgba(216,222,233,0.12)",
    text: "#ECEFF4",
    lineNumber: "#93A1BA",
    keyword: "#81A1C1",
    string: "#A3BE8C",
    comment: "#93A1BA",
    number: "#BE9BB7",
    fn: "#88C0D0",
    variable: "#D8DEE9",
    builtin: "#8FBCBB",
    type: "#8FBCBB",
    attr: "#8FBCBB",
    tag: "#81A1C1",
    operator: "#81A1C1",
  },
  {
    id: "one-dark",
    name: "One Dark Pro",
    dark: true,
    bg: "#282C34",
    header: "#21252B",
    border: "rgba(171,178,191,0.12)",
    text: "#ABB2BF",
    lineNumber: "#8E96A6",
    keyword: "#C678DD",
    string: "#98C379",
    comment: "#8E96A6",
    number: "#D19A66",
    fn: "#61AFEF",
    variable: "#E67A82",
    builtin: "#56B6C2",
    type: "#E5C07B",
    attr: "#D19A66",
    tag: "#E67A82",
    operator: "#56B6C2",
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    dark: true,
    bg: "#0D1117",
    header: "#161B22",
    border: "rgba(240,246,252,0.10)",
    text: "#E6EDF3",
    lineNumber: "#7D8590",
    keyword: "#FF7B72",
    string: "#A5D6FF",
    comment: "#8B949E",
    number: "#79C0FF",
    fn: "#D2A8FF",
    variable: "#FFA657",
    builtin: "#79C0FF",
    type: "#FFA657",
    attr: "#79C0FF",
    tag: "#7EE787",
    operator: "#FF7B72",
  },
  {
    id: "tokyo",
    name: "Tokyo Night",
    dark: true,
    bg: "#1A1B26",
    header: "#16161E",
    border: "rgba(192,202,245,0.10)",
    text: "#C0CAF5",
    lineNumber: "#7E86AE",
    keyword: "#BB9AF7",
    string: "#9ECE6A",
    comment: "#7E86AE",
    number: "#FF9E64",
    fn: "#7AA2F7",
    variable: "#C0CAF5",
    builtin: "#7DCFFF",
    type: "#2AC3DE",
    attr: "#73DACA",
    tag: "#F7768E",
    operator: "#89DDFF",
  },
  {
    id: "night-owl",
    name: "Night Owl",
    dark: true,
    bg: "#011627",
    header: "#01111D",
    border: "rgba(127,219,202,0.14)",
    text: "#D6DEEB",
    lineNumber: "#6B869C",
    keyword: "#C792EA",
    string: "#ECC48D",
    comment: "#7F9999",
    number: "#F78C6C",
    fn: "#82AAFF",
    variable: "#ADDB67",
    builtin: "#7FDBCA",
    type: "#FFCB8B",
    attr: "#ADD7FF",
    tag: "#7FDBCA",
    operator: "#C792EA",
  },
  {
    id: "gruvbox-dark",
    name: "Gruvbox Dark",
    dark: true,
    bg: "#282828",
    header: "#1D2021",
    border: "rgba(235,219,178,0.12)",
    text: "#EBDBB2",
    lineNumber: "#9E8F80",
    keyword: "#FC5C49",
    string: "#B8BB26",
    comment: "#9E8F80",
    number: "#D3869B",
    fn: "#FABD2F",
    variable: "#83A598",
    builtin: "#8EC07C",
    type: "#FABD2F",
    attr: "#FE8019",
    tag: "#FC5C49",
    operator: "#FE8019",
  },
  {
    id: "kanagawa",
    name: "Kanagawa Wave",
    dark: true,
    bg: "#1F1F28",
    header: "#16161D",
    border: "rgba(220,215,186,0.12)",
    text: "#DCD7BA",
    lineNumber: "#898897",
    keyword: "#957FB8",
    string: "#98BB6C",
    comment: "#898897",
    number: "#D27E99",
    fn: "#7E9CD8",
    variable: "#DCD7BA",
    builtin: "#7FB4CA",
    type: "#7AA89F",
    attr: "#E6C384",
    tag: "#E46876",
    operator: "#C0A36E",
  },
  {
    id: "synthwave",
    name: "SynthWave '84",
    dark: true,
    bg: "#262335",
    header: "#1E1B2B",
    border: "rgba(255,126,219,0.18)",
    text: "#F7F3FF",
    lineNumber: "#948BAE",
    keyword: "#FEDE5D",
    string: "#FF8B39",
    comment: "#948BAE",
    number: "#F97E72",
    fn: "#36F9F6",
    variable: "#FF7EDB",
    builtin: "#36F9F6",
    type: "#FF5E69",
    attr: "#FEDE5D",
    tag: "#72F1B8",
    operator: "#FF7EDB",
  },
  {
    id: "monokai",
    name: "Monokai",
    dark: true,
    bg: "#272822",
    header: "#1F201B",
    border: "rgba(248,248,242,0.10)",
    text: "#F8F8F2",
    lineNumber: "#95917D",
    keyword: "#FF4D8D",
    string: "#E6DB74",
    comment: "#95917D",
    number: "#AE81FF",
    fn: "#A6E22E",
    variable: "#F8F8F2",
    builtin: "#66D9EF",
    type: "#66D9EF",
    attr: "#A6E22E",
    tag: "#FF4D8D",
    operator: "#FF4D8D",
  },
  {
    id: "vesper",
    name: "Vesper",
    dark: true,
    bg: "#101010",
    header: "#161616",
    border: "rgba(255,255,255,0.12)",
    text: "#F5F5F5",
    lineNumber: "#808080",
    keyword: "#FFC799",
    string: "#99FFE4",
    comment: "#8B8B8B",
    number: "#FFC799",
    fn: "#FFC799",
    variable: "#FFFFFF",
    builtin: "#99FFE4",
    type: "#FFC799",
    attr: "#A0A0A0",
    tag: "#FFC799",
    operator: "#A0A0A0",
  },
  {
    id: "everforest-dark",
    name: "Everforest Dark",
    dark: true,
    bg: "#2D353B",
    header: "#232A2E",
    border: "rgba(211,198,170,0.14)",
    text: "#D3C6AA",
    lineNumber: "#9DA9A0",
    keyword: "#F08083",
    string: "#A7C080",
    comment: "#9DA9A0",
    number: "#D699B6",
    fn: "#83C092",
    variable: "#D3C6AA",
    builtin: "#7FBBB3",
    type: "#DBBC7F",
    attr: "#E69875",
    tag: "#F08083",
    operator: "#E69875",
  },
  {
    id: "poimandres",
    name: "Poimandres",
    dark: true,
    bg: "#1B1E28",
    header: "#171922",
    border: "rgba(173,215,255,0.14)",
    text: "#E4F0FB",
    lineNumber: "#868CAD",
    keyword: "#ADD7FF",
    string: "#5DE4C7",
    comment: "#868CAD",
    number: "#5DE4C7",
    fn: "#89DDFF",
    variable: "#E4F0FB",
    builtin: "#91B4D5",
    type: "#FAE4FC",
    attr: "#ADD7FF",
    tag: "#5DE4C7",
    operator: "#91B4D5",
  },
  {
    id: "palenight",
    name: "Palenight",
    dark: true,
    bg: "#292D3E",
    header: "#232635",
    border: "rgba(166,172,205,0.14)",
    text: "#A6ACCD",
    lineNumber: "#939AC0",
    keyword: "#C792EA",
    string: "#C3E88D",
    comment: "#939AC0",
    number: "#F78C6C",
    fn: "#82AAFF",
    variable: "#EEFFFF",
    builtin: "#89DDFF",
    type: "#FFCB6B",
    attr: "#FFCB6B",
    tag: "#F07178",
    operator: "#89DDFF",
  },

  /* ---------- Light Themes (8) ---------- */
  {
    id: "github-light",
    name: "GitHub Light",
    dark: false,
    bg: "#FFFFFF",
    header: "#F6F8FA",
    border: "rgba(31,35,40,0.10)",
    text: "#1F2328",
    lineNumber: "#656D76",
    keyword: "#CF222E",
    string: "#0A3069",
    comment: "#59636E",
    number: "#0550AE",
    fn: "#8250DF",
    variable: "#953800",
    builtin: "#0550AE",
    type: "#953800",
    attr: "#0550AE",
    tag: "#116329",
    operator: "#CF222E",
  },
  {
    id: "catppuccin-latte",
    name: "Catppuccin Latte",
    dark: false,
    bg: "#EFF1F5",
    header: "#E6E9EF",
    border: "rgba(76,79,105,0.14)",
    text: "#4C4F69",
    lineNumber: "#5C5F77",
    keyword: "#7C2AE8",
    string: "#2B7A1B",
    comment: "#5C5F77",
    number: "#B84300",
    fn: "#1657D9",
    variable: "#4C4F69",
    builtin: "#0F6E75",
    type: "#9A5E08",
    attr: "#126D7E",
    tag: "#B80D32",
    operator: "#046A99",
  },
  {
    id: "solarized",
    name: "Solarized Light",
    dark: false,
    bg: "#FDF6E3",
    header: "#F5EDD8",
    border: "rgba(88,110,117,0.16)",
    text: "#4D6168",
    lineNumber: "#586E75",
    keyword: "#5D6E00",
    string: "#15736C",
    comment: "#586E75",
    number: "#B3246A",
    fn: "#1967A3",
    variable: "#4D6168",
    builtin: "#1967A3",
    type: "#876500",
    attr: "#1967A3",
    tag: "#5D6E00",
    operator: "#5D6E00",
  },
  {
    id: "rose",
    name: "Rosé Pine Dawn",
    dark: false,
    bg: "#FAF4ED",
    header: "#F2E9E1",
    border: "rgba(87,82,121,0.12)",
    text: "#575279",
    lineNumber: "#6B6785",
    keyword: "#786291",
    string: "#96580E",
    comment: "#6B6785",
    number: "#A34F67",
    fn: "#235E75",
    variable: "#575279",
    builtin: "#2D6B75",
    type: "#2D6B75",
    attr: "#235E75",
    tag: "#A34F67",
    operator: "#786291",
  },
  {
    id: "gruvbox-light",
    name: "Gruvbox Light",
    dark: false,
    bg: "#FBF1C7",
    header: "#F2E5BC",
    border: "rgba(60,56,54,0.14)",
    text: "#3C3836",
    lineNumber: "#6E6258",
    keyword: "#9D0006",
    string: "#66620A",
    comment: "#6E6258",
    number: "#853868",
    fn: "#8F5A0B",
    variable: "#076678",
    builtin: "#366B4A",
    type: "#8F5A0B",
    attr: "#9E3302",
    tag: "#9D0006",
    operator: "#9E3302",
  },
  {
    id: "one-light",
    name: "One Light",
    dark: false,
    bg: "#FAFAFA",
    header: "#F0F0F1",
    border: "rgba(56,58,66,0.12)",
    text: "#383A42",
    lineNumber: "#636670",
    keyword: "#9E229C",
    string: "#357A34",
    comment: "#636670",
    number: "#875C00",
    fn: "#2B64DB",
    variable: "#C93E32",
    builtin: "#0170A1",
    type: "#8F6100",
    attr: "#875C00",
    tag: "#C93E32",
    operator: "#0170A1",
  },
  {
    id: "ayu-light",
    name: "Ayu Light",
    dark: false,
    bg: "#FCFCFC",
    header: "#F3F4F5",
    border: "rgba(92,97,102,0.12)",
    text: "#4E5358",
    lineNumber: "#6B7077",
    keyword: "#BA520D",
    string: "#4B6E00",
    comment: "#6B7077",
    number: "#7E48B5",
    fn: "#965E06",
    variable: "#4E5358",
    builtin: "#216E8F",
    type: "#216E8F",
    attr: "#965E06",
    tag: "#BA520D",
    operator: "#B34B17",
  },
  {
    id: "everforest-light",
    name: "Everforest Light",
    dark: false,
    bg: "#FDF6E3",
    header: "#F3EAD3",
    border: "rgba(76,86,92,0.14)",
    text: "#4C565C",
    lineNumber: "#626B6F",
    keyword: "#B83538",
    string: "#5A6E00",
    comment: "#626B6F",
    number: "#A84878",
    fn: "#26754A",
    variable: "#4C565C",
    builtin: "#256C8C",
    type: "#915D00",
    attr: "#A64616",
    tag: "#B83538",
    operator: "#A64616",
  },
];

export interface BackgroundPreset {
  id: string;
  name: string;
  style: CSSProperties;
  swatch: string;
}

export const BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "aurora",
    name: "Aurora",
    swatch: "linear-gradient(135deg,#9E9BF3,#C1A5E9,#EFC5DA)",
    style: { background: "linear-gradient(135deg,#9E9BF3 0%,#B9A1E9 40%,#EFC5DA 100%)" },
  },
  {
    id: "sunset",
    name: "Sunset",
    swatch: "linear-gradient(135deg,#FF9966,#FF5E62)",
    style: { background: "linear-gradient(135deg,#FF9966 0%,#FF5E62 100%)" },
  },
  {
    id: "ocean",
    name: "Ocean",
    swatch: "linear-gradient(135deg,#2193B0,#6DD5ED)",
    style: { background: "linear-gradient(135deg,#2193B0 0%,#6DD5ED 100%)" },
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "linear-gradient(135deg,#0BA360,#3CBA92)",
    style: { background: "linear-gradient(135deg,#0BA360 0%,#3CBA92 100%)" },
  },
  {
    id: "berry",
    name: "Berry",
    swatch: "linear-gradient(135deg,#8E2DE2,#FF6A95)",
    style: { background: "linear-gradient(135deg,#8E2DE2 0%,#FF6A95 100%)" },
  },
  {
    id: "peach",
    name: "Peach",
    swatch: "linear-gradient(135deg,#FFECD2,#FCB69F)",
    style: { background: "linear-gradient(135deg,#FFECD2 0%,#FCB69F 100%)" },
  },
  {
    id: "honey",
    name: "Honey",
    swatch: "linear-gradient(135deg,#F6D365,#FDA085)",
    style: { background: "linear-gradient(135deg,#F6D365 0%,#FDA085 100%)" },
  },
  {
    id: "abyss",
    name: "Abyss",
    swatch: "linear-gradient(135deg,#0F2027,#2C5364)",
    style: { background: "linear-gradient(135deg,#0F2027 0%,#203A43 50%,#2C5364 100%)" },
  },
  {
    id: "slate",
    name: "Graphite",
    swatch: "linear-gradient(135deg,#232526,#414345)",
    style: { background: "linear-gradient(135deg,#232526 0%,#414345 100%)" },
  },
  {
    id: "porcelain",
    name: "Porcelain",
    swatch: "linear-gradient(135deg,#FDFBFB,#EBEDEE)",
    style: { background: "linear-gradient(135deg,#FDFBFB 0%,#EBEDEE 100%)" },
  },
  {
    id: "cyber",
    name: "Cyber Neon",
    swatch: "linear-gradient(135deg,#1A0B2E,#6B21A8,#EC4899)",
    style: { background: "linear-gradient(135deg,#1A0B2E 0%,#6B21A8 52%,#EC4899 100%)" },
  },
  {
    id: "northern",
    name: "Northern",
    swatch: "linear-gradient(135deg,#1D2B64,#43C6AC)",
    style: { background: "linear-gradient(135deg,#1D2B64 0%,#43C6AC 100%)" },
  },
  {
    id: "flamingo",
    name: "Flamingo",
    swatch: "linear-gradient(135deg,#F093FB,#F5576C)",
    style: { background: "linear-gradient(135deg,#F093FB 0%,#F5576C 100%)" },
  },
  {
    id: "mint-breeze",
    name: "Mint Breeze",
    swatch: "linear-gradient(135deg,#D4FC79,#96E6A1)",
    style: { background: "linear-gradient(135deg,#D4FC79 0%,#96E6A1 100%)" },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    swatch: "linear-gradient(135deg,#09090B,#18181B,#27272A)",
    style: { background: "linear-gradient(135deg,#09090B 0%,#18181B 50%,#27272A 100%)" },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    swatch: "linear-gradient(135deg,#E6DADA,#F4EFEA)",
    style: { background: "linear-gradient(135deg,#E6DADA 0%,#F4EFEA 100%)" },
  },
  {
    id: "dots",
    name: "Starfield",
    swatch: "#111827",
    style: {
      backgroundColor: "#0F172A",
      backgroundImage:
        "radial-gradient(rgba(255,255,255,0.20) 1.2px, transparent 1.2px), radial-gradient(rgba(255,255,255,0.10) 1.2px, transparent 1.2px)",
      backgroundSize: "26px 26px",
      backgroundPosition: "0 0, 13px 13px",
    },
  },
  {
    id: "blueprint",
    name: "Blueprint",
    swatch: "#1D4ED8",
    style: {
      backgroundColor: "#1E40AF",
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
      backgroundSize: "28px 28px",
    },
  },
  {
    id: "grid",
    name: "Studio Grid",
    swatch: "#E4E4E7",
    style: {
      backgroundColor: "#F4F4F5",
      backgroundImage:
        "linear-gradient(rgba(24,24,27,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(24,24,27,0.08) 1px, transparent 1px)",
      backgroundSize: "24px 24px",
    },
  },
  {
    id: "diagonal",
    name: "Diagonal",
    swatch: "#312E81",
    style: {
      backgroundColor: "#1E1B4B",
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0, rgba(255,255,255,0.07) 1px, transparent 0, transparent 50%)",
      backgroundSize: "16px 16px",
    },
  },
];

export interface ShadowOption {
  id: string;
  name: string;
  css: string;
}

export const SHADOWS: ShadowOption[] = [
  { id: "none", name: "None", css: "none" },
  { id: "soft", name: "Soft", css: "0 8px 30px rgba(2,6,23,0.18)" },
  { id: "medium", name: "Medium", css: "0 20px 50px rgba(2,6,23,0.28)" },
  { id: "large", name: "Large", css: "0 32px 80px rgba(2,6,23,0.40)" },
  { id: "glow", name: "Glow", css: "0 24px 70px rgba(2,6,23,0.35), 0 0 60px rgba(255,255,255,0.18)" },
];

export interface StylePreset {
  id: string;
  name: string;
  mode: "dark" | "light";
  theme: string;
  bg: string;
  font: string;
  shadow: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "midnight-pro",
    name: "Midnight Pro",
    mode: "dark",
    theme: "midnight",
    bg: "aurora",
    font: "jetbrains",
    shadow: "large",
  },
  {
    id: "catppuccin-dream",
    name: "Catppuccin Dream",
    mode: "dark",
    theme: "catppuccin-mocha",
    bg: "cyber",
    font: "cascadia",
    shadow: "glow",
  },
  {
    id: "dracula-pop",
    name: "Dracula Pop",
    mode: "dark",
    theme: "dracula",
    bg: "berry",
    font: "fira",
    shadow: "glow",
  },
  {
    id: "nordic-frost",
    name: "Nordic Frost",
    mode: "dark",
    theme: "nord",
    bg: "northern",
    font: "source-code",
    shadow: "medium",
  },
  {
    id: "deep-sea",
    name: "Deep Sea",
    mode: "dark",
    theme: "tokyo",
    bg: "abyss",
    font: "jetbrains",
    shadow: "large",
  },
  {
    id: "synth-arcade",
    name: "Synth Arcade",
    mode: "dark",
    theme: "synthwave",
    bg: "flamingo",
    font: "victor",
    shadow: "glow",
  },
  {
    id: "clean-light",
    name: "Clean Light",
    mode: "light",
    theme: "github-light",
    bg: "porcelain",
    font: "plex",
    shadow: "medium",
  },
  {
    id: "latte-paper",
    name: "Latte Paper",
    mode: "light",
    theme: "catppuccin-latte",
    bg: "warm-sand",
    font: "cascadia",
    shadow: "soft",
  },
  {
    id: "peachy",
    name: "Peachy Dawn",
    mode: "light",
    theme: "rose",
    bg: "peach",
    font: "space",
    shadow: "soft",
  },
  {
    id: "gruvbox-warm",
    name: "Gruvbox Warm",
    mode: "light",
    theme: "gruvbox-light",
    bg: "honey",
    font: "martian",
    shadow: "medium",
  },
  {
    id: "poimandres-dusk",
    name: "Poimandres Dusk",
    mode: "dark",
    theme: "poimandres",
    bg: "obsidian",
    font: "commit",
    shadow: "large",
  },
  {
    id: "everforest-mist",
    name: "Everforest Mist",
    mode: "light",
    theme: "everforest-light",
    bg: "mint-breeze",
    font: "anonymous",
    shadow: "soft",
  },
];

export interface AspectRatioOption {
  id: "auto" | "16:9" | "2:1" | "4:5" | "1:1";
  name: string;
  ratio: number | null;
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { id: "auto", name: "Auto fit", ratio: null },
  { id: "16:9", name: "16:9 Slide", ratio: 16 / 9 },
  { id: "2:1", name: "2:1 Social Card", ratio: 2 / 1 },
  { id: "4:5", name: "4:5 Portrait", ratio: 4 / 5 },
  { id: "1:1", name: "1:1 Square", ratio: 1 },
];

export const EXT_TO_LANG: Record<string, string> = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  rs: "rust",
  go: "go",
  java: "java",
  cs: "csharp",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  hpp: "cpp",
  c: "cpp",
  h: "cpp",
  kt: "kotlin",
  kts: "kotlin",
  scala: "scala",
  sc: "scala",
  ex: "elixir",
  exs: "elixir",
  dart: "dart",
  swift: "swift",
  html: "xml",
  htm: "xml",
  xml: "xml",
  svg: "xml",
  css: "css",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  toml: "ini",
  ini: "ini",
  cfg: "ini",
  dockerfile: "dockerfile",
  nginx: "nginx",
  conf: "nginx",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  php: "php",
  rb: "ruby",
  lua: "lua",
  md: "markdown",
  markdown: "markdown",
  diff: "diff",
  patch: "diff",
};
