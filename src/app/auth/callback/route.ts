import { NextRequest, NextResponse } from "next/server";
import { serverSupabase } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    try {
      const supabase = await serverSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (error) { console.error("Auth callback failed", error); }
  }
  return NextResponse.redirect(new URL("/login?error=verification", request.url));
}
