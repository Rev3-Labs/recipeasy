"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "default";
  className?: string;
  showLabel?: boolean;
  disabled?: boolean;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = "md",
  variant = "ghost",
  className,
  showLabel = false,
  disabled = false,
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        "transition-all duration-200",
        isFavorite
          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
          : "text-muted-foreground hover:text-red-500 hover:bg-red-50",
        className
      )}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isFavorite && "fill-current"
        )}
      />
      {showLabel && (
        <span className="ml-2 text-sm">
          {isFavorite ? "Favorited" : "Add to Favorites"}
        </span>
      )}
    </Button>
  );
}


