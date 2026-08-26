"use server";

import { createClient } from "@/lib/supabase/server";

/** Fail-soft, same philosophy as lib/email.ts and lib/activity-log.ts — a
 *  tracking failure must never block or error out the page it's describing. */
export async function trackPageView(path: string, referrer: string | null, sessionId: string) {
  try {
    const supabase = await createClient();
    await supabase.from("page_views").insert({
      path: path.slice(0, 500),
      referrer: referrer ? referrer.slice(0, 500) : null,
      session_id: sessionId.slice(0, 100),
    });
  } catch (err) {
    console.error("trackPageView failed:", err);
  }
}
