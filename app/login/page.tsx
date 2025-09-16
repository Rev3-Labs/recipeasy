"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Logo } from "@/components/logo"
import { useUser } from "@/contexts/user-context"
import type { Provider } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authStatus, setAuthStatus] = useState<string>("Checking authentication status...")
  const { signIn, signInWithProvider, user } = useUser()
  const searchParams = useSearchParams()
  const signupSuccess = searchParams.get("signup") === "success"
  const authError = searchParams.get("error")

  // Check if we're already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setAuthStatus(`Already logged in as ${data.session.user.email}. Redirecting...`)
        // If we're already logged in, redirect to home
        window.location.href = "/"
      } else {
        setAuthStatus("Not logged in")
      }
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setAuthStatus("Attempting to sign in...")

    try {
      if (!email || !password) {
        setError("Email and password are required")
        setAuthStatus("Sign in failed: Missing email or password")
        setIsLoading(false)
        return
      }

      console.log("Submitting login form with email:", email)
      const { error: signInError, success } = await signIn(email, password)

      if (signInError) {
        console.error("Login error:", signInError)
        setError(signInError.message || "Failed to sign in. Please check your credentials.")
        setAuthStatus(`Sign in failed: ${signInError.message}`)
      } else if (!success) {
        setError("Failed to sign in. Please try again.")
        setAuthStatus("Sign in failed: No success response")
      } else {
        setAuthStatus("Sign in successful! Redirecting...")
      }
    } catch (err) {
      console.error("Unexpected login error:", err)
      setError("An unexpected error occurred. Please try again.")
      setAuthStatus("Sign in failed: Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: Provider) => {
    try {
      setError(null)
      setAuthStatus(`Initiating ${provider} login...`)
      await signInWithProvider(provider)
    } catch (err) {
      console.error("Social login error:", err)
      setError("Failed to initialize social login. Please try again.")
      setAuthStatus(`${provider} login failed`)
    }
  }

  // Direct login function that bypasses the context
  const handleDirectLogin = async () => {
    setIsLoading(true)
    setError(null)
    setAuthStatus("Attempting direct login...")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Direct login error:", error)
        setError(error.message)
        setAuthStatus(`Direct login failed: ${error.message}`)
      } else if (data.session) {
        console.log("Direct login successful!")
        setAuthStatus("Direct login successful! Redirecting...")
        window.location.href = "/"
      } else {
        setError("Login succeeded but no session was created")
        setAuthStatus("Direct login failed: No session created")
      }
    } catch (err) {
      console.error("Unexpected direct login error:", err)
      setError("An unexpected error occurred during direct login")
      setAuthStatus("Direct login failed: Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auth status display */}
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <AlertDescription>{authStatus}</AlertDescription>
          </Alert>

          {signupSuccess && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertDescription>
                Account created successfully! You can now sign in with your credentials.
              </AlertDescription>
            </Alert>
          )}

          {authError && (
            <Alert variant="destructive">
              <AlertDescription>
                {authError === "auth_callback_error"
                  ? "There was a problem with the authentication. Please try again."
                  : "Authentication error. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" type="button" onClick={() => handleSocialLogin("google")} className="w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-5 h-5 mr-2"
                style={{ color: "#4285F4" }}
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" type="button" onClick={() => handleSocialLogin("github")} className="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or try direct login</span>
            </div>
          </div>

          <Button
            onClick={handleDirectLogin}
            className="w-full"
            variant="secondary"
            disabled={isLoading || !email || !password}
          >
            Direct Login (Bypass Context)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
