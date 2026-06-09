import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from "jsonwebtoken";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PUBLIC ROUTES — always allow
  if (
    pathname.startsWith("/api") ||
    pathname === "/manifest.webmanifest" ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/logo")
  ) {
    return NextResponse.next();
  }

  // Check NextAuth session token (Google + NextAuth credentials)
  const nextAuthToken = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check custom JWT cookie (credentials login via /api/auth/login)
  let customJwtValid = false;
  const savvyraToken = request.cookies.get("savvyra_token")?.value;
  if (savvyraToken && process.env.JWT_SECRET) {
    try {
      jwt.verify(savvyraToken, process.env.JWT_SECRET);
      customJwtValid = true;
    } catch {
      // Invalid or expired — treat as not logged in
    }
  }

  const isLoggedIn = !!nextAuthToken || customJwtValid;
  const onboarded  = request.cookies.get("savvyra_onboarded")?.value;

  // ONBOARDING — only for non-logged-in users
  if (pathname.startsWith("/onboarding")) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // LOGIN / REGISTER — if already logged in, go to dashboard
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // FIRST TIME VISITOR — not logged in, never onboarded
  if (!isLoggedIn && !onboarded) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // RETURNING VISITOR — not logged in but has seen onboarding
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // LOGGED IN — proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webmanifest|sw\\.js|workbox-.*|worker-.*|fallback-.*).*)",
  ],
};