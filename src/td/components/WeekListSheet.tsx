import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { Sheet } from "../../components/Sheet";

export function WeekListSheet({
  weekStart,
  kind,
  title,
  placeholder,
  onClose,
}: {
  weekStart: string;
  kind: "goal" | "joy";
  title: string;
  placeholder: string;
  onClose: () => void;
}) {
  const { weekListFor, addWeekListItem, toggleWeekListItem, removeWeekListItem } = useTodo();
  const [draft, setDraft] = useState("");
  const items = weekListFor(weekStart, kind);

  function submit() {
    if (!draft.trim()) return;
    addWeekListItem(weekStart, kind, draft);
    setDraft("");
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">{title}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {items.length > 0 && (
        <div className="task-list">
          {items.map((item) => (
            <div className={`task-row ${item.completed ? "done" : ""}`} key={item.id}>
              <button
                className={`task-check ${item.completed ? "checked" : ""}`}
                onClick={() => toggleWeekListItem(item.id)}
                aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
              >
                {item.completed ? "✓" : ""}
              </button>
              <div className="task-row-main">
                <span className="task-label">{item.label}</span>
              </div>
              <button
                className="icon-btn subtle"
                onClick={() => removeWeekListItem(item.id)}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="add-task-row">
        <div className="add-task-main">
          <input
            className="text-field inline add-task-input"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button className="icon-btn add-task-submit" onClick={submit} aria-label="Add">
            +
          </button>
        </div>
      </div>
    </Sheet>
  );
}
