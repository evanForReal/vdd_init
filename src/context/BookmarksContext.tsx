import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Artwork } from "../data/artworks";
import { ARTWORKS } from "../data/artworks";
import { todayISO } from "../utils/date";

// Global (not per-module) — the bookmark checkbox lives on ArtworkPanel,
// which is rendered inside every module's own provider tree (and on the
// bare Home screen, inside none of them), so this has to live above all
// of that, wrapping the whole app once in App.tsx.
const STORAGE_KEY = "lift-log-art-bookmarks-v1";

export interface BookmarkEntry {
  artworkId: string;
  bookmarkedAt: string;
}

function loadBookmarks(): BookmarkEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is BookmarkEntry =>
        !!e && typeof e.artworkId === "string" && typeof e.bookmarkedAt === "string"
    );
  } catch {
    return [];
  }
}

function saveBookmarks(entries: BookmarkEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

interface BookmarksContextValue {
  isBookmarked: (artworkId: string) => boolean;
  toggleBookmark: (artworkId: string) => void;
  removeBookmark: (artworkId: string) => void;
  /** Resolved artworks, most-recently-bookmarked first. */
  bookmarkedArtworks: Artwork[];
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<BookmarkEntry[]>(() => loadBookmarks());

  useEffect(() => {
    saveBookmarks(entries);
  }, [entries]);

  const bookmarkedIds = useMemo(
    () => new Set(entries.map((e) => e.artworkId)),
    [entries]
  );

  function isBookmarked(artworkId: string) {
    return bookmarkedIds.has(artworkId);
  }

  function toggleBookmark(artworkId: string) {
    setEntries((prev) =>
      prev.some((e) => e.artworkId === artworkId)
        ? prev.filter((e) => e.artworkId !== artworkId)
        : [...prev, { artworkId, bookmarkedAt: todayISO() }]
    );
  }

  function removeBookmark(artworkId: string) {
    setEntries((prev) => prev.filter((e) => e.artworkId !== artworkId));
  }

  const bookmarkedArtworks = useMemo(() => {
    const byId = new Map(ARTWORKS.map((a) => [a.id, a]));
    // entries are appended in bookmark order, so reversing gives
    // most-recently-saved first without needing a date sort (which would
    // only have day granularity anyway).
    return entries
      .slice()
      .reverse()
      .map((e) => byId.get(e.artworkId))
      .filter((a): a is Artwork => Boolean(a));
  }, [entries]);

  const value: BookmarksContextValue = {
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    bookmarkedArtworks,
  };

  return (
    <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
  );
}

export function useBookmarks(): BookmarksContextValue {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarksProvider");
  return ctx;
}
