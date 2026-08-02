import { useState } from "react";
import { BookIcon } from "../../nutrition/components/Icons";

export function NoteFoldout({
  entryCount,
  onAppend,
}: {
  entryCount: number;
  onAppend: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function commit() {
    if (!value.trim()) return;
    onAppend(value.trim());
    setValue("");
  }

  return (
    <div className="note-foldout">
      <button className="text-btn note-toggle" onClick={() => setOpen((o) => !o)}>
        <BookIcon className="note-toggle-icon" /> note{entryCount > 0 ? ` (${entryCount})` : ""}
      </button>
      {open && (
        <div className="note-foldout-panel">
          <textarea
            className="text-field textarea-field"
            rows={3}
            placeholder="jot something down about this lesson…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button className="primary-btn" onClick={commit} disabled={!value.trim()}>
            add to note
          </button>
        </div>
      )}
    </div>
  );
}
