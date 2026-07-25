import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { TemplateSheet } from "../components/TemplateSheet";
import { AssignTemplateSheet } from "../components/AssignTemplateSheet";
import { PlannedItemSheet } from "../components/PlannedItemSheet";
import { ChevronIcon } from "../components/Icons";
import { summarize } from "../format";
import { addDays, formatDateShort, todayISO } from "../../utils/date";

export function PlanPage() {
  const { templates, deleteTemplate, plannedItemsForDate, upcomingPlannedDays, removePlannedItem } =
    useNutrition();

  const [templatesOpen, setTemplatesOpen] = useState(true);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [assigning, setAssigning] = useState<{ id: string; name: string } | null>(null);

  const [pickedDate, setPickedDate] = useState(() => addDays(todayISO(), 1));
  const [addingItem, setAddingItem] = useState(false);

  const pickedItems = plannedItemsForDate(pickedDate);
  const upcoming = upcomingPlannedDays(todayISO(), 30);

  return (
    <div className="page">
      <header className="program-header">
        <h1>plan</h1>
      </header>
      <p className="hint">
        build reusable templates and assign them ahead of time so eating on plan is a
        one-tap decision, not a fresh one.
      </p>

      <div className="action-foldout">
        <button
          className="action-foldout-toggle"
          onClick={() => setTemplatesOpen((o) => !o)}
        >
          <span>templates</span>
          <ChevronIcon className={`foldout-chevron ${templatesOpen ? "open" : ""}`} />
        </button>

        {templatesOpen && (
          <div className="action-foldout-panel">
            {templates.length === 0 && (
              <p className="hint">no templates yet — build one to reuse across days.</p>
            )}
            {templates.map((t) => (
              <div className="template-row" key={t.id}>
                <div className="template-row-main">
                  <span className="template-row-name">{t.name}</span>
                  <span className="template-row-meta">
                    {t.items.length} item{t.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="template-row-actions">
                  <button
                    className="text-btn"
                    onClick={() => setAssigning({ id: t.id, name: t.name })}
                  >
                    assign
                  </button>
                  <button
                    className="icon-btn subtle"
                    onClick={() => deleteTemplate(t.id)}
                    aria-label="Delete template"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button className="add-exercise-btn" onClick={() => setCreatingTemplate(true)}>
              + new template
            </button>
          </div>
        )}
      </div>

      <div className="plan-day-section">
        <label className="field-label">plan a day</label>
        <input
          className="text-field"
          type="date"
          value={pickedDate}
          onChange={(e) => setPickedDate(e.target.value)}
        />

        {pickedItems.length > 0 && (
          <div className="exercise-list">
            {pickedItems.map((item) => (
              <div className="food-card planned-card" key={item.id}>
                <div className="food-card-main">
                  <span className="food-card-label">{item.label}</span>
                  <span className="food-card-macros">
                    {summarize(item.calories.value, item.calories.confidence)} kcal ·{" "}
                    {summarize(item.protein.value, item.protein.confidence)}g protein
                  </span>
                </div>
                <button
                  className="icon-btn subtle"
                  onClick={() => removePlannedItem(pickedDate, item.id)}
                  aria-label="Remove planned item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="add-exercise-btn" onClick={() => setAddingItem(true)}>
          + add item to this day
        </button>
      </div>

      {upcoming.length > 0 && (
        <div className="upcoming-plan-list">
          <div className="field-label">upcoming</div>
          {upcoming.map((day) => {
            const calories = day.items.reduce((sum, i) => sum + i.calories.value, 0);
            return (
              <div className="upcoming-plan-row" key={day.date}>
                <span className="upcoming-plan-date">{formatDateShort(day.date)}</span>
                <span className="upcoming-plan-meta">
                  {day.items.length} item{day.items.length === 1 ? "" : "s"} · {calories} kcal
                </span>
              </div>
            );
          })}
        </div>
      )}

      {creatingTemplate && <TemplateSheet onClose={() => setCreatingTemplate(false)} />}
      {assigning && (
        <AssignTemplateSheet
          templateId={assigning.id}
          templateName={assigning.name}
          onClose={() => setAssigning(null)}
        />
      )}
      {addingItem && (
        <PlannedItemSheet date={pickedDate} onClose={() => setAddingItem(false)} />
      )}
    </div>
  );
}
