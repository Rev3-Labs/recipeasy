"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import type { User } from "@supabase/supabase-js"
import type { Provider } from "@/lib/supabase"

// Create a mock user that will be used throughout the app
const MOCK_USER: User = {
  id: "anonymous-user",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
}

type UserContextType = {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any; success: boolean }>
  signInWithProvider: (provider: Provider) => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Always provide the mock user
  const [user] = useState<User | null>(MOCK_USER)
  const [loading] = useState(false)

  // These functions are now stubs that don't do anything
  const signUp = async () => ({ error: null })
  const signIn = async () => ({ error: null, success: true })
  const signInWithProvider = async () => {}
  const signOut = async () => {}

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
