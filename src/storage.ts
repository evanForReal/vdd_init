import type { AppState, Mesocycle } from "./types";

const STORAGE_KEY = "lift-log-state-v1";

const DEFAULT_STATE: AppState = {
  mesocycles: [],
  activeMesocycleId: null,
  logs: {},
};

// Normalizes mesocycles saved under the old weekday-keyed schedule shape
// (or missing fields from earlier versions) to the current cycle-day shape.
function normalizeMesocycle(m: Partial<Mesocycle>): Mesocycle {
  const schedule = (m.schedule ?? {}) as Record<string, unknown>;
  return {
    id: m.id ?? "",
    name: m.name ?? "My Mesocycle",
    startDate: m.startDate ?? "",
    endDate: m.endDate ?? "",
    insertedRestDates: Array.isArray(m.insertedRestDates)
      ? m.insertedRestDates
      : [],
    schedule: {
      u1: Array.isArray(schedule.u1) ? schedule.u1 : [],
      l1: Array.isArray(schedule.l1) ? schedule.l1 : [],
      u2: Array.isArray(schedule.u2) ? schedule.u2 : [],
      l2: Array.isArray(schedule.l2) ? schedule.l2 : [],
    } as Mesocycle["schedule"],
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as AppState;
    return {
      mesocycles: (parsed.mesocycles ?? []).map(normalizeMesocycle),
      activeMesocycleId: parsed.activeMesocycleId ?? null,
      logs: parsed.logs ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
