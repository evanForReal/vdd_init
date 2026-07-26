import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { Sheet } from "../../components/Sheet";

export function TemplateSheet({ onClose }: { onClose: () => void }) {
  const { createTemplate } = useNutrition();
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  function submit() {
    const items = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!name.trim() || items.length === 0) {
      onClose();
      return;
    }
    createTemplate(name, items);
    onClose();
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">new template</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="form">
        <label className="field-label">template name</label>
        <input
          className="text-field"
          placeholder="e.g. training day"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="field-label">items</label>
        <textarea
          className="text-field textarea-field"
          rows={7}
          placeholder={"- eggs\n- toast\n- coffee"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="hint">one item per line, written however you like — typed as-is.</p>

        <button className="primary-btn" onClick={submit}>
          save template
        </button>
      </div>
    </Sheet>
  );
}
