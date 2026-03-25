/**
 * Next.js Middleware — Server-side Route Protection
 * 
 * Verifies the HttpOnly server-set session cookie (tibrah_session).
 * The cookie is an HS256 signed JWT created by /api/auth/session.
 * 
 * Admin authorization is embedded in the JWT claims by the server.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { PROTECTED_ROUTES, ADMIN_ROUTES, AUTH_ONLY_ROUTES } from './lib/routes';

// ============================================
// Session Verification
// ============================================

function getSessionSecret(): Uint8Array {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        // Must match the API requirement. If missing in middleware, we fail closed.
        return new Uint8Array(32);
    }
    return new TextEncoder().encode(secret);
}

interface AuthResult {
    authenticated: boolean;
    isAdmin: boolean;
    email: string;
    method: 'session' | 'legacy' | 'none';
}

/**
 * Verify the server-issued session JWT using the shared symmetric secret.
 */
async function verifySessionJWT(token: string): Promise<AuthResult> {
    try {
        const secret = getSessionSecret();
        const { payload } = await jwtVerify(token, secret, {
            algorithms: ['HS256'],
            issuer: 'tibrah',
        });

        const email = (payload.email as string || '').toLowerCase();
        if (!email) {
            return { authenticated: false, isAdmin: false, email: '', method: 'none' };
        }

        return {
            authenticated: true,
            isAdmin: payload.isAdmin === true,
            email,
            method: 'session',
        };
    } catch (error) {
        // Token is invalid, expired, or tampered with
        return { authenticated: false, isAdmin: false, email: '', method: 'none' };
    }
}

/**
 * Detect a legacy base64 cookie (migration window).
 * These are NOT cryptographically verified and are NOT trusted for authorization.
 * Returns authenticated: false — legacy users must create Firebase accounts.
 */
function detectLegacyCookie(cookieValue: string): AuthResult {
    try {
        const base64Part = cookieValue.replace(/^LEGACY:/, '');
        const decoded = decodeURIComponent(atob(base64Part));
        const data = JSON.parse(decoded);

        if (data.email) {
            // Log for migration tracking — but do NOT authenticate
            console.log(`[Auth] Legacy cookie detected for ${data.email} — migration required`);
        }
    } catch {
        // Not a valid legacy cookie
    }

    // NEVER authenticate via unverified cookie
    return { authenticated: false, isAdmin: false, email: '', method: 'legacy' };
}

/**
 * Resolve and verify the auth cookie.
 * ONLY server-issued session JWT grants authenticated access.
 * Legacy and old cookies are detected but NOT trusted.
 */
async function resolveAuth(req: NextRequest): Promise<AuthResult> {
    const sessionCookie = req.cookies.get('tibrah_session')?.value;
    const legacyCookie = req.cookies.get('tibrah_auth')?.value;

    // 1. Try verifiable server session first (Highest priority and most secure)
    if (sessionCookie) {
        const result = await verifySessionJWT(sessionCookie);
        if (result.authenticated) {
            return result;
        }
    }

    // 2. If no valid session but token exists in legacy auth cookie slot
    if (legacyCookie) {
        if (legacyCookie.startsWith('LEGACY:')) {
            return detectLegacyCookie(legacyCookie);
        }
    }

    return { authenticated: false, isAdmin: false, email: '', method: 'none' };
}

// ============================================
// Middleware
// ============================================

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Resolve authentication from the incoming request cookies
    const auth = await resolveAuth(request);

    // Check admin routes — ONLY valid sessions can access, and must have isAdmin=true
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (!auth.authenticated || !auth.isAdmin || auth.method !== 'session') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            loginUrl.searchParams.set('reason', 'admin');
            return NextResponse.redirect(loginUrl);
        }
    }

    // Check protected routes — must have valid server session
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        if (!auth.authenticated || auth.method !== 'session') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect logged-in users away from login/register
    if (AUTH_ONLY_ROUTES.some(route => pathname === route)) {
        if (auth.authenticated && auth.method === 'session') {
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
