"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";
export function browserSupabase() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}
