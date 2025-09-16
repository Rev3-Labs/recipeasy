"use client";

import { Users, ImageOff, Clock } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/lib/types";
import { TagEditor } from "@/components/tag-editor";
import { FavoriteButton } from "@/components/favorite-button";

interface RecipeCardProps {
  recipe: Recipe;
  onTagsUpdate?: (recipeId: string, tags: string[]) => void;
  onFavoriteToggle?: (recipeId: string, isFavorite: boolean) => void;
  availableTags?: string[];
}

export function RecipeCard({
  recipe,
  onTagsUpdate,
  onFavoriteToggle,
  availableTags = [],
}: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleTagsChange = (newTags: string[]) => {
    if (onTagsUpdate) {
      onTagsUpdate(recipe.id, newTags);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking favorite button
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(recipe.id, !recipe.isFavorite);
    }
  };

  return (
    <Link href={`/recipe/${recipe.id}`} className="block group">
      <div className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
        {/* Recipe image */}
        <div className="w-12 h-12 shrink-0 overflow-hidden bg-muted rounded">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageOff className="h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={
                recipe.image ||
                `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(
                  recipe.title
                )}`
              }
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          )}
        </div>

        {/* Recipe content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {recipe.title}
            </h3>
            {onFavoriteToggle && (
              <div onClick={handleFavoriteToggle}>
                <FavoriteButton
                  isFavorite={recipe.isFavorite || false}
                  onToggle={() => {}} // Handled by onClick above
                  size="sm"
                  variant="ghost"
                />
              </div>
            )}
          </div>

          {recipe.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {recipe.description}
            </p>
          )}

          {/* Recipe metadata */}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{recipe.ingredients.length} ingredients</span>
            {recipe.yield && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{recipe.yield}</span>
              </div>
            )}
            {recipe.prepTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{recipe.prepTime}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mt-2" onClick={(e) => e.preventDefault()}>
            <TagEditor
              tags={recipe.categories}
              onTagsChange={handleTagsChange}
              availableTags={availableTags}
              maxTags={8}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
