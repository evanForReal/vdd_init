import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { Sheet } from "../../components/Sheet";

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
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">note</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

        <div className="form">
          <label className="field-label">title</label>
          <input
            className="text-field"
            placeholder="short title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />

          <label className="field-label">description</label>
          <textarea
            className="text-field textarea-field"
            placeholder="what's up today?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <button className="primary-btn" onClick={submit}>
            save
          </button>
        </div>
    </Sheet>
  );
}
