import { useState } from "react";
import { useApp } from "../context/AppContext";
import type { ExerciseTemplate } from "../types";
import { ExerciseDetailSheet } from "../components/ExerciseDetailSheet";
import { ArtworkPanel } from "../components/ArtworkPanel";
import { daysBetween, formatDateLong, todayISO } from "../utils/date";
import { CYCLE_DAY_LABELS, getCycleDay } from "../utils/cycle";

const SPARSE_DAY_THRESHOLD = 2;

export function TodayPage() {
  const { activeMesocycle, getLogFor, insertRestDay } = useApp();
  const [openExercise, setOpenExercise] = useState<ExerciseTemplate | null>(
    null
  );

  const date = todayISO();

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

  const cycleDay = getCycleDay(activeMesocycle, date);
  const isRest = cycleDay === "rest";
  const exercises = isRest ? [] : activeMesocycle.schedule[cycleDay];
  const daysLeft = daysBetween(date, activeMesocycle.endDate);

  return (
    <div className="page">
      <header className="today-header">
        <div className="today-date">{formatDateLong(date)}</div>
        <div className="meso-name">
          {activeMesocycle.name} · {CYCLE_DAY_LABELS[cycleDay]}
        </div>
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

      {!isRest && (
        <button
          className="text-btn rest-day-btn"
          onClick={() => {
            if (confirm("insert a rest day today? pushes every future day out by one.")) {
              insertRestDay(date);
            }
          }}
        >
          insert rest day today
        </button>
      )}

      {isRest ? (
        <>
          <div className="empty-state">
            <p>rest day</p>
          </div>
          <ArtworkPanel seed={`today-rest-${date}`} />
        </>
      ) : exercises.length === 0 ? (
        <>
          <div className="empty-state">
            <p>nothing scheduled today</p>
          </div>
          <ArtworkPanel seed={`today-sparse-${date}`} />
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

      {openExercise && !isRest && (
        <ExerciseDetailSheet
          exercise={openExercise}
          date={date}
          cycleDay={cycleDay}
          onClose={() => setOpenExercise(null)}
        />
      )}
    </div>
  );
}
