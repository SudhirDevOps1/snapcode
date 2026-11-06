import { createHash } from "node:crypto";
import { readFile, writeFile, access } from "node:fs/promises";
import sharp from "sharp";

const dist = new URL("../dist/", import.meta.url);
let html = await readFile(new URL("index.html", dist), "utf8");
const hashes = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
  .filter((match) => match[1].trim())
  .map((match) => `'sha256-${createHash("sha256").update(match[1]).digest("base64")}'`);
if (hashes.length === 0) throw new Error("Expected a bundled inline script for the production CSP.");
const csp = `default-src 'self'; script-src 'self' ${hashes.join(" ")}; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`;
html = html.replace(/(<meta\s+http-equiv="Content-Security-Policy"\s+content=")[^"]*("\s*\/?>)/, `$1${csp}$2`);
if (!html.includes(hashes[0])) throw new Error("Production CSP was not injected.");
await writeFile(new URL("index.html", dist), html);
const headers = (await readFile(new URL("_headers", dist), "utf8")).replace(
  /Content-Security-Policy:.*$/m,
  `Content-Security-Policy: ${csp}; frame-ancestors 'none'`,
);
await writeFile(new URL("_headers", dist), headers);
await writeFile(
  new URL("security-headers.conf", dist),
  [
    `add_header Content-Security-Policy "${csp}; frame-ancestors 'none'" always;`,
    'add_header X-Content-Type-Options "nosniff" always;',
    'add_header X-Frame-Options "DENY" always;',
    'add_header Referrer-Policy "no-referrer" always;',
    'add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;',
    'add_header Cross-Origin-Opener-Policy "same-origin" always;',
    'add_header Cache-Control "no-cache" always;',
  ].join("\n"),
);
const version = createHash("sha256").update(html).digest("hex").slice(0, 16);
const sw = (await readFile(new URL("sw.js", dist), "utf8")).replaceAll("__BUILD_VERSION__", version);
await writeFile(new URL("sw.js", dist), sw);
const manifest = JSON.parse(await readFile(new URL("manifest.webmanifest", dist), "utf8"));
for (const icon of manifest.icons) {
  const file = new URL(icon.src.slice(1), dist);
  await access(file);
  if (icon.type === "image/png") {
    const metadata = await sharp(await readFile(file)).metadata();
    if (`${metadata.width}x${metadata.height}` !== icon.sizes) throw new Error(`Wrong icon size: ${icon.src}`);
  }
}
await writeFile(
  new URL("build-info.json", dist),
  JSON.stringify({ version, assetsVerified: true, localFonts: true }, null, 2),
);
console.log(`Verified production assets. CSP hashes and offline cache ${version} generated.`);
