export interface ExerciseTemplate {
  id: string;
  name: string;
}

// Upper/lower/rest rotating cycle: u1, l1, rest, u2, l2, rest (repeats every 6 days).
// Rest days carry no exercises so they're not represented as schedule keys.
export type CycleDay = "u1" | "l1" | "u2" | "l2";
export const CYCLE_PATTERN: readonly (CycleDay | "rest")[] = [
  "u1",
  "l1",
  "rest",
  "u2",
  "l2",
  "rest",
];

export type Schedule = Record<CycleDay, ExerciseTemplate[]>;

export interface Mesocycle {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd, startDate + 3 months
  schedule: Schedule;
  /** Dates where the user manually inserted an extra rest day, shifting the cycle for every later date. */
  insertedRestDates: string[];
}

export interface SetEntry {
  reps: string;
  weight: string;
  rir: string;
  completed: boolean;
}

export interface SessionLog {
  id: string; // `${date}_${exerciseId}`
  date: string; // ISO date this was logged
  exerciseId: string;
  exerciseName: string;
  sets: SetEntry[];
  comment: string;
}

export interface AppState {
  mesocycles: Mesocycle[];
  activeMesocycleId: string | null;
  logs: Record<string, SessionLog>;
}
