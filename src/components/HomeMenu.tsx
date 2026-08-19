import { useState } from "react";
import { MenuIcon, BookmarkIcon } from "../nutrition/components/Icons";

// Mirrors TdMenu.tsx's foldout-hamburger pattern, applied to the Home
// screen itself rather than a module tab.
export function HomeMenu({
  onBookmarkedArt,
}: {
  onBookmarkedArt: () => void;
}) {
  const [open, setOpen] = useState(false);

  function pick(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <div className="home-menu">
      <button
        className="icon-btn home-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="menu"
      >
        <MenuIcon />
      </button>
      {open && (
        <>
          <div className="home-menu-scrim" onClick={() => setOpen(false)} />
          <div className="home-menu-panel">
            <button
              className="home-menu-item"
              onClick={() => pick(onBookmarkedArt)}
            >
              <BookmarkIcon className="home-menu-icon" />
              <span>bookmarked art</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
