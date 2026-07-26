import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  GuidingStar,
  GuidingStarCheckIn,
  ScopeBlock,
  Sprint,
  TodoItem,
  TodoState,
  WeekListItem,
} from "../types";
import { loadTodoState, saveTodoState } from "../storage";
import { addDays, daysBetween } from "../../utils/date";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface NewItemOptions {
  time?: string;
  group?: string;
  starId?: string;
}

interface TodoContextValue {
  state: TodoState;

  itemsForDate: (date: string) => TodoItem[];
  addDayItem: (date: string, label: string, opts?: NewItemOptions) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;

  scopeBlocks: ScopeBlock[];
  scopeBlocksForDate: (date: string) => ScopeBlock[];
  itemsForScope: (scopeBlockId: string) => TodoItem[];
  createScopeBlock: (label: string, startDate: string, endDate: string) => void;
  deleteScopeBlock: (id: string) => void;
  addScopeItem: (scopeBlockId: string, label: string) => void;

  weekListFor: (weekStart: string, kind: "goal" | "joy") => WeekListItem[];
  addWeekListItem: (weekStart: string, kind: "goal" | "joy", label: string) => void;
  toggleWeekListItem: (id: string) => void;
  removeWeekListItem: (id: string) => void;

  guidingStars: GuidingStar[];
  createGuidingStar: (name: string, description?: string) => void;
  archiveGuidingStar: (id: string) => void;
  deleteGuidingStar: (id: string) => void;
  pinnedStarsForDate: (date: string) => GuidingStar[];
  pinStarToDay: (date: string, starId: string) => void;
  unpinStarFromDay: (date: string, starId: string) => void;
  checkInsForDate: (date: string) => GuidingStarCheckIn[];
  toggleCheckIn: (starId: string, date: string) => void;
  checkInCountLast7Days: (starId: string, fromDate: string) => number;

  activeSprint: Sprint | undefined;
  startSprint: (date: string, taskIds: string[], durationMinutes: number) => void;
  endSprint: (id: string) => void;
}

const TodoContext = createContext<TodoContextValue | null>(null);

export function TodoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TodoState>(() => loadTodoState());

  useEffect(() => {
    saveTodoState(state);
  }, [state]);

  function itemsForDate(date: string) {
    return state.items.filter((i) => i.date === date);
  }

  function addDayItem(date: string, label: string, opts?: NewItemOptions) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const item: TodoItem = {
      id: uid(),
      date,
      label: trimmed,
      completed: false,
      time: opts?.time,
      group: opts?.group,
      starId: opts?.starId,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, items: [...s.items, item] }));
  }

  function toggleItem(id: string) {
    setState((s) => ({
      ...s,
      items: s.items.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)),
    }));
  }

  function removeItem(id: string) {
    setState((s) => ({ ...s, items: s.items.filter((i) => i.id !== id) }));
  }

  function scopeBlocksForDate(date: string) {
    return state.scopeBlocks.filter(
      (b) => daysBetween(b.startDate, date) >= 0 && daysBetween(date, b.endDate) >= 0
    );
  }

  function itemsForScope(scopeBlockId: string) {
    return state.items.filter((i) => i.scopeBlockId === scopeBlockId);
  }

  function createScopeBlock(label: string, startDate: string, endDate: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const block: ScopeBlock = {
      id: uid(),
      label: trimmed,
      startDate,
      endDate,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, scopeBlocks: [...s.scopeBlocks, block] }));
  }

  function deleteScopeBlock(id: string) {
    setState((s) => ({
      ...s,
      scopeBlocks: s.scopeBlocks.filter((b) => b.id !== id),
      items: s.items.filter((i) => i.scopeBlockId !== id),
    }));
  }

  function addScopeItem(scopeBlockId: string, label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const item: TodoItem = {
      id: uid(),
      scopeBlockId,
      label: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, items: [...s.items, item] }));
  }

  function weekListFor(weekStart: string, kind: "goal" | "joy") {
    return state.weekLists.filter((w) => w.weekStart === weekStart && w.kind === kind);
  }

  function addWeekListItem(weekStart: string, kind: "goal" | "joy", label: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const item: WeekListItem = {
      id: uid(),
      weekStart,
      kind,
      label: trimmed,
      completed: false,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, weekLists: [...s.weekLists, item] }));
  }

  function toggleWeekListItem(id: string) {
    setState((s) => ({
      ...s,
      weekLists: s.weekLists.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w)),
    }));
  }

  function removeWeekListItem(id: string) {
    setState((s) => ({ ...s, weekLists: s.weekLists.filter((w) => w.id !== id) }));
  }

  function createGuidingStar(name: string, description?: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const star: GuidingStar = {
      id: uid(),
      name: trimmed,
      description: description?.trim() || undefined,
      archived: false,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, guidingStars: [...s.guidingStars, star] }));
  }

  function archiveGuidingStar(id: string) {
    setState((s) => ({
      ...s,
      guidingStars: s.guidingStars.map((g) => (g.id === id ? { ...g, archived: true } : g)),
      dayPins: s.dayPins.filter((p) => p.starId !== id),
    }));
  }

  function deleteGuidingStar(id: string) {
    setState((s) => ({
      ...s,
      guidingStars: s.guidingStars.filter((g) => g.id !== id),
      dayPins: s.dayPins.filter((p) => p.starId !== id),
      checkIns: s.checkIns.filter((c) => c.starId !== id),
    }));
  }

  function pinnedStarsForDate(date: string) {
    const ids = new Set(state.dayPins.filter((p) => p.date === date).map((p) => p.starId));
    return state.guidingStars.filter((g) => ids.has(g.id));
  }

  function pinStarToDay(date: string, starId: string) {
    setState((s) =>
      s.dayPins.some((p) => p.date === date && p.starId === starId)
        ? s
        : { ...s, dayPins: [...s.dayPins, { date, starId }] }
    );
  }

  function unpinStarFromDay(date: string, starId: string) {
    setState((s) => ({
      ...s,
      dayPins: s.dayPins.filter((p) => !(p.date === date && p.starId === starId)),
    }));
  }

  function checkInsForDate(date: string) {
    return state.checkIns.filter((c) => c.date === date);
  }

  function toggleCheckIn(starId: string, date: string) {
    setState((s) => {
      const existing = s.checkIns.find((c) => c.starId === starId && c.date === date);
      if (existing) {
        return { ...s, checkIns: s.checkIns.filter((c) => c.id !== existing.id) };
      }
      return {
        ...s,
        checkIns: [...s.checkIns, { id: uid(), starId, date, createdAt: Date.now() }],
      };
    });
  }

  function checkInCountLast7Days(starId: string, fromDate: string) {
    const start = addDays(fromDate, -6);
    return state.checkIns.filter(
      (c) =>
        c.starId === starId &&
        daysBetween(start, c.date) >= 0 &&
        daysBetween(c.date, fromDate) >= 0
    ).length;
  }

  const activeSprint = useMemo(
    () => state.sprints.find((sp) => sp.endedAt === undefined),
    [state.sprints]
  );

  function startSprint(date: string, taskIds: string[], durationMinutes: number) {
    if (taskIds.length === 0) return;
    setState((s) => ({
      ...s,
      sprints: [
        ...s.sprints.map((sp) => (sp.endedAt === undefined ? { ...sp, endedAt: Date.now() } : sp)),
        { id: uid(), date, taskIds, durationMinutes, startedAt: Date.now() },
      ],
    }));
  }

  function endSprint(id: string) {
    setState((s) => ({
      ...s,
      sprints: s.sprints.map((sp) => (sp.id === id ? { ...sp, endedAt: Date.now() } : sp)),
    }));
  }

  const guidingStars = useMemo(
    () => state.guidingStars.filter((g) => !g.archived),
    [state.guidingStars]
  );

  const value: TodoContextValue = {
    state,
    itemsForDate,
    addDayItem,
    toggleItem,
    removeItem,
    scopeBlocks: state.scopeBlocks,
    scopeBlocksForDate,
    itemsForScope,
    createScopeBlock,
    deleteScopeBlock,
    addScopeItem,
    weekListFor,
    addWeekListItem,
    toggleWeekListItem,
    removeWeekListItem,
    guidingStars,
    createGuidingStar,
    archiveGuidingStar,
    deleteGuidingStar,
    pinnedStarsForDate,
    pinStarToDay,
    unpinStarFromDay,
    checkInsForDate,
    toggleCheckIn,
    checkInCountLast7Days,
    activeSprint,
    startSprint,
    endSprint,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
}

export function useTodo(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodo must be used within TodoProvider");
  return ctx;
}
