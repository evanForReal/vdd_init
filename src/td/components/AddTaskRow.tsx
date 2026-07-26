import { useState } from "react";

export function AddTaskRow({
  onAdd,
  placeholder = "add a task",
  allowOptions = true,
}: {
  onAdd: (label: string, opts?: { time?: string; group?: string }) => void;
  placeholder?: string;
  allowOptions?: boolean;
}) {
  const [label, setLabel] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState("");
  const [group, setGroup] = useState("");

  function submit() {
    if (!label.trim()) return;
    onAdd(label, { time: time || undefined, group: group || undefined });
    setLabel("");
    setTime("");
    setGroup("");
    setExpanded(false);
  }

  return (
    <div className="add-task-row">
      <div className="add-task-main">
        <input
          className="text-field inline add-task-input"
          placeholder={placeholder}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        {allowOptions && (
          <button
            className={`icon-btn subtle add-task-expand ${expanded ? "active" : ""}`}
            onClick={() => setExpanded((o) => !o)}
            aria-label="More options"
          >
            ⋯
          </button>
        )}
        <button className="icon-btn add-task-submit" onClick={submit} aria-label="Add task">
          +
        </button>
      </div>
      {expanded && (
        <div className="add-task-options">
          <input
            className="text-field inline"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <input
            className="text-field inline"
            placeholder="group (optional)"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
