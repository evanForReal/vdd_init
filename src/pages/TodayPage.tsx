import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { ExerciseTemplate } from "../types";
import { ExerciseDetailSheet } from "../components/ExerciseDetailSheet";
import { ArtworkPanel } from "../components/ArtworkPanel";
import {
  daysBetween,
  formatDateLong,
  todayISO,
  weekdayIndex,
} from "../utils/date";

const SPARSE_DAY_THRESHOLD = 2;

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
          <h2>no mesocycle</h2>
          <p>set one up in program.</p>
        </div>
        <ArtworkPanel seed={`today-empty-${date}`} />
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
            ? "mesocycle ends today — start a new one in program"
            : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
        </div>
      )}
      {daysLeft < 0 && (
        <div className="banner warning">
          mesocycle ended {Math.abs(daysLeft)}d ago — start a new one
        </div>
      )}

      {exercises.length === 0 ? (
        <>
          <div className="empty-state">
            <p>nothing scheduled today</p>
          </div>
          <ArtworkPanel seed={`today-rest-${date}`} />
        </>
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
          {exercises.length <= SPARSE_DAY_THRESHOLD && (
            <ArtworkPanel seed={`today-sparse-${date}`} />
          )}
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
