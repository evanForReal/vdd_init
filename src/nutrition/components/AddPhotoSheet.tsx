import { useRef, useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { todayISO } from "../../utils/date";

export function AddPhotoSheet({ onClose }: { onClose: () => void }) {
  const { addPhoto } = useNutrition();
  const [date, setDate] = useState(todayISO());
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit() {
    if (!file) return;
    await addPhoto(date, file);
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">add photo</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="form">
          <label className="field-label">date</label>
          <input
            className="text-field"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label className="field-label">photo</label>
          <input
            ref={inputRef}
            className="text-field"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button className="primary-btn" onClick={submit} disabled={!file}>
            save
          </button>
        </div>
      </div>
    </div>
  );
}
