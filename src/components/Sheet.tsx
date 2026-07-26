import { useEffect, useState, type ReactNode } from "react";
import { animate, motion, useDragControls, useMotionValue, type PanInfo } from "framer-motion";

const EXPANDED_FRACTION = 0.94; // nearly full screen
const HALF_FRACTION = 0.55; // half screen
const SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;

// A bottom sheet draggable by its handle, with three stable points: pulled
// up to nearly full screen, resting at half screen, or dragged/flung down
// past the bottom edge to dismiss. The panel is always rendered at its
// nearly-full-screen height and translated down via a shared motion value
// `y` to reveal only part of it — the viewport does the clipping, so no
// per-snap height/overflow juggling is needed. `y` is read directly for
// both live dragging and programmatic snapping so the two can never drift
// out of sync with each other.
export function Sheet({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const dragControls = useDragControls();
  const [viewportH, setViewportH] = useState(() => window.innerHeight);

  useEffect(() => {
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const panelHeight = viewportH * EXPANDED_FRACTION;
  const halfY = panelHeight - viewportH * HALF_FRACTION;
  const dismissY = panelHeight + 40;

  const y = useMotionValue(halfY);

  function handleDragEnd(_: unknown, info: PanInfo) {
    const current = y.get();

    if (info.velocity.y > 700 || current > halfY + (dismissY - halfY) * 0.4) {
      animate(y, dismissY, { ...SPRING, velocity: info.velocity.y }).then(onClose);
    } else if (info.velocity.y < -700 || current < halfY / 2) {
      animate(y, 0, { ...SPRING, velocity: info.velocity.y });
    } else {
      animate(y, halfY, { ...SPRING, velocity: info.velocity.y });
    }
  }

  return (
    <div
      className="sheet-overlay"
      // A real backdrop-tap-to-dismiss always starts with a fresh pointerdown
      // directly on this element. Using pointerdown here (rather than click)
      // means a synthetic trailing "click" that the browser can construct
      // from a completed drag's mouseup — without a matching new pointerdown
      // on the overlay — never triggers a dismiss.
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="sheet"
        style={{ height: panelHeight, y }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: dismissY }}
        dragElastic={{ top: 0.04, bottom: 0.3 }}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="sheet-handle-area"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="sheet-handle" />
        </div>
        <div className="sheet-body">{children}</div>
      </motion.div>
    </div>
  );
}
