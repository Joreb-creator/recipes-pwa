import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  filterByCategory,
  getCategories,
  getMealById,
  searchMeals,
} from "./lib/api";
import {
  getAllFavorites,
  getFavorite,
  removeFavorite,
  saveFavorite,
} from "./features/favorites/db";
import {
  addItem,
  clearItems,
  getAllItems,
  removeItem,
} from "./features/shopping/db";

function getIngredients(meal: any) {
  const ingredients: string[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];

    if (ingredient && ingredient.trim()) {
      ingredients.push(`${measure || ""} ${ingredient}`.trim());
    }
  }

  return ingredients;
}

function App() {
  const [query, setQuery] = useState("chicken");
  const [meals, setMeals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [shoppingItems, setShoppingItems] = useState<any[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showShopping, setShowShopping] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDark, setIsDark] = useState(true);
  const [zoom, setZoom] = useState(1);

  const pageClass = isDark
    ? "min-h-screen bg-slate-950 p-6 text-white"
    : "min-h-screen bg-white p-6 text-slate-950";

  const displayedMeals = showFavorites ? favorites : meals;

  async function refreshFavorites() {
    setFavorites(await getAllFavorites());
  }

  async function loadShoppingItems() {
    setShoppingItems(await getAllItems());
  }

  function isFavorite(idMeal: string) {
    return favorites.some((meal) => meal.idMeal === idMeal);
  }

  async function toggleFavorite(meal: any) {
    const existing = await getFavorite(meal.idMeal);

    if (existing) {
      await removeFavorite(meal.idMeal);
    } else {
      await saveFavorite(meal);
    }

    await refreshFavorites();
  }

  async function addIngredientsToShopping(meal: any) {
    const ingredients = getIngredients(meal);

    for (const item of ingredients) {
      await addItem(item, meal.strMeal);
    }

    await loadShoppingItems();
  }

  async function removeShoppingItem(id: string) {
    await removeItem(id);
    await loadShoppingItems();
  }

  async function clearShoppingList() {
    await clearItems();
    await loadShoppingItems();
  }

  function copyShoppingList() {
  const text = shoppingItems.map(i => i.item).join("\n");
  navigator.clipboard.writeText(text);
  }

  async function loadMeals(searchTerm: string) {
    try {
      setLoading(true);
      setError("");
      setActiveCategory("");
      setSelectedMeal(null);
      setShowFavorites(false);
      setShowShopping(false);

      const data = await searchMeals(searchTerm);
      setMeals(data.meals || []);
    } catch {
      setError("Could not load recipes. Make sure the server is running.");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch {
      console.error("Could not load categories");
    }
  }

  async function loadCategory(category: string) {
    try {
      setLoading(true);
      setError("");
      setActiveCategory(category);
      setSelectedMeal(null);
      setShowFavorites(false);
      setShowShopping(false);

      const data = await filterByCategory(category);
      setMeals(data.meals || []);
    } catch {
      setError("Could not load this category.");
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  async function openMealDetails(id: string) {
    try {
      setDetailsLoading(true);
      setError("");

      const data = await getMealById(id);
      setSelectedMeal(data.meals?.[0] || null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not load recipe details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  useEffect(() => {
    loadMeals("chicken");
    loadCategories();
    refreshFavorites();
    loadShoppingItems();
  }, []);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }

    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    loadMeals(query.trim());
  }

  const groupedShoppingItems = shoppingItems.reduce((acc: any, item: any) => {
    const recipe = item.recipe || "Unknown Recipe";

    if (!acc[recipe]) {
      acc[recipe] = [];
    }

    acc[recipe].push(item);
    return acc;
  }, {});

  if (selectedMeal) {
    const ingredients = getIngredients(selectedMeal);

    return (
      <div className={pageClass}>
        {isOffline && (
          <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg">
            You are offline. Saved favorites are still available.
          </div>
        )}

        <main
          className="mx-auto max-w-4xl"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          <button
            onClick={() => setSelectedMeal(null)}
            className="mb-6 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            ← Back to recipes
          </button>

          <img
            src={selectedMeal.strMealThumb}
            alt={selectedMeal.strMeal}
            className="mb-6 max-h-[420px] w-full rounded-2xl object-cover"
          />

          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <h1 className="text-4xl font-bold">{selectedMeal.strMeal}</h1>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleFavorite(selectedMeal)}
                className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-400"
              >
                {isFavorite(selectedMeal.idMeal) ? "★ Saved" : "☆ Favorite"}
              </button>

              <button
                onClick={() => addIngredientsToShopping(selectedMeal)}
                className="rounded-xl bg-green-500 px-4 py-2 font-semibold text-slate-950 hover:bg-green-400"
              >
                Add to shopping list
              </button>
            </div>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 text-sm">
            {selectedMeal.strCategory && (
              <span className="rounded-full bg-blue-600 px-3 py-1 text-white">
                {selectedMeal.strCategory}
              </span>
            )}

            {selectedMeal.strArea && (
              <span className="rounded-full bg-slate-800 px-3 py-1 text-white">
                {selectedMeal.strArea}
              </span>
            )}
          </div>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold">Ingredients</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {ingredients.map((item) => (
                <li
                  key={item}
                  className="rounded-xl bg-slate-800 px-4 py-3 text-white"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-2xl font-semibold">Instructions</h2>
            <p
              className={
                isDark
                  ? "whitespace-pre-line leading-7 text-slate-300"
                  : "whitespace-pre-line leading-7 text-slate-700"
              }
            >
              {selectedMeal.strInstructions}
            </p>
          </section>

          {selectedMeal.strYoutube && (
            <a
              href={selectedMeal.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500"
            >
              Watch on YouTube
            </a>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={pageClass}>
      {isOffline && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-yellow-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg">
          You are offline. Saved favorites are still available.
        </div>
      )}

      <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}>
        <header className="mx-auto mb-8 max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Recipes PWA</h1>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                Search, browse, save recipes, and build a shopping list.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setShowFavorites(false);
                  setShowShopping(false);
                  setSelectedMeal(null);
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Recipes
              </button>

              <button
                onClick={() => {
                  setShowFavorites(true);
                  setShowShopping(false);
                  setSelectedMeal(null);
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Favorites ({favorites.length})
              </button>

              <button
                onClick={() => {
                  setShowShopping(true);
                  setShowFavorites(false);
                  setSelectedMeal(null);
                  loadShoppingItems();
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                Shopping List ({shoppingItems.length})
              </button>

              <button
                onClick={() => setIsDark((value) => !value)}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
              >
                {isDark ? "Light" : "Dark"}
              </button>

              <button
                onClick={() => setZoom((value) => Math.max(0.8, value - 0.1))}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800"
              >
                −
              </button>

              <button
                onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}
                className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800"
              >
                +
              </button>
            </div>
          </div>

          {!showFavorites && !showShopping && (
            <>
              <form onSubmit={handleSearch} className="mb-6 flex gap-3">
                <label htmlFor="search" className="sr-only">
                  Search recipes
                </label>

                <input
                  id="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search recipes..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-400"
                />

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-500"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.idCategory}
                    onClick={() => loadCategory(category.strCategory)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      activeCategory === category.strCategory
                        ? "border-blue-400 bg-blue-600 text-white"
                        : "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                    }`}
                  >
                    {category.strCategory}
                  </button>
                ))}
              </div>
            </>
          )}
        </header>

        <main className="mx-auto max-w-6xl">
          {loading && <p>Loading recipes...</p>}
          {detailsLoading && <p className="mb-4">Loading recipe details...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {showShopping ? (
            <section>
              <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <h2 className="text-2xl font-bold">Shopping List</h2>
                <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
  <h2 className="text-2xl font-bold">Shopping List</h2>

  <div className="flex gap-2">
    {shoppingItems.length > 0 && (
      <>
        <button
          onClick={copyShoppingList}
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
        >
          Copy List
        </button>

        <button
          onClick={clearShoppingList}
          className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
        >
          Clear List
        </button>
      </>
    )}
  </div>
</div>

                {shoppingItems.length > 0 && (
                  <button
                    onClick={clearShoppingList}
                    className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500"
                  >
                    Clear List
                  </button>
                )}
              </div>

              {shoppingItems.length === 0 ? (
                <p>No shopping items yet. Open a recipe and add ingredients.</p>
              ) : (
                Object.entries(groupedShoppingItems).map(
                  ([recipe, items]: any) => (
                    <div key={recipe} className="mb-6">
                      <h3 className="mb-2 text-lg font-semibold">{recipe}</h3>

                      <ul className="space-y-2">
                        {items.map((item: any) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-4 rounded-xl bg-slate-800 p-3 text-white"
                          >
                            <span>{item.item}</span>

                            <button
                              onClick={() => removeShoppingItem(item.id)}
                              className="rounded-lg bg-slate-700 px-3 py-1 text-sm hover:bg-slate-600"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )
              )}
            </section>
          ) : (
            <>
              {!loading && !error && displayedMeals.length === 0 && (
                <p>
                  {showFavorites
                    ? "No favorites saved yet."
                    : "No recipes found."}
                </p>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {displayedMeals.map((meal) => (
                  <article
                    key={meal.idMeal}
                    className="overflow-hidden rounded-2xl bg-slate-800 text-white shadow-md"
                  >
                    <button
                      onClick={() => openMealDetails(meal.idMeal)}
                      className="block w-full text-left"
                    >
                      <img
                        src={meal.strMealThumb}
                        alt={meal.strMeal}
                        className="h-48 w-full object-cover"
                      />

                      <div className="p-4">
                        <h2 className="text-lg font-semibold">
                          {meal.strMeal}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                          View recipe details
                        </p>
                      </div>
                    </button>

                    <div className="border-t border-slate-700 p-4">
                      <button
                        onClick={() => toggleFavorite(meal)}
                        className="w-full rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-slate-950 hover:bg-yellow-400"
                      >
                        {isFavorite(meal.idMeal) ? "★ Saved" : "☆ Favorite"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;