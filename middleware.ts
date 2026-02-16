import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session token from cookies
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  const isLoggedIn = !!sessionToken;

  // Public routes - no protection needed
  const publicRoutes = ["/", "/calendar", "/progress", "/radio", "/login"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // API routes for public data
  if (pathname.startsWith("/api/schedules") && request.method === "GET") {
    return NextResponse.next();
  }
  if (pathname === "/api/status" && request.method === "GET") {
    return NextResponse.next();
  }

  // Auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected dashboard routes - redirect to login if not authenticated
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
