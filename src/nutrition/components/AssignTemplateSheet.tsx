import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { addDays, ORDERED_WEEKDAYS, todayISO, WEEKDAY_SHORT } from "../../utils/date";

export function AssignTemplateSheet({
  templateId,
  templateName,
  onClose,
}: {
  templateId: string;
  templateName: string;
  onClose: () => void;
}) {
  const { assignTemplateToDate, assignTemplateToRange } = useNutrition();
  const tomorrow = addDays(todayISO(), 1);
  const [mode, setMode] = useState<"single" | "range">("single");
  const [singleDate, setSingleDate] = useState(tomorrow);
  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(addDays(tomorrow, 6));
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set(ORDERED_WEEKDAYS));

  function toggleWeekday(day: number) {
    setWeekdays((set) => {
      const next = new Set(set);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function submit() {
    if (mode === "single") {
      assignTemplateToDate(templateId, singleDate);
    } else {
      assignTemplateToRange(templateId, startDate, endDate, Array.from(weekdays));
    }
    onClose();
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h2 className="sheet-title">assign "{templateName}"</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="form">
          <div className="mode-toggle">
            <button
              className={`mode-toggle-btn ${mode === "single" ? "active" : ""}`}
              onClick={() => setMode("single")}
            >
              single day
            </button>
            <button
              className={`mode-toggle-btn ${mode === "range" ? "active" : ""}`}
              onClick={() => setMode("range")}
            >
              range
            </button>
          </div>

          {mode === "single" ? (
            <>
              <label className="field-label">date</label>
              <input
                className="text-field"
                type="date"
                value={singleDate}
                onChange={(e) => setSingleDate(e.target.value)}
              />
            </>
          ) : (
            <>
              <label className="field-label">from</label>
              <input
                className="text-field"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <label className="field-label">to</label>
              <input
                className="text-field"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <label className="field-label">on these days</label>
              <div className="weekday-chip-row">
                {ORDERED_WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    className={`weekday-chip ${weekdays.has(day) ? "active" : ""}`}
                    onClick={() => toggleWeekday(day)}
                  >
                    {WEEKDAY_SHORT[day]}
                  </button>
                ))}
              </div>
            </>
          )}

          <button className="primary-btn" onClick={submit}>
            assign
          </button>
        </div>
      </div>
    </div>
  );
}
