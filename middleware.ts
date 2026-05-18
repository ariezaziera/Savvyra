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

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // LOG — tengok apa yang middleware nampak
  console.log("[middleware]", {
    pathname,
    hasToken: !!token,
    tokenId: token?.id ?? null,
    cookies: request.cookies.getAll().map(c => c.name), // list semua cookie names
  });

  const isLoggedIn = !!token;
  const onboarded  = request.cookies.get("savvyra_onboarded")?.value;

  if (!isLoggedIn) {
    console.log("[middleware] NOT LOGGED IN — redirecting to /login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!onboarded && pathname !== "/onboarding") {
    console.log("[middleware] NOT ONBOARDED — redirecting to /onboarding");
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webmanifest).*)"],
};