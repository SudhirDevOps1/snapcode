import { mkdir, readFile, writeFile, copyFile, readdir } from "node:fs/promises";
import sharp from "sharp";

const icon = await readFile(new URL("../public/icon.svg", import.meta.url));
for (const size of [192, 512]) {
  await writeFile(
    new URL(`../public/icon-${size}.png`, import.meta.url),
    await sharp(icon).resize(size, size).png().toBuffer(),
  );
}
await mkdir(new URL("../public/docs/", import.meta.url), { recursive: true });
for (const file of ["README.md", "SECURITY.md", "CONTRIBUTING.md", "CHANGELOG.md"]) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(`../public/docs/${file}`, import.meta.url));
}

await mkdir(new URL("../public/licenses/", import.meta.url), { recursive: true });
const packages = [
  "@fontsource-variable/inter",
  "@fontsource/jetbrains-mono",
  "@fontsource/fira-code",
  "@fontsource/cascadia-code",
  "@fontsource/commit-mono",
  "@fontsource/ibm-plex-mono",
  "@fontsource/source-code-pro",
  "@fontsource/victor-mono",
  "@fontsource/martian-mono",
  "@fontsource/inconsolata",
  "@fontsource/anonymous-pro",
  "@fontsource/space-mono",
  "@fontsource/roboto-mono",
  "@fontsource/ubuntu-mono",
  "react",
  "react-dom",
  "highlight.js",
  "html-to-image",
  "lucide-react",
  "clsx",
  "tailwind-merge",
];
for (const name of packages) {
  const directory = new URL(`../node_modules/${name}/`, import.meta.url);
  const filename = (await readdir(directory)).find((file) => /^licen[cs]e(\.(md|txt))?$/i.test(file));
  if (!filename) throw new Error(`Missing license for ${name}`);
  await copyFile(
    new URL(filename, directory),
    new URL(`../public/licenses/${name.replaceAll("/", "-").replace("@", "")}.txt`, import.meta.url),
  );
}
await copyFile(new URL("../LICENSE", import.meta.url), new URL("../public/licenses/snapcode.txt", import.meta.url));
