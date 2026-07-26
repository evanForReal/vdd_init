import { useEffect, useState } from "react";
import { useTodo } from "../context/TodoContext";
import { TaskRow } from "./TaskRow";
import type { Sprint, TodoItem } from "../types";

// Checking a task off here toggles the exact same TodoItem record shown in
// the day's main list — there's no separate copy, so completion always
// propagates both ways automatically.
export function SprintBanner({ sprint }: { sprint: Sprint }) {
  const { state, toggleItem, endSprint } = useTodo();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const items = sprint.taskIds
    .map((id) => state.items.find((i) => i.id === id))
    .filter((i): i is TodoItem => !!i);

  const totalMs = sprint.durationMinutes * 60000;
  const remainingMs = Math.max(0, totalMs - (now - sprint.startedAt));
  const expired = remainingMs <= 0;
  const minutes = Math.floor(remainingMs / 60000);
  const seconds = Math.floor((remainingMs % 60000) / 1000);
  const allDone = items.length > 0 && items.every((i) => i.completed);

  return (
    <div className={`sprint-banner ${expired ? "expired" : ""}`}>
      <div className="sprint-banner-header">
        <span className="sprint-banner-title">sprint</span>
        <span className="sprint-banner-timer">
          {expired ? "time's up" : `${minutes}:${String(seconds).padStart(2, "0")}`}
        </span>
        <button
          className="icon-btn subtle"
          onClick={() => endSprint(sprint.id)}
          aria-label="End sprint"
        >
          ✕
        </button>
      </div>
      <div className="task-list">
        {items.map((item) => (
          <TaskRow key={item.id} item={item} onToggle={() => toggleItem(item.id)} />
        ))}
      </div>
      {allDone && <p className="hint">all done — nice.</p>}
    </div>
  );
}
