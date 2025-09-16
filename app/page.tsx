"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  saveRecipe,
  searchRecipes,
  getRecipes,
  updateRecipe,
} from "@/lib/recipe-service";
import { RecipeCard } from "@/components/recipe-card";
import { Logo } from "@/components/logo";
import type { Recipe } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { analytics } from "@/lib/analytics";

export default function RecipeCollector() {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<
    Array<{ name: string; count: number }>
  >([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const { user } = useUser();

  // Generate dynamic categories from user's recipes
  const generateDynamicCategories = (recipes: Recipe[]) => {
    const categoryCount: { [key: string]: number } = {};

    recipes.forEach((recipe) => {
      recipe.categories.forEach((category) => {
        const normalizedCategory = category.toLowerCase();
        categoryCount[normalizedCategory] =
          (categoryCount[normalizedCategory] || 0) + 1;
      });
    });

    // Convert to array, sort by count, and take top 5
    const sortedCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sortedCategories;
  };

  // Generate available tags for autocomplete
  const generateAvailableTags = (recipes: Recipe[]) => {
    const allTags = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.categories.forEach((tag) => {
        allTags.add(tag.toLowerCase());
      });
    });
    return Array.from(allTags).sort();
  };

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Load recipes on mount
    const loadRecipes = async () => {
      if (user && mounted) {
        try {
          const userRecipes = await getRecipes(user.id);
          setRecipes(userRecipes);
          setFilteredRecipes(userRecipes);

          // Generate dynamic categories and available tags
          const categories = generateDynamicCategories(userRecipes);
          const tags = generateAvailableTags(userRecipes);
          setDynamicCategories(categories);
          setAvailableTags(tags);
        } catch (error) {
          console.error("Error loading recipes:", error);
        }
      }
    };

    loadRecipes();
  }, [user, mounted]);

  const handleAddRecipe = async () => {
    if (!url || !user) return;

    // Basic URL validation
    let validUrl: string;
    try {
      // Try to construct a URL object to validate
      validUrl = new URL(url).toString();
    } catch (e) {
      // If it fails, try adding https:// prefix
      try {
        validUrl = new URL(`https://${url}`).toString();
      } catch (e) {
        setError("Please enter a valid URL");
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const newRecipe = await saveRecipe(validUrl, user.id);
      const updatedRecipes = [newRecipe, ...recipes];
      setRecipes(updatedRecipes);
      setFilteredRecipes(updatedRecipes);

      // Update dynamic categories
      const categories = generateDynamicCategories(updatedRecipes);
      setDynamicCategories(categories);

      setUrl("");
      setIsAddingRecipe(false);
    } catch (error) {
      console.error("Failed to add recipe:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to parse recipe. Please try another URL."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const results = searchRecipes(recipes, searchQuery);
    setFilteredRecipes(results);

    // Track search
    analytics.trackSearch(searchQuery, results.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filterByCategory = (category: string) => {
    setActiveTab(category);
    if (category === "all") {
      setFilteredRecipes(recipes);
    } else if (category === "favorites") {
      setFilteredRecipes(recipes.filter((recipe) => recipe.isFavorite));
    } else {
      setFilteredRecipes(
        recipes.filter((recipe) =>
          recipe.categories.some(
            (cat) => cat.toLowerCase() === category.toLowerCase()
          )
        )
      );
    }

    // Track category filter
    analytics.trackCategoryFilter(category);
  };

  const handleTagsUpdate = (recipeId: string, newTags: string[]) => {
    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === recipeId ? { ...recipe, categories: newTags } : recipe
    );
    setRecipes(updatedRecipes);
    setFilteredRecipes(updatedRecipes);

    // Update dynamic categories and available tags
    const categories = generateDynamicCategories(updatedRecipes);
    const tags = generateAvailableTags(updatedRecipes);
    setDynamicCategories(categories);
    setAvailableTags(tags);
  };

  const handleFavoriteToggle = async (
    recipeId: string,
    isFavorite: boolean
  ) => {
    if (!user) return;

    const updatedRecipes = recipes.map((recipe) =>
      recipe.id === recipeId ? { ...recipe, isFavorite } : recipe
    );
    setRecipes(updatedRecipes);
    setFilteredRecipes(updatedRecipes);

    // Update in localStorage
    try {
      const updatedRecipe = updatedRecipes.find((r) => r.id === recipeId);
      if (updatedRecipe) {
        await updateRecipe(updatedRecipe, user.id);
      }
    } catch (error) {
      console.error("Error updating recipe favorite status:", error);
      // Revert the change on error
      const revertedRecipes = recipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, isFavorite: !isFavorite } : recipe
      );
      setRecipes(revertedRecipes);
      setFilteredRecipes(revertedRecipes);
    }
  };

  // Show loading state during hydration
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Clean, minimal header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" />
            <Button
              onClick={() => setIsAddingRecipe(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </div>
      </header>

      {/* Add recipe form - 37signals style */}
      {isAddingRecipe && (
        <div className="border-b border-border bg-muted/30">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Input
                  placeholder="Paste recipe URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleAddRecipe}
                  disabled={isLoading || !url}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? "Adding..." : "Add"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingRecipe(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content area */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Search and filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              variant="outline"
              className="sm:w-auto"
            >
              Search
            </Button>
          </div>

          {/* Dynamic category filters */}
          <div className="flex flex-wrap gap-2">
            {/* All button */}
            <button
              onClick={() => filterByCategory("all")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                activeTab === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              All ({recipes.length})
            </button>

            {/* Favorites button */}
            <button
              onClick={() => filterByCategory("favorites")}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                activeTab === "favorites"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              ❤️ Favorites ({recipes.filter((r) => r.isFavorite).length})
            </button>

            {/* Dynamic categories */}
            {dynamicCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => filterByCategory(category.name)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  activeTab === category.name
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {category.name.charAt(0).toUpperCase() + category.name.slice(1)}{" "}
                ({category.count})
              </button>
            ))}

            {/* Show message if no categories yet */}
            {dynamicCategories.length === 0 && recipes.length > 0 && (
              <span className="text-sm text-muted-foreground px-3 py-1">
                Add more recipes to see categories
              </span>
            )}
          </div>
        </div>

        {/* Recipe list */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <Logo size="lg" className="mx-auto mb-4 opacity-50" />
            </div>
            <h2 className="text-lg font-medium text-foreground mb-2">
              {recipes.length === 0 ? "No recipes yet" : "No recipes found"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {recipes.length === 0
                ? "Get started by adding your first recipe from any website."
                : "Try adjusting your search or filter to find what you're looking for."}
            </p>
            {recipes.length === 0 && (
              <Button
                onClick={() => setIsAddingRecipe(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Recipe
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onTagsUpdate={handleTagsUpdate}
                onFavoriteToggle={handleFavoriteToggle}
                availableTags={availableTags}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
