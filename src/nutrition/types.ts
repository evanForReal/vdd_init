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

export interface NutritionState {
  targets: NutritionTargets;
  entries: FoodEntry[];
  comments: DayComment[];
  boosts: CalorieBoost[];
  freeDays: FreeDay[];
  photos: ProgressPhotoMeta[];
}
