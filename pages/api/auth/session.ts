/**
 * POST /api/auth/session
 * 
 * Receives a Firebase ID token from the client, verifies it server-side,
 * and sets a secure HttpOnly session cookie.
 * 
 * The session cookie is a custom JWT signed with SESSION_SECRET (HS256),
 * containing verified user claims (uid, email, isAdmin).
 * 
 * This is the ONLY path to get a server-trusted session cookie.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminAuth } from '@/lib/firebaseAdmin';
import { SignJWT } from 'jose';

// Server-only admin emails — NOT the public NEXT_PUBLIC_ version
const SERVER_ADMIN_EMAILS = (
    process.env.ADMIN_EMAILS || 'dr.omar@tibrah.com'
).split(',').map(e => e.trim().toLowerCase());

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSessionSecret(): Uint8Array {
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 32) {
        throw new Error(
            'SESSION_SECRET env var must be at least 32 characters. ' +
            'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"'
        );
    }
    return new TextEncoder().encode(secret);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
        return res.status(400).json({ error: 'Missing idToken' });
    }

    try {
        // Verify the Firebase ID token server-side
        let adminAuth;
        try {
            adminAuth = getAdminAuth();
        } catch (configError: any) {
            // Firebase Admin SDK not configured — likely missing FIREBASE_SERVICE_ACCOUNT_KEY
            console.error('[Session API] Firebase Admin SDK not configured:', configError.message);
            console.error('[Session API] Add FIREBASE_SERVICE_ACCOUNT_KEY to your .env.local file.');
            // Return 503 (service unavailable) not 401 so the client doesn't treat it as an auth error
            return res.status(503).json({ error: 'Auth service not configured', configured: false });
        }

        const decodedToken = await adminAuth.verifyIdToken(idToken);

        const email = (decodedToken.email || '').toLowerCase();
        const uid = decodedToken.uid;
        const isAdmin = SERVER_ADMIN_EMAILS.includes(email);

        // Create a signed session JWT (HS256)
        const secret = getSessionSecret();
        const sessionToken = await new SignJWT({
            uid,
            email,
            isAdmin,
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(`${SESSION_MAX_AGE}s`)
            .setIssuer('tibrah')
            .setSubject(uid)
            .sign(secret);

        // Set the session cookie — HttpOnly, Secure, SameSite
        const isProduction = process.env.NODE_ENV === 'production';
        const securePart = isProduction ? '; Secure' : '';

        res.setHeader('Set-Cookie', [
            `tibrah_session=${sessionToken}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE}; SameSite=Lax${securePart}`,
            // Clear old client-set cookie reliably
            `tibrah_auth=; Path=/; Max-Age=0; SameSite=Lax${securePart}`,
        ]);

        return res.status(200).json({ ok: true });
    } catch (error: any) {
        const msg = error.message || '';
        // Only log as error if it's a genuine token problem, not a config issue
        if (!msg.includes('SERVICE_ACCOUNT')) {
            console.error('[Session API] Token verification failed:', msg);
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
