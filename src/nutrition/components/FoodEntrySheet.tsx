import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";

export function FoodEntrySheet({
  date,
  onClose,
  title = "add food",
  templateBlockId,
  bulletIndex,
}: {
  date: string;
  onClose: () => void;
  title?: string;
  templateBlockId?: string;
  bulletIndex?: number;
}) {
  const { addFoodEntry } = useNutrition();
  const [label, setLabel] = useState("");
  const [protein, setProtein] = useState("");
  const [proteinConfidence, setProteinConfidence] = useState("");
  const [calories, setCalories] = useState("");
  const [caloriesConfidence, setCaloriesConfidence] = useState("");

  function submit() {
    const proteinValue = parseFloat(protein);
    const caloriesValue = parseFloat(calories);
    if (Number.isNaN(proteinValue) && Number.isNaN(caloriesValue)) {
      onClose();
      return;
    }
    addFoodEntry(
      date,
      label,
      {
        value: Number.isNaN(proteinValue) ? 0 : proteinValue,
        confidence: proteinConfidence ? parseFloat(proteinConfidence) : undefined,
      },
      {
        value: Number.isNaN(caloriesValue) ? 0 : caloriesValue,
        confidence: caloriesConfidence ? parseFloat(caloriesConfidence) : undefined,
      },
      templateBlockId !== undefined && bulletIndex !== undefined
        ? { templateBlockId, bulletIndex }
        : undefined
    );
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="form">
          <label className="field-label">name (optional)</label>
          <input
            className="text-field"
            placeholder="e.g. chicken bowl"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <label className="field-label">protein (g)</label>
          <div className="value-confidence-row">
            <input
              className="text-field"
              inputMode="decimal"
              placeholder="0"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <span className="pm-sign">±</span>
            <input
              className="text-field confidence-field"
              inputMode="decimal"
              placeholder="optional"
              value={proteinConfidence}
              onChange={(e) => setProteinConfidence(e.target.value)}
            />
          </div>

          <label className="field-label">calories</label>
          <div className="value-confidence-row">
            <input
              className="text-field"
              inputMode="decimal"
              placeholder="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <span className="pm-sign">±</span>
            <input
              className="text-field confidence-field"
              inputMode="decimal"
              placeholder="optional"
              value={caloriesConfidence}
              onChange={(e) => setCaloriesConfidence(e.target.value)}
            />
          </div>

          <button className="primary-btn" onClick={submit}>
            add
          </button>
        </div>
      </div>
    </div>
  );
}
