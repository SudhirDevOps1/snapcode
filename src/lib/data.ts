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
  { id: "dart", name: "Dart", ext: "dart", color: "#0175C2" },
  { id: "swift", name: "Swift", ext: "swift", color: "#F05138" },
  { id: "scala", name: "Scala", ext: "scala", color: "#DC322F" },
  { id: "haskell", name: "Haskell", ext: "hs", color: "#5E5086" },
  { id: "elixir", name: "Elixir", ext: "ex", color: "#6E4A7E" },
  { id: "r", name: "R", ext: "r", color: "#276DC3" },
  { id: "powershell", name: "PowerShell", ext: "ps1", color: "#5391FE" },
  { id: "perl", name: "Perl", ext: "pl", color: "#39457E" },
  { id: "scss", name: "SCSS", ext: "scss", color: "#CD6799" },
  { id: "nginx", name: "Nginx", ext: "conf", color: "#009639" },
  { id: "makefile", name: "Makefile", ext: "mk", color: "#427819" },
  { id: "xml", name: "HTML", ext: "html", color: "#E34F26" },
  { id: "css", name: "CSS", ext: "css", color: "#1572B6" },
  { id: "sql", name: "SQL", ext: "sql", color: "#E38C00" },
  { id: "graphql", name: "GraphQL", ext: "graphql", color: "#E10098" },
  { id: "json", name: "JSON", ext: "json", color: "#A3A3A3" },
  { id: "yaml", name: "YAML", ext: "yml", color: "#CB171E" },
  { id: "ini", name: "TOML / INI", ext: "toml", color: "#9C4221" },
  { id: "dockerfile", name: "Dockerfile", ext: "dockerfile", color: "#2496ED" },
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
  scala: `import scala.collection.mutable

final case class Order(id: Int, total: Double)

object Revenue {
  def sumPaid(orders: List[Order]): Double =
    orders.filter(_.total > 0).map(_.total).sum

  def main(args: Array[String]): Unit = {
    val orders = List(Order(1, 19.5), Order(2, 0.0), Order(3, 42.25))
    println(f"Paid: \${sumPaid(orders)}%.2f")
  }
}`,
  haskell: `module Main where

import Data.List (sortBy)
import Data.Ord (comparing)

data Player = Player { name :: String, score :: Int } deriving (Show)

leaderboard :: [Player] -> [Player]
leaderboard = sortBy (comparing (negate . score))

main :: IO ()
main = mapM_ print (leaderboard [Player "ada" 42, Player "linus" 77])`,
  elixir: `defmodule Snippets do
  @moduledoc "Pattern matching keeps small functions readable."

  def summarize(%{title: title, lines: lines}) when lines > 0 do
    "#{title} (#{lines} lines)"
  end

  def summarize(_), do: "empty snippet"
end

IO.puts Snippets.summarize(%{title: "hello.ex", lines: 12})`,
  r: `# Average order value by region
library(dplyr)

orders <- data.frame(
  region = c("EU", "US", "EU", "APAC"),
  value  = c(120.5, 89.0, 42.25, 310.0)
)

summary_tbl <- orders %>%
  group_by(region) %>%
  summarise(avg_value = mean(value), .groups = "drop")

print(summary_tbl)`,
  powershell: `# Report services that are not running
param([string]$Filter = "*")

$stopped = Get-Service -Name $Filter |
  Where-Object { $_.Status -ne 'Running' } |
  Sort-Object DisplayName

foreach ($svc in $stopped) {
  Write-Host ("{0,-30} {1}" -f $svc.DisplayName, $svc.Status) -ForegroundColor Yellow
}`,
  perl: `#!/usr/bin/perl
use strict;
use warnings;

my %count;
while (my $line = <STDIN>) {
    chomp $line;
    $count{lc $_}++ for ($line =~ /\\b(\\w+)\\b/g);
}

for my $word (sort { $count{$b} <=> $count{$a} || $a cmp $b } keys %count) {
    printf "%-12s %d\\n", $word, $count{$word};
}`,
  scss: `$brand: #7755db;
$radius: 12px;

@mixin card($pad: 1.5rem) {
  padding: $pad;
  border-radius: $radius;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .18);
}

.snap-card {
  @include card;
  background: lighten($brand, 45%);

  &:hover { transform: translateY(-2px); }

  .title { color: darken($brand, 10%); }
}`,
  nginx: `server {
  listen 8080;
  server_name _;
  root /usr/share/nginx/html;

  add_header X-Content-Type-Options "nosniff" always;

  location ~* \\.(js|css|png|svg)$ {
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}`,
  makefile: `.PHONY: build test clean

build:
\tnpm ci
\tnpm run build

test:
\tnpm test

clean:
\trm -rf dist coverage`,
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
  bash: "script.sh",
  php: "index.php",
  ruby: "app.rb",
  lua: "init.lua",
  markdown: "README.md",
  diff: "changes.diff",
  scala: "Revenue.scala",
  haskell: "Leaderboard.hs",
  elixir: "snippets.ex",
  r: "analysis.R",
  powershell: "report.ps1",
  perl: "wordcount.pl",
  scss: "_card.scss",
  nginx: "nginx.conf",
  makefile: "Makefile",
};

/** Maximum characters accepted in the editor or from a loaded file. */
export const MAX_CODE_CHARS = 500_000;
/** Maximum file size (bytes) accepted via Open / drag & drop (5 MB). */
export const MAX_FILE_BYTES = 5_000_000;

export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const FONTS: FontOption[] = [
  { id: "jetbrains", name: "JetBrains Mono", family: "'JetBrains Mono', monospace" },
  { id: "fira", name: "Fira Code", family: "'Fira Code', monospace" },
  { id: "cascadia", name: "Cascadia Code", family: "'Cascadia Code', monospace" },
  { id: "plex", name: "IBM Plex Mono", family: "'IBM Plex Mono', monospace" },
  { id: "source-code", name: "Source Code Pro", family: "'Source Code Pro', monospace" },
  { id: "victor", name: "Victor Mono", family: "'Victor Mono', monospace" },
  { id: "martian", name: "Martian Mono", family: "'Martian Mono', monospace" },
  { id: "inconsolata", name: "Inconsolata", family: "'Inconsolata', monospace" },
  { id: "space", name: "Space Mono", family: "'Space Mono', monospace" },
  { id: "roboto", name: "Roboto Mono", family: "'Roboto Mono', monospace" },
  { id: "ubuntu", name: "Ubuntu Mono", family: "'Ubuntu Mono', monospace" },
  { id: "geist", name: "Geist Mono", family: "'Geist Mono', monospace" },
  { id: "red-hat", name: "Red Hat Mono", family: "'Red Hat Mono', monospace" },
  { id: "azeret", name: "Azeret Mono", family: "'Azeret Mono', monospace" },
  { id: "dm-mono", name: "DM Mono", family: "'DM Mono', monospace" },
  { id: "anonymous", name: "Anonymous Pro", family: "'Anonymous Pro', monospace" },
  { id: "overpass", name: "Overpass Mono", family: "'Overpass Mono', monospace" },
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
    id: "catppuccin-frappe",
    name: "Catppuccin Frappé",
    dark: true,
    bg: "#303446",
    header: "#292C3C",
    border: "rgba(198,208,245,0.12)",
    text: "#C6D0F5",
    lineNumber: "#A5ADCE",
    keyword: "#CA9EE6",
    string: "#A6D189",
    comment: "#A5ADCE",
    number: "#EF9F76",
    fn: "#8CAAEE",
    variable: "#C6D0F5",
    builtin: "#81C8BE",
    type: "#E5C890",
    attr: "#BABBF1",
    tag: "#E78284",
    operator: "#99D1DB",
  },
  {
    id: "catppuccin-macchiato",
    name: "Catppuccin Macchiato",
    dark: true,
    bg: "#24273A",
    header: "#1E2030",
    border: "rgba(202,211,245,0.12)",
    text: "#CAD3F5",
    lineNumber: "#A5ADCB",
    keyword: "#C6A0F6",
    string: "#A6DA95",
    comment: "#A5ADCB",
    number: "#F5A97F",
    fn: "#8AADF4",
    variable: "#CAD3F5",
    builtin: "#8BD5CA",
    type: "#EED49F",
    attr: "#B7BDF8",
    tag: "#ED8796",
    operator: "#91D7E3",
  },
  {
    id: "rose-pine-moon",
    name: "Rosé Pine Moon",
    dark: true,
    bg: "#232136",
    header: "#2A273F",
    border: "rgba(224,222,244,0.12)",
    text: "#E0DEF4",
    lineNumber: "#908CAA",
    keyword: "#C4A7E7",
    string: "#F6C177",
    comment: "#908CAA",
    number: "#EA9A97",
    fn: "#9CCFD8",
    variable: "#E0DEF4",
    builtin: "#9CCFD8",
    type: "#F6C177",
    attr: "#EA9A97",
    tag: "#EB6F92",
    operator: "#C4A7E7",
  },
  {
    id: "everforest-dark",
    name: "Everforest Dark",
    dark: true,
    bg: "#2D353B",
    header: "#232A2E",
    border: "rgba(211,198,170,0.12)",
    text: "#D3C6AA",
    lineNumber: "#9DA9A0",
    keyword: "#E67E80",
    string: "#A7C080",
    comment: "#9DA9A0",
    number: "#D699B6",
    fn: "#7FBBB3",
    variable: "#D3C6AA",
    builtin: "#83C092",
    type: "#DBBC7F",
    attr: "#E69875",
    tag: "#E67E80",
    operator: "#83C092",
  },
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    dark: true,
    bg: "#002B36",
    header: "#073642",
    border: "rgba(147,161,161,0.16)",
    text: "#93A1A1",
    lineNumber: "#839499",
    keyword: "#859900",
    string: "#2AA198",
    comment: "#839499",
    number: "#D7764E",
    fn: "#3C97D7",
    variable: "#93A1A1",
    builtin: "#868BCF",
    type: "#B58900",
    attr: "#3C97D7",
    tag: "#E56765",
    operator: "#DE66A0",
  },

  {
    id: "ayu-dark",
    name: "Ayu Dark",
    dark: true,
    bg: "#0B0E14",
    header: "#0F131A",
    border: "rgba(191,189,182,0.14)",
    text: "#BFBDB6",
    lineNumber: "#787E8A",
    keyword: "#FF8F40",
    string: "#AAD94C",
    comment: "#787E8A",
    number: "#D2A6FF",
    fn: "#FFB454",
    variable: "#BFBDB6",
    builtin: "#39BAE6",
    type: "#59C2FF",
    attr: "#FFB454",
    tag: "#39BAE6",
    operator: "#F29668",
  },
  {
    id: "palenight",
    name: "Material Palenight",
    dark: true,
    bg: "#292D3E",
    header: "#232736",
    border: "rgba(166,172,205,0.14)",
    text: "#A6ACCD",
    lineNumber: "#9297B3",
    keyword: "#C792EA",
    string: "#C3E88D",
    comment: "#9297B3",
    number: "#F78C6C",
    fn: "#82AAFF",
    variable: "#EEFFFF",
    builtin: "#89DDFF",
    type: "#FFCB6B",
    attr: "#FFCB6B",
    tag: "#F07178",
    operator: "#89DDFF",
  },
  {
    id: "shades-of-purple",
    name: "Shades of Purple",
    dark: true,
    bg: "#2D2B55",
    header: "#222044",
    border: "rgba(227,223,255,0.16)",
    text: "#E3DFFF",
    lineNumber: "#A599E9",
    keyword: "#FF9D00",
    string: "#A5FF90",
    comment: "#BF7BFF",
    number: "#FF628C",
    fn: "#FAD000",
    variable: "#E3DFFF",
    builtin: "#80FCFF",
    type: "#9EFFFF",
    attr: "#FAD000",
    tag: "#9EFFFF",
    operator: "#FF9D00",
  },
  {
    id: "cobalt2",
    name: "Cobalt2",
    dark: true,
    bg: "#193549",
    header: "#122738",
    border: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    lineNumber: "#76A2C2",
    keyword: "#FF9D00",
    string: "#3AD900",
    comment: "#38A2FF",
    number: "#FF6B93",
    fn: "#FFC600",
    variable: "#FFFFFF",
    builtin: "#80FFBB",
    type: "#80FFBB",
    attr: "#FFC600",
    tag: "#9EFFFF",
    operator: "#FF9D00",
  },
  {
    id: "horizon",
    name: "Horizon Dark",
    dark: true,
    bg: "#1C1E26",
    header: "#161820",
    border: "rgba(224,224,224,0.12)",
    text: "#E0E0E0",
    lineNumber: "#8486A4",
    keyword: "#B877DB",
    string: "#FAB795",
    comment: "#8486A4",
    number: "#F09383",
    fn: "#25B2BC",
    variable: "#E95678",
    builtin: "#25B2BC",
    type: "#FAC29A",
    attr: "#F09383",
    tag: "#E95678",
    operator: "#B877DB",
  },

  /* ---------- Light Themes (9) ---------- */
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
    id: "modus-operandi",
    name: "Modus Operandi",
    dark: false,
    bg: "#FFFFFF",
    header: "#F2F2F2",
    border: "rgba(0,0,0,0.14)",
    text: "#000000",
    lineNumber: "#595959",
    keyword: "#531AB6",
    string: "#3548CF",
    comment: "#595959",
    number: "#005F5F",
    fn: "#721045",
    variable: "#005E8B",
    builtin: "#8F0075",
    type: "#005F5F",
    attr: "#005E8B",
    tag: "#005E8B",
    operator: "#000000",
  },
  {
    id: "papercolor-light",
    name: "PaperColor Light",
    dark: false,
    bg: "#EEEEEE",
    header: "#E4E4E4",
    border: "rgba(0,0,0,0.14)",
    text: "#444444",
    lineNumber: "#666666",
    keyword: "#CE005B",
    string: "#005F87",
    comment: "#5F5F5F",
    number: "#AC4C00",
    fn: "#005FAF",
    variable: "#005F00",
    builtin: "#005FAF",
    type: "#005F87",
    attr: "#005FAF",
    tag: "#005F87",
    operator: "#CE005B",
  },
];

export interface BackgroundPreset {
  id: string;
  name: string;
  style: CSSProperties;
  swatch: string;
}

const CORE_BACKGROUNDS: BackgroundPreset[] = [
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
  {
    id: "polka",
    name: "Polka Dots",
    swatch: "#EAE6F8",
    style: {
      backgroundColor: "#F3F0FA",
      backgroundImage: "radial-gradient(rgba(119,85,219,0.22) 1.5px, transparent 1.5px)",
      backgroundSize: "18px 18px",
    },
  },
  {
    id: "crosshatch",
    name: "Crosshatch",
    swatch: "#064E3B",
    style: {
      backgroundColor: "#042F2E",
      backgroundImage:
        "repeating-linear-gradient(45deg, rgba(45,212,191,0.12) 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, rgba(45,212,191,0.12) 0 1px, transparent 1px 14px)",
    },
  },
];

/** Layered radial "mesh" gradients: smooth, premium-looking, and fully exportable (no images needed). */
const MESH_BACKGROUNDS: BackgroundPreset[] = [
  {
    id: "mesh-violet",
    name: "Mesh Violet",
    swatch:
      "radial-gradient(circle at 20% 20%,#7C3AED 0%,transparent 55%),radial-gradient(circle at 80% 30%,#EC4899 0%,transparent 55%),#1B1038",
    style: {
      backgroundColor: "#1B1038",
      backgroundImage:
        "radial-gradient(circle at 20% 20%, #7C3AED 0px, transparent 55%), radial-gradient(circle at 80% 30%, #EC4899 0px, transparent 55%), radial-gradient(circle at 50% 100%, #F59E0B 0px, transparent 60%)",
    },
  },
  {
    id: "mesh-lagoon",
    name: "Mesh Lagoon",
    swatch:
      "radial-gradient(circle at 15% 25%,#14B8A6 0%,transparent 55%),radial-gradient(circle at 85% 20%,#3B82F6 0%,transparent 55%),#06202A",
    style: {
      backgroundColor: "#06202A",
      backgroundImage:
        "radial-gradient(circle at 15% 25%, #14B8A6 0px, transparent 55%), radial-gradient(circle at 85% 20%, #3B82F6 0px, transparent 55%), radial-gradient(circle at 60% 100%, #A3E635 0px, transparent 50%)",
    },
  },
  {
    id: "mesh-ember",
    name: "Mesh Ember",
    swatch:
      "radial-gradient(circle at 20% 80%,#F97316 0%,transparent 55%),radial-gradient(circle at 85% 15%,#E11D48 0%,transparent 55%),#1F0A0A",
    style: {
      backgroundColor: "#1F0A0A",
      backgroundImage:
        "radial-gradient(circle at 20% 80%, #F97316 0px, transparent 55%), radial-gradient(circle at 85% 15%, #E11D48 0px, transparent 55%), radial-gradient(circle at 60% 40%, #FACC15 0px, transparent 45%)",
    },
  },
];

/** Every gradient, mesh, and pattern background, in display order. */
export const BACKGROUNDS: BackgroundPreset[] = [...CORE_BACKGROUNDS, ...MESH_BACKGROUNDS];

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
    id: "rose-moon",
    name: "Rosé Moon",
    mode: "dark",
    theme: "rose-pine-moon",
    bg: "flamingo",
    font: "geist",
    shadow: "large",
  },
  {
    id: "everforest-calm",
    name: "Everforest Calm",
    mode: "dark",
    theme: "everforest-dark",
    bg: "northern",
    font: "red-hat",
    shadow: "medium",
  },
  {
    id: "frappe-soft",
    name: "Frappé Soft",
    mode: "dark",
    theme: "catppuccin-frappe",
    bg: "mesh-lagoon",
    font: "dm-mono",
    shadow: "soft",
  },
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
    id: "ayu-midnight",
    name: "Ayu Midnight",
    mode: "dark",
    theme: "ayu-dark",
    bg: "mesh-ember",
    font: "anonymous",
    shadow: "large",
  },
  {
    id: "cobalt-ocean",
    name: "Cobalt Ocean",
    mode: "dark",
    theme: "cobalt2",
    bg: "ocean",
    font: "overpass",
    shadow: "large",
  },
  {
    id: "paper-studio",
    name: "Paper Studio",
    mode: "light",
    theme: "papercolor-light",
    bg: "polka",
    font: "anonymous",
    shadow: "soft",
  },
  {
    id: "modus-crisp",
    name: "Modus Crisp",
    mode: "light",
    theme: "modus-operandi",
    bg: "grid",
    font: "geist",
    shadow: "medium",
  },
];

export const HIGHLIGHT_COLOR_IDS = ["violet", "amber", "cyan", "emerald", "rose"] as const;
export type HighlightColorId = (typeof HIGHLIGHT_COLOR_IDS)[number];

export interface HighlightColorOption {
  id: HighlightColorId;
  name: string;
  swatch: string;
  bar: string;
  darkBg: string;
  lightBg: string;
}

export const HIGHLIGHT_COLORS: HighlightColorOption[] = [
  {
    id: "violet",
    name: "Violet",
    swatch: "#8B5CF6",
    bar: "#9E7EE6",
    darkBg: "rgba(139, 92, 246, 0.26)",
    lightBg: "rgba(124, 58, 237, 0.14)",
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "#F59E0B",
    bar: "#FBBF24",
    darkBg: "rgba(245, 158, 11, 0.24)",
    lightBg: "rgba(217, 119, 6, 0.15)",
  },
  {
    id: "cyan",
    name: "Cyan",
    swatch: "#06B6D4",
    bar: "#22D3EE",
    darkBg: "rgba(6, 182, 212, 0.24)",
    lightBg: "rgba(8, 145, 178, 0.14)",
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#10B981",
    bar: "#34D399",
    darkBg: "rgba(16, 185, 129, 0.24)",
    lightBg: "rgba(5, 150, 105, 0.14)",
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#F43F5E",
    bar: "#FB7185",
    darkBg: "rgba(244, 63, 94, 0.24)",
    lightBg: "rgba(225, 29, 72, 0.14)",
  },
];

export const WINDOW_WIDTH_IDS = ["auto", "540", "760", "960"] as const;
export type WindowWidthId = (typeof WINDOW_WIDTH_IDS)[number];

export const WINDOW_WIDTHS: { id: WindowWidthId; name: string; px: number | null }[] = [
  { id: "auto", name: "Auto fit", px: null },
  { id: "540", name: "Compact (540px)", px: 540 },
  { id: "760", name: "Standard (760px)", px: 760 },
  { id: "960", name: "Wide (960px)", px: 960 },
];

export type FrameId = "auto" | "16:9" | "1:1" | "4:5" | "og" | "story";

export interface FrameOption {
  id: FrameId;
  name: string;
  hint: string;
  width: number | null;
  height: number | null;
}

/** `auto` hugs the code; every other frame exports an exact social/print size with the code auto-fitted. */
export const FRAMES: FrameOption[] = [
  { id: "auto", name: "Auto fit", hint: "Hugs your code at any size", width: null, height: null },
  { id: "16:9", name: "Wide 16:9", hint: "1600 × 900 · X / Twitter cards", width: 1600, height: 900 },
  { id: "1:1", name: "Square 1:1", hint: "1080 × 1080 · Instagram posts", width: 1080, height: 1080 },
  { id: "4:5", name: "Portrait 4:5", hint: "1080 × 1350 · Instagram feed", width: 1080, height: 1350 },
  { id: "og", name: "Social card", hint: "1200 × 630 · Open Graph & LinkedIn", width: 1200, height: 630 },
  { id: "story", name: "Story 9:16", hint: "1080 × 1920 · Stories & Reels", width: 1080, height: 1920 },
];

export const EXPORT_FORMAT_IDS = ["png", "jpeg", "webp", "svg"] as const;
export type ExportFormatId = (typeof EXPORT_FORMAT_IDS)[number];

export interface ExportFormatOption {
  id: ExportFormatId;
  label: string;
  ext: string;
  mime: string;
  lossy: boolean;
  hint: string;
}

export const EXPORT_FORMATS: ExportFormatOption[] = [
  { id: "png", label: "PNG", ext: "png", mime: "image/png", lossy: false, hint: "Lossless · transparency supported" },
  { id: "jpeg", label: "JPEG", ext: "jpg", mime: "image/jpeg", lossy: true, hint: "Smallest file · no transparency" },
  {
    id: "webp",
    label: "WebP",
    ext: "webp",
    mime: "image/webp",
    lossy: true,
    hint: "Modern web format · transparency supported",
  },
  {
    id: "svg",
    label: "SVG",
    ext: "svg",
    mime: "image/svg+xml",
    lossy: false,
    hint: "Vector · scales to any size, fonts embedded",
  },
];

export const TAB_SIZES = [2, 4, 8] as const;

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
  scala: "scala",
  sc: "scala",
  hs: "haskell",
  ex: "elixir",
  exs: "elixir",
  r: "r",
  ps1: "powershell",
  psm1: "powershell",
  pl: "perl",
  scss: "scss",
  mk: "makefile",
  makefile: "makefile",
};
