import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { ArtworkPanel } from "../../components/ArtworkPanel";

export function TargetsPage() {
  const { state, setTargets } = useNutrition();
  const [calories, setCalories] = useState(String(state.targets.calories));
  const [protein, setProtein] = useState(String(state.targets.proteinGrams));

  function save() {
    const caloriesValue = parseFloat(calories);
    const proteinValue = parseFloat(protein);
    setTargets({
      calories: Number.isNaN(caloriesValue) ? state.targets.calories : caloriesValue,
      proteinGrams: Number.isNaN(proteinValue)
        ? state.targets.proteinGrams
        : proteinValue,
    });
  }

  return (
    <div className="page">
      <header className="program-header">
        <h1>Daily Targets</h1>
      </header>

      <div className="form">
        <label className="field-label">Calories</label>
        <input
          className="text-field"
          inputMode="decimal"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          onBlur={save}
        />

        <label className="field-label">Protein (g)</label>
        <input
          className="text-field"
          inputMode="decimal"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          onBlur={save}
        />

        <button className="primary-btn" onClick={save}>
          Save Targets
        </button>
      </div>

      <ArtworkPanel seed="nutrition-targets" categories={["abstract"]} />
    </div>
  );
}
