import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { ExerciseTemplate } from "../types";
import { ExerciseDetailSheet } from "../components/ExerciseDetailSheet";
import {
  daysBetween,
  formatDateLong,
  todayISO,
  weekdayIndex,
} from "../utils/date";

export function TodayPage() {
  const { activeMesocycle, getLogFor } = useApp();
  const [openExercise, setOpenExercise] = useState<ExerciseTemplate | null>(
    null
  );

  const date = todayISO();
  const weekday = weekdayIndex(date);

  if (!activeMesocycle) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>No active mesocycle</h2>
          <p>Head to the Program tab to set one up and build your weekly schedule.</p>
        </div>
      </div>
    );
  }

  const exercises = activeMesocycle.schedule[weekday] ?? [];
  const daysLeft = daysBetween(date, activeMesocycle.endDate);

  return (
    <div className="page">
      <header className="today-header">
        <div className="today-date">{formatDateLong(date)}</div>
        <div className="meso-name">{activeMesocycle.name}</div>
      </header>

      {daysLeft <= 7 && daysLeft >= 0 && (
        <div className="banner">
          {daysLeft === 0
            ? "This mesocycle ends today. Set up your next one in Program."
            : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in this mesocycle.`}
        </div>
      )}
      {daysLeft < 0 && (
        <div className="banner warning">
          This mesocycle ended {Math.abs(daysLeft)} day
          {Math.abs(daysLeft) === 1 ? "" : "s"} ago. Start a new one in Program.
        </div>
      )}

      {exercises.length === 0 ? (
        <div className="empty-state">
          <p>No exercises scheduled for today.</p>
        </div>
      ) : (
        <div className="exercise-list">
          {exercises.map((ex) => {
            const log = getLogFor(date, ex.id);
            const doneCount = log?.sets.filter((s) => s.completed).length ?? 0;
            const totalCount = log?.sets.length ?? 0;
            const hasData = log?.sets.some(
              (s) => s.reps || s.weight || s.completed
            );
            return (
              <button
                key={ex.id}
                className="exercise-card"
                onClick={() => setOpenExercise(ex)}
              >
                <span className="exercise-name">{ex.name}</span>
                {hasData && (
                  <span className="exercise-progress">
                    {doneCount}/{totalCount} sets
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {openExercise && (
        <ExerciseDetailSheet
          exercise={openExercise}
          date={date}
          weekday={weekday}
          onClose={() => setOpenExercise(null)}
        />
      )}
    </div>
  );
}
