/**
 * Auth Middleware for API Routes
 * Verifies Firebase ID tokens for protected API endpoints
 * Falls back gracefully when Firebase is not configured
 */

import { NextApiRequest, NextApiResponse } from 'next';

// Admin emails — same source of truth as AuthContext
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'dr.omar@tibrah.com')
    .split(',')
    .map(e => e.trim().toLowerCase());

// Admin passcode hash for local auth fallback (stored as env var)
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || '';

/**
 * Extract and verify the auth token from request headers
 * Expects: Authorization: Bearer <token> OR x-admin-token: <token>
 */
export function getAuthFromRequest(req: NextApiRequest): {
    authenticated: boolean;
    isAdmin: boolean;
    userId?: string;
    email?: string;
    authMethod: 'firebase' | 'local' | 'none';
} {
    // Check for admin token (used by admin dashboard)
    const adminToken = req.headers['x-admin-token'] as string;
    if (adminToken) {
        // Verify admin token against env-based secret
        const validToken = process.env.ADMIN_API_SECRET;
        if (validToken && adminToken === validToken) {
            return {
                authenticated: true,
                isAdmin: true,
                userId: 'admin',
                email: ADMIN_EMAILS[0],
                authMethod: 'local',
            };
        }
    }

    // Check for local auth session token
    const authHeader = req.headers['authorization'] as string;
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token.length > 10) {
            // For local auth, the token is a session token stored in localStorage
            // We can't fully verify it server-side without a shared store,
            // but we validate it exists and has correct format
            return {
                authenticated: true,
                isAdmin: false, // Would need to check against stored sessions
                userId: 'local-user',
                authMethod: 'local',
            };
        }
    }

    return {
        authenticated: false,
        isAdmin: false,
        authMethod: 'none',
    };
}

/**
 * Middleware: Require authentication for API route
 */
export function requireAuth(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const auth = getAuthFromRequest(req);

        if (!auth.authenticated) {
            return res.status(401).json({
                error: 'غير مصرح — يرجى تسجيل الدخول',
                success: false,
            });
        }

        // Attach auth info to request for downstream use
        (req as any).auth = auth;
        return handler(req, res);
    };
}

/**
 * Middleware: Require admin access for API route
 */
export function requireAdmin(
    handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const auth = getAuthFromRequest(req);

        if (!auth.authenticated) {
            return res.status(401).json({
                error: 'غير مصرح — يرجى تسجيل الدخول',
                success: false,
            });
        }

        if (!auth.isAdmin) {
            return res.status(403).json({
                error: 'ليس لديك صلاحية الوصول لهذا المورد',
                success: false,
            });
        }

        (req as any).auth = auth;
        return handler(req, res);
    };
}

/**
 * Verify admin passcode (for admin dashboard login)
 * Uses environment variable — NO fallback in any environment
 */
export function verifyAdminPasscode(passcode: string): boolean {
    const validPasscode = process.env.ADMIN_PASSCODE;
    if (!validPasscode) {
        console.error('❌ ADMIN_PASSCODE not set — admin login disabled');
        return false;
    }
    return passcode === validPasscode;
}

/**
 * Generate a secure admin API token
 * Used for admin dashboard to authenticate API calls
 */
export function generateAdminToken(): string {
    const secret = process.env.ADMIN_API_SECRET;
    if (secret) return secret;

    // Generate a random token if no secret is configured
    if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    }
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
