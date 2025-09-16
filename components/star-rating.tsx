"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating?: number;
  onRatingChange?: (rating: number) => void;
  editable?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function StarRating({
  rating = 0,
  onRatingChange,
  editable = false,
  size = "md",
  showLabel = false,
  label = "Rating",
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = (starRating: number) => {
    if (editable && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating: number) => {
    if (editable) {
      // Optional: Add hover effects here
    }
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showLabel && (
        <span className="text-sm font-medium text-muted-foreground mr-2">
          {label}:
        </span>
      )}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={cn(
              "transition-colors",
              editable && "cursor-pointer hover:scale-110",
              !editable && "cursor-default"
            )}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            disabled={!editable}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300",
                editable && "hover:text-yellow-300"
              )}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-muted-foreground ml-1">({rating}/5)</span>
      )}
    </div>
  );
}

