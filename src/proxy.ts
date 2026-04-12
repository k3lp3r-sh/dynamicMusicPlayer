import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Core Bypass: Always allow API routes, Next.js static builds, and the Login page itself
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/login" ||
    pathname.includes(".") // Safely bypasses any public folder assets like logo.png, fonts, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Authentication Parsing
  const authCookie = request.cookies.get("auth_role")?.value;
  const isAdminRoute = pathname.startsWith("/admin");

  // 3. Strict Admin Lockdown
  if (isAdminRoute) {
    if (authCookie !== "admin") {
      const loginUrl = new URL(
        `/login?callbackUrl=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }
  } 
  
  // 4. Base App Lockdown
  else {
    if (authCookie !== "user" && authCookie !== "admin") {
      const loginUrl = new URL(
        `/login?callbackUrl=${encodeURIComponent(pathname)}`,
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Broad matcher caching everything possible and sending it through the proxy parser
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
