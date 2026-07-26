import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { ChevronIcon } from "./Icons";
import { FoodEntrySheet } from "./FoodEntrySheet";
import { summarize } from "../format";
import type { AssignedTemplate } from "../types";

export function TemplateBlockCard({
  block,
  date,
  dayTarget,
}: {
  block: AssignedTemplate;
  date: string;
  dayTarget: number;
}) {
  const { entriesForTemplateBullet, templateBlockConsumedCalories, removeFoodEntry, removeAssignedTemplate } =
    useNutrition();
  const [open, setOpen] = useState(false);
  const [addingFor, setAddingFor] = useState<number | null>(null);

  const consumed = templateBlockConsumedCalories(block.id);

  return (
    <div className="action-foldout template-block">
      <button className="action-foldout-toggle" onClick={() => setOpen((o) => !o)}>
        <span>{block.templateName}</span>
        <span className="template-block-tally">
          {consumed} / {dayTarget}
        </span>
        <ChevronIcon className={`foldout-chevron ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="action-foldout-panel">
          {block.items.map((bullet, i) => {
            const entries = entriesForTemplateBullet(date, block.id, i);
            return (
              <div className="template-bullet" key={i}>
                <div className="template-bullet-header">
                  <span className="template-bullet-label">{bullet}</span>
                  <button
                    className="add-exercise-btn inline-add-btn"
                    onClick={() => setAddingFor(i)}
                  >
                    + add food
                  </button>
                </div>

                {entries.length > 0 && (
                  <div className="exercise-list template-bullet-entries">
                    {entries.map((e) => (
                      <div className="food-card" key={e.id}>
                        <div className="food-card-main">
                          <span className="food-card-label">{e.label}</span>
                          <span className="food-card-macros">
                            {summarize(e.calories.value, e.calories.confidence)} kcal ·{" "}
                            {summarize(e.protein.value, e.protein.confidence)}g protein
                          </span>
                        </div>
                        <button
                          className="icon-btn subtle"
                          onClick={() => removeFoodEntry(e.id)}
                          aria-label="Remove entry"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            className="text-btn template-block-remove"
            onClick={() => removeAssignedTemplate(block.id)}
          >
            remove from day
          </button>
        </div>
      )}

      {addingFor !== null && (
        <FoodEntrySheet
          date={date}
          title={block.items[addingFor]}
          templateBlockId={block.id}
          bulletIndex={addingFor}
          onClose={() => setAddingFor(null)}
        />
      )}
    </div>
  );
}
