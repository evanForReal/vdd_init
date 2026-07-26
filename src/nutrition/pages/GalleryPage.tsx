import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, type PanInfo } from "framer-motion";
import { useNutrition } from "../context/NutritionContext";
import { AddPhotoSheet } from "../components/AddPhotoSheet";
import { GridIcon, PlusIcon } from "../components/Icons";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { Lightbox } from "../../components/Lightbox";
import { formatDateLong } from "../../utils/date";
import type { ProgressPhotoMeta } from "../types";

type SlideCustom = number | "grid";

const variants = {
  enter: (custom: SlideCustom) =>
    custom === "grid" ? { opacity: 0 } : { x: custom > 0 ? 320 : -320, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: (custom: SlideCustom) =>
    custom === "grid" ? { opacity: 0 } : { x: custom < 0 ? 320 : -320, opacity: 0 },
};

// Object URLs are cached in NutritionContext and only revoked on delete, so
// this hook just reads from that cache — no per-mount revoke, no re-fetch
// when the same photo remounts across single/grid view switches.
function usePhotoUrl(id: string | undefined) {
  const { getPhotoUrl } = useNutrition();
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (id) {
      getPhotoUrl(id).then((u) => {
        if (!cancelled) setUrl(u);
      });
    } else {
      setUrl(undefined);
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return url;
}

function GridThumb({
  photo,
  index,
  onSelect,
}: {
  photo: ProgressPhotoMeta;
  index: number;
  onSelect: () => void;
}) {
  const url = usePhotoUrl(photo.id);
  return (
    <motion.button
      layoutId={`photo-${photo.id}`}
      className="gallery-grid-item"
      onClick={onSelect}
      aria-label={`View photo from ${photo.date}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.015, 0.3) }}
    >
      {url && <img className="gallery-grid-thumb" src={url} alt={photo.date} />}
    </motion.button>
  );
}

export function GalleryPage() {
  const { photos, removePhoto, updatePhotoDate, getPhotoUrl } = useNutrition();
  const [[index, direction], setPage] = useState([photos.length - 1, 0]);
  const [exitVelocity, setExitVelocity] = useState(0);
  const [adding, setAdding] = useState(false);
  const [viewingFull, setViewingFull] = useState(false);
  const [view, setView] = useState<"single" | "grid">("single");
  const [editingDate, setEditingDate] = useState(false);
  const [enteringFromGrid, setEnteringFromGrid] = useState(false);

  useEffect(() => {
    setPage(([i]) => [Math.min(i, photos.length - 1), 0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  // Warm the URL cache for every photo in the background so the grid can
  // mount instantly instead of waiting on each thumbnail's own IndexedDB
  // round trip the first time you switch to it.
  useEffect(() => {
    photos.forEach((p) => {
      getPhotoUrl(p.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const clampedIndex = Math.max(0, Math.min(index, photos.length - 1));
  const current = photos[clampedIndex];
  const url = usePhotoUrl(current?.id);

  function paginate(newDirection: number, velocity: number) {
    const next = clampedIndex + newDirection;
    if (next < 0 || next >= photos.length) return;
    setEnteringFromGrid(false);
    setExitVelocity(velocity);
    setPage([next, newDirection]);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const swipe = Math.abs(info.offset.x) * info.velocity.x;
    if (swipe < -10000) paginate(1, info.velocity.x);
    else if (swipe > 10000) paginate(-1, info.velocity.x);
  }

  function selectFromGrid(id: string) {
    const i = photos.findIndex((p) => p.id === id);
    if (i >= 0) setPage([i, 0]);
    setEnteringFromGrid(true);
    setEditingDate(false);
    setView("single");
  }

  if (photos.length === 0) {
    return (
      <div className="page">
        <header className="program-header">
          <h1>photos</h1>
        </header>
        <div className="empty-state">
          <p>no photos yet</p>
        </div>
        <ArtworkPanel seed="nutrition-gallery-empty" />
        <button className="fab" onClick={() => setAdding(true)} aria-label="Add photo">
          <PlusIcon className="fab-icon" />
        </button>
        {adding && <AddPhotoSheet onClose={() => setAdding(false)} />}
      </div>
    );
  }

  return (
    <LayoutGroup>
      <div className="page gallery-page">
        <header className="program-header">
          <h1>photos</h1>
          {view === "single" && (
            <div className="meso-dates">
              {clampedIndex + 1} / {photos.length}
            </div>
          )}
        </header>

        {view === "grid" ? (
          <div className="gallery-grid">
            {photos.map((p, i) => (
              <GridThumb key={p.id} photo={p} index={i} onSelect={() => selectFromGrid(p.id)} />
            ))}
          </div>
        ) : (
          <>
            <div className="gallery-stage">
              <AnimatePresence initial={false} custom={enteringFromGrid ? "grid" : direction}>
                {current && (
                  <motion.div
                    key={current.id}
                    layoutId={`photo-${current.id}`}
                    className="gallery-card"
                    custom={enteringFromGrid ? "grid" : direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 300, damping: 30, velocity: exitVelocity },
                      opacity: { duration: 0.2 },
                    }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={onDragEnd}
                    onTap={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest(".gallery-card-label, .gallery-remove-btn")) return;
                      setViewingFull(true);
                    }}
                  >
                    {url && <img className="gallery-photo" src={url} alt={current.date} />}
                    <div
                      className="gallery-card-label"
                      onPointerDownCapture={(e) => e.stopPropagation()}
                    >
                      {editingDate ? (
                        <input
                          type="date"
                          className="gallery-date-input"
                          autoFocus
                          defaultValue={current.date}
                          onChange={(e) => {
                            if (e.target.value) updatePhotoDate(current.id, e.target.value);
                            setEditingDate(false);
                          }}
                          onBlur={() => setEditingDate(false)}
                        />
                      ) : (
                        <button
                          className="gallery-date-btn"
                          onClick={() => setEditingDate(true)}
                        >
                          {formatDateLong(current.date)}
                        </button>
                      )}
                    </div>
                    <button
                      className="icon-btn subtle gallery-remove-btn"
                      onPointerDownCapture={(e) => e.stopPropagation()}
                      onClick={() => removePhoto(current.id)}
                      aria-label="Delete photo"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {viewingFull && url && current && (
              <Lightbox
                src={url}
                alt={current.date}
                caption={formatDateLong(current.date)}
                onClose={() => setViewingFull(false)}
              />
            )}

            <div className="gallery-nav">
              <button
                className="round-btn"
                disabled={clampedIndex === 0}
                onClick={() => paginate(-1, 0)}
              >
                ‹
              </button>
              <button
                className="round-btn"
                disabled={clampedIndex === photos.length - 1}
                onClick={() => paginate(1, 0)}
              >
                ›
              </button>
            </div>
          </>
        )}

        <button
          className="fab fab-left"
          onClick={() => {
            if (view === "grid") setEnteringFromGrid(true);
            setView((v) => (v === "grid" ? "single" : "grid"));
          }}
          aria-label={view === "grid" ? "View single photo" : "View all photos"}
        >
          <GridIcon className="fab-icon" />
        </button>

        {view === "single" && (
          <button className="fab" onClick={() => setAdding(true)} aria-label="Add photo">
            <PlusIcon className="fab-icon" />
          </button>
        )}

        {adding && <AddPhotoSheet onClose={() => setAdding(false)} />}
      </div>
    </LayoutGroup>
  );
}
