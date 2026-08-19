import { useState } from "react";
import type { Artwork } from "../data/artworks";
import { artworkImageUrl } from "../data/artworks";
import { useBookmarks } from "../context/BookmarksContext";
import { Lightbox } from "./Lightbox";

// Same graceful degrade as ArtworkPanel: if the image fails (no local
// bundled copy yet and Commons unreachable), show a plain tinted tile
// instead of a broken-image glyph.
function BookmarkTile({
  art,
  onOpen,
  onRemove,
}: {
  art: Artwork;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="bookmarks-tile">
      <button
        className="bookmarks-tile-tap"
        onClick={onOpen}
        aria-label={`view ${art.title} full screen`}
      >
        {!failed ? (
          <img
            className="bookmarks-tile-img"
            src={artworkImageUrl(art)}
            alt={`${art.title} by ${art.artist}`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="bookmarks-tile-fallback" />
        )}
      </button>
      <label className="bookmarks-tile-remove" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked
          onChange={onRemove}
          aria-label={`remove ${art.title} from bookmarked art`}
        />
      </label>
      <div className="bookmarks-tile-caption">
        <div className="bookmarks-tile-title">{art.title}</div>
        <div className="bookmarks-tile-meta">
          {art.artist}, {art.year}
        </div>
      </div>
    </div>
  );
}

export function BookmarkedArtPage({ onBack }: { onBack: () => void }) {
  const { bookmarkedArtworks, toggleBookmark } = useBookmarks();
  const [openArt, setOpenArt] = useState<Artwork | null>(null);

  return (
    <div className="app-shell">
      <button className="back-btn" onClick={onBack} aria-label="back to home">
        ‹ home
      </button>
      <main className="app-main">
        <div className="page bookmarks-page">
          <header className="bookmarks-header">
            <h1>bookmarked art</h1>
            <p className="bookmarks-count">
              {bookmarkedArtworks.length === 0
                ? "nothing saved yet"
                : `${bookmarkedArtworks.length} piece${
                    bookmarkedArtworks.length === 1 ? "" : "s"
                  }`}
            </p>
          </header>

          {bookmarkedArtworks.length === 0 ? (
            <div className="empty-state">
              <p>check the bookmark box on any artwork to save it here.</p>
            </div>
          ) : (
            <div className="bookmarks-grid">
              {bookmarkedArtworks.map((art) => (
                <BookmarkTile
                  key={art.id}
                  art={art}
                  onOpen={() => setOpenArt(art)}
                  onRemove={() => toggleBookmark(art.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {openArt && (
        <Lightbox
          src={artworkImageUrl(openArt, 2400)}
          alt={`${openArt.title} by ${openArt.artist}`}
          caption={`${openArt.title} — ${openArt.artist}, ${openArt.year} · ${openArt.museum}`}
          onClose={() => setOpenArt(null)}
        />
      )}
    </div>
  );
}
