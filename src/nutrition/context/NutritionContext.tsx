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
  NutritionState,
  NutritionTargets,
  ProgressPhotoMeta,
} from "../types";
import {
  deletePhotoBlob,
  loadNutritionState,
  loadPhotoBlob,
  saveNutritionState,
  savePhotoBlob,
} from "../storage";
import { addDays, daysBetween } from "../../utils/date";

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
