import { useMemo, useState } from "react";
import type { ArtCategory } from "../data/artworks";
import { artworkImageUrl, pickArtwork } from "../data/artworks";
import { Lightbox } from "./Lightbox";
import { useBookmarks } from "../context/BookmarksContext";

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
  variant?: "hero" | "panel" | "raw";
  minHeight?: string;
}) {
  const artwork = useMemo(() => pickArtwork(seed, categories), [seed, categories]);
  const imageUrl = useMemo(() => artworkImageUrl(artwork), [artwork]);
  const fullImageUrl = useMemo(() => artworkImageUrl(artwork, 2400), [artwork]);
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(artwork.id);
  const wash = FALLBACK_WASHES[
    Math.abs(seed.length + artwork.id.length) % FALLBACK_WASHES.length
  ];
  const credit = `${artwork.title} — ${artwork.artist}, ${artwork.year} · ${artwork.museum}`;
  // Bookmarking only makes sense where a panel reads as "one specific
  // painting" — the hero backdrop is decorative scenery behind the home
  // orbs, and the raw blog variant is deliberately sparse, so both skip it.
  const showBookmark = variant === "panel";

  return (
    <div
      className={`artwork-panel artwork-panel--${variant}`}
      style={minHeight ? { minHeight } : undefined}
    >
      {!failed ? (
        <button
          className="artwork-panel-tap"
          onClick={() => setLightboxOpen(true)}
          aria-label={`view ${artwork.title} full screen`}
        >
          <img
            className="artwork-panel-img"
            src={imageUrl}
            alt={`${artwork.title} by ${artwork.artist}`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </button>
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

      {showBookmark && (
        <label
          className="artwork-bookmark"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={bookmarked}
            onChange={() => toggleBookmark(artwork.id)}
            aria-label={
              bookmarked
                ? `remove ${artwork.title} from bookmarked art`
                : `bookmark ${artwork.title}`
            }
          />
          <span>{bookmarked ? "bookmarked" : "bookmark"}</span>
        </label>
      )}

      <div className="artwork-panel-credit">
        <div className="artwork-panel-title">{artwork.title}</div>
        <div className="artwork-panel-meta">
          {artwork.artist}, {artwork.year} · {artwork.museum}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          src={fullImageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
          caption={credit}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
