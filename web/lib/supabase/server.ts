import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// The server-side Supabase client — reads the session from the request's
// cookies (set by the browser client / auth callback route) so Server
// Components and Server Actions can see who's signed in and run
// RLS-scoped queries as that user, without re-authenticating.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll is called from a Server Component in some render
            // paths (e.g. a layout), where cookies can't be written — safe
            // to ignore there since middleware/route handlers cover the
            // actual session-refresh writes.
          }
        },
      },
    }
  );
}
