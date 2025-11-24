"use client"

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("[v0] Missing Supabase environment variables")
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL:", !!url)
    console.error("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!key)
    throw new Error("Missing Supabase environment variables. Please check your Vars section.")
  }

  return createBrowserClient(url, key)
}
