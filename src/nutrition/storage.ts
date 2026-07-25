import type { NutritionState } from "./types";

const STORAGE_KEY = "lift-log-nutrition-v1";

const DEFAULT_STATE: NutritionState = {
  targets: { calories: 2000, proteinGrams: 150 },
  entries: [],
  comments: [],
  boosts: [],
  freeDays: [],
  photos: [],
  templates: [],
  plannedDays: [],
};

export function loadNutritionState(): NutritionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<NutritionState>;
    return {
      targets: parsed.targets ?? DEFAULT_STATE.targets,
      entries: parsed.entries ?? [],
      comments: parsed.comments ?? [],
      boosts: parsed.boosts ?? [],
      freeDays: parsed.freeDays ?? [],
      photos: parsed.photos ?? [],
      templates: parsed.templates ?? [],
      plannedDays: parsed.plannedDays ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveNutritionState(state: NutritionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Photo blob storage (IndexedDB) ----------
// Photo bytes live here rather than in the JSON state above so the main
// state blob stays small and cheap to re-serialize on every change.

const DB_NAME = "lift-log-photos";
const STORE_NAME = "photos";

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function savePhotoBlob(id: string, blob: Blob): Promise<void> {
  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPhotoBlob(id: string): Promise<Blob | undefined> {
  const db = await openPhotoDb();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function deletePhotoBlob(id: string): Promise<void> {
  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
