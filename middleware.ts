/**
 * Next.js Middleware — Server-side Route Protection
 * 
 * Checks for `tibrah_auth` cookie to protect routes.
 * The cookie is set client-side when user logs in (see AuthContext).
 * It is a lightweight JSON cookie, NOT a full session token.
 * 
 * Protected routes: /admin*, /profile, /settings, /medical-file
 * Public routes: /, /login, /register, /about, /help, etc.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/profile',
    '/settings',
    '/medical-file',
    '/my-appointments',
    '/health-tracker',
];

// Routes that require admin role
const ADMIN_ROUTES = [
    '/admin-dashboard',
    '/admin',
];

// Routes that should redirect to home if already logged in
const AUTH_ONLY_ROUTES = [
    '/login',
    '/register',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const authCookie = request.cookies.get('tibrah_auth')?.value;

    let isAuthenticated = false;
    let isAdmin = false;

    // Parse auth cookie
    if (authCookie) {
        try {
            const authData = JSON.parse(authCookie);
            isAuthenticated = !!authData?.email;
            isAdmin = authData?.role === 'admin';
        } catch {
            isAuthenticated = false;
        }
    }

    // Check admin routes
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated || !isAdmin) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            loginUrl.searchParams.set('reason', 'admin');
            return NextResponse.redirect(loginUrl);
        }
    }

    // Check protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect logged-in users away from login/register
    if (AUTH_ONLY_ROUTES.some(route => pathname === route)) {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

// Only run middleware on page routes, not API/static files
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, manifest.json, etc
         * - public assets (images, data, etc)
         */
        '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|icons|data|images|sw\\.js).*)',
    ],
};
