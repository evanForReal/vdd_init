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
  assignedTemplates: [],
};

// Templates used to carry per-item macro objects ({label, protein,
// calories}); they're now plain strings. Coerce old-shaped stored items so
// existing local data doesn't render as [object Object].
function normalizeTemplateItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => (typeof it === "string" ? it : (it as { label?: string })?.label ?? ""))
    .filter((label): label is string => Boolean(label));
}

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
      templates: (parsed.templates ?? []).map((t) => ({
        ...t,
        items: normalizeTemplateItems(t.items),
      })),
      plannedDays: parsed.plannedDays ?? [],
      assignedTemplates: parsed.assignedTemplates ?? [],
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

// Reused across every call instead of opening a fresh connection per
// read/write — opening IndexedDB is real latency, and the gallery grid
// used to pay it once per photo every time you switched views.
let dbPromise: Promise<IDBDatabase> | null = null;

function openPhotoDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function savePhotoBlob(id: string, blob: Blob): Promise<void> {
  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadPhotoBlob(id: string): Promise<Blob | undefined> {
  const db = await openPhotoDb();
  return new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result as Blob | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function deletePhotoBlob(id: string): Promise<void> {
  const db = await openPhotoDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
