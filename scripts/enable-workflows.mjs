// Activates the GitHub Actions templates by copying docs/workflows/*.yml into .github/workflows/.
// Pushing the result needs a token with the `workflow` scope (classic) or
// "Workflows: Read and write" (fine-grained); GitHub rejects workflow pushes otherwise.
import { copyFile, mkdir, readdir } from "node:fs/promises";

const source = new URL("../docs/workflows/", import.meta.url);
const target = new URL("../.github/workflows/", import.meta.url);

await mkdir(target, { recursive: true });
const files = (await readdir(source)).filter((name) => name.endsWith(".yml"));
for (const name of files) {
  await copyFile(new URL(name, source), new URL(name, target));
  console.log(`enabled .github/workflows/${name}`);
}
console.log(`\n${files.length} workflows copied. Commit and push them with a token that has workflow permission.`);
