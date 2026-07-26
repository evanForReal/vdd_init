import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { Sheet } from "../../components/Sheet";

const DURATIONS = [15, 25, 45, 60];

export function SprintSheet({ date, onClose }: { date: string; onClose: () => void }) {
  const { itemsForDate, startSprint } = useTodo();
  const items = itemsForDate(date).filter((i) => !i.completed);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState(25);

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit() {
    if (selected.size === 0) return;
    startSprint(date, Array.from(selected), duration);
    onClose();
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">start a sprint</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="form">
        <label className="field-label">which tasks?</label>
        {items.length === 0 ? (
          <p className="hint">nothing left unchecked today.</p>
        ) : (
          <div className="sprint-task-picker">
            {items.map((item) => (
              <button
                key={item.id}
                className={`sprint-pick-row ${selected.has(item.id) ? "picked" : ""}`}
                onClick={() => toggle(item.id)}
              >
                <span className={`task-check ${selected.has(item.id) ? "checked" : ""}`}>
                  {selected.has(item.id) ? "✓" : ""}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <label className="field-label">for how long?</label>
        <div className="duration-chip-row">
          {DURATIONS.map((d) => (
            <button
              key={d}
              className={`duration-chip ${duration === d ? "active" : ""}`}
              onClick={() => setDuration(d)}
            >
              {d}m
            </button>
          ))}
        </div>

        <button className="primary-btn" onClick={submit} disabled={selected.size === 0}>
          start sprint
        </button>
      </div>
    </Sheet>
  );
}
