import { addDays, weekdayIndex } from "../utils/date";

// td's weekly document runs Sunday -> Saturday (matching the user's prior
// notebook habit), unlike nutrition's Monday-start week strip — kept
// separate rather than generalizing the shared util for one call site.
export function weekStartSunday(iso: string): string {
  return addDays(iso, -weekdayIndex(iso));
}

export function weekDatesSunday(sundayISO: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(sundayISO, i));
}
