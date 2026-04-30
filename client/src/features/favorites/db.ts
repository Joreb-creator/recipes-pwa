import { openDB } from "idb";

const DB_NAME = "recipes-pwa-db";
const STORE_NAME = "favorites";

const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "idMeal" });
    }

    if (!db.objectStoreNames.contains("shopping")) {
      db.createObjectStore("shopping", { keyPath: "id" });
    }
  },
});

export async function saveFavorite(meal: any) {
  const db = await dbPromise;
  await db.put(STORE_NAME, meal);
}

export async function removeFavorite(idMeal: string) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, idMeal);
}

export async function getFavorite(idMeal: string) {
  const db = await dbPromise;
  return db.get(STORE_NAME, idMeal);
}

export async function getAllFavorites() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}