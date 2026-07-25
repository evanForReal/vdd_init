// Downloads every artwork image from Wikimedia Commons into public/artworks/
// so the deployed app serves them locally (no live Commons dependency, no
// load-time flicker). Runs before `vite build` in CI, where outbound network
// access is unrestricted. Safe to run repeatedly — already-downloaded files
// are skipped. If a fetch fails (e.g. no network, as in some sandboxed dev
// environments), that artwork just falls back to the live Commons URL at
// runtime — see commonsImageUrl() in src/data/artworks.ts.

import { existsSync, mkdirSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "artworks");
const manifestPath = join(root, "src", "data", "artwork-files.json");

mkdirSync(outDir, { recursive: true });

const { ARTWORKS, commonsImageUrl } = await import(
  "../src/data/artworks.ts"
);

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/tiff": "tif",
  "image/svg+xml": "svg",
};

const manifest = {};
let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const artwork of ARTWORKS) {
  const existing = ["jpg", "jpeg", "png", "webp", "gif", "tif"].find((ext) =>
    existsSync(join(outDir, `${artwork.id}.${ext}`))
  );
  if (existing) {
    manifest[artwork.id] = `${artwork.id}.${existing}`;
    skipped++;
    continue;
  }

  const url = commonsImageUrl(artwork, 1600);
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type")?.split(";")[0] ?? "";
    const ext = EXT_BY_TYPE[contentType] ?? "jpg";
    const buf = Buffer.from(await res.arrayBuffer());
    const filename = `${artwork.id}.${ext}`;
    writeFileSync(join(outDir, filename), buf);
    manifest[artwork.id] = filename;
    downloaded++;
  } catch (err) {
    console.warn(`skip ${artwork.id}: ${err.message}`);
    failed++;
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `artwork images: ${downloaded} downloaded, ${skipped} already present, ${failed} failed (will use live Commons URL as fallback)`
);
