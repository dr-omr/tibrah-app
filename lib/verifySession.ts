/**
 * Server-side Session Verification for API Routes
 * 
 * Verifies the HttpOnly tibrah_session JWT cookie.
 * Use this in every API route that requires authentication.
 * 
 * @see pages/api/auth/session.ts — where the JWT is created
 * @see middleware.ts — where the JWT is verified for page routes
 */

import type { NextApiRequest } from 'next';
import { jwtVerify } from 'jose';
import { getAdminAuth } from './firebaseAdmin';

export interface ApiSession {
    uid: string;
    email: string;
    isAdmin: boolean;
    /** دور المستخدم: 'admin' | 'user' — مشتق من isAdmin */
    role: 'admin' | 'user';
}

/**
 * Verify the server-issued session JWT from the request cookies.
 * Returns the decoded session payload or null if invalid/missing.
 * 
 * Usage:
 * ```ts
 * const session = await verifyApiSession(req);
 * if (!session) return res.status(401).json({ error: 'Unauthorized' });
 * ```
 */
export async function verifyApiSession(req: NextApiRequest): Promise<ApiSession | null> {
    // 1. Mobile First: Verify via Firebase Bearer Token (Capacitor SDK injected)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const idToken = authHeader.substring(7);
        try {
            const decodedPayload = await getAdminAuth().verifyIdToken(idToken);
            const isAdmin = decodedPayload.admin === true;
            
            return {
                uid: decodedPayload.uid,
                email: decodedPayload.email || '',
                isAdmin: isAdmin,
                role: isAdmin ? 'admin' : 'user',
            };
        } catch (error) {
            console.error('[verifyApiSession] Native JWT verification failed:', error);
            // Continue fallback sequence
        }
    }

    // 2. Web Fallback: Verify via HttpOnly secure cookies
    const token = req.cookies['tibrah_session'];
    if (!token) return null;

    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        console.error('[verifyApiSession] SESSION_SECRET is missing or too short — denying all session tokens.');
        return null;
    }

    try {
        const key = new TextEncoder().encode(secret);
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
            issuer: 'tibrah',
        });

        const email = (payload.email as string || '').toLowerCase();
        const uid = payload.sub || (payload.uid as string) || '';

        if (!email || !uid) return null;

        const isAdmin = payload.isAdmin === true;

        return {
            uid,
            email,
            isAdmin,
            role: isAdmin ? 'admin' : 'user',
        };
    } catch {
        // Token expired, invalid signature, or tampered
        return null;
    }
}

/**
 * Require admin privileges. Returns session or null.
 */
export async function requireAdmin(req: NextApiRequest): Promise<ApiSession | null> {
    const session = await verifyApiSession(req);
    if (!session || !session.isAdmin) return null;
    return session;
}
