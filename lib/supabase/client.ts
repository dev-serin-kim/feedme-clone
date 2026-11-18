import { createBrowserClient } from "@supabase/ssr";

import { supabaseConfig } from "./config";

/** Callers check supabaseConfig() first; this throws when Supabase is not configured. */
export function createClient() {
  const config = supabaseConfig();
  if (!config) throw new Error("Supabase is not configured");
  return createBrowserClient(config.url, config.key);
}
