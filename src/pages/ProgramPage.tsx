import { useState } from "react";
import { useApp } from "../context/AppContext";
import { ORDERED_WEEKDAYS, WEEKDAY_LABELS, WEEKDAY_SHORT, todayISO, weekdayIndex, formatDateShort } from "../utils/date";
import { ArtworkPanel } from "../components/ArtworkPanel";

const SPARSE_DAY_THRESHOLD = 2;

export function ProgramPage() {
  const {
    activeMesocycle,
    createMesocycle,
    addExercise,
    removeExercise,
    renameExercise,
  } = useApp();

  const [selectedWeekday, setSelectedWeekday] = useState(
    weekdayIndex(todayISO())
  );
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const [mesoName, setMesoName] = useState("My Mesocycle");
  const [startDate, setStartDate] = useState(todayISO());
  const [creatingNew, setCreatingNew] = useState(false);

  if (!activeMesocycle || creatingNew) {
    return (
      <div className="page">
        <header className="program-header">
          <h1>new mesocycle</h1>
        </header>
        <ArtworkPanel seed={`new-meso-${startDate}`} variant="hero" minHeight="260px" />
        <div className="form">
          <label className="field-label">name</label>
          <input
            className="text-field"
            value={mesoName}
            onChange={(e) => setMesoName(e.target.value)}
          />
          <label className="field-label">start date</label>
          <input
            className="text-field"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <p className="hint">runs 3 months</p>
          <button
            className="primary-btn"
            onClick={() => {
              createMesocycle(mesoName.trim() || "My Mesocycle", startDate);
              setCreatingNew(false);
            }}
          >
            create
          </button>
          {activeMesocycle && (
            <button className="text-btn" onClick={() => setCreatingNew(false)}>
              cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  const exercises = activeMesocycle.schedule[selectedWeekday] ?? [];

  function submitAdd() {
    const trimmed = newName.trim();
    if (trimmed) addExercise(selectedWeekday, trimmed);
    setNewName("");
    setAdding(false);
  }

  function submitRename(exerciseId: string) {
    const trimmed = editingName.trim();
    if (trimmed) renameExercise(selectedWeekday, exerciseId, trimmed);
    setEditingId(null);
  }

  return (
    <div className="page">
      <header className="program-header">
        <h1>{activeMesocycle.name}</h1>
        <div className="meso-dates">
          {formatDateShort(activeMesocycle.startDate)} –{" "}
          {formatDateShort(activeMesocycle.endDate)}
        </div>
        <button
          className="text-btn"
          onClick={() => {
            if (
              confirm(
                "start a new mesocycle? clears the weekly schedule (past logs stay saved)."
              )
            ) {
              setCreatingNew(true);
            }
          }}
        >
          new mesocycle
        </button>
      </header>

      <div className="weekday-tabs">
        {ORDERED_WEEKDAYS.map((wd) => (
          <button
            key={wd}
            className={`weekday-tab ${wd === selectedWeekday ? "active" : ""}`}
            onClick={() => setSelectedWeekday(wd)}
          >
            {WEEKDAY_SHORT[wd]}
          </button>
        ))}
      </div>

      <div className="day-label">{WEEKDAY_LABELS[selectedWeekday]}</div>

      <div className="program-exercise-list">
        {exercises.map((ex) => (
          <div className="program-exercise-row" key={ex.id}>
            {editingId === ex.id ? (
              <input
                className="text-field inline"
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => submitRename(ex.id)}
                onKeyDown={(e) => e.key === "Enter" && submitRename(ex.id)}
              />
            ) : (
              <span
                className="program-exercise-name"
                onClick={() => {
                  setEditingId(ex.id);
                  setEditingName(ex.name);
                }}
              >
                {ex.name}
              </span>
            )}
            <button
              className="icon-btn subtle"
              onClick={() => removeExercise(selectedWeekday, ex.id)}
              aria-label="Remove exercise"
            >
              ✕
            </button>
          </div>
        ))}

        {adding ? (
          <div className="program-exercise-row">
            <input
              className="text-field inline"
              autoFocus
              placeholder="exercise name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={submitAdd}
              onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            />
          </div>
        ) : (
          <button className="add-exercise-btn" onClick={() => setAdding(true)}>
            + add exercise
          </button>
        )}

        {exercises.length <= SPARSE_DAY_THRESHOLD && (
          <ArtworkPanel seed={`program-day-${selectedWeekday}`} />
        )}
      </div>
    </div>
  );
}
