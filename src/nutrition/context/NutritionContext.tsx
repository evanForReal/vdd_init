import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ConfidenceValue,
  DayComment,
  FoodEntry,
  MealTemplate,
  NutritionState,
  NutritionTargets,
  PlannedItem,
  ProgressPhotoMeta,
  TemplateItem,
} from "../types";
import {
  deletePhotoBlob,
  loadNutritionState,
  loadPhotoBlob,
  saveNutritionState,
  savePhotoBlob,
} from "../storage";
import { addDays, daysBetween, weekdayIndex } from "../../utils/date";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

interface NutritionContextValue {
  state: NutritionState;
  setTargets: (targets: NutritionTargets) => void;
  entriesForDate: (date: string) => FoodEntry[];
  addFoodEntry: (
    date: string,
    label: string,
    protein: ConfidenceValue,
    calories: ConfidenceValue
  ) => void;
  removeFoodEntry: (id: string) => void;
  commentsForDate: (date: string) => DayComment[];
  addComment: (date: string, title: string, description: string) => void;
  boostCountLast7Days: (fromDate: string) => number;
  extraCaloriesForDate: (date: string) => number;
  pressCalorieBoost: (date: string, amount?: number) => void;
  isFreeDay: (date: string) => boolean;
  markFreeDay: (date: string) => void;
  photos: ProgressPhotoMeta[];
  addPhoto: (date: string, blob: Blob) => Promise<void>;
  removePhoto: (id: string) => Promise<void>;
  updatePhotoDate: (id: string, date: string) => void;
  getPhotoUrl: (id: string) => Promise<string | undefined>;
  templates: MealTemplate[];
  createTemplate: (name: string, items: TemplateItem[]) => void;
  deleteTemplate: (id: string) => void;
  plannedItemsForDate: (date: string) => PlannedItem[];
  upcomingPlannedDays: (fromDate: string, days: number) => { date: string; items: PlannedItem[] }[];
  addPlannedItem: (
    date: string,
    label: string,
    protein: ConfidenceValue,
    calories: ConfidenceValue
  ) => void;
  removePlannedItem: (date: string, itemId: string) => void;
  confirmPlannedItem: (date: string, itemId: string) => void;
  skipPlannedItem: (date: string, itemId: string) => void;
  assignTemplateToDate: (templateId: string, date: string) => void;
  assignTemplateToRange: (
    templateId: string,
    startDate: string,
    endDate: string,
    weekdays?: number[]
  ) => void;
}

const NutritionContext = createContext<NutritionContextValue | null>(null);

export function NutritionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NutritionState>(() => loadNutritionState());

  useEffect(() => {
    saveNutritionState(state);
  }, [state]);

  function setTargets(targets: NutritionTargets) {
    setState((s) => ({ ...s, targets }));
  }

  function entriesForDate(date: string) {
    return state.entries.filter((e) => e.date === date);
  }

  function addFoodEntry(
    date: string,
    label: string,
    protein: ConfidenceValue,
    calories: ConfidenceValue
  ) {
    const entry: FoodEntry = {
      id: uid(),
      date,
      label: label.trim() || "Food",
      protein,
      calories,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, entries: [...s.entries, entry] }));
  }

  function removeFoodEntry(id: string) {
    setState((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== id) }));
  }

  function commentsForDate(date: string) {
    return state.comments.filter((c) => c.date === date);
  }

  function addComment(date: string, title: string, description: string) {
    const comment: DayComment = {
      id: uid(),
      date,
      title: title.trim(),
      description: description.trim(),
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, comments: [...s.comments, comment] }));
  }

  function boostCountLast7Days(fromDate: string) {
    const start = addDays(fromDate, -6);
    return state.boosts.filter(
      (b) => daysBetween(start, b.date) >= 0 && daysBetween(b.date, fromDate) >= 0
    ).length;
  }

  function extraCaloriesForDate(date: string) {
    return state.boosts
      .filter((b) => b.date === date)
      .reduce((sum, b) => sum + b.amount, 0);
  }

  function pressCalorieBoost(date: string, amount = 500) {
    setState((s) => ({
      ...s,
      boosts: [...s.boosts, { id: uid(), date, amount }],
    }));
  }

  function isFreeDay(date: string) {
    return state.freeDays.some((f) => f.date === date);
  }

  function markFreeDay(date: string) {
    setState((s) => ({
      ...s,
      entries: s.entries.filter((e) => e.date !== date),
      comments: s.comments.filter((c) => c.date !== date),
      boosts: s.boosts.filter((b) => b.date !== date),
      freeDays: s.freeDays.some((f) => f.date === date)
        ? s.freeDays
        : [...s.freeDays, { date }],
    }));
  }

  function createTemplate(name: string, items: TemplateItem[]) {
    const template: MealTemplate = {
      id: uid(),
      name: name.trim() || "template",
      items,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, templates: [...s.templates, template] }));
  }

  function deleteTemplate(id: string) {
    setState((s) => ({ ...s, templates: s.templates.filter((t) => t.id !== id) }));
  }

  function plannedItemsForDate(date: string): PlannedItem[] {
    return (
      state.plannedDays.find((p) => p.date === date)?.items.filter((i) => i.status === "pending") ?? []
    );
  }

  function upcomingPlannedDays(fromDate: string, days: number) {
    const cutoff = addDays(fromDate, days);
    return state.plannedDays
      .map((p) => ({ date: p.date, items: p.items.filter((i) => i.status === "pending") }))
      .filter(
        (p) =>
          p.items.length > 0 &&
          daysBetween(fromDate, p.date) >= 0 &&
          daysBetween(p.date, cutoff) >= 0
      )
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  // Adds `newItems` to the plan for `date`, creating the plan if it doesn't
  // exist yet. Used by both freehand adds and template assignment.
  function appendPlannedItems(date: string, newItems: PlannedItem[]) {
    setState((s) => {
      const existing = s.plannedDays.find((p) => p.date === date);
      const plannedDays = existing
        ? s.plannedDays.map((p) => (p.date === date ? { ...p, items: [...p.items, ...newItems] } : p))
        : [...s.plannedDays, { date, items: newItems }];
      return { ...s, plannedDays };
    });
  }

  function addPlannedItem(
    date: string,
    label: string,
    protein: ConfidenceValue,
    calories: ConfidenceValue
  ) {
    appendPlannedItems(date, [
      { id: uid(), label: label.trim() || "food", protein, calories, status: "pending" },
    ]);
  }

  function removePlannedItem(date: string, itemId: string) {
    setState((s) => ({
      ...s,
      plannedDays: s.plannedDays.map((p) =>
        p.date === date ? { ...p, items: p.items.filter((i) => i.id !== itemId) } : p
      ),
    }));
  }

  function setPlannedItemStatus(date: string, itemId: string, status: PlannedItem["status"]) {
    setState((s) => ({
      ...s,
      plannedDays: s.plannedDays.map((p) =>
        p.date === date
          ? { ...p, items: p.items.map((i) => (i.id === itemId ? { ...i, status } : i)) }
          : p
      ),
    }));
  }

  function confirmPlannedItem(date: string, itemId: string) {
    const item = state.plannedDays.find((p) => p.date === date)?.items.find((i) => i.id === itemId);
    if (!item) return;
    addFoodEntry(date, item.label, item.protein, item.calories);
    setPlannedItemStatus(date, itemId, "confirmed");
  }

  function skipPlannedItem(date: string, itemId: string) {
    setPlannedItemStatus(date, itemId, "skipped");
  }

  function assignTemplateToDate(templateId: string, date: string) {
    const template = state.templates.find((t) => t.id === templateId);
    if (!template) return;
    appendPlannedItems(
      date,
      template.items.map((item) => ({ ...item, id: uid(), status: "pending" as const }))
    );
  }

  function assignTemplateToRange(
    templateId: string,
    startDate: string,
    endDate: string,
    weekdays?: number[]
  ) {
    const span = daysBetween(startDate, endDate);
    if (span < 0) return;
    for (let i = 0; i <= span; i++) {
      const date = addDays(startDate, i);
      if (weekdays && weekdays.length > 0 && !weekdays.includes(weekdayIndex(date))) continue;
      assignTemplateToDate(templateId, date);
    }
  }

  async function addPhoto(date: string, blob: Blob) {
    const id = uid();
    await savePhotoBlob(id, blob);
    setState((s) => ({
      ...s,
      photos: [...s.photos, { id, date, createdAt: Date.now() }],
    }));
  }

  async function removePhoto(id: string) {
    await deletePhotoBlob(id);
    setState((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== id) }));
  }

  function updatePhotoDate(id: string, date: string) {
    setState((s) => ({
      ...s,
      photos: s.photos.map((p) => (p.id === id ? { ...p, date } : p)),
    }));
  }

  async function getPhotoUrl(id: string) {
    const blob = await loadPhotoBlob(id);
    return blob ? URL.createObjectURL(blob) : undefined;
  }

  const photos = useMemo(
    () => [...state.photos].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [state.photos]
  );

  const value: NutritionContextValue = {
    state,
    setTargets,
    entriesForDate,
    addFoodEntry,
    removeFoodEntry,
    commentsForDate,
    addComment,
    boostCountLast7Days,
    extraCaloriesForDate,
    pressCalorieBoost,
    isFreeDay,
    markFreeDay,
    photos,
    addPhoto,
    removePhoto,
    updatePhotoDate,
    getPhotoUrl,
    templates: state.templates,
    createTemplate,
    deleteTemplate,
    plannedItemsForDate,
    upcomingPlannedDays,
    addPlannedItem,
    removePlannedItem,
    confirmPlannedItem,
    skipPlannedItem,
    assignTemplateToDate,
    assignTemplateToRange,
  };

  return (
    <NutritionContext.Provider value={value}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition(): NutritionContextValue {
  const ctx = useContext(NutritionContext);
  if (!ctx) throw new Error("useNutrition must be used within NutritionProvider");
  return ctx;
}
