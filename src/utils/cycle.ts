import type { Mesocycle } from "../types";
import { CYCLE_PATTERN } from "../types";
import { daysBetween } from "./date";

export function getCycleDay(
  mesocycle: Pick<Mesocycle, "startDate" | "insertedRestDates" | "skippedRestDates">,
  date: string
): (typeof CYCLE_PATTERN)[number] {
  if (mesocycle.insertedRestDates.includes(date)) return "rest";

  // Every inserted rest day before this date pushes everything after it one
  // day later (+1); every skipped natural rest before this date pulls
  // everything after it one day earlier (-1) — the exact inverse. Net shift
  // only counts entries strictly before `date`, matching how each one's own
  // day is handled separately below.
  const insertedBefore = mesocycle.insertedRestDates.filter((d) => d < date).length;
  const skippedBefore = mesocycle.skippedRestDates.filter((d) => d < date).length;
  const netShift = insertedBefore - skippedBefore;

  // A date that's itself a skipped natural rest needs one *more* pull than
  // netShift already gives it (the pull that applies to dates strictly
  // after it applies to itself too) — that's what turns its own naturally-
  // "rest" slot into whatever the next pattern slot would have shown.
  const localShift = mesocycle.skippedRestDates.includes(date) ? netShift - 1 : netShift;

  const base = daysBetween(mesocycle.startDate, date);
  const idx = (((base - localShift) % 6) + 6) % 6;
  return CYCLE_PATTERN[idx];
}

export const CYCLE_DAY_LABELS: Record<(typeof CYCLE_PATTERN)[number], string> = {
  u1: "upper 1",
  l1: "lower 1",
  u2: "upper 2",
  l2: "lower 2",
  rest: "rest",
};
