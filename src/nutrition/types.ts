export interface ConfidenceValue {
  value: number;
  /** Optional plus-or-minus uncertainty range on `value`. */
  confidence?: number;
}

export interface FoodEntry {
  id: string;
  date: string; // ISO date
  label: string;
  protein: ConfidenceValue;
  calories: ConfidenceValue;
  createdAt: number;
  /** Set when this entry was logged under a bullet item of an assigned template block. */
  templateBlockId?: string;
  bulletIndex?: number;
}

export interface DayComment {
  id: string;
  date: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface CalorieBoost {
  id: string;
  date: string; // date the button was pressed
  amount: number;
}

export interface FreeDay {
  date: string;
}

export interface NutritionTargets {
  calories: number;
  proteinGrams: number;
}

export interface ProgressPhotoMeta {
  id: string;
  date: string; // ISO date the photo represents
  createdAt: number;
}

// A template is just a plain-text bullet list — no macro data, no
// processing of the lines beyond splitting them. It exists to be assigned
// onto a day, where each bullet becomes its own loggable slot.
export interface MealTemplate {
  id: string;
  name: string;
  items: string[];
  createdAt: number;
}

// A snapshot of a template assigned to a specific date — copied at
// assignment time so later edits to the template don't retroactively
// change days it was already assigned to.
export interface AssignedTemplate {
  id: string;
  templateId: string;
  templateName: string;
  date: string;
  items: string[];
}

export interface PlannedItem {
  id: string;
  label: string;
  protein: ConfidenceValue;
  calories: ConfidenceValue;
  status: "pending" | "confirmed" | "skipped";
}

export interface PlannedDay {
  date: string; // ISO date
  items: PlannedItem[];
}

export interface NutritionState {
  targets: NutritionTargets;
  entries: FoodEntry[];
  comments: DayComment[];
  boosts: CalorieBoost[];
  freeDays: FreeDay[];
  photos: ProgressPhotoMeta[];
  templates: MealTemplate[];
  plannedDays: PlannedDay[];
  assignedTemplates: AssignedTemplate[];
}
