import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Only an optimistic gate — every admin Server Action re-checks the session
 * itself, since Server Actions are directly reachable by POST regardless of
 * what a visitor was shown here (see Next.js's own auth guide).
 */
export default async function proxy(req: NextRequest) {
  const secret = process.env.SESSION_SECRET;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  let authed = false;
  if (secret && token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      authed = true;
    } catch {
      // invalid/expired token — treat as logged out
    }
  }

  const isLogin = req.nextUrl.pathname === "/admin/login";
  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
