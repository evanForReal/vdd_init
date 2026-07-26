// A task belongs to exactly one container: a specific day (`date`) or a
// multi-day scope block (`scopeBlockId`). `time`/`group` are both optional
// so the default add-a-task flow stays a single line of text — scheduling
// and clustering are opt-in, not required structure.
export interface TodoItem {
  id: string;
  label: string;
  completed: boolean;
  time?: string; // "HH:MM", 24h — presence makes it a scheduled item
  group?: string; // freeform cluster label, e.g. "errands"
  starId?: string; // optional link to a GuidingStar this task serves
  date?: string; // ISO date, set for day-scoped items
  scopeBlockId?: string; // set for scope-block items
  createdAt: number;
}

// A "scope for a given few days" — the framework for multi-scale scope the
// user asked for, deliberately without any priority/ranking mechanism yet.
export interface ScopeBlock {
  id: string;
  label: string;
  startDate: string; // ISO, inclusive
  endDate: string; // ISO, inclusive
  createdAt: number;
}

export interface WeekListItem {
  id: string;
  weekStart: string; // ISO Sunday of the week this belongs to
  kind: "goal" | "joy";
  label: string;
  completed: boolean;
  createdAt: number;
}

export interface GuidingStar {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  createdAt: number;
}

export interface GuidingStarCheckIn {
  id: string;
  starId: string;
  date: string; // ISO date checked in on
  createdAt: number;
}

// Which guiding stars are surfaced ("pinned") on a given day's focus section.
export interface DayPin {
  date: string;
  starId: string;
}

export interface Sprint {
  id: string;
  date: string;
  taskIds: string[]; // references into TodoState.items — never copies
  durationMinutes: number;
  startedAt: number; // epoch ms
  endedAt?: number; // epoch ms; unset while the sprint is active
}

export interface TodoState {
  items: TodoItem[];
  scopeBlocks: ScopeBlock[];
  weekLists: WeekListItem[];
  guidingStars: GuidingStar[];
  checkIns: GuidingStarCheckIn[];
  dayPins: DayPin[];
  sprints: Sprint[];
}
