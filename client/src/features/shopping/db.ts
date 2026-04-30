import { openDB } from "idb";

const DB_NAME = "recipes-pwa-db";
const STORE_NAME = "shopping";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("favorites")) {
      db.createObjectStore("favorites", { keyPath: "idMeal" });
    }
  },
});

export async function addItem(item: string, recipe: string) {
  const db = await dbPromise;
  const id = crypto.randomUUID();
  await db.put(STORE_NAME, { id, item, recipe });
}

export async function removeItem(id: string) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
}

export async function getAllItems() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}

export async function clearItems() {
  const db = await dbPromise;
  await db.clear(STORE_NAME);
}