import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { Sheet } from "../../components/Sheet";

export function GuidingStarSheet({ onClose }: { onClose: () => void }) {
  const { createGuidingStar } = useTodo();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!name.trim()) {
      onClose();
      return;
    }
    createGuidingStar(name, description);
    onClose();
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">new guiding star</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>
      <div className="form">
        <label className="field-label">name</label>
        <input
          className="text-field"
          placeholder="e.g. sketching"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <label className="field-label">description (optional)</label>
        <input
          className="text-field"
          placeholder="why this matters to you"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="primary-btn" onClick={submit}>
          save
        </button>
      </div>
    </Sheet>
  );
}
