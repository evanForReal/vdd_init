import { useState } from "react";
import { useNutrition } from "../context/NutritionContext";
import { ConfirmDialog } from "./ConfirmDialog";
import { CommentSheet } from "./CommentSheet";
import { ChevronIcon, CommentIcon, FlameIcon, SunIcon } from "./Icons";

export function ActionFoldout({ date }: { date: string }) {
  const { pressCalorieBoost, boostCountLast7Days, markFreeDay } = useNutrition();
  const [open, setOpen] = useState(false);
  const [confirmingFreeDay, setConfirmingFreeDay] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);

  const boostCount = boostCountLast7Days(date);

  return (
    <div className="action-foldout">
      <button
        className="action-foldout-toggle"
        onClick={() => setOpen((o) => !o)}
      >
        <span>actions</span>
        <ChevronIcon className={`foldout-chevron ${open ? "open" : ""}`} />
      </button>

      {open && (
        <div className="action-foldout-panel">
          <button
            className="action-btn"
            onClick={() => pressCalorieBoost(date, 500)}
          >
            <FlameIcon className="action-btn-icon" />
            <span className="action-btn-label">+500 kcal to target</span>
            <span className="action-btn-badge">{boostCount}×/7d</span>
          </button>

          <button
            className="action-btn"
            onClick={() => setConfirmingFreeDay(true)}
          >
            <SunIcon className="action-btn-icon" />
            <span className="action-btn-label">free day</span>
          </button>

          <button className="action-btn" onClick={() => setCommentOpen(true)}>
            <CommentIcon className="action-btn-icon" />
            <span className="action-btn-label">note</span>
          </button>
        </div>
      )}

      {confirmingFreeDay && (
        <ConfirmDialog
          message="be free? (generally a good idea!)"
          confirmLabel="Be Free"
          onConfirm={() => {
            markFreeDay(date);
            setConfirmingFreeDay(false);
            setOpen(false);
          }}
          onCancel={() => setConfirmingFreeDay(false)}
        />
      )}

      {commentOpen && (
        <CommentSheet date={date} onClose={() => setCommentOpen(false)} />
      )}
    </div>
  );
}
