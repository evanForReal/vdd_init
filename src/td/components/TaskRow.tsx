import type { TodoItem } from "../types";

export function TaskRow({
  item,
  onToggle,
  onRemove,
}: {
  item: TodoItem;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className={`task-row ${item.completed ? "done" : ""}`}>
      <button
        className={`task-check ${item.completed ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
      >
        {item.completed ? "✓" : ""}
      </button>
      <div className="task-row-main">
        <span className="task-label">{item.label}</span>
        {item.time && <span className="task-time">{item.time}</span>}
      </div>
      {onRemove && (
        <button className="icon-btn subtle" onClick={onRemove} aria-label="Remove task">
          ✕
        </button>
      )}
    </div>
  );
}
