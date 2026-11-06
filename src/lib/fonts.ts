import inter from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?inline";
import jetbrains from "@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2?inline";
import fira from "@fontsource/fira-code/files/fira-code-latin-400-normal.woff2?inline";
import cascadia from "@fontsource/cascadia-code/files/cascadia-code-latin-400-normal.woff2?inline";
import commitMono from "@fontsource/commit-mono/files/commit-mono-latin-400-normal.woff2?inline";
import plex from "@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?inline";
import sourceCodePro from "@fontsource/source-code-pro/files/source-code-pro-latin-400-normal.woff2?inline";
import victorMono from "@fontsource/victor-mono/files/victor-mono-latin-400-normal.woff2?inline";
import martianMono from "@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff2?inline";
import inconsolata from "@fontsource/inconsolata/files/inconsolata-latin-400-normal.woff2?inline";
import anonymousPro from "@fontsource/anonymous-pro/files/anonymous-pro-latin-400-normal.woff2?inline";
import space from "@fontsource/space-mono/files/space-mono-latin-400-normal.woff2?inline";
import roboto from "@fontsource/roboto-mono/files/roboto-mono-latin-400-normal.woff2?inline";
import ubuntu from "@fontsource/ubuntu-mono/files/ubuntu-mono-latin-400-normal.woff2?inline";

const faces = [
  { id: "inter", name: "Inter", source: inter, weight: "100 900" },
  { id: "jetbrains", name: "JetBrains Mono", source: jetbrains, weight: "400" },
  { id: "fira", name: "Fira Code", source: fira, weight: "400" },
  { id: "cascadia", name: "Cascadia Code", source: cascadia, weight: "400" },
  { id: "commit", name: "Commit Mono", source: commitMono, weight: "400" },
  { id: "plex", name: "IBM Plex Mono", source: plex, weight: "400" },
  { id: "source-code", name: "Source Code Pro", source: sourceCodePro, weight: "400" },
  { id: "victor", name: "Victor Mono", source: victorMono, weight: "400" },
  { id: "martian", name: "Martian Mono", source: martianMono, weight: "400" },
  { id: "inconsolata", name: "Inconsolata", source: inconsolata, weight: "400" },
  { id: "anonymous", name: "Anonymous Pro", source: anonymousPro, weight: "400" },
  { id: "space", name: "Space Mono", source: space, weight: "400" },
  { id: "roboto", name: "Roboto Mono", source: roboto, weight: "400" },
  { id: "ubuntu", name: "Ubuntu Mono", source: ubuntu, weight: "400" },
];

const fontRule = (face: (typeof faces)[number]) =>
  `@font-face{font-family:'${face.name}';font-style:normal;font-weight:${face.weight};font-display:swap;src:url('${face.source}') format('woff2');}`;

// The same embedded fonts power both the UI and PNGs, including offline exports.
export const localFontCSS = faces.map(fontRule).join("\n");
export const exportFontCSS = (id: string) =>
  faces
    .filter((face) => face.id === id || face.id === "inter")
    .map(fontRule)
    .join("\n");
