import express from "express";

const router = express.Router();

const API_BASE =
  process.env.MEALDB_API_BASE || "https://www.themealdb.com/api/json/v1";

const API_KEY = process.env.MEALDB_API_KEY || "1";



// ✅ ADD LOGS HERE
console.log("API_BASE:", API_BASE);
console.log("API_KEY:", API_KEY);

const categoryCache = {
  data: null,
  expiresAt: 0,
};

const CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function fetchMealDB(endpoint) {
  const url = `${API_BASE}/${API_KEY}/${endpoint}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`MealDB request failed: ${response.status}`);
  }

  return response.json();
}

router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.q || "";
    const data = await fetchMealDB(`search.php?s=${encodeURIComponent(query)}`);

    res.set("Cache-Control", "public, max-age=60");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/meal/:id", async (req, res, next) => {
  try {
    const data = await fetchMealDB(
      `lookup.php?i=${encodeURIComponent(req.params.id)}`
    );

    res.set("Cache-Control", "public, max-age=300");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/categories", async (req, res, next) => {
  try {
    const now = Date.now();

    if (categoryCache.data && categoryCache.expiresAt > now) {
      res.set("Cache-Control", "public, max-age=3600");
      return res.json(categoryCache.data);
    }

    const data = await fetchMealDB("categories.php");

    categoryCache.data = data;
    categoryCache.expiresAt = now + CACHE_TTL;

    res.set("Cache-Control", "public, max-age=3600");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/filter", async (req, res, next) => {
  try {
    const category = req.query.c;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const data = await fetchMealDB(
      `filter.php?c=${encodeURIComponent(category)}`
    );

    res.set("Cache-Control", "public, max-age=300");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/random", async (req, res, next) => {
  try {
    const data = await fetchMealDB("random.php");

    res.set("Cache-Control", "no-store");
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;