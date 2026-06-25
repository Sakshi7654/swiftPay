import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    //explicitly pass the correct cookie names for localhost/production environment mapping
    const session = await getToken({ 
        req, 
        secret: process.env.JWT_SECRET || "secret",
        secureCookie: process.env.NODE_ENV === "production", // Forces standard cookie on localhost
    });

    // 1. Define explicit public routes that don't require an active session
    const isPublicPath = pathname === "/signin" || pathname === "/signup" || pathname === "/";

    // 2. If the user is logged in and tries to access auth pages, send them to the dashboard
    if (session && (pathname === "/signin" || pathname === "/signup")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 3. If the user is NOT logged in and tries to access a protected dashboard route, send them to signin
    if (!session && !isPublicPath) {
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    return NextResponse.next();
}

// Ensure the middleware runs on all dashboard routes while ignoring internal static assets
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};