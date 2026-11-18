/**
 * Supabase connection values, or null when the deployment has not set them.
 * The app must keep working without them: only sign-in features turn off.
 * (Keep the literal process.env names so Next.js can inline them into client code.)
 */
export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}
