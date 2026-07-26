import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { GuidingStarSheet } from "../components/GuidingStarSheet";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { todayISO } from "../../utils/date";

export function FocusPage() {
  const { guidingStars, deleteGuidingStar, checkInCountLast7Days } = useTodo();
  const [creating, setCreating] = useState(false);
  const today = todayISO();

  return (
    <div className="page">
      <header className="program-header">
        <h1>focus</h1>
      </header>
      <p className="hint">
        your guiding stars — habits and projects you want time for beyond the daily grind.
      </p>

      {guidingStars.length === 0 ? (
        <div className="empty-state">
          <p>no guiding stars yet</p>
        </div>
      ) : (
        <div className="program-exercise-list">
          {guidingStars.map((star) => (
            <div className="focus-manage-row" key={star.id}>
              <div className="focus-manage-main">
                <span className="focus-manage-name">{star.name}</span>
                {star.description && (
                  <span className="focus-manage-desc">{star.description}</span>
                )}
                <span className="focus-manage-streak">
                  {checkInCountLast7Days(star.id, today)}× in the last 7 days
                </span>
              </div>
              <button
                className="icon-btn subtle"
                onClick={() => {
                  if (confirm(`remove "${star.name}"?`)) deleteGuidingStar(star.id);
                }}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button className="add-exercise-btn" onClick={() => setCreating(true)}>
        + new guiding star
      </button>

      <ArtworkPanel seed="td-focus" categories={["abstract"]} />

      {creating && <GuidingStarSheet onClose={() => setCreating(false)} />}
    </div>
  );
}
