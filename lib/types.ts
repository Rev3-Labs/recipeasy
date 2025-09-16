export interface Recipe {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  ingredients: string[];
  directions: string[];
  categories: string[];
  dateAdded: string;
  cookTime?: string;
  prepTime?: string;
  totalTime?: string;
  yield?: string;
  comments?: string;
  originalRating?: number; // Rating from the original source (1-5)
  userRating?: number; // User's personal rating (1-5)
  isFavorite?: boolean; // Whether the recipe is marked as favorite
}
