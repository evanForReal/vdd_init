import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { WeekStrip } from "../components/WeekStrip";
import { ActionFoldout } from "../components/ActionFoldout";
import { FoodEntrySheet } from "../components/FoodEntrySheet";
import { ChevronIcon } from "../components/Icons";
import { TemplateBlockCard } from "../components/TemplateBlockCard";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { formatDateLong, todayISO, weekStart, addDays } from "../../utils/date";
import { summarize } from "../format";

const SPARSE_THRESHOLD = 1;

function sumConfidence(values: (number | undefined)[]): number {
  return values.reduce((sum: number, v) => sum + (v ?? 0), 0);
}

export function DayPage() {
  const {
    entriesForDate,
    removeFoodEntry,
    commentsForDate,
    isFreeDay,
    extraCaloriesForDate,
    state,
    plannedItemsForDate,
    confirmPlannedItem,
    skipPlannedItem,
    assignedTemplatesForDate,
  } = useNutrition();

  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(weekStart(today));
  const [addingFood, setAddingFood] = useState(false);
  const [foodOpen, setFoodOpen] = useState(true);
  // Stable for the life of this page visit so the backdrop art doesn't
  // change every time you flip days or toggle a foldout — only a real
  // navigation away and back (a fresh mount) picks a new piece.
  const [daySeed] = useState(() => `nutrition-day-${Math.random().toString(36).slice(2)}`);

  const entries = entriesForDate(selectedDate);
  const comments = commentsForDate(selectedDate);
  const freeDay = isFreeDay(selectedDate);
  const planned = plannedItemsForDate(selectedDate);
  const templateBlocks = assignedTemplatesForDate(selectedDate);

  const totalCalories = entries.reduce((sum, e) => sum + e.calories.value, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein.value, 0);
  const caloriesConfidence = sumConfidence(entries.map((e) => e.calories.confidence));
  const proteinConfidence = sumConfidence(entries.map((e) => e.protein.confidence));
  const calorieTarget = state.targets.calories + extraCaloriesForDate(selectedDate);

  function selectDate(date: string) {
    setSelectedDate(date);
    setWeekAnchor(weekStart(date));
  }

  return (
    <div className="page">
      <header className="today-header">
        <div className="today-date">{formatDateLong(selectedDate)}</div>
        <div className="meso-name">Nutrition</div>
      </header>

      <WeekStrip
        weekStartISO={weekAnchor}
        selectedDate={selectedDate}
        onSelectDate={selectDate}
        onPrevWeek={() => setWeekAnchor((w) => addDays(w, -7))}
        onNextWeek={() => setWeekAnchor((w) => addDays(w, 7))}
      />

      <ActionFoldout date={selectedDate} />

      {freeDay ? (
        <div className="banner free-day-banner">free day</div>
      ) : (
        <div className="nutrition-summary">
          <div className="nutrition-summary-stat">
            <span className="nutrition-summary-value">
              {summarize(totalCalories, caloriesConfidence || undefined)}
            </span>
            <span className="nutrition-summary-target">/{calorieTarget}</span>
          </div>
          <div className="nutrition-summary-stat">
            <span className="nutrition-summary-value">
              {summarize(totalProtein, proteinConfidence || undefined)}
            </span>
            <span className="nutrition-summary-target">/{state.targets.proteinGrams}g</span>
          </div>
        </div>
      )}

      {comments.length > 0 && (
        <div className="comment-list">
          {comments.map((c) => (
            <div className="comment-card" key={c.id}>
              <div className="comment-card-title">{c.title}</div>
              {c.description && (
                <div className="comment-card-desc">{c.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {planned.length > 0 && (
        <div className="planned-section">
          <div className="field-label">planned</div>
          <div className="exercise-list">
            {planned.map((item) => (
              <div className="food-card planned-card" key={item.id}>
                <div className="food-card-main">
                  <span className="food-card-label">{item.label}</span>
                  <span className="food-card-macros">
                    {summarize(item.calories.value, item.calories.confidence)} kcal ·{" "}
                    {summarize(item.protein.value, item.protein.confidence)}g protein
                  </span>
                </div>
                <div className="planned-card-actions">
                  <button
                    className="icon-btn subtle"
                    onClick={() => skipPlannedItem(selectedDate, item.id)}
                    aria-label="Skip planned item"
                  >
                    ✕
                  </button>
                  <button
                    className="icon-btn subtle confirm"
                    onClick={() => confirmPlannedItem(selectedDate, item.id)}
                    aria-label="Log planned item as eaten"
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {templateBlocks.length > 0 && (
        <div className="template-block-list">
          {templateBlocks.map((block) => (
            <TemplateBlockCard
              key={block.id}
              block={block}
              date={selectedDate}
              dayTarget={calorieTarget}
            />
          ))}
        </div>
      )}

      <div className="action-foldout">
        <button
          className="action-foldout-toggle"
          onClick={() => setFoodOpen((o) => !o)}
        >
          <span>food</span>
          <ChevronIcon className={`foldout-chevron ${foodOpen ? "open" : ""}`} />
        </button>

        <button
          className="add-exercise-btn food-add-btn"
          onClick={() => setAddingFood(true)}
        >
          + add food
        </button>

        {foodOpen &&
          (entries.length === 0 ? (
            <>
              {!freeDay && (
                <div className="empty-state">
                  <p>nothing logged yet</p>
                </div>
              )}
              <ArtworkPanel seed={daySeed} />
            </>
          ) : (
            <div className="exercise-list">
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
              {entries.length <= SPARSE_THRESHOLD && (
                <ArtworkPanel seed={daySeed} />
              )}
            </div>
          ))}
      </div>

      {addingFood && (
        <FoodEntrySheet date={selectedDate} onClose={() => setAddingFood(false)} />
      )}
    </div>
  );
}
