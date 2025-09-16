import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  
  // Since Supabase auth is not configured, just redirect to home
  // This prevents build errors when Supabase environment variables are missing
  return NextResponse.redirect(`${requestUrl.origin}/`)
}
