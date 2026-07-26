import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  CycleDay,
  ExerciseTemplate,
  Mesocycle,
  SessionLog,
  SetEntry,
} from "../types";
import { loadState, saveState } from "../storage";
import { addMonths, parseISODate, todayISO } from "../utils/date";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface AppContextValue {
  state: AppState;
  activeMesocycle: Mesocycle | null;
  createMesocycle: (name: string, startDate: string) => void;
  addExercise: (cycleDay: CycleDay, name: string) => void;
  removeExercise: (cycleDay: CycleDay, exerciseId: string) => void;
  renameExercise: (cycleDay: CycleDay, exerciseId: string, name: string) => void;
  insertRestDay: (date: string) => void;
  startMesocycleToday: () => void;
  getLogFor: (date: string, exerciseId: string) => SessionLog | undefined;
  getLastLogBefore: (
    date: string,
    exerciseId: string
  ) => SessionLog | undefined;
  saveLog: (
    date: string,
    exercise: ExerciseTemplate,
    sets: SetEntry[],
    comment: string
  ) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activeMesocycle = useMemo(
    () =>
      state.mesocycles.find((m) => m.id === state.activeMesocycleId) ?? null,
    [state.mesocycles, state.activeMesocycleId]
  );

  function createMesocycle(name: string, startDate: string) {
    const meso: Mesocycle = {
      id: uid(),
      name,
      startDate,
      endDate: addMonths(startDate, 3),
      schedule: { u1: [], l1: [], u2: [], l2: [] },
      insertedRestDates: [],
    };
    setState((s) => ({
      ...s,
      mesocycles: [...s.mesocycles, meso],
      activeMesocycleId: meso.id,
    }));
  }

  function updateActiveSchedule(
    updater: (schedule: Mesocycle["schedule"]) => Mesocycle["schedule"]
  ) {
    setState((s) => ({
      ...s,
      mesocycles: s.mesocycles.map((m) =>
        m.id === s.activeMesocycleId
          ? { ...m, schedule: updater(m.schedule) }
          : m
      ),
    }));
  }

  function addExercise(cycleDay: CycleDay, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateActiveSchedule((schedule) => ({
      ...schedule,
      [cycleDay]: [
        ...(schedule[cycleDay] ?? []),
        { id: uid(), name: trimmed },
      ],
    }));
  }

  function removeExercise(cycleDay: CycleDay, exerciseId: string) {
    updateActiveSchedule((schedule) => ({
      ...schedule,
      [cycleDay]: (schedule[cycleDay] ?? []).filter(
        (e) => e.id !== exerciseId
      ),
    }));
  }

  function renameExercise(cycleDay: CycleDay, exerciseId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    updateActiveSchedule((schedule) => ({
      ...schedule,
      [cycleDay]: (schedule[cycleDay] ?? []).map((e) =>
        e.id === exerciseId ? { ...e, name: trimmed } : e
      ),
    }));
  }

  function insertRestDay(date: string) {
    setState((s) => ({
      ...s,
      mesocycles: s.mesocycles.map((m) =>
        m.id === s.activeMesocycleId && !m.insertedRestDates.includes(date)
          ? { ...m, insertedRestDates: [...m.insertedRestDates, date] }
          : m
      ),
    }));
  }

  function startMesocycleToday() {
    const today = todayISO();
    setState((s) => ({
      ...s,
      mesocycles: s.mesocycles.map((m) =>
        m.id === s.activeMesocycleId
          ? {
              ...m,
              startDate: today,
              endDate: addMonths(today, 3),
              insertedRestDates: [],
              cycleStartConfirmed: true,
            }
          : m
      ),
    }));
  }

  function getLogFor(date: string, exerciseId: string) {
    return state.logs[`${date}_${exerciseId}`];
  }

  function getLastLogBefore(date: string, exerciseId: string) {
    const target = parseISODate(date).getTime();
    let best: SessionLog | undefined;
    let bestTime = -Infinity;
    for (const log of Object.values(state.logs)) {
      if (log.exerciseId !== exerciseId) continue;
      const t = parseISODate(log.date).getTime();
      if (t < target && t > bestTime) {
        best = log;
        bestTime = t;
      }
    }
    return best;
  }

  function saveLog(
    date: string,
    exercise: ExerciseTemplate,
    sets: SetEntry[],
    comment: string
  ) {
    const id = `${date}_${exercise.id}`;
    const log: SessionLog = {
      id,
      date,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets,
      comment,
    };
    setState((s) => ({ ...s, logs: { ...s.logs, [id]: log } }));
  }

  const value: AppContextValue = {
    state,
    activeMesocycle,
    createMesocycle,
    addExercise,
    removeExercise,
    renameExercise,
    insertRestDay,
    startMesocycleToday,
    getLogFor,
    getLastLogBefore,
    saveLog,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
