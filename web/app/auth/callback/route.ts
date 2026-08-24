import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google OAuth (and any other Supabase OAuth provider) redirects back here
// with a `code` param that has to be exchanged server-side for a real
// session before sending the visitor on to wherever they started.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
