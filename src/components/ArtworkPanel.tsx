import { useMemo, useState } from "react";
import type { ArtCategory } from "../data/artworks";
import { commonsImageUrl, pickArtwork } from "../data/artworks";

// A deterministic per-mount palette so the fallback card (used when the
// image can't load) still feels like a specific painting, not an error.
const FALLBACK_WASHES = [
  "linear-gradient(155deg, #6b3f2a 0%, #2c1810 60%, #14100c 100%)",
  "linear-gradient(155deg, #40506b 0%, #202a3a 55%, #14100c 100%)",
  "linear-gradient(155deg, #5c4a2e 0%, #2a2015 55%, #14100c 100%)",
  "linear-gradient(155deg, #4a3350 0%, #251c2a 55%, #14100c 100%)",
  "linear-gradient(155deg, #2e4a3e 0%, #1a251f 55%, #14100c 100%)",
];

export function ArtworkPanel({
  seed,
  categories,
  variant = "panel",
  minHeight,
}: {
  seed: string;
  categories?: ArtCategory[];
  variant?: "hero" | "panel";
  minHeight?: string;
}) {
  const artwork = useMemo(() => pickArtwork(seed, categories), [seed, categories]);
  const imageUrl = useMemo(() => commonsImageUrl(artwork), [artwork]);
  const [failed, setFailed] = useState(false);
  const wash = FALLBACK_WASHES[
    Math.abs(seed.length + artwork.id.length) % FALLBACK_WASHES.length
  ];

  return (
    <div
      className={`artwork-panel artwork-panel--${variant}`}
      style={minHeight ? { minHeight } : undefined}
    >
      {!failed ? (
        <img
          className="artwork-panel-img"
          src={imageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="artwork-panel-fallback" style={{ background: wash }}>
          <svg
            className="artwork-panel-fallback-mark"
            viewBox="0 0 64 64"
            aria-hidden="true"
          >
            <path
              d="M8 44 C 18 20, 30 20, 32 32 C 34 44, 46 44, 56 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="32" cy="32" r="3" fill="currentColor" />
          </svg>
        </div>
      )}
      <div className="artwork-panel-scrim" />
      <div className="artwork-panel-credit">
        <div className="artwork-panel-title">{artwork.title}</div>
        <div className="artwork-panel-meta">
          {artwork.artist}, {artwork.year} · {artwork.museum}
        </div>
      </div>
    </div>
  );
}
