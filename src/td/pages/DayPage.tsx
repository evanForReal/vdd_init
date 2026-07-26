import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import { WeekStrip } from "../components/WeekStrip";
import { TaskRow } from "../components/TaskRow";
import { AddTaskRow } from "../components/AddTaskRow";
import { GhostCell } from "../components/GhostCell";
import { SprintSheet } from "../components/SprintSheet";
import { SprintBanner } from "../components/SprintBanner";
import { WeekListFoldout } from "../components/WeekListFoldout";
import { FocusSection } from "../components/FocusSection";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { formatDateLong, todayISO, weekdayIndex, addDays } from "../../utils/date";
import { weekStartSunday } from "../utils";

export function DayPage() {
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(weekStartSunday(today));
  const [sprintOpen, setSprintOpen] = useState(false);
  const [daySeed] = useState(() => `td-day-${Math.random().toString(36).slice(2)}`);

  const {
    itemsForDate,
    addDayItem,
    toggleItem,
    removeItem,
    scopeBlocksForDate,
    activeSprint,
  } = useTodo();

  const items = itemsForDate(selectedDate);
  const scheduled = items.filter((i) => i.time).sort((a, b) => (a.time! < b.time! ? -1 : 1));
  const unscheduled = items.filter((i) => !i.time);
  const groups = new Map<string, typeof unscheduled>();
  const ungrouped: typeof unscheduled = [];
  for (const item of unscheduled) {
    if (item.group) {
      if (!groups.has(item.group)) groups.set(item.group, []);
      groups.get(item.group)!.push(item);
    } else {
      ungrouped.push(item);
    }
  }

  const activeScopes = scopeBlocksForDate(selectedDate);
  const wd = weekdayIndex(selectedDate);
  const ghostDate = wd === 6 ? addDays(selectedDate, 1) : wd === 0 ? addDays(selectedDate, -1) : null;

  function selectDate(date: string) {
    setSelectedDate(date);
    setWeekAnchor(weekStartSunday(date));
  }

  return (
    <div className="page">
      <header className="today-header">
        <div className="today-date">{formatDateLong(selectedDate)}</div>
        <div className="meso-name">to-do</div>
      </header>

      <WeekStrip
        weekStartISO={weekAnchor}
        selectedDate={selectedDate}
        onSelectDate={selectDate}
        onPrevWeek={() => setWeekAnchor((w) => addDays(w, -7))}
        onNextWeek={() => setWeekAnchor((w) => addDays(w, 7))}
      />

      <WeekListFoldout
        weekStart={weekAnchor}
        kind="goal"
        title="week goals"
        placeholder="a goal for this week"
      />
      <WeekListFoldout
        weekStart={weekAnchor}
        kind="joy"
        title="small joys"
        placeholder="a small joy for this week"
      />

      {activeSprint && activeSprint.date === selectedDate && <SprintBanner sprint={activeSprint} />}

      <button className="text-btn rest-day-btn" onClick={() => setSprintOpen(true)}>
        start a sprint
      </button>

      {activeScopes.length > 0 && (
        <div className="scope-banner">
          {activeScopes.map((b) => (
            <div className="scope-banner-row" key={b.id}>
              <span className="scope-banner-label">{b.label}</span>
              <span className="scope-banner-range">
                {formatDateLong(b.startDate)} – {formatDateLong(b.endDate)}
              </span>
            </div>
          ))}
        </div>
      )}

      <FocusSection date={selectedDate} />

      {ghostDate && <GhostCell date={ghostDate} />}

      {scheduled.length > 0 && (
        <div className="td-section">
          <div className="field-label">schedule</div>
          <div className="task-list">
            {scheduled.map((item) => (
              <TaskRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}

      {[...groups.entries()].map(([group, groupItems]) => (
        <div className="td-section" key={group}>
          <div className="field-label">{group}</div>
          <div className="task-list">
            {groupItems.map((item) => (
              <TaskRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="td-section">
        <div className="field-label">tasks</div>
        {ungrouped.length > 0 ? (
          <div className="task-list">
            {ungrouped.map((item) => (
              <TaskRow
                key={item.id}
                item={item}
                onToggle={() => toggleItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        ) : (
          items.length === 0 && (
            <div className="empty-state">
              <p>nothing on the books yet</p>
            </div>
          )
        )}
        <AddTaskRow onAdd={(label, opts) => addDayItem(selectedDate, label, opts)} />
      </div>

      <ArtworkPanel seed={daySeed} />

      {sprintOpen && <SprintSheet date={selectedDate} onClose={() => setSprintOpen(false)} />}
    </div>
  );
}
