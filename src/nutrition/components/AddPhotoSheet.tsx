import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { todayISO } from "../../utils/date";
import { Sheet } from "../../components/Sheet";

export function AddPhotoSheet({ onClose }: { onClose: () => void }) {
  const { addPhoto } = useNutrition();
  const [file, setFile] = useState<File | null>(null);

  async function submit() {
    if (!file) return;
    await addPhoto(todayISO(), file);
    onClose();
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        <h2 className="sheet-title">add photo</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className="form">
        <label className="field-label">photo</label>
        <input
          className="text-field"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button className="primary-btn" onClick={submit} disabled={!file}>
          save
        </button>
      </div>
    </Sheet>
  );
}
