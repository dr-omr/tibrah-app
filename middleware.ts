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
import { PROTECTED_ROUTES, ADMIN_ROUTES, AUTH_ONLY_ROUTES } from './lib/routes';

// ============================================
// Inline HS256 JWT Verifier (Edge Runtime safe)
// Replaces 'jose' import to avoid CompressionStream/DecompressionStream
// warnings from jose's JWE module being bundled but never used.
// Web Crypto (crypto.subtle) is fully supported in Edge Runtime.
// ============================================

function b64urlToBytes(b64url: string): Uint8Array<ArrayBuffer> {
    const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const binary = atob(padded);
    return Uint8Array.from(binary, c => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

async function verifyHS256(
    token: string,
    secret: Uint8Array<ArrayBuffer>,
): Promise<Record<string, unknown> | null> {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    try {
        const key = await crypto.subtle.importKey(
            'raw', secret,
            { name: 'HMAC', hash: 'SHA-256' },
            false, ['verify'],
        );
        const messageBytes  = new TextEncoder().encode(`${headerB64}.${payloadB64}`) as Uint8Array<ArrayBuffer>;
        const signatureBytes = b64urlToBytes(signatureB64);
        const valid = await crypto.subtle.verify('HMAC', key, signatureBytes, messageBytes);
        if (!valid) return null;

        const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));

        // Check expiry
        if (payload.exp && typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) {
            return null;
        }
        // Check issuer
        if (payload.iss && payload.iss !== 'tibrah') return null;

        return payload;
    } catch {
        return null;
    }
}

// ============================================
// Session Verification
// ============================================

function getSessionSecret(): Uint8Array<ArrayBuffer> | null {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        console.warn('SESSION_SECRET is missing or too short. Server-side session verification is denied.');
        return null;
    }
    return new TextEncoder().encode(secret) as Uint8Array<ArrayBuffer>;
}

interface AuthResult {
    authenticated: boolean;
    isAdmin: boolean;
    email: string;
    method: 'session' | 'legacy' | 'none';
}

/**
 * Verify the server-issued session JWT using inline Web Crypto HS256.
 */
async function verifySessionJWT(token: string): Promise<AuthResult> {
    try {
        const secret = getSessionSecret();
        if (!secret) {
            return { authenticated: false, isAdmin: false, email: '', method: 'none' };
        }

        const payload = await verifyHS256(token, secret);
        if (!payload) {
            return { authenticated: false, isAdmin: false, email: '', method: 'none' };
        }

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
    } catch {
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

    // Check admin routes — must be authenticated AND have admin role
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
        if (!auth.authenticated || auth.method !== 'session') {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        if (!auth.isAdmin) {
            // Authenticated but not admin — redirect to home (403-like)
            return NextResponse.redirect(new URL('/', request.url));
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
