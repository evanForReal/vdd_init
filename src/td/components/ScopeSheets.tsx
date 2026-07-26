import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { Sheet } from "../../components/Sheet";
import { TaskRow } from "./TaskRow";
import { AddTaskRow } from "./AddTaskRow";
import { formatDateLong, todayISO, addDays } from "../../utils/date";
import type { ScopeBlock } from "../types";

export function ScopeCreateSheet({ onClose }: { onClose: () => void }) {
  const { createScopeBlock } = useTodo();
  const today = todayISO();
  const [label, setLabel] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDays(today, 3));

  function submit() {
    if (!label.trim()) {
      onClose();
      return;
    }
    createScopeBlock(label, startDate, endDate);
    onClose();
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">new scope</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="form">
        <label className="field-label">label</label>
        <input
          className="text-field"
          placeholder="e.g. apartment hunt"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <label className="field-label">from</label>
        <input
          className="text-field"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label className="field-label">to</label>
        <input
          className="text-field"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button className="primary-btn" onClick={submit}>
          create
        </button>
      </div>
    </Sheet>
  );
}

export function ScopeDetailSheet({
  block,
  onClose,
}: {
  block: ScopeBlock;
  onClose: () => void;
}) {
  const { itemsForScope, addScopeItem, toggleItem, removeItem, deleteScopeBlock } = useTodo();
  const items = itemsForScope(block.id);

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">{block.label}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <p className="hint">
        {formatDateLong(block.startDate)} – {formatDateLong(block.endDate)}
      </p>

      <div className="form">
        {items.length > 0 && (
          <div className="task-list">
            {items.map((item) => (
              <TaskRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
        <AddTaskRow onAdd={(label) => addScopeItem(block.id, label)} allowOptions={false} />
        <button
          className="text-btn"
          onClick={() => {
            if (confirm(`delete "${block.label}"? this removes its tasks too.`)) {
              deleteScopeBlock(block.id);
              onClose();
            }
          }}
        >
          delete scope
        </button>
      </div>
    </Sheet>
  );
}
