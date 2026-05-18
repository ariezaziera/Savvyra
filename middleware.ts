import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PUBLIC ROUTES
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

  // Guna getToken — dia handle both JWT cookie dan NextAuth session
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // Explicitly check HTTPS cookie for production
    cookieName: process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  const isLoggedIn = !!token;
  const onboarded  = request.cookies.get("savvyra_onboarded")?.value;

  // NOT LOGGED IN
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // LOGGED IN but not onboarded
  if (!onboarded && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webmanifest).*)"],
};