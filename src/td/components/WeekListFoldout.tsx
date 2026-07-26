import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { ChevronIcon } from "../../nutrition/components/Icons";

export function WeekListFoldout({
  weekStart,
  kind,
  title,
  placeholder,
}: {
  weekStart: string;
  kind: "goal" | "joy";
  title: string;
  placeholder: string;
}) {
  const { weekListFor, addWeekListItem, toggleWeekListItem, removeWeekListItem } = useTodo();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const items = weekListFor(weekStart, kind);

  function submit() {
    if (!draft.trim()) return;
    addWeekListItem(weekStart, kind, draft);
    setDraft("");
  }

  return (
    <div className="action-foldout">
      <button className="action-foldout-toggle" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        {items.length > 0 && (
          <span className="template-block-tally">
            {items.filter((i) => i.completed).length}/{items.length}
          </span>
        )}
        <ChevronIcon className={`foldout-chevron ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="action-foldout-panel">
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
        </div>
      )}
    </div>
  );
}
