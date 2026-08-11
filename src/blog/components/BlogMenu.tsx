import { useState } from "react";
import { MenuIcon, BookIcon } from "../../nutrition/components/Icons";
import type { Article } from "../types";

export function BlogMenu({
  dueList,
  onRedact,
}: {
  dueList: Article[];
  onRedact: (articleId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function pick(articleId: string) {
    setOpen(false);
    onRedact(articleId);
  }

  return (
    <div className="blog-menu">
      <button
        className={`icon-btn blog-menu-btn ${dueList.length > 0 ? "has-due" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="menu"
      >
        <MenuIcon />
        {dueList.length > 0 && <span className="blog-menu-badge">{dueList.length}</span>}
      </button>
      {open && (
        <>
          <div className="blog-menu-scrim" onClick={() => setOpen(false)} />
          <div className="blog-menu-panel">
            {dueList.length === 0 ? (
              <div className="blog-menu-empty">nothing due this week</div>
            ) : (
              dueList.map((a) => (
                <button key={a.id} className="blog-menu-item" onClick={() => pick(a.id)}>
                  <BookIcon className="blog-menu-icon" />
                  <span>redact &ldquo;{a.title}&rdquo;</span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
