import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { supabaseConfig } from "./config";

/**
 * Create a new client per request; don't keep it in a module-level variable.
 * Callers check supabaseConfig() first; this throws when Supabase is not configured.
 */
export async function createClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured");
  const cookieStore = await cookies();

  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component; proxy.ts refreshes the session cookies instead.
        }
      },
    },
  });
}
