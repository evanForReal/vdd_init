import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import type { TemplateItem } from "../types";

interface DraftItem {
  key: string;
  label: string;
  protein: string;
  proteinConfidence: string;
  calories: string;
  caloriesConfidence: string;
}

function emptyDraft(): DraftItem {
  return {
    key: Math.random().toString(36).slice(2),
    label: "",
    protein: "",
    proteinConfidence: "",
    calories: "",
    caloriesConfidence: "",
  };
}

export function TemplateSheet({ onClose }: { onClose: () => void }) {
  const { createTemplate } = useNutrition();
  const [name, setName] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyDraft()]);

  function updateItem(key: string, patch: Partial<DraftItem>) {
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  }

  function removeItem(key: string) {
    setItems((list) => list.filter((it) => it.key !== key));
  }

  function submit() {
    const built: TemplateItem[] = items
      .filter((it) => it.label.trim() || it.protein || it.calories)
      .map((it) => {
        const proteinValue = parseFloat(it.protein);
        const caloriesValue = parseFloat(it.calories);
        return {
          label: it.label.trim() || "food",
          protein: {
            value: Number.isNaN(proteinValue) ? 0 : proteinValue,
            confidence: it.proteinConfidence ? parseFloat(it.proteinConfidence) : undefined,
          },
          calories: {
            value: Number.isNaN(caloriesValue) ? 0 : caloriesValue,
            confidence: it.caloriesConfidence ? parseFloat(it.caloriesConfidence) : undefined,
          },
        };
      });
    if (!name.trim() || built.length === 0) {
      onClose();
      return;
    }
    createTemplate(name, built);
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
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

          {items.map((it, i) => (
            <div className="template-item-row" key={it.key}>
              <div className="template-item-header">
                <span className="field-label">item {i + 1}</span>
                {items.length > 1 && (
                  <button
                    className="icon-btn subtle"
                    onClick={() => removeItem(it.key)}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
              <input
                className="text-field"
                placeholder="e.g. chicken bowl"
                value={it.label}
                onChange={(e) => updateItem(it.key, { label: e.target.value })}
              />
              <div className="value-confidence-row">
                <input
                  className="text-field"
                  inputMode="decimal"
                  placeholder="protein (g)"
                  value={it.protein}
                  onChange={(e) => updateItem(it.key, { protein: e.target.value })}
                />
                <span className="pm-sign">±</span>
                <input
                  className="text-field confidence-field"
                  inputMode="decimal"
                  placeholder="optional"
                  value={it.proteinConfidence}
                  onChange={(e) => updateItem(it.key, { proteinConfidence: e.target.value })}
                />
              </div>
              <div className="value-confidence-row">
                <input
                  className="text-field"
                  inputMode="decimal"
                  placeholder="calories"
                  value={it.calories}
                  onChange={(e) => updateItem(it.key, { calories: e.target.value })}
                />
                <span className="pm-sign">±</span>
                <input
                  className="text-field confidence-field"
                  inputMode="decimal"
                  placeholder="optional"
                  value={it.caloriesConfidence}
                  onChange={(e) => updateItem(it.key, { caloriesConfidence: e.target.value })}
                />
              </div>
            </div>
          ))}

          <button
            className="add-exercise-btn"
            onClick={() => setItems((list) => [...list, emptyDraft()])}
          >
            + add item
          </button>

          <button className="primary-btn" onClick={submit}>
            save template
          </button>
        </div>
      </div>
    </div>
  );
}
