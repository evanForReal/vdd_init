import type { AppState } from "./types";

const STORAGE_KEY = "lift-log-state-v1";

const DEFAULT_STATE: AppState = {
  mesocycles: [],
  activeMesocycleId: null,
  logs: {},
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as AppState;
    return {
      mesocycles: parsed.mesocycles ?? [],
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
