export interface ExerciseTemplate {
  id: string;
  name: string;
}

// Keyed by JS Date.getDay(): 0 = Sunday ... 6 = Saturday
export type Schedule = Record<number, ExerciseTemplate[]>;

export interface Mesocycle {
  id: string;
  name: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd, startDate + 3 months
  schedule: Schedule;
}

export interface SetEntry {
  reps: string;
  weight: string;
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
