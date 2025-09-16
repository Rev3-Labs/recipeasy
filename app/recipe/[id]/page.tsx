"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Users,
  ExternalLink,
  Check,
  ChevronLeft,
  Edit2,
  Save,
  ImageOff,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { Recipe } from "@/lib/types";
import { getRecipes, updateRecipe, deleteRecipe } from "@/lib/recipe-service";
import { useUser } from "@/contexts/user-context";
import { TagEditor } from "@/components/tag-editor";
import { DeleteRecipeDialog } from "@/components/delete-recipe-dialog";
import { StarRating } from "@/components/star-rating";
import { FavoriteButton } from "@/components/favorite-button";
import { analytics } from "@/lib/analytics";

export default function RecipePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );
  const [activeTab, setActiveTab] = useState("ingredients");
  const [editingIngredients, setEditingIngredients] = useState(false);
  const [editingDirections, setEditingDirections] = useState(false);
  const [editedIngredients, setEditedIngredients] = useState<string[]>([]);
  const [editedDirections, setEditedDirections] = useState<string[]>([]);
  const [editingServings, setEditingServings] = useState(false);
  const [editedServings, setEditedServings] = useState("");
  const [imageError, setImageError] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [editedImage, setEditedImage] = useState("");
  const [editingComments, setEditingComments] = useState(false);
  const [comments, setComments] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const { user } = useUser(); // We'll still use the mock user from context

  // Generate available tags from all user recipes
  const generateAvailableTags = (recipes: Recipe[]) => {
    const allTags = new Set<string>();
    recipes.forEach((recipe) => {
      recipe.categories.forEach((tag) => {
        allTags.add(tag.toLowerCase());
      });
    });
    return Array.from(allTags).sort();
  };

  useEffect(() => {
    const loadRecipe = async () => {
      if (!user) return;

      try {
        const recipes = await getRecipes(user.id);
        const foundRecipe = recipes.find((r) => r.id === params.id);

        if (foundRecipe) {
          setRecipe(foundRecipe);
          setEditedIngredients(foundRecipe.ingredients);
          setEditedDirections(foundRecipe.directions);
          setEditedServings(foundRecipe.yield || "");
          setEditedImage(foundRecipe.image || "");
          setComments(foundRecipe.comments || "");
          setEditedTitle(foundRecipe.title);
          setUserRating(foundRecipe.userRating || 0);
          setIsFavorite(foundRecipe.isFavorite || false);
          setImageError(false);

          // Track recipe view
          analytics.trackRecipeViewed(foundRecipe.id, foundRecipe.title);
        }

        // Generate available tags from all recipes
        const tags = generateAvailableTags(recipes);
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error loading recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadRecipe();
    }
  }, [params.id, user]);

  const toggleIngredient = (index: number) => {
    if (editingIngredients) return;

    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  const handleSaveIngredients = async () => {
    if (!recipe || !user) return;

    // Filter out empty ingredients
    const filteredIngredients = editedIngredients.filter(
      (ingredient) => ingredient.trim() !== ""
    );

    // Create updated recipe
    const updatedRecipe = { ...recipe, ingredients: filteredIngredients };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
      setEditingIngredients(false);
    } catch (error) {
      console.error("Error saving ingredients:", error);
    }
  };

  const handleSaveDirections = async () => {
    if (!recipe || !user) return;

    // Filter out empty directions
    const filteredDirections = editedDirections.filter(
      (direction) => direction.trim() !== ""
    );

    // Create updated recipe
    const updatedRecipe = { ...recipe, directions: filteredDirections };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
      setEditingDirections(false);
    } catch (error) {
      console.error("Error saving directions:", error);
    }
  };

  const handleSaveServings = async () => {
    if (!recipe || !user) return;

    // Create updated recipe
    const updatedRecipe = { ...recipe, yield: editedServings };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
      setEditingServings(false);
    } catch (error) {
      console.error("Error saving servings:", error);
    }
  };

  const handleSaveImage = async () => {
    if (!recipe || !user) return;

    // Create updated recipe
    const updatedRecipe = { ...recipe, image: editedImage };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
      setEditingImage(false);
      setImageError(false);
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const handleSaveComments = async () => {
    if (!recipe || !user) return;

    // Create updated recipe
    const updatedRecipe = { ...recipe, comments };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
      setEditingComments(false);
    } catch (error) {
      console.error("Error saving comments:", error);
    }
  };

  const handleSaveTitle = async () => {
    if (!recipe || !user || !editedTitle.trim()) return;

    // Create updated recipe
    const updatedRecipe = { ...recipe, title: editedTitle.trim() };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
      setEditingTitle(false);
    } catch (error) {
      console.error("Error saving title:", error);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleTagsUpdate = async (newTags: string[]) => {
    if (!recipe || !user) return;

    // Create updated recipe
    const updatedRecipe = { ...recipe, categories: newTags };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);

      // Update available tags
      const recipes = await getRecipes(user.id);
      const tags = generateAvailableTags(recipes);
      setAvailableTags(tags);
    } catch (error) {
      console.error("Error saving tags:", error);
    }
  };

  const handleUserRatingChange = async (rating: number) => {
    if (!recipe || !user) return;

    // Update local state immediately for better UX
    setUserRating(rating);

    // Track recipe rating
    analytics.trackRecipeRated(recipe.id, rating);

    // Create updated recipe
    const updatedRecipe = { ...recipe, userRating: rating };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
    } catch (error) {
      console.error("Error saving user rating:", error);
      // Revert local state on error
      setUserRating(recipe.userRating || 0);
    }
  };

  const handleToggleFavorite = async () => {
    if (!recipe || !user) return;

    // Update local state immediately for better UX
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // Track favorite toggle
    analytics.trackRecipeFavorited(recipe.id, newFavoriteState);

    // Create updated recipe
    const updatedRecipe = { ...recipe, isFavorite: newFavoriteState };

    try {
      // Update in localStorage
      await updateRecipe(updatedRecipe, user.id);

      // Update state
      setRecipe(updatedRecipe);
    } catch (error) {
      console.error("Error saving favorite status:", error);
      // Revert local state on error
      setIsFavorite(recipe.isFavorite || false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!recipe || !user) return;

    try {
      // Delete from localStorage
      await deleteRecipe(recipe.id, user.id);

      // Navigate back to main page
      router.push("/");
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleUpdateIngredient = (index: number, value: string) => {
    const newIngredients = [...editedIngredients];
    newIngredients[index] = value;
    setEditedIngredients(newIngredients);
  };

  const handleAddIngredient = () => {
    setEditedIngredients([...editedIngredients, ""]);
  };

  const handleUpdateDirection = (index: number, value: string) => {
    const newDirections = [...editedDirections];
    newDirections[index] = value;
    setEditedDirections(newDirections);
  };

  const handleAddDirection = () => {
    setEditedDirections([...editedDirections, ""]);
  };

  // Format time strings to human-readable format
  const formatTime = (timeString: string | undefined) => {
    if (!timeString) return null;

    // Try to parse ISO8601 duration format
    const match = timeString.match(
      /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
    );
    if (match) {
      const days = Number.parseInt(match[1] || "0");
      const hours = Number.parseInt(match[2] || "0");
      const minutes = Number.parseInt(match[3] || "0");
      const seconds = Number.parseInt(match[4] || "0");

      const result = [];
      if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
      if (hours > 0) result.push(`${hours} hr${hours > 1 ? "s" : ""}`);
      if (minutes > 0) result.push(`${minutes} min${minutes > 1 ? "s" : ""}`);
      if (seconds > 0 && result.length === 0)
        result.push(`${seconds} sec${seconds > 1 ? "s" : ""}`);

      return result.join(" ");
    }

    return timeString;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="animate-pulse p-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
        <Button onClick={() => router.push("/")}>Back to recipes</Button>
      </div>
    );
  }

  // Prepare time and yield information
  const cookTime = formatTime(recipe.cookTime);
  const prepTime = formatTime(recipe.prepTime);
  const totalTime = formatTime(recipe.totalTime);
  const recipeYield = recipe.yield;

  // Determine image source with fallback
  const imageSrc = imageError
    ? `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(
        recipe.title
      )}`
    : recipe.image ||
      `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(
        recipe.title
      )}`;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header */}
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="container px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 px-2"
              onClick={() => router.push("/")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            {!editingTitle ? (
              <h1 className="text-lg font-medium truncate">{recipe.title}</h1>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-lg font-medium h-8"
                  placeholder="Recipe title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveTitle();
                    } else if (e.key === "Escape") {
                      setEditingTitle(false);
                      setEditedTitle(recipe.title);
                    }
                  }}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={handleSaveTitle}
                  disabled={!editedTitle.trim()}
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    setEditingTitle(false);
                    setEditedTitle(recipe.title);
                  }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!editingTitle && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={() => setEditingTitle(true)}
                disabled={loading}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <FavoriteButton
              isFavorite={isFavorite}
              onToggle={handleToggleFavorite}
              size="sm"
              disabled={loading}
            />
            <DeleteRecipeDialog
              recipeTitle={recipe.title}
              onConfirm={handleDeleteRecipe}
              disabled={loading}
            />
          </div>
        </div>
      </header>

      {/* Recipe content */}
      <main className="flex-1">
        {/* Recipe header with title/description and image */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left side - Title, description, and metadata */}
            <div className="space-y-6">
              <div className="space-y-4">
                {!editingTitle ? (
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold">{recipe.title}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={() => setEditingTitle(true)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-3xl font-bold h-12"
                      placeholder="Recipe title"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveTitle();
                        } else if (e.key === "Escape") {
                          setEditingTitle(false);
                          setEditedTitle(recipe.title);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={handleSaveTitle}
                      disabled={!editedTitle.trim()}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setEditingTitle(false);
                        setEditedTitle(recipe.title);
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {recipe.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {recipe.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Tags
                </h3>
                <TagEditor
                  tags={recipe.categories}
                  onTagsChange={handleTagsUpdate}
                  availableTags={availableTags}
                  maxTags={10}
                />
              </div>

              {/* Recipe metadata */}
              <div className="space-y-3">
                {/* Times */}
                {(prepTime || cookTime || totalTime) && (
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {prepTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Prep: {prepTime}</span>
                      </div>
                    )}
                    {cookTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Cook: {cookTime}</span>
                      </div>
                    )}
                    {totalTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Total: {totalTime}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Yield/Servings */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  {!editingServings ? (
                    <div className="flex items-center gap-2">
                      <span>Serves: {recipeYield || "Not specified"}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={() => setEditingServings(true)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editedServings}
                        onChange={(e) => setEditedServings(e.target.value)}
                        className="h-7 w-24 text-xs"
                        placeholder="e.g., 4 servings"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 p-0"
                        onClick={handleSaveServings}
                      >
                        <Save className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Original Recipe Rating */}
                {recipe.originalRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Original rating:
                    </span>
                    <StarRating
                      rating={recipe.originalRating}
                      size="sm"
                      editable={false}
                    />
                  </div>
                )}

                {/* User Rating */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Your rating:
                  </span>
                  <StarRating
                    rating={userRating}
                    onRatingChange={handleUserRatingChange}
                    size="sm"
                    editable={true}
                  />
                </div>

                {/* Source link */}
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={recipe.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View original recipe
                  </a>
                </div>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="relative overflow-hidden bg-muted rounded-lg">
              <div className="aspect-[4/3] relative">
                {editingImage ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-background/90 z-10 rounded-lg">
                    <Input
                      value={editedImage}
                      onChange={(e) => setEditedImage(e.target.value)}
                      placeholder="Enter image URL"
                      className="mb-4"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingImage(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSaveImage}
                      >
                        Save Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/50 hover:bg-background/70"
                    onClick={() => setEditingImage(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}

                {imageError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted rounded-lg">
                    <ImageOff className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Image could not be loaded
                    </p>
                  </div>
                ) : (
                  <img
                    src={imageSrc || "/placeholder.svg"}
                    alt={recipe.title}
                    className="object-cover w-full h-full rounded-lg"
                    onError={handleImageError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for ingredients and directions */}
        <div className="max-w-4xl mx-auto px-4 pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="directions">Directions</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Ingredients</h2>
                {!editingIngredients ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingIngredients(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveIngredients}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                )}
              </div>

              {!editingIngredients ? (
                <ul className="space-y-0 divide-y">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start py-3"
                      onClick={() => toggleIngredient(index)}
                    >
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full border mr-3 shrink-0 mt-0.5 ${
                          checkedIngredients.has(index)
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {checkedIngredients.has(index) && (
                          <Check className="h-4 w-4 text-primary-foreground" />
                        )}
                      </div>
                      <span
                        className={
                          checkedIngredients.has(index)
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        {ingredient}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-2">
                  {editedIngredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) =>
                          handleUpdateIngredient(index, e.target.value)
                        }
                        placeholder="Enter ingredient"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddIngredient}
                    className="w-full mt-2"
                  >
                    Add Ingredient
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="directions" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Directions</h2>
                {!editingDirections ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDirections(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" /> Edit
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveDirections}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                )}
              </div>

              {!editingDirections ? (
                <ol className="space-y-6">
                  {recipe.directions.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium mr-4 shrink-0">
                        {index + 1}
                      </span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="space-y-4">
                  {editedDirections.map((direction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="shrink-0 pt-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium">
                          {index + 1}
                        </span>
                      </div>
                      <Textarea
                        value={direction}
                        onChange={(e) =>
                          handleUpdateDirection(index, e.target.value)
                        }
                        placeholder="Enter direction"
                        className="flex-1"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddDirection}
                    className="w-full mt-2"
                  >
                    Add Direction
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Comments section */}
          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Notes
                  </h2>
                  {!editingComments ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingComments(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />{" "}
                      {comments ? "Edit" : "Add"}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveComments}
                    >
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  )}
                </div>

                {!editingComments ? (
                  <div>
                    {comments ? (
                      <p className="text-sm whitespace-pre-wrap">{comments}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No notes yet. Add your own notes, tips, or variations
                        for this recipe.
                      </p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add your notes, tips, or variations for this recipe..."
                    className="min-h-[120px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
