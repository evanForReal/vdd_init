import { useTodo } from "../context/TodoContext";
import { TaskRow } from "./TaskRow";
import { AddTaskRow } from "./AddTaskRow";
import { formatDateLong } from "../../utils/date";

// A live, editable peek at the day just across a week boundary — Saturday
// can see+edit next week's Sunday, and Sunday can see+edit last week's
// Saturday, without navigating away from the current week.
export function GhostCell({ date }: { date: string }) {
  const { itemsForDate, addDayItem, toggleItem, removeItem } = useTodo();
  const items = itemsForDate(date);

  return (
    <div className="ghost-cell">
      <div className="ghost-cell-header">peek — {formatDateLong(date)}</div>
      {items.length > 0 && (
        <div className="task-list">
          {items.map((item) => (
            <TaskRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </div>
      )}
      <AddTaskRow
        onAdd={(label, opts) => addDayItem(date, label, opts)}
        placeholder="add to that day"
        allowOptions={false}
      />
    </div>
  );
}
