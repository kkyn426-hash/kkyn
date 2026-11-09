import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { supabaseEnv } from "@/lib/env";
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseEnv();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // getUser verifies the JWT with Supabase; getSession alone must not authorize access.
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (!user && (path.startsWith("/dashboard") || path.startsWith("/resumes"))) {
    const dest = request.nextUrl.clone(); dest.pathname = "/login";
    dest.searchParams.set("next", path);
    return NextResponse.redirect(dest);
  }
  if (user && path === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return response;
}
