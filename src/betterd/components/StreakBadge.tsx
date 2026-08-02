import type { StreakState } from "../types";
import { FlameIcon } from "../../nutrition/components/Icons";

export function StreakBadge({ streak }: { streak: StreakState }) {
  return (
    <div className={`streak-badge ${streak.current > 0 ? "active" : ""}`}>
      <FlameIcon className="streak-flame" />
      <span>{streak.current}</span>
    </div>
  );
}
