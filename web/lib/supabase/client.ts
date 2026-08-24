import { createBrowserClient } from "@supabase/ssr";

// The browser-side Supabase client — used from client components for auth
// (sign up/in/out, OAuth) and any reads/writes the RLS policies (see the
// migration in lib/supabase/schema.sql) allow a signed-in user to do
// directly, without a server round-trip.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
