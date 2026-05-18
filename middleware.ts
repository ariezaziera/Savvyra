import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Auth check: support both old JWT cookie AND NextAuth session cookie ──
  const token          = request.cookies.get("savvyra_token")?.value;
  const nextAuthToken  = request.cookies.get("next-auth.session-token")?.value
                      || request.cookies.get("__Secure-next-auth.session-token")?.value; // HTTPS version
  const isLoggedIn     = !!token || !!nextAuthToken;

  const onboarded = request.cookies.get("savvyra_onboarded")?.value;

  // PUBLIC ROUTES — always allow through first
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api") ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/logo")
  ) {
    return NextResponse.next();
  }

  // FIRST-TIME USERS — only redirect to onboarding if not logged in
  if (!onboarded && !isLoggedIn && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // PROTECTED ROUTES
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webmanifest).*)"],
};