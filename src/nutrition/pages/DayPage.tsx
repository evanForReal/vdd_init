import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { WeekStrip } from "../components/WeekStrip";
import { ActionFoldout } from "../components/ActionFoldout";
import { FoodEntrySheet } from "../components/FoodEntrySheet";
import { PlusIcon } from "../components/Icons";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { formatDateLong, todayISO, weekStart, addDays } from "../../utils/date";

const SPARSE_THRESHOLD = 1;

function summarize(value: number, confidence?: number): string {
  return confidence ? `${value} ±${confidence}` : `${value}`;
}

export function DayPage() {
  const {
    entriesForDate,
    removeFoodEntry,
    commentsForDate,
    isFreeDay,
    extraCaloriesForDate,
    state,
  } = useNutrition();

  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(weekStart(today));
  const [addingFood, setAddingFood] = useState(false);

  const entries = entriesForDate(selectedDate);
  const comments = commentsForDate(selectedDate);
  const freeDay = isFreeDay(selectedDate);

  const totalCalories = entries.reduce((sum, e) => sum + e.calories.value, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein.value, 0);
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
        <div className="banner free-day-banner">Free day — nothing tracked.</div>
      ) : (
        <div className="nutrition-summary">
          <div className="nutrition-summary-stat">
            <span className="nutrition-summary-value">
              {totalCalories} / {calorieTarget}
            </span>
            <span className="nutrition-summary-label">Calories</span>
          </div>
          <div className="nutrition-summary-stat">
            <span className="nutrition-summary-value">
              {totalProtein} / {state.targets.proteinGrams}g
            </span>
            <span className="nutrition-summary-label">Protein</span>
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

      {entries.length === 0 ? (
        <>
          {!freeDay && (
            <div className="empty-state">
              <p>No food logged yet today.</p>
            </div>
          )}
          <ArtworkPanel seed={`nutrition-${selectedDate}`} />
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
            <ArtworkPanel seed={`nutrition-sparse-${selectedDate}`} />
          )}
        </div>
      )}

      <button
        className="fab"
        onClick={() => setAddingFood(true)}
        aria-label="Add food"
      >
        <PlusIcon className="fab-icon" />
      </button>

      {addingFood && (
        <FoodEntrySheet date={selectedDate} onClose={() => setAddingFood(false)} />
      )}
    </div>
  );
}
