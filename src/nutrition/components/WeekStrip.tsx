import { weekDates, todayISO, WEEKDAY_SHORT, weekdayIndex, parseISODate } from "../../utils/date";

export function WeekStrip({
  weekStartISO,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}: {
  weekStartISO: string;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}) {
  const dates = weekDates(weekStartISO);
  const today = todayISO();

  return (
    <div className="week-strip">
      <button className="week-nav-btn" onClick={onPrevWeek} aria-label="Previous week">
        ‹
      </button>
      <div className="week-strip-days">
        {dates.map((date) => {
          const dayNum = parseISODate(date).getDate();
          const wd = weekdayIndex(date);
          return (
            <button
              key={date}
              className={`week-day-btn ${date === selectedDate ? "active" : ""} ${
                date === today ? "is-today" : ""
              }`}
              onClick={() => onSelectDate(date)}
            >
              <span className="week-day-label">{WEEKDAY_SHORT[wd]}</span>
              <span className="week-day-num">{dayNum}</span>
            </button>
          );
        })}
      </div>
      <button className="week-nav-btn" onClick={onNextWeek} aria-label="Next week">
        ›
      </button>
    </div>
  );
}
