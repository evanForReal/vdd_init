import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { TaskRow } from "./TaskRow";
import { AddTaskRow } from "./AddTaskRow";

// The "guiding stars" section — pinned habits/projects surfaced on the day
// so they stay visually distinct from daily-grind tasks, with a quick
// check-in and the ability to attach today's tasks directly to a star.
export function FocusSection({ date }: { date: string }) {
  const {
    guidingStars,
    pinnedStarsForDate,
    pinStarToDay,
    unpinStarFromDay,
    checkInsForDate,
    toggleCheckIn,
    itemsForDate,
    addDayItem,
    toggleItem,
    removeItem,
  } = useTodo();

  const [picking, setPicking] = useState(false);

  if (guidingStars.length === 0) return null;

  const pinned = pinnedStarsForDate(date);
  const checkedInIds = new Set(checkInsForDate(date).map((c) => c.starId));
  const unpinned = guidingStars.filter((g) => !pinned.some((p) => p.id === g.id));
  const dayItems = itemsForDate(date);

  return (
    <div className="focus-section">
      <div className="field-label">focus today</div>
      {pinned.map((star) => {
        const tasks = dayItems.filter((i) => i.starId === star.id);
        return (
          <div className="focus-star-card" key={star.id}>
            <div className="focus-star-header">
              <button
                className={`focus-checkin ${checkedInIds.has(star.id) ? "checked" : ""}`}
                onClick={() => toggleCheckIn(star.id, date)}
                aria-label="Toggle check-in"
              >
                {checkedInIds.has(star.id) ? "✓" : ""}
              </button>
              <span className="focus-star-name">{star.name}</span>
              <button
                className="icon-btn subtle"
                onClick={() => unpinStarFromDay(date, star.id)}
                aria-label="Unpin from today"
              >
                ✕
              </button>
            </div>
            {tasks.length > 0 && (
              <div className="task-list">
                {tasks.map((item) => (
                  <TaskRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
            <AddTaskRow
              onAdd={(label) => addDayItem(date, label, { starId: star.id })}
              placeholder={`a task for ${star.name}`}
              allowOptions={false}
            />
          </div>
        );
      })}

      {unpinned.length > 0 &&
        (picking ? (
          <div className="focus-pick-row">
            {unpinned.map((star) => (
              <button
                key={star.id}
                className="text-btn"
                onClick={() => {
                  pinStarToDay(date, star.id);
                  setPicking(false);
                }}
              >
                {star.name}
              </button>
            ))}
          </div>
        ) : (
          <button className="text-btn" onClick={() => setPicking(true)}>
            + pin a focus
          </button>
        ))}
    </div>
  );
}
