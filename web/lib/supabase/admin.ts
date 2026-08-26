import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Service-role Supabase client — bypasses RLS entirely. Never import this
 *  into anything reachable from the browser; it exists for exactly two
 *  narrow, admin-only server-side operations: inviting a new staff member
 *  by email (auth.admin.inviteUserByEmail, which only the service role can
 *  call) and applying that invited role once onboarding completes (see
 *  migration 0017's service_role exception on guard_profile_self_update).
 *  Returns null rather than throwing when SUPABASE_SERVICE_ROLE_KEY isn't
 *  set on Netlify yet — same fail-soft-with-a-clear-error convention as
 *  RESEND_API_KEY/ADMIN_TOKEN elsewhere in this app. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
