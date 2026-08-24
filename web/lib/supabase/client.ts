import { createBrowserClient } from "@supabase/ssr";

// The browser-side Supabase client — used from client components for auth
// (sign up/in/out, OAuth) and any reads/writes the RLS policies (see the
// migrations applied via the Supabase MCP tools) allow a signed-in user to
// do directly, without a server round-trip.
//
// Deliberately a singleton (cached at module scope, not created fresh on
// every call) — this was a real bug: each createClient() call spins up its
// own GoTrueClient with its own independent auth-state listeners. Sign-in
// via LoginForm's own instance never reached ProfileMenu's useSession()
// hook, since it was listening on a *different* instance that was never
// told anything changed — the profile menu kept showing "Guest" forever
// after a real, successful sign-in. Sharing one instance means every
// onAuthStateChange listener across the app hears the same events.
function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// A plain non-generic wrapper (above) rather than typing this variable
// directly as `ReturnType<typeof createBrowserClient>` — createBrowserClient
// itself is generic, and ReturnType on an un-instantiated generic/overloaded
// function resolved to `any` here, silently erasing type-checking on every
// call site (e.g. onAuthStateChange callback params).
let client: ReturnType<typeof createSupabaseBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    client = createSupabaseBrowserClient();
  }
  return client;
}
