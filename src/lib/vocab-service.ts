import { initDB, IDBPromise } from "@/lib/db";
import type { VocabItem, Translation } from "@/types/vocab";

const STORE = "vocabulary";

export async function ensureVocabStore() {
  const db = await initDB();
  return db;
}

export async function addVocab(item: Omit<VocabItem, "id" | "createdAt" | "reviewCount" | "ease" | "intervalDays">) {
  const db = await initDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const now = Date.now();
  const newItem: VocabItem = {
    ...item,
    createdAt: now,
    updatedAt: now,
    reviewCount: 0,
    ease: 2.5,
    intervalDays: 0,
  };
  const id = await IDBPromise(store.add(newItem));
  return id;
}

export async function updateVocab(id: number, patch: Partial<VocabItem>) {
  const db = await initDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const existing: VocabItem = await IDBPromise(store.get(id));
  const updated = { ...existing, ...patch, updatedAt: Date.now() };
  await IDBPromise(store.put(updated));
  return updated;
}

export async function deleteVocab(id: number) {
  const db = await initDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  await IDBPromise(store.delete(id));
}

export async function listVocab(): Promise<VocabItem[]> {
  const db = await initDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const all = await IDBPromise(store.getAll());
  return all as VocabItem[];
}

// Simple SRS update: user grades recall (0-5) -> update ease, interval
export async function applyReviewResult(id: number, grade: number) {
  // grade: 0 (forgot) ... 5 (perfect)
  const db = await initDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const item: VocabItem = await IDBPromise(store.get(id));
  if (!item) return null;

  // simplified SM-2-ish adjustments
  let ease = item.ease ?? 2.5;
  if (grade >= 3) {
    ease = ease + 0.1 - (5 - grade) * 0.08;
    if (item.reviewCount === 0) {
      item.intervalDays = 1;
    } else if (item.reviewCount === 1) {
      item.intervalDays = 6;
    } else {
      item.intervalDays = Math.max(1, Math.round((item.intervalDays ?? 1) * ease));
    }
    item.reviewCount = (item.reviewCount || 0) + 1;
  } else {
    // forgot -> reset interval
    item.intervalDays = 1;
    item.reviewCount = 0;
    ease = Math.max(1.3, ease - 0.2);
  }
  item.ease = ease;
  item.dueAt = Date.now() + (item.intervalDays ?? 1) * 24 * 60 * 60 * 1000;
  item.updatedAt = Date.now();

  await IDBPromise(store.put(item));
  await IDBPromise(tx.complete);
  return item;
}

// Export and import
export async function exportVocabJSON() {
  const arr = await listVocab();
  return JSON.stringify(arr, null, 2);
}

export async function importVocabJSON(jsonStr: string) {
  const parsed = JSON.parse(jsonStr) as VocabItem[];
  const db = await initDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  for (const raw of parsed) {
    // sanitize a bit, remove id so DB can assign
    const { id, ...rest } = raw;
    const now = Date.now();
    const item = { ...rest, createdAt: rest.createdAt ?? now, updatedAt: now, reviewCount: rest.reviewCount ?? 0 };
    await IDBPromise(store.add(item));
  }
}
