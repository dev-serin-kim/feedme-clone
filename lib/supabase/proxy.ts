import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfig } from "./config";

/** Paths that need a signed-in user. Everything else (the converter) stays public. */
const PROTECTED = ["/settings"];

/** Refreshes the Supabase session cookies on every request (from the official Supabase UI block). */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  // Without Supabase settings the converter must still work: skip the session, keep protected pages closed.
  const config = supabaseConfig();
  if (!config) return isProtected ? redirectToLogin(request) : NextResponse.next({ request });

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it refreshes the session.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && isProtected) return redirectToLogin(request);

  // Return supabaseResponse as is so the refreshed cookies reach the browser.
  return supabaseResponse;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/auth/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}
