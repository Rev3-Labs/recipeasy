// Google Tag Manager helper functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

export const analytics = {
  // Initialize dataLayer if it doesn't exist
  init: () => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
    }
  },

  // Track page views
  trackPageView: (url: string) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "page_view",
        page_path: url,
        page_title: document.title,
      });
    }
  },

  // Track recipe additions
  trackRecipeAdded: (recipeTitle: string) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "recipe_added",
        recipe_title: recipeTitle,
        event_category: "engagement",
      });
    }
  },

  // Track recipe views
  trackRecipeViewed: (recipeId: string, recipeTitle: string) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "recipe_viewed",
        recipe_id: recipeId,
        recipe_title: recipeTitle,
        event_category: "engagement",
      });
    }
  },

  // Track recipe ratings
  trackRecipeRated: (recipeId: string, rating: number) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "recipe_rated",
        recipe_id: recipeId,
        rating: rating,
        event_category: "engagement",
      });
    }
  },

  // Track favorites
  trackRecipeFavorited: (recipeId: string, isFavorited: boolean) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "recipe_favorited",
        recipe_id: recipeId,
        favorited: isFavorited,
        event_category: "engagement",
      });
    }
  },

  // Track search
  trackSearch: (query: string, resultsCount: number) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "search",
        search_term: query,
        results_count: resultsCount,
        event_category: "engagement",
      });
    }
  },

  // Track category filters
  trackCategoryFilter: (category: string) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "category_filtered",
        category: category,
        event_category: "engagement",
      });
    }
  },

  // Track custom events
  trackCustomEvent: (
    eventName: string,
    parameters: Record<string, any> = {}
  ) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...parameters,
      });
    }
  },
};
