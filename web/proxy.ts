import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Only an optimistic gate — is there a valid Supabase session at all? Every
 * admin Server Action re-checks the actual profiles.role itself (see
 * lib/admin-auth.ts), since Server Actions are directly reachable by POST
 * regardless of what a visitor was shown here, and a signed-in 'client'
 * shouldn't be treated as staff just because they have *a* session.
 */
export default async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = req.nextUrl.pathname === "/admin/login";
  if (!user && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
