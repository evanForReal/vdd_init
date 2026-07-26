import { useEffect, useState } from "react";
import type { CycleDay, ExerciseTemplate, SetEntry } from "../types";
import { useApp } from "../context/AppContext";
import { Sheet } from "./Sheet";

function emptySet(): SetEntry {
  return { reps: "", weight: "", rir: "", completed: false };
}

function summarizeLast(sets: SetEntry[]): string {
  const reps = sets.map((s) => s.reps || "-").join(", ");
  const weights = Array.from(new Set(sets.map((s) => s.weight || "-")));
  const weightStr =
    weights.length === 1
      ? weights[0]
      : sets.map((s) => s.weight || "-").join(", ");
  return `${reps} @ ${weightStr} lb`;
}

export function ExerciseDetailSheet({
  exercise,
  date,
  cycleDay,
  onClose,
}: {
  exercise: ExerciseTemplate;
  date: string;
  cycleDay: CycleDay;
  onClose: () => void;
}) {
  const { getLogFor, getLastLogBefore, saveLog, removeExercise, renameExercise } =
    useApp();

  const existing = getLogFor(date, exercise.id);
  const lastLog = getLastLogBefore(date, exercise.id);

  const [sets, setSets] = useState<SetEntry[]>(() => {
    if (existing) return existing.sets.map((s) => ({ ...s, rir: s.rir ?? "" }));
    const count = lastLog?.sets.length ?? 2;
    return Array.from({ length: count }, emptySet);
  });
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [nameDraft, setNameDraft] = useState(exercise.name);
  const [editingName, setEditingName] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    saveLog(date, { ...exercise, name: nameDraft || exercise.name }, sets, comment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets, comment, dirty]);

  function updateSet(idx: number, patch: Partial<SetEntry>) {
    setDirty(true);
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  }

  function addSet() {
    setDirty(true);
    setSets((prev) => [...prev, emptySet()]);
  }

  function removeSet() {
    setDirty(true);
    setSets((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function commitName() {
    setEditingName(false);
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== exercise.name) {
      renameExercise(cycleDay, exercise.id, trimmed);
    } else {
      setNameDraft(exercise.name);
    }
  }

  return (
    <Sheet onClose={onClose}>
      <div className="sheet-header">
        {editingName ? (
          <input
            className="sheet-title-input"
            value={nameDraft}
            autoFocus
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => e.key === "Enter" && commitName()}
          />
        ) : (
          <h2 className="sheet-title" onClick={() => setEditingName(true)}>
            {exercise.name}
          </h2>
        )}
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

        {lastLog && (
          <div className="last-session">
            <div className="last-session-label">last</div>
            <div className="last-session-value">
              {summarizeLast(lastLog.sets)}
            </div>
            {lastLog.comment && (
              <div className="last-session-comment">
                &ldquo;{lastLog.comment}&rdquo;
              </div>
            )}
          </div>
        )}

        <div className="sets-grid">
          <div className="sets-grid-header">
            <span>set</span>
            <span>reps</span>
            <span>lb</span>
            <span>rir</span>
            <span></span>
          </div>
          {sets.map((set, idx) => (
            <div className="sets-grid-row" key={idx}>
              <span className="set-num">{idx + 1}</span>
              <input
                className="set-input"
                inputMode="numeric"
                placeholder="0"
                value={set.reps}
                onChange={(e) => updateSet(idx, { reps: e.target.value })}
              />
              <input
                className="set-input"
                inputMode="decimal"
                placeholder="0"
                value={set.weight}
                onChange={(e) => updateSet(idx, { weight: e.target.value })}
              />
              <input
                className="set-input"
                inputMode="numeric"
                placeholder="-"
                value={set.rir}
                onChange={(e) => updateSet(idx, { rir: e.target.value })}
              />
              <button
                className={`check-toggle ${set.completed ? "checked" : ""}`}
                onClick={() => updateSet(idx, { completed: !set.completed })}
                aria-label="Mark set complete"
              >
                {set.completed ? "✓" : ""}
              </button>
            </div>
          ))}
        </div>

        <div className="set-controls">
          <button className="round-btn" onClick={removeSet} aria-label="Remove set">
            −
          </button>
          <span>set</span>
          <button className="round-btn accent" onClick={addSet} aria-label="Add set">
            +
          </button>
        </div>

        <input
          className="comment-input"
          placeholder="note"
          value={comment}
          onChange={(e) => {
            setDirty(true);
            setComment(e.target.value);
          }}
        />

        <button
          className="remove-exercise-btn"
          onClick={() => {
            if (confirm(`remove ${exercise.name}?`)) {
              removeExercise(cycleDay, exercise.id);
              onClose();
            }
          }}
        >
          remove
        </button>
    </Sheet>
  );
}
