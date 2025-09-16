import type { Recipe } from "./types"
import { fetchAndParseRecipe } from "@/app/actions"

// Use localStorage for all operations instead of Supabase
const LOCAL_STORAGE_KEY = "recipes"

// Helper function to get recipes from localStorage
function getLocalStorageRecipes(): Recipe[] {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
  return saved ? JSON.parse(saved) : []
}

// Helper function to save recipes to localStorage
function saveLocalStorageRecipes(recipes: Recipe[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipes))
}

export async function saveRecipe(url: string, userId: string): Promise<Recipe> {
  try {
    // Use our server action to fetch and parse the recipe
    const parsedRecipe = await fetchAndParseRecipe(url)

    // Save to localStorage
    const recipes = getLocalStorageRecipes()
    recipes.unshift(parsedRecipe)
    saveLocalStorageRecipes(recipes)

    return parsedRecipe
  } catch (error) {
    console.error("Error saving recipe:", error)
    throw error
  }
}

export async function getRecipes(userId: string): Promise<Recipe[]> {
  return getLocalStorageRecipes()
}

export async function updateRecipe(recipe: Recipe, userId: string): Promise<void> {
  try {
    const recipes = getLocalStorageRecipes()
    const index = recipes.findIndex((r) => r.id === recipe.id)

    if (index !== -1) {
      recipes[index] = recipe
      saveLocalStorageRecipes(recipes)
    }
  } catch (error) {
    console.error("Error updating recipe:", error)
    throw error
  }
}

export async function deleteRecipe(recipeId: string, userId: string): Promise<void> {
  try {
    const recipes = getLocalStorageRecipes()
    const filteredRecipes = recipes.filter((r) => r.id !== recipeId)
    saveLocalStorageRecipes(filteredRecipes)
  } catch (error) {
    console.error("Error deleting recipe:", error)
    throw error
  }
}

export function searchRecipes(recipes: Recipe[], query: string): Recipe[] {
  if (!query) return recipes

  const searchTerm = query.toLowerCase()
  return recipes.filter((recipe) => {
    // Search in title
    if (recipe.title.toLowerCase().includes(searchTerm)) return true

    // Search in ingredients
    if (recipe.ingredients.some((i) => i.toLowerCase().includes(searchTerm))) return true

    // Search in categories
    if (recipe.categories.some((c) => c.toLowerCase().includes(searchTerm))) return true

    // Search in comments
    if (recipe.comments && recipe.comments.toLowerCase().includes(searchTerm)) return true

    return false
  })
}

// These functions are now just aliases to the localStorage functions
export function getLocalRecipes(): Recipe[] {
  return getLocalStorageRecipes()
}

export function saveLocalRecipe(recipe: Recipe): void {
  const recipes = getLocalStorageRecipes()
  recipes.unshift(recipe)
  saveLocalStorageRecipes(recipes)
}

export function migrateLocalRecipesToSupabase(): Promise<void> {
  // This function is now a no-op since we're not using Supabase
  return Promise.resolve()
}
