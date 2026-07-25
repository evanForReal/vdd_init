import type { Mesocycle } from "../types";
import { CYCLE_PATTERN } from "../types";
import { daysBetween } from "./date";

export function getCycleDay(
  mesocycle: Pick<Mesocycle, "startDate" | "insertedRestDates">,
  date: string
): (typeof CYCLE_PATTERN)[number] {
  if (mesocycle.insertedRestDates.includes(date)) return "rest";
  const shiftCount = mesocycle.insertedRestDates.filter((d) => d < date).length;
  const base = daysBetween(mesocycle.startDate, date);
  const idx = (((base + shiftCount) % 6) + 6) % 6;
  return CYCLE_PATTERN[idx];
}

export const CYCLE_DAY_LABELS: Record<(typeof CYCLE_PATTERN)[number], string> = {
  u1: "upper 1",
  l1: "lower 1",
  u2: "upper 2",
  l2: "lower 2",
  rest: "rest",
};
