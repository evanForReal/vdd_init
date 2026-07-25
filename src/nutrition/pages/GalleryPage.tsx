import { useEffect, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useNutrition } from "../context/NutritionContext";
import { AddPhotoSheet } from "../components/AddPhotoSheet";
import { PlusIcon } from "../components/Icons";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { formatDateLong } from "../../utils/date";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 320 : -320,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 320 : -320,
    opacity: 0,
  }),
};

function usePhotoUrl(id: string | undefined) {
  const { getPhotoUrl } = useNutrition();
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;
    if (id) {
      getPhotoUrl(id).then((u) => {
        if (cancelled) return;
        objectUrl = u;
        setUrl(u);
      });
    } else {
      setUrl(undefined);
    }
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return url;
}

export function GalleryPage() {
  const { photos, removePhoto } = useNutrition();
  const [[index, direction], setPage] = useState([photos.length - 1, 0]);
  const [exitVelocity, setExitVelocity] = useState(0);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setPage(([i]) => [Math.min(i, photos.length - 1), 0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos.length]);

  const clampedIndex = Math.max(0, Math.min(index, photos.length - 1));
  const current = photos[clampedIndex];
  const url = usePhotoUrl(current?.id);

  function paginate(newDirection: number, velocity: number) {
    const next = clampedIndex + newDirection;
    if (next < 0 || next >= photos.length) return;
    setExitVelocity(velocity);
    setPage([next, newDirection]);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    const swipe = Math.abs(info.offset.x) * info.velocity.x;
    if (swipe < -10000) paginate(1, info.velocity.x);
    else if (swipe > 10000) paginate(-1, info.velocity.x);
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
    <div className="page gallery-page">
      <header className="program-header">
        <h1>photos</h1>
        <div className="meso-dates">
          {clampedIndex + 1} / {photos.length}
        </div>
      </header>

      <div className="gallery-stage">
        <AnimatePresence initial={false} custom={direction}>
          {current && (
            <motion.div
              key={current.id}
              className="gallery-card"
              custom={direction}
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
            >
              {url && <img className="gallery-photo" src={url} alt={current.date} />}
              <div className="gallery-card-label">{formatDateLong(current.date)}</div>
              <button
                className="icon-btn subtle gallery-remove-btn"
                onClick={() => removePhoto(current.id)}
                aria-label="Delete photo"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      <button className="fab" onClick={() => setAdding(true)} aria-label="Add photo">
        <PlusIcon className="fab-icon" />
      </button>

      {adding && <AddPhotoSheet onClose={() => setAdding(false)} />}
    </div>
  );
}
