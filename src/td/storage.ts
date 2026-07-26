import type { TodoState } from "./types";

const STORAGE_KEY = "lift-log-td-v1";

const DEFAULT_STATE: TodoState = {
  items: [],
  scopeBlocks: [],
  weekLists: [],
  guidingStars: [],
  checkIns: [],
  dayPins: [],
  sprints: [],
};

export function loadTodoState(): TodoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TodoState>;
    return {
      items: parsed.items ?? [],
      scopeBlocks: parsed.scopeBlocks ?? [],
      weekLists: parsed.weekLists ?? [],
      guidingStars: parsed.guidingStars ?? [],
      checkIns: parsed.checkIns ?? [],
      dayPins: parsed.dayPins ?? [],
      sprints: parsed.sprints ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveTodoState(state: TodoState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
