const API_BASE = "http://localhost:5174/api";

export async function searchMeals(query: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);

  if (!res.ok) {
    throw new Error("Failed to fetch meals");
  }

  return res.json();
}

export async function getMealById(id: string) {
  const res = await fetch(`${API_BASE}/meal/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch meal");
  }

  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  return res.json();
}

export async function filterByCategory(category: string) {
  const res = await fetch(
    `${API_BASE}/filter?c=${encodeURIComponent(category)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch category meals");
  }

  return res.json();
}