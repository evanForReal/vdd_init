// Downloads every artwork image from Wikimedia Commons into public/artworks/
// so the deployed app serves them locally (no live Commons dependency, no
// load-time flicker). Runs before `vite build` in CI, where outbound network
// access is unrestricted. Safe to run repeatedly — already-downloaded files
// are skipped. If a fetch fails (e.g. no network, as in some sandboxed dev
// environments, or after retries on rate-limiting), that artwork just falls
// back to the live Commons URL at runtime — see commonsImageUrl() in
// src/data/artworks.ts.

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

// Wikimedia's etiquette policy asks automated clients to identify
// themselves and to keep request rates modest; a generic fetch() with no
// User-Agent and no pacing gets 429'd almost immediately.
const USER_AGENT =
  "the-right-tracking-app/1.0 (personal fitness tracker build script; https://github.com/evanForReal/vdd_init) node-fetch";
const REQUEST_DELAY_MS = 250;
const MAX_RETRIES = 4;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Only rate-limit responses (429/503) are worth retrying with backoff — a
// thrown network error (connection refused, blocked by a proxy policy, DNS
// failure, ...) will fail identically on retry, so that's a fast, single
// attempt with no backoff.
async function fetchWithRetry(url) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": USER_AGENT },
    });
    if (res.status === 429 || res.status === 503) {
      if (attempt === MAX_RETRIES) throw new Error(`HTTP ${res.status} (retries exhausted)`);
      const retryAfter = Number(res.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 1000 * 2 ** attempt;
      await sleep(wait);
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  }
  throw new Error("unreachable");
}

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
    const res = await fetchWithRetry(url);
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

  await sleep(REQUEST_DELAY_MS);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(
  `artwork images: ${downloaded} downloaded, ${skipped} already present, ${failed} failed (will use live Commons URL as fallback)`
);
