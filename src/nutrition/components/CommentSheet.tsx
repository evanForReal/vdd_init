import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";

export function CommentSheet({
  date,
  onClose,
}: {
  date: string;
  onClose: () => void;
}) {
  const { addComment } = useNutrition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!title.trim() && !description.trim()) {
      onClose();
      return;
    }
    addComment(date, title, description);
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">Note on Today</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="form">
          <label className="field-label">Title</label>
          <input
            className="text-field"
            placeholder="Short title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <label className="field-label">Description</label>
          <textarea
            className="text-field textarea-field"
            placeholder="What's going on today?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <button className="primary-btn" onClick={submit}>
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
