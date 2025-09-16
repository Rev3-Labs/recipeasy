import { createClient } from "@supabase/supabase-js"
import type { Recipe } from "./types"

// Initialize the Supabase client with fallback values for build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type for the database recipe format
export type DbRecipe = Omit<Recipe, "id"> & {
  id?: string
  user_id: string
}

// Social login providers
export type Provider = "google" | "github" | "facebook" | "twitter"
